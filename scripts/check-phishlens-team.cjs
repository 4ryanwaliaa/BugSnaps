const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase/app');
const fs = require('node:fs');
const { getDatabase, connectDatabaseEmulator, ref, set, get, update, serverTimestamp } = require('firebase/database');

async function client(name) {
  const app = initializeApp({ apiKey: 'demo-key', authDomain: 'demo-phishlens.firebaseapp.com', projectId: 'demo-phishlens', databaseURL: 'https://demo-phishlens-default-rtdb.firebaseio.com' }, name);
  const uid = name;
  const database = getDatabase(app); connectDatabaseEmulator(database, '127.0.0.1', 19000, { mockUserToken: { sub: uid, user_id: uid } });
  return { app, database, uid };
}
async function denied(promise, message) { await assert.rejects(promise, /PERMISSION_DENIED|permission_denied|permission denied/i, message); }
(async () => {
  const fragment = JSON.parse(fs.readFileSync('docs/phishlens/database-rules.fragment.json', 'utf8'));
  const setup = await fetch('http://127.0.0.1:19000/.settings/rules.json?ns=demo-phishlens-default-rtdb', { method: 'PUT', headers: { Authorization: 'Bearer owner' }, body: JSON.stringify({ rules: { '.read': false, '.write': false, ...fragment } }) });
  assert.equal(setup.status, 200, await setup.text());
  const reset = await fetch('http://127.0.0.1:19000/.json?ns=demo-phishlens-default-rtdb', { method: 'DELETE', headers: { Authorization: 'Bearer owner' } });
  assert.equal(reset.status, 200, await reset.text());
  const owner = await client('owner'); const member = await client('member'); const outsider = await client('outsider');
  await denied(set(ref(owner.database, 'phishlensTeams/invalid-initial-members'), { name: 'Bad', owner: owner.uid, members: { [owner.uid]: 'admin', [outsider.uid]: 'admin' } }), 'creator cannot add arbitrary initial members');
  await denied(set(ref(outsider.database, 'phishlensTeams/impersonated'), { name: 'Bad', owner: owner.uid, members: { [owner.uid]: 'admin' } }), 'creator cannot impersonate owner');
  const team = 'phishlensTeams/testteam';
  await set(ref(owner.database, team), { name: 'Example', owner: owner.uid, members: { [owner.uid]: 'admin' } });
  await denied(get(ref(outsider.database, team)), 'outsider must not read team');
  const otherTeam = 'phishlensTeams/otherteam';
  await set(ref(outsider.database, otherTeam), { name: 'Other', owner: outsider.uid, members: { [outsider.uid]: 'admin' } });
  await denied(get(ref(owner.database, otherTeam)), 'another team owner must not read');
  await denied(set(ref(outsider.database, `${team}/members/${outsider.uid}`), 'admin'), 'outsider cannot add self');
  await denied(set(ref(owner.database, `${team}/members/${owner.uid}`), null), 'owner cannot be removed');
  await set(ref(owner.database, `${team}/members/${member.uid}`), 'member');
  assert.equal((await get(ref(member.database, `${team}/name`))).val(), 'Example');
  await denied(set(ref(member.database, `${team}/members/${member.uid}`), 'admin'), 'member cannot promote self');
  const review = `${team}/reviews/review1`;
  const timestamp = serverTimestamp();
  const report = { url: 'https://example.com', hostname: 'example.com', sender: '', message: '', displayed: '', status: 'unresolved', notes: '', submittedBy: member.uid, submittedAt: timestamp, updatedBy: member.uid, updatedAt: timestamp };
  await set(ref(member.database, review), report);
  await denied(update(ref(member.database, review), { status: 'legitimate', updatedBy: member.uid, updatedAt: serverTimestamp() }), 'member cannot change review');
  await denied(update(ref(owner.database, review), { hostname: 'other.example', updatedBy: owner.uid, updatedAt: serverTimestamp() }), 'admin cannot alter evidence');
  await update(ref(owner.database, review), { status: 'suspicious', notes: 'Reported to IT', updatedBy: owner.uid, updatedAt: serverTimestamp() });
  assert.equal((await get(ref(member.database, `${review}/status`))).val(), 'suspicious');
  await denied(set(ref(member.database, review), null), 'member cannot delete review');
  await set(ref(owner.database, review), null);
  assert.equal((await get(ref(owner.database, review))).exists(), false, 'admin can delete review');
  await set(ref(owner.database, `${team}/members/${member.uid}`), null);
  await denied(get(ref(member.database, team)), 'removed member cannot read');
  await Promise.all([owner, member, outsider].map(({ app }) => deleteApp(app)));
  console.log('PhishLens database authorization checks passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });

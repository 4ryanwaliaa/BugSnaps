// Explicit, disposable production acceptance test. Never uses existing customer accounts or teams.
// Requires the owner's existing Firebase CLI authorization for rules verification and cleanup.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');

if (!process.argv.includes('--run-live')) {
  console.error('This creates and deletes disposable production accounts and teams. Pass --run-live explicitly.');
  process.exit(1);
}
const origin = 'https://bugsnaps.in';
const db = 'https://mypentest-bugsnaps-default-rtdb.asia-southeast1.firebasedatabase.app';
const project = 'mypentest-bugsnaps';
const configSource = fs.readFileSync(path.join(__dirname, '../lib/firebase-auth.ts'), 'utf8');
const apiKey = configSource.match(/apiKey: "([^"]+)"/)[1];
const runId = crypto.randomBytes(10).toString('hex');
const teamIds = [`production-verification-${runId}`, `production-verification-other-${runId}`];
const accounts = [];
const sdkApps = [];
const disposableTeams = new Set();
const checks = [];
let adminToken;
const report = { startedAt: new Date().toISOString(), origin, checks, cleanup: {}, result: 'running' };
const reportPath = process.env.PHISHLENS_VERIFICATION_REPORT || path.join(os.tmpdir(), `phishlens-verification-${runId}.json`);
function passed(label) { checks.push(label); console.log(`PASS ${label}`); }
function load(name) {
  const file = path.join(__dirname, '../lib', name + '.ts');
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('exports', 'module', 'require', code)(mod.exports, mod, require);
  return mod.exports;
}
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000), redirect: 'error', cache: 'no-store' });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: response.status, body, headers: response.headers };
}
async function authCall(method, body) {
  return request(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body),
  });
}
async function database(method, key, user, body, privileged = false) {
  // A fixed database and generated test namespace are the only writable resources.
  if (method !== 'GET') assert.ok(teamIds.some(id => key === `phishlensTeams/${id}` || key.startsWith(`phishlensTeams/${id}/`)), 'write must stay within disposable team');
  const url = new URL(`${db}/${key}.json`);
  if (user) url.searchParams.set('auth', user.idToken);
  return request(url, { method, headers: { 'Content-Type': 'application/json', ...(privileged ? { Authorization: `Bearer ${adminToken}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
}
async function allow(promise, label) { const result = await promise; assert.equal(result.status, 200, `${label}: HTTP ${result.status}`); passed(label); return result.body; }
async function deny(promise, label) { const result = await promise; assert.ok([401, 403].includes(result.status), `${label}: expected denial, received HTTP ${result.status}`); passed(label); }
async function createAccount(role) {
  const email = `phishlens-verify-${role}-${runId}@example.test`;
  const password = `V!${crypto.randomBytes(24).toString('base64url')}9a`;
  const signup = await authCall('signUp', { email, password, returnSecureToken: true });
  assert.equal(signup.status, 200, `temporary ${role} signup: ${JSON.stringify(signup.body.error ?? {})}`);
  // The password is held only in this process and is never written to the report.
  const user = { localId: signup.body.localId, idToken: signup.body.idToken, email, password };
  accounts.push(user);
  const login = await authCall('signInWithPassword', { email, password, returnSecureToken: true });
  assert.equal(login.status, 200, `temporary ${role} login failed`);
  assert.equal(login.body.localId, user.localId);
  user.idToken = login.body.idToken;
  passed(`${role} can create account and sign in on production Firebase`);
  return user;
}
async function run() {
  const credentials = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/configstore/firebase-tools.json'), 'utf8'));
  const cli = process.env.FIREBASE_TOOLS_LIB || 'C:/Users/91966/AppData/Local/npm-cache/_npx/ba4f1959e38407b5/node_modules/firebase-tools/lib';
  const api = require(path.join(cli, 'api.js'));
  const refreshed = await request('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: api.clientId(), client_secret: api.clientSecret(), refresh_token: credentials.tokens.refresh_token, grant_type: 'refresh_token' }).toString(),
  });
  assert.equal(refreshed.status, 200, 'Firebase owner authorization failed');
  adminToken = refreshed.body.access_token;
  const rules = await request(`${db}/.settings/rules.json`, { headers: { Authorization: `Bearer ${adminToken}` } });
  assert.equal(rules.status, 200, 'Cannot verify production rules');
  const fragment = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/phishlens/database-rules.fragment.json'), 'utf8'));
  assert.equal(rules.body.rules['.read'], false);
  assert.equal(rules.body.rules['.write'], false);
  assert.deepEqual(rules.body.rules.phishlensTeams, fragment.phishlensTeams);
  passed('live team rules match the tested fragment with root access denied');
  for (const id of teamIds) {
    const existing = await database('GET', `phishlensTeams/${id}`, null, undefined, true);
    assert.equal(existing.status, 200);
    assert.equal(existing.body, null, 'test ID must be unused');
    disposableTeams.add(id);
  }

  for (const route of ['/phishing-detector', '/phishing-detector/team', '/privacy']) {
    const page = await request(origin + route);
    assert.equal(page.status, 200, route);
    if (route.endsWith('/team')) {
      assert.match(page.body, /Team review inbox/);
      assert.match(page.headers.get('X-Robots-Tag') || '', /noindex/);
      assert.match(page.headers.get('Content-Security-Policy') || '', /https:\/\/identitytoolkit\.googleapis\.com/);
      assert.match(page.headers.get('Content-Security-Policy') || '', /https:\/\/\*\.firebasedatabase\.app/);
    }
    passed(`${route} serves successfully with required page protections`);
  }

  const owner = await createAccount('administrator');
  const member = await createAccount('employee');
  const outsider = await createAccount('outsider');
  const team = `phishlensTeams/${teamIds[0]}`;
  const other = `phishlensTeams/${teamIds[1]}`;
  await allow(database('PUT', team, owner, { name: 'Disposable production verification', owner: owner.localId, members: { [owner.localId]: 'admin' } }), 'administrator can create a team');
  await allow(database('PUT', other, outsider, { name: 'Disposable isolated verification', owner: outsider.localId, members: { [outsider.localId]: 'admin' } }), 'separate administrator can create an isolated team');
  await deny(database('GET', team), 'anonymous users cannot read team messages');
  await deny(database('GET', team, outsider), 'another team administrator cannot read this team');
  await deny(database('GET', other, owner), 'team owner cannot read another team');
  await deny(database('GET', team, member), 'employee cannot read before being added');
  await deny(database('PUT', `${team}/members/${member.localId}`, member, 'admin'), 'employee cannot grant their own access');
  await allow(database('PUT', `${team}/members/${member.localId}`, owner, 'member'), 'administrator can add employee');
  await allow(database('GET', team, member), 'added employee can open team inbox');
  await deny(database('PUT', `${team}/members/${member.localId}`, member, 'admin'), 'employee cannot promote themselves');
  await deny(database('DELETE', `${team}/members/${owner.localId}`, owner), 'owner cannot be accidentally removed');

  const record = { url: 'https://example.com/disposable-production-test', hostname: 'example.com', sender: 'synthetic-sender@example.test', message: 'Synthetic verification only. Urgent: verify your account.', displayed: 'https://trusted.example.test', status: 'unresolved', notes: '', submittedBy: member.localId, submittedAt: { '.sv': 'timestamp' }, updatedBy: member.localId, updatedAt: { '.sv': 'timestamp' } };
  await allow(database('PUT', `${team}/reviews/verification1`, member, record), 'employee can submit message into shared inbox');
  await allow(database('PUT', `${team}/reviews/verification2`, member, record), 'second report from repeated sender and domain is saved');
  const history = await allow(database('GET', team, owner), 'administrator can reload saved submissions');
  assert.equal(Object.keys(history.reviews).length, 2);
  assert.equal(history.reviews.verification1.message, record.message);
  assert.equal(history.reviews.verification1.sender, history.reviews.verification2.sender);
  assert.equal(history.reviews.verification1.hostname, history.reviews.verification2.hostname);
  assert.ok(Number.isFinite(history.reviews.verification1.submittedAt));
  passed('message history, repeated sender/domain, and server timestamps persist');

  // Exercise the same client service and Firebase SDK that the deployed team UI
  // imports, against the same disposable production team. This is a Node SDK
  // test; it does not represent a browser interaction or rendering test.
  const { initializeApp } = require('firebase/app');
  const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
  let activeApp;
  for (const account of [owner, member]) {
    const app = initializeApp({ apiKey, authDomain: 'mypentest-bugsnaps.firebaseapp.com', databaseURL: db, projectId: project }, `phishlens-${runId}-${account.localId}`);
    sdkApps.push(app);
    await signInWithEmailAndPassword(getAuth(app), account.email, account.password);
    account.sdkApp = app;
  }
  const serviceFile = path.join(__dirname, '../lib/phishlens-team.ts');
  const service = { exports: {} };
  const serviceCode = ts.transpileModule(fs.readFileSync(serviceFile, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const serviceRequire = id => id === '@/lib/firebase-auth' ? { loadApp: async () => activeApp } : id === '@/lib/phishing-detector' ? load('phishing-detector') : require(id);
  new Function('exports', 'module', 'require', serviceCode)(service.exports, service, serviceRequire);
  const client = service.exports;
  const sdkDeadline = (promise, label) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out`)), 25000);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
  activeApp = member.sdkApp;
  await sdkDeadline(client.submitReview(teamIds[0], { url: 'https://example.com/sdk-verification', displayed: 'https://visible.example.test', sender: 'sdk-sender@example.test', message: 'Synthetic SDK verification' }), 'SDK submit');
  const memberView = await sdkDeadline(client.getTeam(teamIds[0]), 'SDK employee read');
  const sdkReview = memberView.reviews.find(item => item.message === 'Synthetic SDK verification');
  assert.ok(sdkReview); assert.equal(sdkReview.hostname, 'example.com'); assert.equal(sdkReview.status, 'unresolved');
  passed('production Firebase SDK and application service submit and read a report');
  await assert.rejects(sdkDeadline(client.updateReview(teamIds[0], sdkReview, 'legitimate', 'not allowed'), 'SDK employee decision'), /permission.denied/i);
  passed('production application service enforces employee decision restrictions');
  activeApp = owner.sdkApp;
  await sdkDeadline(client.updateReview(teamIds[0], sdkReview, 'suspicious', 'SDK reviewed'), 'SDK administrator decision');
  const ownerView = await sdkDeadline(client.getTeam(teamIds[0]), 'SDK administrator read');
  assert.equal(ownerView.reviews.find(item => item.id === sdkReview.id)?.notes, 'SDK reviewed');
  await sdkDeadline(client.deleteReview(teamIds[0], sdkReview.id), 'SDK administrator deletion');
  assert.ok(!(await sdkDeadline(client.getTeam(teamIds[0]), 'SDK deletion check')).reviews.some(item => item.id === sdkReview.id));
  passed('production Firebase SDK and application service save decisions and delete reports');
  await deny(database('PATCH', `${team}/reviews/verification1`, member, { status: 'legitimate', updatedBy: member.localId, updatedAt: { '.sv': 'timestamp' } }), 'employee cannot change administrator decision');
  await deny(database('PATCH', `${team}/reviews/verification1`, owner, { message: 'tampered', updatedBy: owner.localId, updatedAt: { '.sv': 'timestamp' } }), 'administrator cannot rewrite submitted evidence');
  for (const status of ['suspicious', 'legitimate', 'unresolved']) {
    await allow(database('PATCH', `${team}/reviews/verification1`, owner, { status, notes: `Synthetic action: ${status}`, updatedBy: owner.localId, updatedAt: { '.sv': 'timestamp' } }), `administrator can mark report ${status}`);
    const saved = await database('GET', `${team}/reviews/verification1`, member);
    assert.equal(saved.status, 200); assert.equal(saved.body.status, status); assert.equal(saved.body.notes, `Synthetic action: ${status}`); assert.equal(saved.body.updatedBy, owner.localId);
  }
  passed('employee sees saved decisions and action notes after reload');
  await deny(database('DELETE', `${team}/reviews/verification1`, member), 'employee cannot delete report');
  await allow(database('DELETE', `${team}/reviews/verification1`, owner), 'administrator can delete report');
  assert.equal((await database('GET', `${team}/reviews/verification1`, owner)).body, null);
  passed('deleted report is absent from persisted history');
  await allow(database('DELETE', `${team}/members/${member.localId}`, owner), 'administrator can revoke employee access');
  await deny(database('GET', team, member), 'revoked employee cannot fetch history');
  await deny(database('PUT', `${team}/reviews/revoked`, member, record), 'revoked employee cannot submit reports');

  const adapter = load('phishdestroy');
  for (const hostname of ['example.com', 'example-wallet-claim.xyz']) {
    const result = await adapter.checkPhishDestroy(hostname);
    assert.ok(['listed', 'unlisted'].includes(result.status), `live provider: ${result.status}`);
    assert.ok(result.details?.receivedAt);
    assert.ok(result.details?.checkedAt);
    if (result.details.score) assert.ok(Number.isFinite(result.details.score.value));
    report.reputation ??= [];
    report.reputation.push({ hostname, status: result.status, score: result.details.score ?? null, checkedAt: result.details.checkedAt, receivedAt: result.details.receivedAt, health: result.health });
    passed(`live PhishDestroy lookup validates ${hostname} result, timestamp, and score availability`);
  }
}
(async () => {
  let failure;
  try { await run(); report.result = 'passed'; }
  catch (error) { failure = error; report.result = 'failed'; report.failure = String(error.message); console.error('Verification failed:', error.message); }
  finally {
    for (const app of sdkApps) {
      try {
        const { getDatabase, goOffline } = require('firebase/database');
        goOffline(getDatabase(app));
        await require('firebase/app').deleteApp(app);
      }
      catch { failure ??= new Error('Could not close a disposable Firebase SDK client'); }
    }
    if (adminToken) for (const id of disposableTeams) {
      try {
        assert.match(id, /^production-verification-(?:other-)?[a-f0-9]{20}$/);
        const deleted = await database('DELETE', `phishlensTeams/${id}`, null, undefined, true);
        assert.equal(deleted.status, 200);
        const check = await database('GET', `phishlensTeams/${id}`, null, undefined, true);
        assert.equal(check.body, null);
        report.cleanup[id] = 'deleted and absence verified';
      } catch { report.cleanup[id] = 'cleanup failed'; failure ??= new Error('Disposable team cleanup failed'); }
    }
    for (const account of accounts) {
      try {
        const deleted = await authCall('delete', { idToken: account.idToken });
        assert.equal(deleted.status, 200);
        const check = await authCall('lookup', { idToken: account.idToken });
        assert.ok(check.status !== 200 || !check.body.users?.length);
        report.cleanup[account.email] = 'deleted and absence verified';
      } catch { report.cleanup[account.email] = 'cleanup failed'; failure ??= new Error('Disposable account cleanup failed'); }
    }
    if (failure) report.result = 'failed';
    report.finishedAt = new Date().toISOString();
    report.browserInteraction = 'Not exercised by this API and client-SDK test.';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
    console.log(`Verification report: ${reportPath}`);
    console.log(`Result: ${report.result}; ${checks.length} checks; cleanup ${Object.values(report.cleanup).every(v => v.startsWith('deleted')) ? 'passed' : 'requires attention'}`);
    // The SDK can leave reconnect timers alive even after goOffline/deleteApp.
    // All cleanup and report writes above are awaited; exit after flushing output.
    process.stdout.write('', () => process.exit(failure ? 1 : 0));
  }
})();

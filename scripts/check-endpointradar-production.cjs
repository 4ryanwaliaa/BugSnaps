/* Explicit, disposable production smoke test. Never runs without --production.
 * It uses synthetic scans only, creates verified temporary Firebase users,
 * and attempts scoped cleanup even on failure. No Windows tasks are installed.
 */
'use strict';
const assert = require('node:assert/strict');
const { randomUUID, randomBytes, createHash } = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const PROJECT = 'mypentest-bugsnaps';
const DATABASE = 'https://mypentest-bugsnaps-default-rtdb.asia-southeast1.firebasedatabase.app';
const SITE = 'https://bugsnaps.in';
const API_KEY = 'AIzaSyAozJSDdUVByXcz5BbPSdcEIDodY75Iccg'; // Firebase public web key
const argv = process.argv.slice(2);
if (argv.length !== 1 || argv[0] !== '--production') throw new Error('Explicit --production is required.');
if (process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIREBASE_DATABASE_EMULATOR_HOST || process.env.ENDPOINTRADAR_ALLOW_EMULATOR || process.env.FIRESTORE_EMULATOR_HOST || process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== PROJECT || process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_PROJECT !== PROJECT || process.env.ENDPOINTRADAR_DATABASE_URL && process.env.ENDPOINTRADAR_DATABASE_URL !== DATABASE) throw new Error('Unexpected emulator or project configuration; refusing production operation.');
if (new URL(DATABASE).host !== 'mypentest-bugsnaps-default-rtdb.asia-southeast1.firebasedatabase.app' || new URL(SITE).host !== 'bugsnaps.in') throw new Error('Unexpected target.');

// Load the user's cached Firebase CLI session. Use only a valid cached access
// token: do not launch login, refresh credentials, print tokens or write them.
const cliCache = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/configstore/firebase-tools.json'), 'utf8'));
const cached = cliCache.tokens;
if (!cached?.access_token || !cached.expires_at || cached.expires_at < Date.now() + 5 * 60_000) throw new Error('Firebase CLI access token unavailable or expires too soon; refresh the CLI login before running.');
const token = cached.access_token;
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const credential = { getAccessToken: async () => {
  const remaining = Math.floor((cached.expires_at - Date.now()) / 1000);
  if (remaining < 15) throw new Error('Cached credential expired.');
  return { access_token: token, expires_in: remaining };
} };
const app = initializeApp({ projectId: PROJECT, credential }, `endpoint-smoke-${randomUUID()}`);
const auth = getAuth(app);
const runId = randomBytes(12).toString('hex');
const marker = `ENDPOINTRADAR-SMOKE-${runId}`;
const records = ['owner','viewer','foreign'].map(role => ({ uid: `er-smoke-${runId}-${role}`, email: `er-smoke-${runId}-${role}@example.invalid`, role, password: randomBytes(28).toString('base64url') }));
const created = new Set();
const workspaceIds = new Set();
const inviteIds = new Set();
let ownerToken = null;
let failure = null;
let phase = 'initialization';

async function http(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30000), redirect: 'error' });
  const text = await response.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch {}
  return { status: response.status, data };
}
async function api(route, bearer, method = 'GET', data) {
  return http(`${SITE}/endpointradar/api${route}`, {method, headers:{...(bearer ? {authorization:`Bearer ${bearer}`} : {}), ...(data ? {'content-type':'application/json'} : {})}, ...(data ? {body:JSON.stringify(data)} : {})});
}
function expect(response, status, label) { if (response.status !== status) throw new Error(`${label}: expected HTTP ${status}, received ${response.status}.`); }
async function database(route, method = 'GET', data, bearer = token) {
  if (!/^\/(?:endpointRadar(?:\/[a-zA-Z0-9_-]+)*)?$/.test(route)) throw new Error('Unsafe database path.');
  return http(`${DATABASE}${route}.json`, { method, headers:{...(bearer ? {authorization:`Bearer ${bearer}`} : {}), ...(data !== undefined ? {'content-type':'application/json'} : {})}, ...(data !== undefined ? {body:JSON.stringify(data)} : {}) });
}
async function makeUser(record) {
  // Fixed, fresh UIDs let cleanup identify a created user after a lost response.
  try { await auth.createUser({ uid: record.uid, email: record.email, emailVerified:true, password:record.password, displayName:marker }); created.add(record.uid); }
  catch (e) { try { const existing = await auth.getUser(record.uid); if (existing.email === record.email && existing.displayName === marker) created.add(record.uid); } catch {} throw e; }
  const signed = await http(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:record.email,password:record.password,returnSecureToken:true})});
  expect(signed, 200, 'Synthetic account sign-in'); if (!signed.data?.idToken) throw new Error('Synthetic account sign-in returned no ID token.'); return signed.data.idToken;
}
async function rememberWorkspaces() {
  if (!ownerToken) return;
  const list = await api('/service/workspaces',ownerToken);
  if (list.status !== 200 || !Array.isArray(list.data?.workspaces)) return;
  for (const w of list.data.workspaces) if (w.name === marker && /^[a-f0-9]{36}$/.test(w.id)) workspaceIds.add(w.id);
}
async function run() {
 phase = 'create disposable verified accounts'; const owner = await makeUser(records[0]); ownerToken = owner;
 const viewer = await makeUser(records[1]); const foreign = await makeUser(records[2]);
 phase = 'create and isolate workspace'; const createdWorkspace = await api('/service/workspaces',owner,'POST',{name:marker});
 expect(createdWorkspace,201,'Create workspace'); const wid=createdWorkspace.data?.workspace?.id;
 if (!/^[a-f0-9]{36}$/.test(wid || '')) throw new Error('Invalid test workspace id.'); workspaceIds.add(wid);
 expect(await api(`/service/workspaces/${wid}`,foreign),404,'Foreign workspace denied');
 expect(await api(`/service/workspaces/${wid}`,null),401,'Anonymous workspace denied');
 phase = 'verify invitation and viewer access'; const invite = await api(`/service/workspaces/${wid}/invites`,owner,'POST',{email:records[1].email,role:'viewer'}); expect(invite,201,'Create viewer invite');
 const inviteId = invite.data?.inviteId; if (!/^[a-f0-9]{36}$/.test(inviteId || '')) throw new Error('Invalid test invite id.'); inviteIds.add(inviteId);
 expect(await api('/service/invites/accept',foreign,'POST',{inviteId}),404,'Foreign invitation denied');
 expect(await api('/service/invites/accept',viewer,'POST',{inviteId}),200,'Viewer accepts invitation');
 expect(await api(`/service/workspaces/${wid}`,viewer),200,'Viewer access');
 expect(await api(`/service/workspaces/${wid}/devices`,viewer,'POST',{name:marker,intervalMinutes:15}),403,'Viewer cannot enroll');
 expect(await api(`/service/workspaces/${wid}/review`,viewer,'POST',{}),403,'Viewer cannot replace review');
 phase = 'enroll synthetic device and request retest'; const device = await api(`/service/workspaces/${wid}/devices`,owner,'POST',{name:marker,intervalMinutes:15}); expect(device,201,'Register synthetic device');
 const did=device.data?.deviceId, secret=device.data?.secret; if (!/^[a-f0-9]{36}$/.test(did || '') || typeof secret !== 'string' || secret.length < 32) throw new Error('Invalid test device credentials.');
 const dp=`/device/${wid}/${did}`, sp=`/service/workspaces/${wid}/devices/${did}`;
 expect(await api(dp,'invalid'),401,'Invalid device credential denied');
 expect(await api(`${sp}/schedule`,viewer,'POST',{intervalMinutes:30}),403,'Viewer schedule denied');
 expect(await api(`${sp}/schedule`,owner,'POST',{intervalMinutes:30}),200,'Set schedule');
 expect(await api(`${sp}/retest`,owner,'POST',{}),200,'Request retest');
 const config = await api(dp,secret); expect(config,200,'Poll device schedule');
 assert.equal(config.data.intervalMinutes,30); assert(Number.isFinite(Date.parse(config.data.scanRequestedAt)));
 phase = 'upload baseline and save review'; const scan={hostname:marker,last_scan_at:new Date(Date.now()-60000).toISOString(),vulnerabilities:[],firewall:{profiles:{Domain:{state:'ON'},Private:{state:'ON'},Public:{state:'ON'}}},antivirus:{status:'enabled'}};
 const scanId=randomUUID(); expect(await api(dp,secret,'POST',{scanId,scan}),200,'Upload synthetic baseline');
 expect(await api(dp,secret,'POST',{scanId,scan}),200,'Repeat synthetic upload');
 const review=await api(`/service/workspaces/${wid}/review`,owner,'POST',{}); expect(review,200,'Save baseline review');
 const baseline=await api(`/service/workspaces/${wid}/review/${did}`,viewer); expect(baseline,200,'Viewer reads baseline'); assert.equal(baseline.data.revision,review.data.revision); assert.equal(baseline.data.scan.scan.firewall.profiles.Domain.state,'ON');
 expect(await api(`/service/workspaces/${wid}/review/${did}`,foreign),404,'Foreign review denied');
 phase = 'verify posture change and retained review'; await new Promise(resolve=>setTimeout(resolve,11000));
 const next={...scan,last_scan_at:new Date(Date.now()-1000).toISOString(),firewall:{profiles:{Domain:{state:'OFF'},Private:{state:'ON'},Public:{state:'ON'}}}};
 expect(await api(dp,secret,'POST',{scanId:randomUUID(),scan:next}),200,'Upload changed synthetic scan');
 const status=await api(`/service/workspaces/${wid}`,viewer); expect(status,200,'Read synthetic posture');
 assert(status.data?.alerts?.some(a=>a.kind==='posture' && a.message?.includes('Profile off')),'Missing firewall change alert.');
 assert.equal(status.data.devices.find(d=>d.id===did)?.latestScan?.scan?.firewall?.profiles?.Domain?.state,'OFF');
 const previous=await api(`/service/workspaces/${wid}/review/${did}`,viewer); expect(previous,200,'Review remains readable'); assert.equal(previous.data.scan.scan.firewall.profiles.Domain.state,'ON');
 phase = 'verify device revocation and direct database denial'; expect(await api(`${sp}/disable`,owner,'POST',{}),200,'Revoke device'); expect(await api(dp,secret),401,'Revoked device denied');
 const dbAnon=await database(`/endpointRadar/workspaces/${wid}`,'GET',undefined,'');
 if (![401,403].includes(dbAnon.status)) throw new Error(`Unauthenticated database read unexpectedly returned ${dbAnon.status}.`);
 const dbViewer=await database(`/endpointRadar/workspaces/${wid}`,'GET',undefined,viewer);
 if (![401,403].includes(dbViewer.status)) throw new Error(`Signed-in direct database read unexpectedly returned ${dbViewer.status}.`);
 console.log('PASS: synthetic workspace isolation, invitation, scheduling, retest, scan changes, review baseline, revocation, and database denial.');
}
async function cleanup() {
  const issues = [];
  try { await rememberWorkspaces(); } catch { issues.push('Could not discover a created workspace.'); }
  // Each workspace was returned by this run or found under its owner with the exact random marker.
  for (const wid of workspaceIds) {
    try {
      const check=await database(`/endpointRadar/workspaces/${wid}/name`);
      if (check.status!==200 || check.data!==marker) { issues.push(`Workspace identity could not be confirmed: ${wid}`); continue; }
      const inv=await database(`/endpointRadar/workspaces/${wid}/access/invites`);
      if (inv.status!==200) throw new Error('Could not enumerate invites.');
      for (const id of Object.keys(inv.data || {})) if (/^[a-f0-9]{36}$/.test(id)) inviteIds.add(id);
      const updates={ [`workspaces/${wid}`]:null,[`watchdogDevices/${wid}`]:null,[`deviceCredentials/${wid}`]:null,[`monitor/${wid}`]:null,[`workspaceSlots/${wid}`]:null };
      for (const id of inviteIds) updates[`inviteIndex/${id}`]=null;
      for (const item of records) updates[`users/${createHash('sha256').update(item.uid).digest('hex')}/workspaces/${wid}`]=null;
      const result=await database('/endpointRadar','PATCH',updates); if (result.status!==200) throw new Error('Workspace cleanup failed.');
      const verifyRoutes = [`workspaces/${wid}`,`watchdogDevices/${wid}`,`deviceCredentials/${wid}`,`monitor/${wid}`,`workspaceSlots/${wid}`,
        ...[...inviteIds].map(id=>`inviteIndex/${id}`),
        ...records.map(item=>`users/${createHash('sha256').update(item.uid).digest('hex')}/workspaces/${wid}`)];
      for (const route of verifyRoutes) { const verify=await database(`/endpointRadar/${route}`); if (verify.status!==200 || verify.data!==null) throw new Error('Cleanup verification failed.'); }
    } catch { issues.push(`Workspace cleanup failed: ${wid}`); }
  }
  for (const record of records) if (created.has(record.uid)) {
    try { const existing=await auth.getUser(record.uid); if (existing.email!==record.email || existing.displayName!==marker) throw new Error('Account identity mismatch.'); await auth.deleteUser(record.uid); }
    catch { issues.push(`Account cleanup failed: ${record.uid}`); }
  }
  try { await deleteApp(app); } catch { issues.push('Could not close Firebase Admin client.'); }
  if (issues.length) throw new Error(issues.join(' '));
}
(async()=>{
 try { await run(); } catch(e) { const safe = e instanceof Error && /^(?:[^:]{1,80}: expected HTTP [0-9]{3}, received [0-9]{3}\.|Missing firewall change alert\.)$/.test(e.message) ? ` ${e.message}` : ''; failure=`Production smoke test failed during ${phase}.${safe}`; }
 try { await cleanup(); } catch(e) { failure=`${failure || ''} Cleanup needs attention: ${e.message}`; }
 if (failure) { console.error(failure); process.exitCode=1; }
 else console.log('PASS: disposable smoke records and accounts cleaned up.');
})().catch(()=>{ console.error('Unexpected smoke test failure.'); process.exitCode=1; });

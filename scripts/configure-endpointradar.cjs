/* Configure the existing BugSnaps project without printing or saving private keys.
 * Requires Firebase CLI authentication and a Vercel CLI login for the project owner.
 * Run: node scripts/configure-endpointradar.cjs <vercel-global-config-directory>
 * The script never upgrades billing or overwrites the existing database rules.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const project = 'mypentest-bugsnaps';
const database = 'https://mypentest-bugsnaps-default-rtdb.asia-southeast1.firebasedatabase.app';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
async function api(url, token, method = 'GET', data) {
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, ...(data ? { 'Content-Type': 'application/json' } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}), signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${method} ${new URL(url).hostname}${new URL(url).pathname}: HTTP ${response.status}`);
  return response.status === 204 ? {} : response.json();
}
async function main() {
  if (!process.argv[2]) throw new Error('Pass the global config directory from the Vercel owner-account login.');
  const vercel = read(path.join(process.argv[2], 'auth.json')).token;
  if (!vercel) throw new Error('Complete the Vercel owner-account login first.');
  const owner = await api('https://api.vercel.com/v2/user', vercel);
  if (owner.user?.username !== '4ryanwaliaa') throw new Error('The Vercel login must own the BugSnaps project (4ryanwaliaa).');
  const site = await api('https://api.vercel.com/v9/projects/bug-snaps', vercel);
  if (site.name !== 'bug-snaps') throw new Error('Unexpected Vercel project.');
  const variables = await api(`https://api.vercel.com/v9/projects/${site.id}/env`, vercel);
  if (variables.envs?.some(e => e.key === 'ENDPOINTRADAR_SERVICE_ACCOUNT_JSON' && e.target?.includes('production'))) throw new Error('EndpointRadar is already configured; verify it instead of creating another key.');
  if (variables.envs?.some(e => e.key === 'CRON_SECRET' && e.target?.includes('production'))) throw new Error('A production CRON_SECRET already exists. Coordinate that existing scheduler credential rather than replacing it.');
  const google = read(path.join(os.homedir(), '.config/configstore/firebase-tools.json')).tokens?.access_token;
  if (!google) throw new Error('Sign in with the Firebase CLI first.');
  const rules = await api(`${database}/.settings/rules.json`, google);
  if (rules.rules?.['.read'] !== false || rules.rules?.['.write'] !== false || (rules.rules.endpointRadar && (rules.rules.endpointRadar['.read'] !== false || rules.rules.endpointRadar['.write'] !== false || Object.keys(rules.rules.endpointRadar).some(k => !k.startsWith('.'))))) throw new Error('EndpointRadar must have no inherited or descendant client grants. Review database rules first.');
  const direct = await fetch(`${database}/endpointRadar.json`, {signal: AbortSignal.timeout(15000)});
  if (direct.status !== 401 && direct.status !== 403) throw new Error('Direct database reads were not denied.');
  const accountId = 'endpointradar-runtime';
  const email = `${accountId}@${project}.iam.gserviceaccount.com`;
  const resource = `projects/${project}/serviceAccounts/${email}`;
  const accountUrl = `https://iam.googleapis.com/v1/${resource}`;
  const existing = await fetch(accountUrl, {headers: {Authorization:`Bearer ${google}`}, signal:AbortSignal.timeout(15000)});
  if (existing.status === 404) await api(`https://iam.googleapis.com/v1/projects/${project}/serviceAccounts`, google, 'POST', {accountId,serviceAccount:{displayName:'EndpointRadar runtime',description:'Server-side Firebase identity verification and EndpointRadar data storage.'}});
  else if (!existing.ok) throw new Error(`Service account lookup: HTTP ${existing.status}`);
  const policyUrl = `https://cloudresourcemanager.googleapis.com/v1/projects/${project}`;
  const policy = await api(`${policyUrl}:getIamPolicy`, google, 'POST', {options:{requestedPolicyVersion:3}});
  policy.bindings ||= [];
  const member = `serviceAccount:${email}`;
  for (const role of ['roles/firebaseauth.viewer', 'roles/firebasedatabase.admin']) {
    let binding = policy.bindings.find(b => b.role === role && !b.condition);
    if (!binding) { binding = {role,members:[]}; policy.bindings.push(binding); }
    if (!binding.members.includes(member)) binding.members.push(member);
  }
  await api(`${policyUrl}:setIamPolicy`, google, 'POST', {policy});
  const key = await api(`${accountUrl}/keys`, google, 'POST', {privateKeyType:'TYPE_GOOGLE_CREDENTIALS_FILE',keyAlgorithm:'KEY_ALG_RSA_2048'});
  const credential = Buffer.from(key.privateKeyData, 'base64').toString('utf8');
  const cron = crypto.randomBytes(32).toString('base64url');
  const values = {ENDPOINTRADAR_DATABASE_URL:database,ENDPOINTRADAR_SERVICE_ACCOUNT_JSON:credential,ENDPOINTRADAR_DATABASE_LOCKED:'true',CRON_SECRET:cron};
  let configured = false;
  try {
    await api(`https://api.vercel.com/v10/projects/${site.id}/env?upsert=true`, vercel, 'POST', Object.entries(values).map(([key,value]) => ({key,value,type:'encrypted',target:['production']})));
    configured = true;
    // Send the same watchdog credential to this repository's scheduler via stdin.
    const tokenResult = spawnSync('gh', ['auth','token','--user','4ryanwaliaa'], {encoding:'utf8'});
    if (tokenResult.status !== 0) throw new Error('GitHub owner authentication is unavailable.');
    const set = spawnSync('gh', ['secret','set','ENDPOINTRADAR_CRON_SECRET','--repo','4ryanwaliaa/BugSnaps'], {input:cron,encoding:'utf8',env:{...process.env,GH_TOKEN:tokenResult.stdout.trim()}});
    if (set.status !== 0) throw new Error('Vercel is configured, but the GitHub watchdog secret could not be set.');
    console.log('Configured EndpointRadar production environment and watchdog secret. Redeploy and run the live verification checklist. Private key was not written to disk.');
  } catch (error) {
    if (!configured) await api(`https://iam.googleapis.com/v1/${key.name}`, google, 'DELETE').catch(() => console.error('Key cleanup failed; revoke the newly created key in IAM.'));
    throw error;
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

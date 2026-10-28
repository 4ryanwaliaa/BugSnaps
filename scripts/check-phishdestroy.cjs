// Run with node scripts/check-phishdestroy.cjs; no network is needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = fs.readFileSync(require('node:path').join(__dirname, '../lib/phishdestroy.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = {exports:{}};
new Function('exports','module',compiled)(mod.exports,mod);
const oldFetch = global.fetch;
const health = { status:'degraded', last_sync:'2026-10-28T07:27:10Z', full_sync:{status:'degraded',ok:false,last:'2026-10-26T03:32:29Z'}, stale_lists:[] };
const response = (obj, status=200) => new Response(JSON.stringify(obj), {status, headers: {'Content-Type': 'application/json'}});
async function check(reply, expected, healthReply=response(health)) {
  const calls=[];
  global.fetch=async (url, options)=>{calls.push({url,options});if(String(url).endsWith('/v1/health'))return healthReply;if(reply instanceof Error)throw reply;return reply;};
  const result=await mod.exports.checkPhishDestroy('example.com');
  assert.equal(result.status,expected);
  assert.equal(calls.length,2);
  for (const call of calls) { const url=new URL(call.url);assert.equal(url.hostname,'api.destroy.tools');assert.equal(call.options.credentials,'omit');assert.equal(call.options.referrerPolicy,'no-referrer');assert.equal(call.options.redirect,'error');assert.ok(call.options.signal); }
  const domainCall=calls.find(call=>String(call.url).includes('/v1/check'));
  assert.equal(new URL(domainCall.url).searchParams.get('domain'),'example.com');
  return result;
}
(async()=>{try {
  const listed=await check(response({domain:'example.com',threat:true,risk_score:80,lists:{primary:true,community:true},liveness:'serving',liveness_checked_at:'2026-10-27T21:21:52Z',checked_at:'2026-10-28T07:28:52Z'}),'listed');
  assert.deepEqual(listed.details.sources,['PhishDestroy primary list','Community list']);
  assert.deepEqual(listed.details.score,{value:80,kind:'listed'});
  assert.equal(listed.details.checkedAt,'2026-10-28T07:28:52.000Z');
  assert.ok(Number.isFinite(Date.parse(listed.details.receivedAt)));
  assert.equal(listed.details.liveness,'serving');assert.equal(listed.health.status,'degraded');assert.equal(listed.health.fullSyncAt,'2026-10-26T03:32:29.000Z');
  const noScore=await check(response({domain:'example.com',threat:false,whitelisted:true}),'unlisted');
  assert.equal(noScore.details.score,undefined);
  assert.equal(noScore.details.checkedAt,undefined);
  for (const bad of [-1, 101, 1.5, '10', null]) {
    const invalid=await check(response({domain:'example.com',threat:true,risk_score:bad}),'listed');
    assert.equal(invalid.details.score,undefined);
  }
  const zero=await check(response({domain:'example.com',threat:false,heuristic_score:0}),'unlisted');
  assert.deepEqual(zero.details.score,{value:0,kind:'heuristic'});
  const points=await check(response({domain:'example.com',threat:false,heuristic_score:105}),'unlisted');
  assert.deepEqual(points.details.score,{value:105,kind:'heuristic'});
  const excessive=await check(response({domain:'example.com',threat:false,heuristic_score:10001}),'unlisted');
  assert.equal(excessive.details.score,undefined);
  await check(response({domain:'other.example',threat:true}),'inconclusive');
  await check(response({domain:'example.com',threat:'true'}),'inconclusive');
  const heuristic = await check(response({domain:'example.com',threat:false,suspicious:true,heuristic_score:10,heuristic_flags:['risky_tld','<script>']}),'unlisted');
  assert.deepEqual(heuristic.details.providerSignals,['Top-level domain associated with abuse']);
  assert.deepEqual(heuristic.details.score,{value:10,kind:'heuristic'});
  const changed = await check(response({domain:'example.com',threat:true,matched_domain:'bad.other.com',liveness:'resolving'}),'listed');
  assert.equal(changed.details.matchedDomain,undefined);assert.equal(changed.details.liveness,'dns-active');
  global.fetch=async url=>String(url).endsWith('/v1/health')?response(health):response({domain:'example.com',threat:true,matched_domain:'example.com',liveness:'offline'});
  const www=await mod.exports.checkPhishDestroy('www.example.com');assert.equal(www.status,'listed');assert.equal(www.details.matchedDomain,'example.com');assert.equal(www.details.liveness,'inactive');
  await check(response(null),'inconclusive');
  await check(response({},429),'rate-limited');
  await check(response({},503),'unavailable');
  await check(new Error('network'),'unavailable');
  // Check returns a verdict even when the independent health request is unavailable.
  global.fetch=async url=>String(url).endsWith('/v1/health')?Promise.reject(Error('offline')):response({domain:'example.com',threat:false});
  assert.equal((await mod.exports.checkPhishDestroy('example.com')).health.status,'unavailable');
  global.fetch=()=>{throw Error('invalid hosts must not be sent');};
  for(const host of ['127.0.0.1','1.2.3','[::1]','localhost','machine.local','host.localdomain','host.intranet','host.private','foo.internal','https://example.com/a','example.com/path','a@b.com','foo bar.com']) assert.equal((await mod.exports.checkPhishDestroy(host)).status,'inconclusive',host);
  console.log('PhishDestroy checks passed.');
}finally{global.fetch=oldFetch;}})().catch(e=>{console.error(e);process.exitCode=1});

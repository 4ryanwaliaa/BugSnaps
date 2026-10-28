// Run with node scripts/check-phishlens-dns.cjs. No network is used.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../lib/phishlens-dns.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const moduleObject = { exports: {} };
new Function("exports", "module", compiled)(moduleObject.exports, moduleObject);
const { checkCloudflareDns } = moduleObject.exports;
const oldFetch = global.fetch;
const dns = (addresses, overrides = {}) => ({ Status: 0, TC: false, Question: [{ name: "example.com.", type: 1 }], Answer: addresses.map(data => ({ type: 1, data })), ...overrides });
const response = value => ({ ok: true, json: async () => value });
async function check(replies, expected) {
  const calls = [];
  global.fetch = async (url, options) => { calls.push({ url, options }); const reply = replies.shift(); if (reply instanceof Error) throw reply; return reply; };
  const actual = await checkCloudflareDns("example.com");
  assert.equal(actual.status, expected);
  for (const call of calls) {
    const url = new URL(call.url);
    assert.ok(["security.cloudflare-dns.com", "cloudflare-dns.com"].includes(url.hostname));
    assert.equal(url.searchParams.get("name"), "example.com");
    assert.equal(url.searchParams.get("type"), "A");
    assert.equal(call.options.credentials, "omit");
    assert.equal(call.options.referrerPolicy, "no-referrer");
    assert.equal(call.options.redirect, "error");
    assert.ok(call.options.signal);
  }
  return calls;
}
(async () => {
  try {
    assert.equal((await check([response(dns(["203.0.113.2"]))], "unlisted")).length, 1);
    const filteredCalls = await check([response(dns(["0.0.0.0"])), response(dns(["203.0.113.2"]))], "filtered");
    assert.equal(filteredCalls.length, 2);
    assert.equal(new URL(filteredCalls[1].url).hostname, "cloudflare-dns.com");
    await check([response(dns(["0.0.0.0"])), response(dns(["0.0.0.0"]))], "inconclusive");
    await check([response(dns(["0.0.0.0", "203.0.113.1"]))], "inconclusive");
    await check([response(dns(["0.0.0.0"])), response(dns([], { Status: 3 }))], "inconclusive");
    await check([response(dns(["0.0.0.0"])), new Error("offline")], "inconclusive");
    for (const status of [2, 3, 5]) await check([response(dns([], { Status: status }))], "inconclusive");
    await check([response(dns([]))], "inconclusive");
    await check([response(dns(["999.1.1.1"]))], "inconclusive");
    await check([response(dns(["1.2.3.4"], { TC: true }))], "inconclusive");
    await check([response(dns(["1.2.3.4"], { Question: [{ name: "other.example", type: 1 }] }))], "inconclusive");
    await check([{ ok: false }], "unavailable");
    await check([new Error("network error")], "unavailable");
    global.fetch = (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true }));
    assert.equal((await checkCloudflareDns("example.com")).status, "unavailable", "timeout must abort a stalled request");
    global.fetch = () => { throw new Error("Should not query private names"); };
    for (const hostname of ["127.0.0.1", "127.1", "[::1]", "localhost", "server.local", "server.internal", "host.lan", "x.test", "x.invalid", "secret.onion", "https://example.com/path", "example.com/path", "foo@bar.com", "foo bar.com"]) {
      assert.equal((await checkCloudflareDns(hostname)).status, "inconclusive", hostname);
    }
    console.log("PhishLens DNS checks passed.");
  } finally { global.fetch = oldFetch; }
})().catch(error => { console.error(error); process.exitCode = 1; });

// Run with node scripts/check-phishing-detector.cjs; no network is needed.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

const source = fs.readFileSync(require("node:path").join(__dirname, "../lib/phishing-detector.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const moduleObject = { exports: {} };
new Function("exports", "module", compiled)(moduleObject.exports, moduleObject);
const { analyzePhishingUrl } = moduleObject.exports;
const originalFetch = global.fetch;
global.fetch = () => { throw new Error("Review must not make network requests"); };

try {
  const ordinary = analyzePhishingUrl("example.com/path");
  assert.equal(ordinary.ok, true);
  assert.equal(ordinary.hostname, "example.com");
  assert.equal(ordinary.verdict, "no-obvious-signals");
  assert.ok(ordinary.findings.some((finding) => finding.id === "assumed-scheme"));

  for (const input of ["", "javascript:alert(1)", "file:///etc/passwd", "https://", "https:///evil.example", "https:8080", "https://example.com\\@evil.com", "https://exam ple.com", "https://example.com/\nother", "https://%zz.com"]) {
    assert.equal(analyzePhishingUrl(input).ok, false, `Should reject ${JSON.stringify(input)}`);
  }

  function expectFinding(input, id) {
    const result = analyzePhishingUrl(input);
    assert.equal(result.ok, true, `Should parse ${input}`);
    assert.ok(result.findings.some((finding) => finding.id === id), `Missing ${id}`);
    assert.notEqual(result.verdict, "no-obvious-signals");
    return result;
  }

  const disguised = expectFinding("https://trusted.example@other.example/login", "userinfo");
  assert.equal(disguised.hostname, "other.example");
  assert.equal(disguised.verdict, "high-risk");
  expectFinding("http://127.0.0.1/login", "ip-address");
  expectFinding("https://0x7f000001/", "ip-address");
  expectFinding("https://[::1]/", "ip-address");
  expectFinding("https://xn--pple-43d.example/", "internationalized-domain");
  expectFinding("https://bit.ly/example", "shortener");
  expectFinding("https://login.verify.example.com/", "account-terms");
  expectFinding("http://example.com/", "http");
  for (const address of [
    "https://paypa1-example.com/login",
    "https://paypal.com.attacker.example/",
    "https://g00gle-login.example/",
    "https://micros0ft.example/",
  ]) expectFinding(address, "brand-lookalike");
  for (const address of [
    "https://www.paypal.com/",
    "https://accounts.google.com/",
    "https://www.google.co.in/",
    "https://login.microsoftonline.com/",
    "https://example.com/paypal-login",
    "https://example.com/?q=paypal",
    "https://example.com/@user",
  ]) {
    const result = analyzePhishingUrl(address);
    assert.equal(result.ok, true);
    assert.equal(result.findings.some((finding) => finding.id === "brand-lookalike"), false, `Unexpected brand match: ${address}`);
    assert.equal(result.findings.some((finding) => finding.id === "userinfo"), false, `Unexpected authority match: ${address}`);
  }
  expectFinding("https://example.com/login?next=https%3A%2F%2Fother.example%2Faccount", "external-redirect-parameter");
  for (const address of [
    "https://example.com/?next=%2Faccount",
    "https://example.com/?next=https%3A%2F%2Fexample.com%2Faccount",
    "https://example.com/?q=https%3A%2F%2Fother.example",
  ]) {
    const result = analyzePhishingUrl(address);
    assert.equal(result.ok, true);
    assert.equal(result.findings.some((finding) => finding.id === "external-redirect-parameter"), false, `Unexpected destination warning: ${address}`);
  }
  assert.equal(analyzePhishingUrl("https://bit.ly.example.com/").findings.some((finding) => finding.id === "shortener"), false);
  assert.equal(analyzePhishingUrl("https://example.com/?next=bit.ly").findings.some((finding) => finding.id === "shortener"), false);
  assert.equal(analyzePhishingUrl("example.com:8080").ok, true);
  console.log("Phishing detector checks passed.");
} finally {
  global.fetch = originalFetch;
}

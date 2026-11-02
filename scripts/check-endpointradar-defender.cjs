const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
function compile(file, requireFn) {
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mod = { exports: {} }; vm.runInNewContext(code, { module: mod, exports: mod.exports, require: requireFn, Date });
  return mod.exports;
}
const status = compile("lib/endpointradar/defender-tamper.ts", require).defenderTamperStatus;
assert.equal(status(true), "Enabled");
assert.equal(status(false), "Disabled");
for (const value of [undefined, null, "true", "false", 0, {}, []]) assert.equal(status(value), "Unknown");
const normalize = compile("app/endpointradar/app/workspace.tsx", name => name === "@/lib/endpointradar/defender-tamper" ? { defenderTamperStatus: status } : name.startsWith(".") ? {} : require(name)).normalize;
for (const [raw, expected] of [[true, "Enabled"], [false, "Disabled"], [null, "Unknown"], [undefined, "Unknown"], ["true", "Unknown"]]) {
  assert.equal(normalize({vulnerabilities: [], antivirus: {defender_tamper_protection: raw}}).defenderTamper, expected);
}
assert.equal(normalize({vulnerabilities: []}).defenderTamper, "Unknown");
console.log("PASS Defender tamper import states and legacy/invalid input");

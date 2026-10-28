#!/usr/bin/env node
// Offline evaluation only. This program never fetches or displays submitted URLs.
// Usage: node scripts/evaluate-phishing-detector.cjs <phishtank.json> <comparison.txt>
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ts = require("typescript");

const args = process.argv.slice(2);
const listedMode = args[0] === "--listed-urls";
const phishPath = listedMode ? args[1] : args[0];
const comparisonPath = listedMode ? args[2] : args[1];
if (!phishPath || (listedMode ? args.length > 3 : args.length !== 2)) {
  console.error("Usage: node scripts/evaluate-phishing-detector.cjs <phishtank.json> <comparison.txt>\n   or: node scripts/evaluate-phishing-detector.cjs --listed-urls <urls.txt> [comparison.txt]");
  process.exit(2);
}
const hash = (data) => crypto.createHash("sha256").update(data).digest("hex");
const enginePath = path.join(__dirname, "../lib/phishing-detector.ts");
const engine = fs.readFileSync(enginePath);
const compiled = ts.transpileModule(engine.toString("utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const moduleObject = { exports: {} };
new Function("exports", "module", "require", compiled)(moduleObject.exports, moduleObject, require);
const analyze = moduleObject.exports.analyzePhishingUrl;
const phishingData = fs.readFileSync(phishPath);
const comparisonData = comparisonPath ? fs.readFileSync(comparisonPath) : null;
let phishing;
if (listedMode) {
  const content = phishingData.toString("utf8").replace(/^\uFEFF/, "");
  if (content.trimStart().startsWith("[")) {
    phishing = JSON.parse(content);
    if (!Array.isArray(phishing) || phishing.some(value => typeof value !== "string")) throw new Error("The listed-URLs JSON must be an array of strings.");
    phishing = phishing.map(value => value.trim()).filter(Boolean);
  } else phishing = content.split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith("#"));
} else {
  try { phishing = JSON.parse(phishingData.toString("utf8").replace(/^\uFEFF/, "")); }
  catch { throw new Error("The phishing file must be a PhishTank JSON array."); }
  if (!Array.isArray(phishing)) throw new Error("The phishing file must be a PhishTank JSON array.");
}
const isYes = (value) => value === "yes" || value === true;
let excluded = 0;
const positiveUrls = [];
for (const row of phishing) {
  if (listedMode) { positiveUrls.push(row); continue; }
  if (!row || typeof row.url !== "string" || !isYes(row.verified) || !isYes(row.online)) { excluded++; continue; }
  positiveUrls.push(row.url.trim());
}
const comparison = comparisonData ? comparisonData.toString("utf8").replace(/^\uFEFF/, "").split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith("#")) : [];
if (!positiveUrls.length || (comparisonData && !comparison.length)) throw new Error("Each supplied dataset must contain at least one usable entry.");
const uniquePositive = [...new Set(positiveUrls)];
const uniqueComparison = [...new Set(comparison)];
const positiveSet = new Set(uniquePositive);
const overlap = uniqueComparison.filter(url => positiveSet.has(url)).length;
if (overlap) throw new Error(`Datasets contain ${overlap} identical input entries. Remove overlap before evaluation.`);

function evaluate(urls) {
  const result = { inputEntries: urls.length, parsed: 0, rejected: 0, highConcern: 0, review: 0, noObviousSignals: 0, findingCounts: {} };
  for (const input of urls) {
    const review = analyze(input);
    if (!review.ok) { result.rejected++; continue; }
    result.parsed++;
    if (review.verdict === "high-risk") result.highConcern++;
    else if (review.verdict === "review") result.review++;
    else if (review.verdict === "no-obvious-signals") result.noObviousSignals++;
    else throw new Error("Unknown detector verdict; update evaluation script.");
    for (const finding of review.findings) result.findingCounts[finding.id] = (result.findingCounts[finding.id] || 0) + 1;
  }
  result.flagged = result.highConcern + result.review;
  return result;
}
const output = {
  evaluatedAt: new Date().toISOString(),
  engineSha256: hash(engine),
  inputs: {
    phishing: { format: listedMode ? "listed-urls" : "phishtank-json", sha256: hash(phishingData), rows: phishing.length, excludedNotVerifiedOrOnline: listedMode ? null : excluded, duplicateInputs: positiveUrls.length - uniquePositive.length },
    comparison: comparisonData ? { sha256: hash(comparisonData), rows: comparison.length, duplicateInputs: comparison.length - uniqueComparison.length } : null,
  },
  phishing: evaluate(uniquePositive),
  comparison: comparisonData ? evaluate(uniqueComparison) : null,
  caveat: "Counts describe only these supplied samples. Comparison entries are not automatically verified benign; absence of warnings is not a safety verdict. Do not generalize to real-world accuracy.",
};
console.log(JSON.stringify(output, null, 2));

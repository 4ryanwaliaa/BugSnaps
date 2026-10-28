/* Validate the guide registry before rendering its static routes. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} };
  cache.set(file, mod);
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: file }).outputText;
  const localRequire = (id) => id.startsWith("@/") ? load(`${id.slice(2)}.ts`) : require(id);
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require: localRequire, URL, Date, console }, { filename: file });
  return mod.exports;
}
const { SECURITY_GUIDES, SECURITY_GUIDE_CATEGORIES } = load("lib/security-guides.ts");
const { SITEMAP_PAGES } = load("lib/sitemap-pages.ts");
const slugs = new Set();
const titles = new Set();
const descriptions = new Set();
const thinGuides = [];
const sitemap = new Set(SITEMAP_PAGES.map((page) => page.path));
for (const guide of SECURITY_GUIDES) {
  assert.match(guide.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid slug: ${guide.slug}`);
  assert(!slugs.has(guide.slug), `Duplicate guide: ${guide.slug}`);
  slugs.add(guide.slug);
  assert(!titles.has(guide.title.toLowerCase()), `Duplicate guide title: ${guide.slug}`);
  assert(!descriptions.has(guide.description.toLowerCase()), `Duplicate guide description: ${guide.slug}`);
  titles.add(guide.title.toLowerCase());
  descriptions.add(guide.description.toLowerCase());
  assert(SECURITY_GUIDE_CATEGORIES.includes(guide.category), `Unknown category: ${guide.slug}`);
  assert(sitemap.has(`/guides/${guide.slug}`), `Guide missing from sitemap: ${guide.slug}`);
  assert(guide.sections.length && guide.faqs.length && guide.sources.length, `Incomplete guide: ${guide.slug}`);
  if (guide.updated === "2026-10-28") {
    const content = [guide.answer, ...guide.sections.flatMap((section) => [...section.paragraphs, ...(section.checklist || [])]), guide.limitations, ...guide.faqs.flatMap((faq) => [faq.question, faq.answer])].join(" ");
    if (guide.sections.length < 4 || content.trim().split(/\s+/).length < 250) thinGuides.push(guide.slug);
  }
  for (const source of guide.sources) assert.equal(new URL(source.url).protocol, "https:", `Non-HTTPS source: ${guide.slug}`);
  for (const section of guide.sections) if (section.source !== undefined) assert(guide.sources[section.source], `Invalid source reference: ${guide.slug}`);
}
assert.equal(thinGuides.length, 0, `New guides need more substantive content: ${thinGuides.join(", ")}`);
for (const guide of SECURITY_GUIDES) {
  for (const related of guide.related) assert(slugs.has(related), `Missing related guide ${related} in ${guide.slug}`);
}
console.log(`Validated ${SECURITY_GUIDES.length} guides and ${SITEMAP_PAGES.length} sitemap URLs.`);

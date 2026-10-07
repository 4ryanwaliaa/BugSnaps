/* Audit the actual server-rendered public site and its sitemap.
 * node scripts/check-seo.cjs --base http://localhost:3100
 * node scripts/check-seo.cjs --base https://bugsnaps.in --report <path>
 * Reads only public pages. No provider account or payment is involved.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const base = new URL(option("--base", "http://localhost:3100"));
const reportPath = option("--report", null);
const cache = new Map();
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  }, fileName: file }).outputText;
  const localRequire = (id) => id.startsWith("@/") ? load(`${id.slice(2)}.ts`)
    : id.startsWith(".") ? load(`${path.relative(root, path.resolve(path.dirname(file), id))}.ts`) : require(id);
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require: localRequire, URL, Date, console }, { filename: file });
  return mod.exports;
}
const { INDEXABLE_ROUTES } = load("lib/routes.ts");
const { posts } = load("lib/blog.ts");
const { SITE_URL } = load("lib/site.ts");
const paths = [...INDEXABLE_ROUTES.map((r) => r.path), ...posts.map((p) => `/blog/${p.slug}`)];
assert.equal(new Set(paths).size, paths.length, "Duplicate sitemap paths");
assert(paths.every((p) => p.startsWith("/") && !/^\/mypentest\/(app|api)/.test(p)), "Private routes in sitemap");
const expected = new Set(paths.map((p) => p === "/" ? SITE_URL : SITE_URL + p));
const decode = (s) => s.replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&nbsp;/g, " ");
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [m[1].toLowerCase(), decode(m[2] ?? m[3])]));
function text(s) {
  const clean = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  const stack = [], parts = [], voids = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  for (const token of clean.match(/<[^>]*>|[^<]+/g) || []) {
    if (!token.startsWith("<")) { if (!stack.at(-1)?.hidden) parts.push(token); continue; }
    const match = token.match(/^<\s*(\/?)\s*([a-z][\w:-]*)/i);
    if (!match) continue;
    const name = match[2].toLowerCase();
    if (match[1]) {
      const i = stack.findLastIndex((frame) => frame.name === name);
      if (i >= 0) stack.length = i;
    } else if (!voids.has(name) && !/\/\s*>$/.test(token)) {
      const attr = attributes(token);
      const booleanHidden = /\shidden(?:\s|=|\/?>)/i.test(token.replace(/"[^"]*"|'[^']*'/g, '""'));
      stack.push({ name, hidden: Boolean(stack.at(-1)?.hidden || booleanHidden || attr["aria-hidden"] === "true"
        || /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attr.style || "")) });
    }
  }
  return decode(parts.join(" ")).replace(/\s+/g, " ").trim();
}
assert.equal(text('<p>Visible</p><div hidden><p>Hidden answer</p></div>'), "Visible", "Hidden content must not validate a FAQ answer");
assert.equal(text('<details><summary>Question</summary><p>Expandable answer</p></details>'), "Question Expandable answer", "Expandable FAQ answers remain readable");
assert.equal(text('<div aria-hidden="true"><span>Decoration</span></div><p>Content</p>'), "Content", "Hidden descendants must stay excluded");
const meta = (html, key) => [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attributes(m[0])).find((a) => (a.name || a.property || "").toLowerCase() === key)?.content;
const links = (html) => [...html.matchAll(/<a\b[^>]*>/gi)].map((m) => attributes(m[0]).href).filter(Boolean);
const errors = [], pages = [], linked = new Set(), titles = new Map(), descriptions = new Map();
const fail = (url, message) => errors.push({ url, message });
async function get(route) {
  const response = await fetch(new URL(route, base), { redirect: "manual", signal: AbortSignal.timeout(30000) });
  return { status: response.status, type: response.headers.get("content-type") || "", robots: response.headers.get("x-robots-tag") || "", body: await response.text() };
}
async function audit(route) {
  try {
    const response = await get(route), html = response.body;
    if (response.status !== 200) { fail(route, `HTTP ${response.status}`); return; }
    if (!response.type.includes("text/html")) fail(route, "Expected HTML");
    const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const description = meta(html, "description");
    const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attributes(m[0])).find((a) => a.rel === "canonical")?.href;
    const correct = route === "/" ? SITE_URL : SITE_URL + route;
    if (!title) fail(route, "Missing title");
    else if (titles.has(title)) fail(route, `Duplicate title with ${titles.get(title)}`); else titles.set(title, route);
    if (!description || description.length < 40) fail(route, "Missing or empty description");
    else if (descriptions.has(description)) fail(route, `Duplicate description with ${descriptions.get(description)}`); else descriptions.set(description, route);
    if (canonical !== correct) fail(route, `Canonical is ${canonical || "missing"}`);
    if (meta(html, "og:url") !== correct || !meta(html, "og:image")) fail(route, "Missing or incorrect social metadata");
    if (/noindex/i.test([meta(html, "robots"), meta(html, "googlebot"), response.robots].filter(Boolean).join(","))) fail(route, "Public page marked noindex");
    const headingCount = [...html.matchAll(/<h1\b/gi)].length;
    if (headingCount !== 1) fail(route, `Expected one H1; found ${headingCount}`);
    const mainText = text(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "");
    if (/^\/(guides|use-cases|alternatives)\//.test(route) && mainText.split(/\s+/).length < 300) fail(route, "Insufficient rendered explanatory content");
    const schema = [];
    for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const data = JSON.parse(m[1]); schema.push(...(data["@graph"] || (Array.isArray(data) ? data : [data])));
      } catch { fail(route, "Invalid JSON-LD"); }
    }
    if (!schema.length) fail(route, "Missing structured data");
    for (const data of schema) if (data["@type"] === "FAQPage") {
      if (!Array.isArray(data.mainEntity) || data.mainEntity.length === 0) { fail(route, "FAQ has no questions"); continue; }
      for (const item of data.mainEntity) {
        if (item?.["@type"] !== "Question" || item.acceptedAnswer?.["@type"] !== "Answer"
            || typeof item.name !== "string" || typeof item.acceptedAnswer?.text !== "string"
            || !text(item.name) || !text(item.acceptedAnswer.text)) { fail(route, "FAQ question or answer is empty or malformed"); continue; }
        if (!mainText.includes(text(item.name)) || !mainText.includes(text(item.acceptedAnswer.text))) fail(route, "FAQ structured data differs from rendered main content");
      }
    }
    const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => decode(m[1])));
    for (const href of links(html)) {
      if (href.startsWith("#")) {
        if (href.length > 1 && !ids.has(decodeURIComponent(href.slice(1)))) fail(route, `Missing on-page anchor: ${href}`);
        continue;
      }
      if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
      const url = new URL(href, SITE_URL + route);
      if (url.origin !== SITE_URL) continue;
      const target = url.pathname.replace(/\/$/, "") || "/";
      if (expected.has(target === "/" ? SITE_URL : SITE_URL + target)) linked.add(target);
      else if (!/^\/mypentest\/(app|api)(\/|$)/.test(target) && !/\.[a-z0-9]+$/i.test(target)) fail(route, `Unlisted internal page link: ${target}`);
    }
    pages.push({ path: route, status: response.status, title, canonical, schemaTypes: schema.map((d) => d["@type"]) });
  } catch (e) { fail(route, e.message); }
}
(async () => {
  const xml = await get("/sitemap.xml");
  assert.equal(xml.status, 200, "Sitemap is unavailable");
  assert(xml.type.includes("xml"), "Sitemap content type must be XML");
  const entries = [...xml.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));
  assert.equal(entries.length, expected.size, "Sitemap entry count does not match route catalog");
  assert.equal(new Set(entries).size, entries.length, "Sitemap contains duplicates");
  assert(entries.every((url) => expected.has(url)), "Sitemap contains unknown or private URLs");
  const robots = await get("/robots.txt");
  assert.equal(robots.status, 200, "robots.txt is unavailable");
  assert(robots.body.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), "Missing sitemap discovery directive");
  assert(robots.body.includes("Disallow: /mypentest/app") && robots.body.includes("Disallow: /mypentest/api"), "Private areas must remain excluded");
  // Check the applicable named group, not just the wildcard fallback.
  const groups = [];
  let group = { agents: [], rules: [] };
  for (const raw of robots.body.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const match = line.match(/^(user-agent|allow|disallow):\s*(.*)$/i);
    if (!match) continue;
    const key = match[1].toLowerCase(), value = match[2];
    if (key === "user-agent") {
      if (group.rules.length) { groups.push(group); group = { agents: [], rules: [] }; }
      group.agents.push(value.toLowerCase());
    } else group.rules.push({ key, value });
  }
  if (group.agents.length) groups.push(group);
  for (const bot of ["Googlebot", "Bingbot", "DuckDuckBot", "OAI-SearchBot", "GPTBot", "Google-Extended", "ClaudeBot", "Claude-SearchBot", "PerplexityBot"]) {
    const applicable = groups.filter(g => g.agents.includes(bot.toLowerCase()));
    assert(applicable.length, `Missing explicit crawler policy for ${bot}`);
    const rules = applicable.flatMap(g => g.rules);
    assert(rules.some(r => r.key === "allow" && r.value === "/"), `${bot} cannot crawl public content`);
    for (const privatePath of ["/mypentest/app", "/mypentest/api"]) {
      assert(rules.some(r => r.key === "disallow" && r.value === privatePath), `${bot} private-path exclusion missing`);
    }
  }
  const llms = await get("/llms.txt");
  assert.equal(llms.status, 200, "AI discovery directory unavailable");
  assert(llms.type.includes("text/plain"), "AI directory must be plain text");
  for (const match of llms.body.matchAll(/\]\((https:\/\/[^)]+)\)/g)) {
    const url = new URL(match[1]);
    assert.equal(url.origin, SITE_URL, "AI directory must use the canonical origin");
    const canonical = url.pathname === "/" ? url.origin : url.href;
    assert(expected.has(canonical), `Unknown AI discovery URL: ${url.href}`);
  }
  const csv = await get("/benchmarks/run-template.csv");
  assert.equal(csv.status, 200, "Benchmark record template unavailable");
  assert(csv.body.includes("ground_truth_artifact") && csv.body.includes("raw_report_artifact"), "Benchmark template missing evidence fields");
  let index = 0;
  await Promise.all(Array.from({ length: 5 }, async () => { while (index < paths.length) await audit(paths[index++]); }));
  for (const p of paths) if (p !== "/" && !linked.has(p)) fail(p, "No internal page links to this URL");
  for (const route of ["/guides/not-a-guide", "/use-cases/not-a-use-case", "/alternatives/not-a-tool", "/compare/mypentest-vs-not-a-tool"]) {
    const response = await get(route);
    if (response.status !== 404) fail(route, `Unknown content must return 404; found ${response.status}`);
  }
  const report = { base: base.origin, checkedAt: new Date().toISOString(), sitemapEntries: entries.length, pagesChecked: pages.length, errors, pages };
  if (reportPath) fs.writeFileSync(path.resolve(reportPath), JSON.stringify(report, null, 2) + "\n");
  if (errors.length) { for (const e of errors) console.error(`${e.url}: ${e.message}`); process.exitCode = 1; }
  else console.log(`PASS: ${pages.length} public pages; sitemap, canonical URLs, unique metadata, headings, schema, FAQ text, internal discovery and unknown-route 404s.`);
})().catch((e) => { console.error(e.message); process.exitCode = 1; });

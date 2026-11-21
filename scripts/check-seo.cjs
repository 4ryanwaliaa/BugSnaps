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
const strictBlog = args.includes("--strict-blog");
const strictCatalog = args.includes("--strict-catalog");
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
const { SITEMAP_PAGES } = load("lib/sitemap-pages.ts");
const { competitors, versusPath } = load("lib/competitors.ts");
const VERSUS_DYNAMIC_ROUTES = new Set(competitors.map((c) => versusPath(c.slug)));
const LEGAL_ROUTES = new Set(["/privacy", "/terms", "/refund-policy", "/responsible-disclosure"]);
const isBlogRoute = (route) => route.startsWith("/blog/");
const isCatalogDynamicRoute = (route) =>
  route.startsWith("/guides/") || route.startsWith("/alternatives/") || VERSUS_DYNAMIC_ROUTES.has(route);
const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const paths = [...INDEXABLE_ROUTES.map((r) => r.path), ...posts.map((p) => `/blog/${p.slug}`)];
assert.equal(new Set(paths).size, paths.length, "Duplicate sitemap paths");
assert(paths.every((p) => p.startsWith("/") && !/^\/(?:mypentest\/(?:app|api)|endpointradar\/(?:app|managed)|phishing-detector\/team)(\/|$)/.test(p)), "Private routes in sitemap");
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
const errors = [], warnings = [], pages = [], linked = new Set(), titles = new Map(), descriptions = new Map();
const graph = new Map(), assets = new Map();
const fail = (url, message) => errors.push({ url, message });
const warn = (url, message) => warnings.push({ url, message });
const checkLength = (route, message, enforce) => (enforce ? fail(route, message) : warn(route, message));
const addAsset = (assetPath, route) => {
  if (!assets.has(assetPath)) assets.set(assetPath, new Set());
  assets.get(assetPath).add(route);
};
function validateItemList(route, d) {
  if (!nonEmpty(d.name) || !Array.isArray(d.itemListElement) || d.itemListElement.length === 0) {
    fail(route, "Invalid ItemList JSON-LD: missing name or itemListElement");
    return;
  }
  for (const e of d.itemListElement) {
    const validFlat = nonEmpty(e?.name) && nonEmpty(e?.url || e?.item);
    const validNested = nonEmpty(e?.item?.name) && nonEmpty(e?.item?.url);
    if (e?.["@type"] !== "ListItem" || !Number.isInteger(e.position) || e.position < 1 || (!validFlat && !validNested)) {
      fail(route, "Invalid ItemList ListItem entry");
      break;
    }
  }
}
function validateSchemaNode(route, d, mainText) {
  const t = d?.["@type"];
  if (!t) { fail(route, "JSON-LD node missing @type"); return; }
  if (t === "Organization" || t === "WebSite") {
    if (!nonEmpty(d.name) || !nonEmpty(d.url)) fail(route, `Invalid ${t} JSON-LD: missing name or url`);
  } else if (t === "BreadcrumbList") {
    if (!Array.isArray(d.itemListElement) || d.itemListElement.length === 0) {
      fail(route, "BreadcrumbList has no items");
    } else {
      for (const e of d.itemListElement) {
        if (e?.["@type"] !== "ListItem" || !Number.isInteger(e.position) || e.position < 1 || !nonEmpty(e.name) || !nonEmpty(e.item || e.url)) {
          fail(route, "BreadcrumbList ListItem is malformed");
          break;
        }
      }
    }
  } else if (t === "SoftwareApplication") {
    if (!nonEmpty(d.name) || !nonEmpty(d.applicationCategory) || !nonEmpty(d.operatingSystem) || !nonEmpty(d.url)) {
      fail(route, "SoftwareApplication JSON-LD missing required fields");
    }
  } else if (t === "Service") {
    if (!nonEmpty(d.name) || !nonEmpty(d.description) || !nonEmpty(d.url) || !d.provider) {
      fail(route, "Service JSON-LD missing required fields");
    }
  } else if (t === "Article" || t === "TechArticle" || t === "BlogPosting") {
    if (!nonEmpty(d.headline) || !nonEmpty(d.description) || !d.author || !d.publisher || !nonEmpty(d.datePublished || d.dateModified) || !nonEmpty(d.mainEntityOfPage || d.url)) {
      fail(route, `${t} JSON-LD missing required fields`);
    }
  } else if (t === "VideoObject") {
    const hasThumb = nonEmpty(d.thumbnailUrl) || (Array.isArray(d.thumbnailUrl) && d.thumbnailUrl.some(nonEmpty));
    if (!nonEmpty(d.name) || !nonEmpty(d.description) || !hasThumb || !nonEmpty(d.uploadDate) || !nonEmpty(d.contentUrl || d.embedUrl)) {
      fail(route, "VideoObject JSON-LD missing required fields");
    }
  } else if (t === "HowTo") {
    if (!nonEmpty(d.name) || !Array.isArray(d.step) || d.step.length === 0) {
      fail(route, "HowTo JSON-LD missing name or steps");
    }
  } else if (t === "CreativeWork") {
    if (!nonEmpty(d.name) || !nonEmpty(d.description) || !nonEmpty(d.url || d.mainEntityOfPage) || !(d.author || d.publisher || d.creator)) {
      fail(route, "CreativeWork JSON-LD missing required fields");
    }
  } else if (t === "AboutPage") {
    if (!nonEmpty(d.name) || !nonEmpty(d.url) || !(d.mainEntity || d.about)) {
      fail(route, "AboutPage JSON-LD missing required fields");
    }
  } else if (t === "Person") {
    if (!nonEmpty(d.name)) fail(route, "Person JSON-LD missing name");
  } else if (t === "Blog") {
    if (!nonEmpty(d.name) || !nonEmpty(d.url) || !d.publisher) fail(route, "Blog JSON-LD missing required fields");
  } else if (t === "CollectionPage") {
    if (!nonEmpty(d.name) || !nonEmpty(d.url)) fail(route, "CollectionPage JSON-LD missing name or url");
    if (d.mainEntity?.["@type"] === "ItemList") validateItemList(route, d.mainEntity);
  } else if (t === "ItemList") {
    validateItemList(route, d);
  } else if (t === "ImageObject") {
    if (!nonEmpty(d.contentUrl || d.url)) fail(route, "ImageObject JSON-LD missing contentUrl");
    if (route === "/" && (!nonEmpty(d.license) || !nonEmpty(d.acquireLicensePage) || !nonEmpty(d.copyrightNotice))) {
      fail(route, "Homepage ImageObject JSON-LD missing license/acquireLicensePage/copyrightNotice");
    }
  } else if (t === "FAQPage") {
    if (!Array.isArray(d.mainEntity) || d.mainEntity.length === 0) { fail(route, "FAQ has no questions"); return; }
    for (const item of d.mainEntity) {
      if (item?.["@type"] !== "Question" || item.acceptedAnswer?.["@type"] !== "Answer"
          || typeof item.name !== "string" || typeof item.acceptedAnswer?.text !== "string"
          || !text(item.name) || !text(item.acceptedAnswer.text)) { fail(route, "FAQ question or answer is empty or malformed"); continue; }
      if (!mainText.includes(text(item.name)) || !mainText.includes(text(item.acceptedAnswer.text))) fail(route, "FAQ structured data differs from rendered main content");
    }
  }
}
async function get(route) {
  const response = await fetch(new URL(route, base), { redirect: "manual", signal: AbortSignal.timeout(30000) });
  return { status: response.status, type: response.headers.get("content-type") || "", robots: response.headers.get("x-robots-tag") || "", csp: response.headers.get("content-security-policy") || "", body: await response.text() };
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
    const enforceSnippet = isBlogRoute(route) ? strictBlog : isCatalogDynamicRoute(route) ? strictCatalog : true;
    if (!title) fail(route, "Missing title");
    else {
      if (titles.has(title)) fail(route, `Duplicate title with ${titles.get(title)}`); else titles.set(title, route);
      if (title.length > 65) checkLength(route, `Title exceeds 65 chars (${title.length}): ${title}`, enforceSnippet);
    }
    if (!description || description.length < 40) fail(route, "Missing or empty description");
    else {
      if (descriptions.has(description)) fail(route, `Duplicate description with ${descriptions.get(description)}`); else descriptions.set(description, route);
      const minDesc = LEGAL_ROUTES.has(route) ? 70 : 110;
      if (description.length < minDesc || description.length > 165) {
        checkLength(route, `Description length ${description.length} outside ${minDesc}-165 chars`, enforceSnippet);
      }
    }
    if (canonical !== correct) fail(route, `Canonical is ${canonical || "missing"}`);
    const ogImage = meta(html, "og:image");
    if (meta(html, "og:url") !== correct || !ogImage) fail(route, "Missing or incorrect social metadata");
    if (ogImage && !ogImage.startsWith("data:")) {
      try {
        const ogUrl = new URL(ogImage, SITE_URL + route);
        if (ogUrl.origin === SITE_URL) addAsset(ogUrl.pathname + ogUrl.search, route);
      } catch { /* invalid URL caught elsewhere */ }
    }
    if (/noindex/i.test([meta(html, "robots"), meta(html, "googlebot"), response.robots].filter(Boolean).join(","))) fail(route, "Public page marked noindex");
    const cleanedHtml = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ");
    const headings = [...cleanedHtml.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
      level: Number(m[1]),
      text: text(m[2]),
    }));
    const h1Count = headings.filter((h) => h.level === 1).length;
    if (h1Count !== 1) fail(route, `Expected one H1; found ${h1Count}`);
    if (headings.length && headings[0].level !== 1) fail(route, `First heading must be H1; found H${headings[0].level}`);
    for (let i = 0; i < headings.length; i++) {
      if (!headings[i].text) fail(route, `Empty H${headings[i].level} heading`);
      if (i > 0 && headings[i].level > headings[i - 1].level + 1) {
        fail(route, `Skipped heading level: H${headings[i - 1].level} -> H${headings[i].level}`);
      }
    }
    const mainText = text(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "");
    const wordCount = mainText ? mainText.split(/\s+/).filter(Boolean).length : 0;
    if (/^\/(guides|use-cases|alternatives)\//.test(route) && wordCount < 300) fail(route, "Insufficient rendered explanatory content");
    if (isBlogRoute(route) && wordCount < 300) {
      if (strictBlog) fail(route, `Blog post under 300 words (${wordCount})`);
      else warn(route, `Blog post under 300 words (${wordCount}); pass --strict-blog to enforce`);
    }
    const schema = [];
    for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const data = JSON.parse(m[1]); schema.push(...(data["@graph"] || (Array.isArray(data) ? data : [data])));
      } catch { fail(route, "Invalid JSON-LD"); }
    }
    if (!schema.length) fail(route, "Missing structured data");
    for (const data of schema) validateSchemaNode(route, data, mainText);
    for (const m of cleanedHtml.matchAll(/<(?:img|source|track)\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')|<video\b[^>]*\bposter\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      const raw = decode(m[1] ?? m[2] ?? m[3] ?? m[4] ?? "");
      if (!raw || raw.startsWith("data:")) continue;
      try {
        const assetUrl = new URL(raw, SITE_URL + route);
        if (assetUrl.origin === SITE_URL) addAsset(assetUrl.pathname + assetUrl.search, route);
      } catch { /* ignore malformed */ }
    }
    const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => decode(m[1])));
    const targets = new Set();
    graph.set(route, targets);
    for (const href of links(html)) {
      if (href.startsWith("#")) {
        if (href.length > 1 && !ids.has(decodeURIComponent(href.slice(1)))) fail(route, `Missing on-page anchor: ${href}`);
        continue;
      }
      if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
      const url = new URL(href, SITE_URL + route);
      if (url.origin !== SITE_URL) continue;
      const target = url.pathname.replace(/\/$/, "") || "/";
      if (expected.has(target === "/" ? SITE_URL : SITE_URL + target)) { linked.add(target); targets.add(target); }
      else if (/\.[a-z0-9]+$/i.test(target)) addAsset(url.pathname + url.search, route);
      else if (target !== "/endpointradar/app" && target !== "/endpointradar/managed" && target !== "/phishing-detector/team" && !/^\/mypentest\/(app|api)(\/|$)/.test(target)) fail(route, `Unlisted internal page link: ${target}`);
    }
    pages.push({ path: route, status: response.status, title, wordCount, canonical, schemaTypes: schema.map((d) => d["@type"]) });
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
  for (const match of xml.body.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const url = decode(match[1].match(/<loc>(.*?)<\/loc>/)[1]);
    const date = match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    const source = SITEMAP_PAGES.find((page) => (page.path === "/" ? SITE_URL : SITE_URL + page.path) === url);
    assert.equal(date, source.lastModified, `Incorrect content modification date: ${url}`);
    if (date) {
      // Editorial dates are calendar dates in the publisher's India timezone.
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      assert(/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date && date <= today, `Invalid or future sitemap date: ${url}`);
    }
  }
  const robots = await get("/robots.txt");
  const endpointWorkspace = await get("/endpointradar/app");
  assert.equal(endpointWorkspace.status, 200, "EndpointRadar workspace unavailable");
  assert(/noindex/i.test(meta(endpointWorkspace.body, "robots") || ""), "EndpointRadar workspace must remain noindex");
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
  for (const bot of ["Googlebot", "Googlebot-Image", "Bingbot", "DuckDuckBot", "Slurp", "MojeekBot", "PetalBot", "OAI-SearchBot", "GPTBot", "ChatGPT-User", "Google-Extended", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Applebot", "Meta-ExternalAgent", "Twitterbot", "LinkedInBot"]) {
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
  const cases = await get("/benchmarks/case-template.csv");
  assert.equal(cases.status, 200, "Benchmark case-review template unavailable");
  assert(cases.body.includes("expected_behavior") && cases.body.includes("control_artifact"), "Case-review template missing comparison controls");
  const editorialImage = await fetch(new URL("/images/website-security-review.webp", base), { signal: AbortSignal.timeout(30000) });
  assert.equal(editorialImage.status, 200, "Editorial image is unavailable");
  assert((editorialImage.headers.get("content-type") || "").includes("image/webp"), "Editorial image must be served as WebP");
  const contact = await get("/contact");
  const frameSources = (policy) => policy.split(";").map((part) => part.trim()).find((part) => part.startsWith("frame-src "))?.split(/\s+/).slice(1) ?? [];
  assert(frameSources(contact.csp).includes("https://www.openstreetmap.org"), "Contact map frame is blocked by CSP");
  const home = await get("/");
  const teamInbox = await get("/phishing-detector/team");
  assert.equal(teamInbox.status, 200, "PhishLens team inbox must be reachable");
  assert(/noindex/i.test(teamInbox.robots), "PhishLens team inbox must remain noindex");
  for (const route of ["/?_rsc=seo-check", "/guides?source=check&_rsc=seo-check"]) {
    const variant = await get(route);
    assert.equal(variant.status, 200, "Navigation variants must stay fetchable");
    assert(/noindex/i.test(variant.robots), "RSC variants need an HTTP noindex directive");
  }
  const flight = await fetch(new URL("/guides?_rsc=seo-check", base), { headers: { RSC: "1" }, signal: AbortSignal.timeout(30000) });
  assert.equal(flight.status, 200, "Client navigation must remain available");
  assert((flight.headers.get("content-type") || "").includes("text/x-component"), "RSC navigation must return component data, not a redirect or HTML");
  for (const [route, field] of [["/templates/api-security-test-cases.csv", "case_id"], ["/templates/pentest-findings-template.csv", "finding_id"]]) {
    const template = await get(route);
    assert.equal(template.status, 200, "Download unavailable");
    assert(template.body.startsWith(field + ","), "Download must contain CSV data");
  }
  assert.deepEqual(frameSources(home.csp), ["https://www.youtube-nocookie.com"], "Homepage should allow only the privacy-enhanced YouTube player");
  for (const route of ["/", "/mypentest"]) {
    const tutorial = await get(route);
    assert(tutorial.body.includes("https://www.youtube.com/watch?v=wZM29H-GTvU"), `Missing tutorial video link on ${route}`);
    assert(tutorial.body.includes('id="how-to-use"'), `Missing tutorial section on ${route}`);
    assert(!/<iframe[^>]+youtube/.test(tutorial.body), `YouTube must load only after play on ${route}`);
  }
  let index = 0;
  await Promise.all(Array.from({ length: 5 }, async () => { while (index < paths.length) await audit(paths[index++]); }));
  for (const p of paths) if (p !== "/" && !linked.has(p)) fail(p, "No internal page links to this URL");
  const depths = new Map([["/", 0]]), queue = ["/"];
  for (let i = 0; i < queue.length; i++) {
    for (const target of graph.get(queue[i]) || []) if (!depths.has(target)) {
      depths.set(target, depths.get(queue[i]) + 1); queue.push(target);
    }
  }
  for (const p of paths) {
    if (!depths.has(p)) fail(p, "Unreachable through links from the homepage");
    if (!graph.get("/site-map")?.has(p)) fail(p, "Missing from the HTML site map");
  }
  for (const route of ["/guides/not-a-guide", "/use-cases/not-a-use-case", "/alternatives/not-a-tool", "/compare/mypentest-vs-not-a-tool"]) {
    const response = await get(route);
    if (response.status !== 404) fail(route, `Unknown content must return 404; found ${response.status}`);
  }
  addAsset("/favicon.ico", "/");
  addAsset("/apple-icon.png", "/");
  const assetList = [...assets.entries()];
  let assetIndex = 0;
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (assetIndex < assetList.length) {
      const [assetPath, refRoutes] = assetList[assetIndex++];
      try {
        const res = await fetch(new URL(assetPath, base), { redirect: "manual", signal: AbortSignal.timeout(30000) });
        await res.body?.cancel();
        if (res.status !== 200) {
          for (const refRoute of refRoutes) fail(refRoute, `Broken static asset ${assetPath} (HTTP ${res.status})`);
        }
      } catch (e) {
        for (const refRoute of refRoutes) fail(refRoute, `Static asset fetch failed for ${assetPath}: ${e.message}`);
      }
    }
  }));
  const blogPages = pages.filter((p) => isBlogRoute(p.path));
  const blogSummary = {
    total: blogPages.length,
    under300: blogPages.filter((p) => p.wordCount < 300).length,
    minWords: blogPages.length ? Math.min(...blogPages.map((p) => p.wordCount)) : 0,
  };
  const report = { base: base.origin, checkedAt: new Date().toISOString(), sitemapEntries: entries.length, pagesChecked: pages.length, assetsChecked: assetList.length, maxClickDepth: Math.max(...depths.values()), blogSummary, warnings, errors, pages };
  if (reportPath) fs.writeFileSync(path.resolve(reportPath), JSON.stringify(report, null, 2) + "\n");
  if (warnings.length) {
    console.warn(`WARN: ${warnings.length} staged M2 warning(s) (blogSummary: total=${blogSummary.total}, under300=${blogSummary.under300}, minWords=${blogSummary.minWords}).`);
  }
  if (errors.length) { for (const e of errors) console.error(`${e.url}: ${e.message}`); process.exitCode = 1; }
  else console.log(`PASS: ${pages.length} public pages (${assetList.length} static assets); sitemap, canonical URLs, unique metadata, headings, schema, FAQ text, internal discovery and unknown-route 404s. blogSummary: ${blogSummary.total} posts, ${blogSummary.under300} under 300w (min ${blogSummary.minWords}w).`);
})().catch((e) => { console.error(e.message); process.exitCode = 1; });

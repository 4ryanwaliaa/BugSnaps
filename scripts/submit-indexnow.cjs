/* Submit only public, canonical pages after they are live.
 * node scripts/submit-indexnow.cjs / /improvements /benchmarks
 * Exit 0 means received by IndexNow, not indexed or ranked.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { host, key } = require("./indexnow-config.json");
const origin = `https://${host}`;
const request = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(30000) });

async function main() {
  const paths = [...new Set(process.argv.slice(2))];
  assert(paths.length > 0 && paths.length <= 10000, "Supply changed public page paths");
  assert.match(key, /^[a-zA-Z0-9-]{8,128}$/);
  const ownership = await request(`${origin}/${key}.txt`);
  assert.equal(ownership.status, 200, "Deploy the ownership file before submission");
  assert.equal((await ownership.text()).trim(), key, "Ownership file differs from configuration");
  const sitemap = await request(`${origin}/sitemap.xml`);
  assert.equal(sitemap.status, 200, "Public sitemap is unavailable");
  const catalog = new Set([...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  const urlList = [];
  for (const route of paths) {
    assert(route.startsWith("/") && !/[?#]/.test(route), "Only clean public paths are accepted");
    assert(!/^\/mypentest\/(app|api)(\/|$)/.test(route), "Never submit private application URLs");
    const url = new URL(route, origin);
    assert.equal(url.origin, origin, "External URLs are not accepted");
    const canonical = route === "/" ? origin : url.href.replace(/\/$/, "");
    assert(catalog.has(canonical), `URL absent from live sitemap: ${canonical}`);
    const page = await request(canonical, { redirect: "manual" });
    assert.equal(page.status, 200, `Public page not ready: ${canonical}`);
    assert((page.headers.get("content-type") || "").includes("text/html"), "Submit HTML pages only");
    assert(!/noindex/i.test(page.headers.get("x-robots-tag") || ""), "Page is noindex");
    const html = await page.text();
    const tags = [...html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(m => m[0]);
    assert(!tags.some(tag => /name=["'](?:robots|googlebot)["']/i.test(tag) && /noindex/i.test(tag)), "Page markup is noindex");
    assert(tags.some(tag => /rel=["']canonical["']/i.test(tag) && tag.includes(`href="${canonical}"`)), `Canonical differs: ${canonical}`);
    urlList.push(canonical);
  }
  const response = await request("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation: `${origin}/${key}.txt`, urlList }),
  });
  const receipt = {
    submittedAt: new Date().toISOString(), status: response.status, urls: urlList,
    result: response.status === 200 ? "Received; indexing is not confirmed" : response.status === 202 ? "Received; key validation is pending" : "Rejected",
    response: (await response.text()).slice(0, 1000),
  };
  const directory = path.resolve(__dirname, "../.next");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "indexnow-receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
  console.log(JSON.stringify({ status: receipt.status, urlsSubmitted: urlList.length, result: receipt.result }));
  assert([200, 202].includes(response.status), `IndexNow returned ${response.status}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

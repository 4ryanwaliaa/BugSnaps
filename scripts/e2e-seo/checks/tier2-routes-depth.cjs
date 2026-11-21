"use strict";

const { extractPage } = require("../lib/html-parser.cjs");
const { parseLlmsTxt } = require("../lib/xml-robots-llms.cjs");
const { normalizePath } = require("../lib/http-client.cjs");

const DYNAMIC_FAMILIES = [
  { name: "blog", re: /^\/blog\/.+/ },
  { name: "guides", re: /^\/guides\/.+/ },
  { name: "compare", re: /^\/compare\/.+/ },
  { name: "alternatives", re: /^\/alternatives\/.+/ },
  { name: "use-cases", re: /^\/use-cases\/.+/ },
  { name: "solutions", re: /^\/solutions\/.+/ },
];

const PRIVATE_NOINDEX_ROUTES = [
  "/mypentest/app",
  "/mypentest/app/new",
  "/mypentest/app/assessment",
  "/mypentest/app/billing",
  "/endpointradar/app",
  "/endpointradar/managed",
  "/phishing-detector/team",
];

const SUBSTANTIVE_DEPTH_RE = /^\/(?:blog|guides|use-cases|alternatives|solutions)\/.+/;

const NOT_FOUND_PROBES = [
  "/definitely-not-a-real-page-404-check",
  "/blog/not-a-post-e2e-check",
  "/guides/not-a-guide-e2e-check",
  "/use-cases/not-a-use-case-e2e-check",
  "/alternatives/not-a-tool-e2e-check",
  "/compare/mypentest-vs-not-a-tool-e2e-check",
];

async function runTier2(ctx) {
  const { client, discovery, pages, fail, warn } = ctx;
  const canonicalOrigin = client.canonicalOrigin;
  const sitemapPathSet = new Set(discovery.sitemapPaths);

  // T2.1: Dynamic route family title/description boundary reporting
  for (const routePath of discovery.sitemapPaths) {
    const family = DYNAMIC_FAMILIES.find((f) => f.re.test(routePath));
    if (!family) continue;
    const entry = pages.get(routePath);
    if (!entry || !entry.parsed) continue;
    const { title, description } = entry.parsed;

    if (title.length > 65) {
      fail("T2.1", routePath, `[${family.name}] <title> length ${title.length} exceeds 65-char boundary`);
    } else if (title.length > 58) {
      warn("T2.1", routePath, `[${family.name}] <title> length ${title.length} exceeds 58-char CTR target`);
    }
    if (description.length < 110 || description.length > 165) {
      fail(
        "T2.1",
        routePath,
        `[${family.name}] <meta name="description"> length ${description.length} outside [110, 165]`
      );
    } else if (description.length > 150) {
      warn("T2.1", routePath, `[${family.name}] description length ${description.length} exceeds 150-char CTR target`);
    }
  }

  // T2.2: Private noindex routes (all 7 routes must be excluded from discovery AND emit both meta noindex + X-Robots-Tag noindex)
  const llmsPaths = new Set();
  if (discovery.llmsRes && discovery.llmsRes.status === 200) {
    const parsedLlms = parseLlmsTxt(discovery.llmsRes.body);
    for (const l of parsedLlms.links) {
      try {
        llmsPaths.add(normalizePath(new URL(l.url).pathname));
      } catch {
        // ignore
      }
    }
  }
  const siteMapLinks = new Set();
  const siteMapPage = pages.get("/site-map");
  if (siteMapPage && siteMapPage.parsed) {
    for (const l of siteMapPage.parsed.linksMain) {
      try {
        const u = new URL(l.href, canonicalOrigin + "/site-map");
        if (u.origin === canonicalOrigin) siteMapLinks.add(normalizePath(u.pathname));
      } catch {
        // ignore
      }
    }
  }

  await client.runPool(PRIVATE_NOINDEX_ROUTES, async (privRoute) => {
    if (sitemapPathSet.has(privRoute)) {
      fail("T2.2", privRoute, "Private route leaked into /sitemap.xml");
    }
    if (siteMapLinks.has(privRoute)) {
      fail("T2.2", privRoute, "Private route leaked into /site-map");
    }
    if (llmsPaths.has(privRoute)) {
      fail("T2.2", privRoute, "Private route leaked into /llms.txt");
    }
    try {
      const res = await client.getText(privRoute);
      if (res.status !== 200) {
        fail("T2.2", privRoute, `Expected HTTP 200 for private workspace route, got ${res.status}`);
        return;
      }
      const parsed = extractPage(res.body, privRoute, canonicalOrigin);
      const metaRobots = `${parsed.meta.robots || ""},${parsed.meta.googlebot || ""}`;
      if (!/\bnoindex\b/i.test(metaRobots)) {
        fail("T2.2", privRoute, `Missing meta robots "noindex" on ${privRoute}`);
      }
      if (!/\bnoindex\b/i.test(res.xRobotsTag)) {
        fail("T2.2", privRoute, `Missing X-Robots-Tag "noindex" HTTP header on ${privRoute}`);
      }
    } catch (err) {
      fail("T2.2", privRoute, `Failed fetching private route: ${err.message}`);
    }
  });

  // T2.3: www redirect, ?_rsc= noindex, RSC: 1 flight, custom 404s
  for (const probePath of ["/", "/mypentest"]) {
    const redir = await client.probeHostRedirect(probePath, "www.bugsnaps.in");
    if (redir.error) {
      fail("T2.3", probePath, `Host: www.bugsnaps.in probe failed: ${redir.error}`);
    } else if (![301, 308].includes(redir.statusCode)) {
      fail("T2.3", probePath, `Host: www.bugsnaps.in expected 301/308 redirect, got ${redir.statusCode}`);
    } else if (!redir.location.startsWith(canonicalOrigin)) {
      fail("T2.3", probePath, `Host: www.bugsnaps.in redirect location "${redir.location}" does not target ${canonicalOrigin}`);
    }
  }

  for (const rscUrl of ["/?_rsc=seo-check", "/guides?source=check&_rsc=seo-check"]) {
    try {
      const rscRes = await client.getText(rscUrl);
      if (rscRes.status !== 200) {
        fail("T2.3", rscUrl, `?_rsc= probe expected HTTP 200, got ${rscRes.status}`);
      }
      if (!/\bnoindex\b/i.test(rscRes.xRobotsTag)) {
        fail("T2.3", rscUrl, `?_rsc= response missing X-Robots-Tag: noindex (got "${rscRes.xRobotsTag}")`);
      }
    } catch (err) {
      fail("T2.3", rscUrl, `?_rsc= probe failed: ${err.message}`);
    }
  }

  try {
    const flightRes = await client.getText("/guides?_rsc=seo-check", { RSC: "1" });
    if (flightRes.status !== 200) {
      fail("T2.3", "/guides?_rsc=seo-check", `RSC: 1 flight probe expected HTTP 200, got ${flightRes.status}`);
    } else if (!flightRes.contentType.includes("text/x-component")) {
      fail("T2.3", "/guides?_rsc=seo-check", `RSC: 1 response Content-Type "${flightRes.contentType}" missing text/x-component`);
    }
  } catch (err) {
    fail("T2.3", "/guides?_rsc=seo-check", `RSC: 1 flight probe failed: ${err.message}`);
  }

  await client.runPool(NOT_FOUND_PROBES, async (nfRoute) => {
    try {
      const nfRes = await client.getText(nfRoute);
      if (nfRes.status !== 404) {
        fail("T2.3", nfRoute, `Unknown route expected HTTP 404, got ${nfRes.status}`);
        return;
      }
      if (!nfRes.contentType.includes("text/html")) {
        fail("T2.3", nfRoute, `404 response expected text/html, got "${nfRes.contentType}"`);
      }
      const parsed = extractPage(nfRes.body, nfRoute, canonicalOrigin);
      const robotsCombined = `${parsed.meta.robots || ""},${nfRes.xRobotsTag}`;
      if (!/\bnoindex\b/i.test(robotsCombined)) {
        fail("T2.3", nfRoute, "Custom 404 page missing noindex directive");
      }
      const h1s = parsed.headingsFull.filter((h) => h.level === 1);
      if (h1s.length !== 1) {
        fail("T2.3", nfRoute, `Custom 404 page expected 1 <h1>, found ${h1s.length}`);
      }
      const hasHomeRecovery = parsed.linksAll.some((l) => {
        try {
          const u = new URL(l.href, canonicalOrigin + "/");
          return u.origin === canonicalOrigin && normalizePath(u.pathname) === "/";
        } catch {
          return false;
        }
      });
      if (!hasHomeRecovery) {
        fail("T2.3", nfRoute, "Custom 404 page missing recovery link to /");
      }
    } catch (err) {
      fail("T2.3", nfRoute, `404 probe failed: ${err.message}`);
    }
  });

  // T2.4: Substantive <main> word count >= 300 on /blog/*, /guides/*, /use-cases/*, /alternatives/*, /solutions/*
  for (const routePath of discovery.sitemapPaths) {
    if (!SUBSTANTIVE_DEPTH_RE.test(routePath)) continue;
    const entry = pages.get(routePath);
    if (!entry || !entry.parsed) continue;
    const wc = entry.parsed.mainSubstantiveWordCount;
    if (wc < 300) {
      fail("T2.4", routePath, `Thin substantive <main> content: ${wc} words (minimum 300)`);
    }
  }
}

module.exports = {
  runTier2,
  PRIVATE_NOINDEX_ROUTES,
  DYNAMIC_FAMILIES,
};

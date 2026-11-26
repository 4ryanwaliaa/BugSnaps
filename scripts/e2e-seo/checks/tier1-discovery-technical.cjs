"use strict";

const { isStaticAssetUrl } = require("../lib/html-parser.cjs");
const {
  parseSitemapXml,
  parseRobotsTxt,
  getRulesForAgent,
  parseLlmsTxt,
} = require("../lib/xml-robots-llms.cjs");
const { normalizePath } = require("../lib/http-client.cjs");

const LEGAL_UTILITY_RE =
  /^\/(privacy|terms|cookies|cookie-policy|refund-policy|data-processing|responsible-disclosure|legal)(\/|$)/;

const PRIVATE_PREFIX_RE =
  /^\/(?:mypentest\/(?:app|api)|endpointradar\/(?:app|managed|api)|phishing-detector\/team)(\/|$)/;

const REQUIRED_ROBOTS_BOTS = [
  "*",
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "DuckDuckBot",
  "Slurp",
  "MojeekBot",
  "PetalBot",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Meta-ExternalAgent",
  "Twitterbot",
  "LinkedInBot",
];

const REQUIRED_DISALLOW_PATHS = [
  "/mypentest/app",
  "/mypentest/api",
  "/endpointradar/app",
  "/endpointradar/managed",
  "/endpointradar/api",
];

function isValidIsoCalendarDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parsed = Date.parse(`${dateStr}T00:00:00Z`);
  if (!Number.isFinite(parsed)) return false;
  return new Date(parsed).toISOString().slice(0, 10) === dateStr;
}

function isValidHttpUrl(val) {
  if (typeof val !== "string" || !val.trim()) return false;
  if (/\b(?:undefined|null)\b/i.test(val)) return false;
  try {
    const u = new URL(val);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function nonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

const NESTED_ORG_PROPS = new Set(["author", "provider", "publisher", "creator", "brand"]);

function validateJsonLdObject(obj, routePath, canonicalOrigin, fail, jsonLdCtx = {}) {
  if (!obj || typeof obj !== "object") return;
  const rawType = obj["@type"];
  const types = Array.isArray(rawType) ? rawType : rawType ? [rawType] : [];
  const isNestedRef = Boolean(jsonLdCtx.isNestedRef);
  const parentProp = jsonLdCtx.parentProp || null;
  const parentTypes = jsonLdCtx.parentTypes || [];

  // Validate common URL fields when present as strings
  for (const urlField of ["url", "mainEntityOfPage", "contentUrl", "embedUrl", "thumbnailUrl", "logo", "item"]) {
    const val = obj[urlField];
    if (typeof val === "string" && !isValidHttpUrl(val)) {
      fail("T1.5", routePath, `Invalid URL in JSON-LD field "${urlField}": ${val}`);
    } else if (val && typeof val === "object" && typeof val["@id"] === "string" && !isValidHttpUrl(val["@id"])) {
      fail("T1.5", routePath, `Invalid URL in JSON-LD "${urlField}.@id": ${val["@id"]}`);
    }
  }

  for (const type of types) {
    switch (type) {
      case "Organization": {
        const canonicalOrgId = `${canonicalOrigin}/#organization`;
        const isNestedOrgRef =
          isNestedRef &&
          (NESTED_ORG_PROPS.has(parentProp) ||
            (typeof obj["@id"] === "string" && obj["@id"] === canonicalOrgId));
        if (isNestedOrgRef) {
          if (!nonEmptyString(obj.name) && !isValidHttpUrl(obj["@id"])) {
            fail("T1.5", routePath, "Nested Organization missing name or valid @id");
          }
          if (obj.url !== undefined && !isValidHttpUrl(obj.url)) {
            fail("T1.5", routePath, `Nested Organization has invalid url: ${obj.url}`);
          }
        } else {
          if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "Organization missing name");
          if (!obj.url || !isValidHttpUrl(obj.url)) fail("T1.5", routePath, "Organization missing valid url");
          if (!obj.logo && !nonEmptyString(obj.email)) fail("T1.5", routePath, "Organization missing logo or email");
        }
        break;
      }
      case "WebSite": {
        if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "WebSite missing name");
        if (!obj.url || !isValidHttpUrl(obj.url)) fail("T1.5", routePath, "WebSite missing valid url");
        break;
      }
      case "ImageObject": {
        if (!isValidHttpUrl(obj.contentUrl)) fail("T1.5", routePath, "ImageObject missing valid contentUrl");
        if (!nonEmptyString(obj.caption) && !nonEmptyString(obj.name)) {
          fail("T1.5", routePath, "ImageObject missing caption or name");
        }
        break;
      }
      case "BreadcrumbList": {
        if (!Array.isArray(obj.itemListElement) || obj.itemListElement.length === 0) {
          fail("T1.5", routePath, "BreadcrumbList missing non-empty itemListElement");
        } else {
          obj.itemListElement.forEach((li, idx) => {
            if (!li || (li["@type"] && li["@type"] !== "ListItem")) {
              fail("T1.5", routePath, `BreadcrumbList item ${idx + 1} invalid @type`);
            }
            if (li?.position !== idx + 1) {
              fail("T1.5", routePath, `BreadcrumbList item ${idx + 1} has non-sequential position ${li?.position}`);
            }
            if (!nonEmptyString(li?.name)) {
              fail("T1.5", routePath, `BreadcrumbList item ${idx + 1} missing name`);
            }
            const itemUrl = typeof li?.item === "string" ? li.item : li?.item?.["@id"];
            if (!isValidHttpUrl(itemUrl)) {
              fail("T1.5", routePath, `BreadcrumbList item ${idx + 1} missing valid item URL`);
            }
          });
        }
        break;
      }
      case "Article": {
        if (!nonEmptyString(obj.headline)) fail("T1.5", routePath, "Article missing headline");
        if (!nonEmptyString(obj.description)) fail("T1.5", routePath, "Article missing description");
        if (!nonEmptyString(obj.dateModified)) fail("T1.5", routePath, "Article missing dateModified");
        if (!obj.author) fail("T1.5", routePath, "Article missing author");
        if (!obj.publisher) fail("T1.5", routePath, "Article missing publisher");
        if (!obj.mainEntityOfPage) fail("T1.5", routePath, "Article missing mainEntityOfPage");
        break;
      }
      case "TechArticle": {
        if (!nonEmptyString(obj.headline)) fail("T1.5", routePath, "TechArticle missing headline");
        if (!nonEmptyString(obj.description)) fail("T1.5", routePath, "TechArticle missing description");
        if (!nonEmptyString(obj.datePublished) && !nonEmptyString(obj.dateModified)) {
          fail("T1.5", routePath, "TechArticle missing datePublished or dateModified");
        }
        if (!obj.author) fail("T1.5", routePath, "TechArticle missing author");
        if (!obj.publisher) fail("T1.5", routePath, "TechArticle missing publisher");
        if (!obj.mainEntityOfPage) fail("T1.5", routePath, "TechArticle missing mainEntityOfPage");
        break;
      }
      case "Blog":
      case "CollectionPage":
      case "ContactPage": {
        if (!nonEmptyString(obj.name)) fail("T1.5", routePath, `${type} missing name`);
        if (!isValidHttpUrl(obj.url)) fail("T1.5", routePath, `${type} missing valid url`);
        break;
      }
      case "ItemList": {
        if (!Array.isArray(obj.itemListElement) || obj.itemListElement.length === 0) {
          fail("T1.5", routePath, "ItemList missing non-empty itemListElement");
        } else {
          obj.itemListElement.forEach((li, idx) => {
            if (typeof li?.position !== "number") {
              fail("T1.5", routePath, `ItemList entry ${idx + 1} missing numeric position`);
            }
            const hasTarget = isValidHttpUrl(li?.url) || isValidHttpUrl(li?.item?.url) || isValidHttpUrl(li?.item) || nonEmptyString(li?.name) || nonEmptyString(li?.item?.name);
            if (!hasTarget) {
              fail("T1.5", routePath, `ItemList entry ${idx + 1} missing url/item`);
            }
          });
        }
        break;
      }
      case "FAQPage": {
        if (!Array.isArray(obj.mainEntity) || obj.mainEntity.length === 0) {
          fail("T1.5", routePath, "FAQPage missing non-empty mainEntity");
        } else {
          obj.mainEntity.forEach((q, idx) => {
            if (q?.["@type"] !== "Question" || !nonEmptyString(q?.name)) {
              fail("T1.5", routePath, `FAQPage question ${idx + 1} malformed or empty name`);
            }
            if (q?.acceptedAnswer?.["@type"] !== "Answer" || !nonEmptyString(q?.acceptedAnswer?.text)) {
              fail("T1.5", routePath, `FAQPage answer ${idx + 1} malformed or empty text`);
            }
          });
        }
        break;
      }
      case "Service": {
        if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "Service missing name");
        if (!nonEmptyString(obj.description)) fail("T1.5", routePath, "Service missing description");
        if (!isValidHttpUrl(obj.url)) fail("T1.5", routePath, "Service missing valid url");
        if (!obj.provider) fail("T1.5", routePath, "Service missing provider");
        break;
      }
      case "SoftwareApplication": {
        const isNestedAboutApp =
          parentProp === "about" &&
          parentTypes.some((t) => t === "Article" || t === "TechArticle");
        if (isNestedAboutApp) {
          if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "SoftwareApplication missing name");
          if (obj.url !== undefined && !isValidHttpUrl(obj.url)) {
            fail("T1.5", routePath, `SoftwareApplication has invalid url: ${obj.url}`);
          }
        } else {
          if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "SoftwareApplication missing name");
          if (!nonEmptyString(obj.applicationCategory)) fail("T1.5", routePath, "SoftwareApplication missing applicationCategory");
          if (!nonEmptyString(obj.operatingSystem)) fail("T1.5", routePath, "SoftwareApplication missing operatingSystem");
          if (!isValidHttpUrl(obj.url)) fail("T1.5", routePath, "SoftwareApplication missing valid url");
        }
        break;
      }
      case "VideoObject": {
        if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "VideoObject missing name");
        if (!nonEmptyString(obj.description)) fail("T1.5", routePath, "VideoObject missing description");
        const thumb = Array.isArray(obj.thumbnailUrl) ? obj.thumbnailUrl[0] : obj.thumbnailUrl;
        if (!isValidHttpUrl(thumb)) fail("T1.5", routePath, "VideoObject missing valid thumbnailUrl");
        if (!nonEmptyString(obj.uploadDate)) fail("T1.5", routePath, "VideoObject missing uploadDate");
        if (!isValidHttpUrl(obj.contentUrl) && !isValidHttpUrl(obj.embedUrl)) {
          fail("T1.5", routePath, "VideoObject missing contentUrl or embedUrl");
        }
        break;
      }
      case "HowTo": {
        if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "HowTo missing name");
        if (!Array.isArray(obj.step) || obj.step.length === 0) {
          fail("T1.5", routePath, "HowTo missing non-empty step array");
        } else {
          obj.step.forEach((st, idx) => {
            if (!nonEmptyString(st?.name) && !nonEmptyString(st?.text)) {
              fail("T1.5", routePath, `HowTo step ${idx + 1} missing name or text`);
            }
          });
        }
        break;
      }
      case "CreativeWork": {
        if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "CreativeWork missing name");
        if (!nonEmptyString(obj.description) && !isValidHttpUrl(obj.url)) {
          fail("T1.5", routePath, "CreativeWork missing description or url");
        }
        break;
      }
      case "AboutPage": {
        if (!nonEmptyString(obj.name) && !isValidHttpUrl(obj.url)) {
          fail("T1.5", routePath, "AboutPage missing name or url");
        }
        if (!obj.mainEntity && !obj.about) {
          fail("T1.5", routePath, "AboutPage missing mainEntity or about");
        }
        break;
      }
      case "Person": {
        if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "Person missing name");
        break;
      }
      case "DefinedTermSet": {
        if (!nonEmptyString(obj.name)) fail("T1.5", routePath, "DefinedTermSet missing name");
        if (!Array.isArray(obj.hasDefinedTerm) || obj.hasDefinedTerm.length === 0) {
          fail("T1.5", routePath, "DefinedTermSet missing non-empty hasDefinedTerm");
        } else {
          obj.hasDefinedTerm.forEach((term, idx) => {
            if (!nonEmptyString(term?.name) || !nonEmptyString(term?.description)) {
              fail("T1.5", routePath, `DefinedTermSet term ${idx + 1} missing name or description`);
            }
          });
        }
        break;
      }
      case "Offer": {
        const p = obj.price;
        if (p === undefined || p === null || String(p).trim() === "") {
          fail("T1.5", routePath, "Offer missing price");
        }
        if (!nonEmptyString(obj.priceCurrency)) {
          fail("T1.5", routePath, "Offer missing priceCurrency");
        }
        break;
      }
      default:
        break;
    }
  }

  // Recurse into known nested Schema fields
  for (const nestedKey of ["mainEntity", "about", "offers", "author", "publisher", "provider", "creator", "brand", "logo", "image"]) {
    const val = obj[nestedKey];
    const nextCtx = { parentProp: nestedKey, parentTypes: types, isNestedRef: true };
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === "object" && item["@type"]) {
          validateJsonLdObject(item, routePath, canonicalOrigin, fail, nextCtx);
        }
      }
    } else if (val && typeof val === "object" && val["@type"]) {
      validateJsonLdObject(val, routePath, canonicalOrigin, fail, nextCtx);
    }
  }
  if (Array.isArray(obj.itemListElement)) {
    for (const li of obj.itemListElement) {
      if (li && typeof li === "object") {
        if (li["@type"] && li["@type"] !== "ListItem") {
          validateJsonLdObject(li, routePath, canonicalOrigin, fail, {
            parentProp: "itemListElement",
            parentTypes: types,
            isNestedRef: true,
          });
        }
        if (li.item && typeof li.item === "object" && li.item["@type"]) {
          validateJsonLdObject(li.item, routePath, canonicalOrigin, fail, {
            parentProp: "item",
            parentTypes: ["ListItem"],
            isNestedRef: true,
          });
        }
      }
    }
  }
}

function checkHeadingHierarchy(headings, scopeName, routePath, fail) {
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count !== 1) {
    fail("T1.4", routePath, `${scopeName}: expected exactly 1 <h1>, found ${h1Count}`);
  }
  if (headings.length > 0 && headings[0].level !== 1 && scopeName === "<main>") {
    fail("T1.4", routePath, `${scopeName}: first heading is <h${headings[0].level}> instead of <h1>`);
  }
  for (let i = 0; i < headings.length; i++) {
    const cur = headings[i];
    if (!cur.text) {
      fail("T1.4", routePath, `${scopeName}: empty <h${cur.level}> heading`);
    }
    if (i > 0) {
      const prev = headings[i - 1];
      if (cur.level > prev.level + 1) {
        fail("T1.4", routePath, `${scopeName}: skipped heading level <h${prev.level}> -> <h${cur.level}>`);
      }
    }
  }
}

function expectedMimePatternForUrl(assetUrl) {
  let pathname = assetUrl;
  try {
    pathname = new URL(assetUrl, "https://bugsnaps.in").pathname.toLowerCase();
  } catch {
    return null;
  }
  if (pathname === "/_next/image") return /^image\//;
  if (pathname === "/resources/atom.xml") return /application\/atom\+xml/;
  if (pathname.endsWith(".webp")) return /image\/webp/;
  if (pathname.endsWith(".png")) return /image\/png/;
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return /image\/jpe?g/;
  if (pathname.endsWith(".svg")) return /image\/svg/;
  if (pathname.endsWith(".ico")) return /(?:image\/|icon|octet-stream)/;
  if (pathname.endsWith(".csv")) return /(?:text\/csv|text\/plain)/;
  if (pathname.endsWith(".vtt")) return /text\/vtt/;
  if (pathname.endsWith(".mp4")) return /video\/mp4/;
  if (pathname.endsWith(".txt") || pathname.endsWith(".ps1")) return /text\/plain/;
  return null;
}

async function runTier1(ctx) {
  const { client, discovery, pages, todayIST, fail, warn } = ctx;
  const canonicalOrigin = client.canonicalOrigin;
  const sitemapPathSet = new Set(discovery.sitemapPaths);

  // T1.1: Discovery files consistency
  {
    const robotsRes = discovery.robotsRes;
    if (robotsRes.status !== 200) {
      fail("T1.1", "/robots.txt", `Expected HTTP 200, got ${robotsRes.status}${robotsRes.error ? ` (${robotsRes.error})` : ""}`);
    } else {
      if (!robotsRes.contentType.includes("text/plain")) {
        fail("T1.1", "/robots.txt", `Expected text/plain Content-Type, got "${robotsRes.contentType}"`);
      }
      const parsedRobots = parseRobotsTxt(robotsRes.body);
      const expectedSitemapDirective = `${canonicalOrigin}/sitemap.xml`;
      if (!parsedRobots.sitemaps.includes(expectedSitemapDirective)) {
        fail("T1.1", "/robots.txt", `Missing Sitemap directive: ${expectedSitemapDirective}`);
      }
      for (const bot of REQUIRED_ROBOTS_BOTS) {
        const rules = getRulesForAgent(parsedRobots, bot);
        if (rules.length === 0) {
          fail("T1.1", "/robots.txt", `Missing User-Agent rules for ${bot}`);
          continue;
        }
        if (!rules.some((r) => r.key === "allow" && r.value === "/")) {
          fail("T1.1", "/robots.txt", `Missing "Allow: /" for ${bot}`);
        }
        for (const priv of REQUIRED_DISALLOW_PATHS) {
          if (!rules.some((r) => r.key === "disallow" && r.value === priv)) {
            fail("T1.1", "/robots.txt", `Missing "Disallow: ${priv}" for ${bot}`);
          }
        }
      }
    }

    const sitemapRes = discovery.sitemapRes;
    if (sitemapRes.status !== 200) {
      fail("T1.1", "/sitemap.xml", `Expected HTTP 200, got ${sitemapRes.status}${sitemapRes.error ? ` (${sitemapRes.error})` : ""}`);
    } else {
      if (!sitemapRes.contentType.includes("xml")) {
        fail("T1.1", "/sitemap.xml", `Expected XML Content-Type, got "${sitemapRes.contentType}"`);
      }
      const parsedSitemap = parseSitemapXml(sitemapRes.body);
      for (const errMsg of parsedSitemap.errors) {
        fail("T1.1", "/sitemap.xml", errMsg);
      }
      if (parsedSitemap.entries.length === 0) {
        fail("T1.1", "/sitemap.xml", "Sitemap contains zero <url> entries");
      }
      const seenLocs = new Set();
      for (const entry of parsedSitemap.entries) {
        if (seenLocs.has(entry.loc)) {
          fail("T1.1", "/sitemap.xml", `Duplicate <loc>: ${entry.loc}`);
        }
        seenLocs.add(entry.loc);
        let u;
        try {
          u = new URL(entry.loc);
        } catch {
          fail("T1.1", "/sitemap.xml", `Invalid <loc> URL: ${entry.loc}`);
          continue;
        }
        if (u.origin !== canonicalOrigin) {
          fail("T1.1", "/sitemap.xml", `<loc> has non-canonical origin ${u.origin}: ${entry.loc}`);
        }
        if (u.pathname !== "/" && u.pathname.endsWith("/")) {
          fail("T1.1", "/sitemap.xml", `<loc> has trailing slash: ${entry.loc}`);
        }
        const p = normalizePath(u.pathname);
        if (PRIVATE_PREFIX_RE.test(p)) {
          fail("T1.1", "/sitemap.xml", `Private route leaked into sitemap: ${p}`);
        }
        if (!entry.lastmod) {
          fail("T1.1", "/sitemap.xml", `Missing <lastmod> for ${p}`);
        } else if (!isValidIsoCalendarDate(entry.lastmod)) {
          fail("T1.1", "/sitemap.xml", `Invalid <lastmod> date "${entry.lastmod}" for ${p}`);
        } else if (entry.lastmod > todayIST) {
          fail("T1.1", "/sitemap.xml", `Future <lastmod> "${entry.lastmod}" > ${todayIST} for ${p}`);
        }
      }
    }

    const llmsRes = discovery.llmsRes;
    if (llmsRes.status !== 200) {
      fail("T1.1", "/llms.txt", `Expected HTTP 200, got ${llmsRes.status}${llmsRes.error ? ` (${llmsRes.error})` : ""}`);
    } else {
      if (!llmsRes.contentType.includes("text/plain")) {
        fail("T1.1", "/llms.txt", `Expected text/plain Content-Type, got "${llmsRes.contentType}"`);
      }
      const parsedLlms = parseLlmsTxt(llmsRes.body);
      if (!parsedLlms.sitemaps.includes(`${canonicalOrigin}/sitemap.xml`)) {
        fail("T1.1", "/llms.txt", `Missing Sitemap directive ${canonicalOrigin}/sitemap.xml`);
      }
      if (!parsedLlms.links.length) {
        fail("T1.1", "/llms.txt", "Missing curated public links");
      }
      const llmsPathSet = new Set();
      for (const link of parsedLlms.links) {
        let u;
        try {
          u = new URL(link.url);
        } catch {
          fail("T1.1", "/llms.txt", `Invalid URL in llms.txt: ${link.url}`);
          continue;
        }
        if (u.origin !== canonicalOrigin || u.search || u.hash) {
          fail("T1.1", "/llms.txt", `Non-canonical URL in llms.txt: ${link.url}`);
          continue;
        }
        const p = normalizePath(u.pathname);
        if (llmsPathSet.has(p)) {
          fail("T1.1", "/llms.txt", `Duplicate URL in llms.txt: ${p}`);
        }
        llmsPathSet.add(p);
        if (!sitemapPathSet.has(p)) {
          fail("T1.1", "/llms.txt", `URL in llms.txt missing from sitemap.xml: ${p}`);
        }
      }
    }

    const siteMapPage = pages.get("/site-map");
    if (!siteMapPage || siteMapPage.res.status !== 200) {
      fail("T1.1", "/site-map", `Expected HTTP 200 for /site-map, got ${siteMapPage ? siteMapPage.res.status : "missing"}`);
    } else if (siteMapPage.parsed) {
      const mainHrefs = siteMapPage.parsed.linksMain.map((l) => l.href);
      const hasXmlLink = mainHrefs.some((h) => h === "/sitemap.xml" || h === `${canonicalOrigin}/sitemap.xml`);
      if (!hasXmlLink) {
        fail("T1.1", "/site-map", "/site-map <main> does not link to /sitemap.xml");
      }
      const siteMapTargets = new Set();
      for (const href of mainHrefs) {
        if (href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
        let u;
        try {
          u = new URL(href, canonicalOrigin + "/site-map");
        } catch {
          continue;
        }
        if (u.origin !== canonicalOrigin) continue;
        const p = normalizePath(u.pathname);
        if (p === "/sitemap.xml" || isStaticAssetUrl(p)) continue;
        siteMapTargets.add(p);
        if (!sitemapPathSet.has(p)) {
          fail("T1.1", "/site-map", `/site-map links to non-sitemap route: ${p}`);
        }
      }
      for (const sp of sitemapPathSet) {
        if (!siteMapTargets.has(sp)) {
          fail("T1.1", "/site-map", `Sitemap route missing from /site-map: ${sp}`);
        }
      }
    }
  }

  // Per-page checks: T1.2, T1.3, T1.4, T1.5, T1.6 (links/ids/prefetch)
  const seenTitles = new Map();
  const seenDescriptions = new Map();
  const assetsToVerify = new Map(); // normalized assetUrl -> Set<referringPagePath>

  for (const routePath of discovery.sitemapPaths) {
    const entry = pages.get(routePath);
    if (!entry) {
      fail("T1.2", routePath, "Page was not fetched");
      continue;
    }
    const { res, parsed } = entry;
    const expectedCanonical = client.toCanonicalUrl(routePath);

    // T1.2: Status, HTML, canonical, robots, OG/Twitter
    if (res.status !== 200) {
      fail("T1.2", routePath, `Expected HTTP 200, got ${res.status}`);
      continue;
    }
    if (!res.contentType.includes("text/html")) {
      fail("T1.2", routePath, `Expected text/html Content-Type, got "${res.contentType}"`);
      continue;
    }
    if (!parsed) {
      fail("T1.2", routePath, "HTML failed to parse");
      continue;
    }

    if (parsed.canonical !== expectedCanonical) {
      fail("T1.2", routePath, `Canonical mismatch: expected "${expectedCanonical}", got "${parsed.canonical || "missing"}"`);
    }
    const robotsDirectives = [parsed.meta.robots, parsed.meta.googlebot, res.xRobotsTag]
      .filter(Boolean)
      .join(",");
    if (/\b(?:noindex|nofollow)\b/i.test(robotsDirectives)) {
      fail("T1.2", routePath, `Indexable page emits noindex/nofollow: "${robotsDirectives}"`);
    }
    if (parsed.meta["og:url"] !== expectedCanonical) {
      fail("T1.2", routePath, `og:url mismatch: expected "${expectedCanonical}", got "${parsed.meta["og:url"] || "missing"}"`);
    }
    if (parsed.meta["og:site_name"] !== "BugSnaps") {
      fail("T1.2", routePath, `og:site_name mismatch: got "${parsed.meta["og:site_name"] || "missing"}"`);
    }
    if (!["website", "article"].includes(parsed.meta["og:type"] || "")) {
      fail("T1.2", routePath, `Invalid or missing og:type: "${parsed.meta["og:type"] || "missing"}"`);
    }
    for (const reqSocial of ["og:title", "og:description", "og:image", "twitter:image"]) {
      if (!nonEmptyString(parsed.meta[reqSocial])) {
        fail("T1.2", routePath, `Missing ${reqSocial} metadata`);
      }
    }
    if (parsed.meta["twitter:card"] !== "summary_large_image") {
      fail("T1.2", routePath, `twitter:card must be "summary_large_image", got "${parsed.meta["twitter:card"] || "missing"}"`);
    }

    // T1.3: Title & description uniqueness + bounds + duplicate brand + advisory CTR warnings
    const title = parsed.title;
    if (!title) {
      fail("T1.3", routePath, "Missing <title>");
    } else {
      if (/bugsnaps\s*[-|–—]\s*bugsnaps/i.test(title)) {
        fail("T1.3", routePath, `Duplicate brand in <title>: "${title}"`);
      }
      if (title.length > 65) {
        fail("T1.3", routePath, `<title> exceeds 65 chars (${title.length}): "${title}"`);
      } else if (title.length > 58) {
        warn("T1.3", routePath, `<title> exceeds 58-char CTR target (${title.length}): "${title}"`);
      }
      if (seenTitles.has(title)) {
        fail("T1.3", routePath, `Duplicate <title> with ${seenTitles.get(title)}: "${title}"`);
      } else {
        seenTitles.set(title, routePath);
      }
    }

    const desc = parsed.description;
    if (!desc) {
      fail("T1.3", routePath, "Missing <meta name=\"description\">");
    } else {
      const minDesc = LEGAL_UTILITY_RE.test(routePath) ? 70 : 110;
      if (desc.length < minDesc || desc.length > 165) {
        fail(
          "T1.3",
          routePath,
          `<meta name="description"> length ${desc.length} outside [${minDesc}, 165]`
        );
      } else if (desc.length > 150) {
        warn("T1.3", routePath, `<meta name="description"> exceeds 150-char CTR target (${desc.length})`);
      }
      if (seenDescriptions.has(desc)) {
        fail("T1.3", routePath, `Duplicate description with ${seenDescriptions.get(desc)}`);
      } else {
        seenDescriptions.set(desc, routePath);
      }
    }

    // T1.4: Headings hierarchy inside <main> AND full body
    if (!parsed.hasMain) {
      fail("T1.4", routePath, "Missing <main> landmark");
    } else {
      checkHeadingHierarchy(parsed.headingsMain, "<main>", routePath, fail);
    }
    checkHeadingHierarchy(parsed.headingsFull, "<body>", routePath, fail);

    // T1.5: JSON-LD schemas
    if (parsed.jsonLdBlocks.length === 0) {
      fail("T1.5", routePath, "Missing <script type=\"application/ld+json\"> structured data");
    } else {
      for (const blk of parsed.jsonLdBlocks) {
        if (blk.error) {
          fail("T1.5", routePath, `Malformed JSON-LD: ${blk.error}`);
        }
      }
      for (const node of parsed.jsonLdNodes) {
        validateJsonLdObject(node, routePath, canonicalOrigin, fail);
      }
    }

    // T1.6: Fragments, internal links, eager prefetch bloat, static asset collection
    if (parsed.prefetchLinks.length > 3) {
      fail("T1.6", routePath, `Excessive <link rel="prefetch"> crawl-budget bloat (${parsed.prefetchLinks.length} links)`);
    } else if (parsed.prefetchLinks.length > 0) {
      warn("T1.6", routePath, `Found ${parsed.prefetchLinks.length} <link rel="prefetch"> tags in document`);
    }

    for (const link of parsed.linksAll) {
      const href = link.href;
      if (/[?&]_rsc=/i.test(href)) {
        fail("T1.6", routePath, `Anchor href leaks _rsc query parameter: ${href}`);
        continue;
      }
      if (href.startsWith("#")) {
        const frag = href.slice(1);
        if (frag) {
          let decodedFrag = frag;
          try {
            decodedFrag = decodeURIComponent(frag);
          } catch {
            // keep raw
          }
          if (!parsed.ids.has(decodedFrag)) {
            fail("T1.6", routePath, `Broken #fragment link "${href}" (missing id="${decodedFrag}")`);
          }
        }
        continue;
      }
      if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;

      let u;
      try {
        u = new URL(href, canonicalOrigin + (routePath === "/" ? "/" : routePath));
      } catch {
        fail("T1.6", routePath, `Malformed href "${href}"`);
        continue;
      }
      if (u.origin !== canonicalOrigin) continue;

      const targetPath = normalizePath(u.pathname);
      if (isStaticAssetUrl(href)) {
        // Static assets collected below
        continue;
      }
      if (targetPath === "/sitemap.xml" || targetPath === "/robots.txt" || targetPath === "/llms.txt") {
        continue;
      }
      if (PRIVATE_PREFIX_RE.test(targetPath)) {
        continue;
      }
      if (u.pathname !== "/" && u.pathname.endsWith("/")) {
        fail("T1.6", routePath, `Internal link has trailing slash (causes 308 redirect): ${u.pathname}`);
      }
      if (!sitemapPathSet.has(targetPath)) {
        fail("T1.6", routePath, `Broken or unlisted internal link: ${targetPath}`);
      }
    }

    for (const asset of parsed.assets) {
      if (!asset.url || /^(data:|blob:)/i.test(asset.url)) continue;
      let u;
      try {
        u = new URL(asset.url, canonicalOrigin + "/");
      } catch {
        fail("T1.6", routePath, `Malformed asset URL "${asset.url}" (${asset.source})`);
        continue;
      }
      if (u.origin !== canonicalOrigin) continue;

      const relAsset = u.pathname + u.search;
      if (!assetsToVerify.has(relAsset)) assetsToVerify.set(relAsset, new Set());
      assetsToVerify.get(relAsset).add(routePath);

      if (u.pathname === "/_next/image") {
        const innerUrl = u.searchParams.get("url");
        if (innerUrl && innerUrl.startsWith("/")) {
          if (!assetsToVerify.has(innerUrl)) assetsToVerify.set(innerUrl, new Set());
          assetsToVerify.get(innerUrl).add(routePath);
        }
      }
    }
  }

  // T1.6: Verify deduplicated static assets
  const assetList = [...assetsToVerify.keys()];
  await client.runPool(assetList, async (assetPath) => {
    const res = await client.checkAsset(assetPath);
    const refs = [...assetsToVerify.get(assetPath)].slice(0, 3).join(", ");
    if (!res.ok) {
      fail("T1.6", assetPath, `Static asset returned HTTP ${res.status} (${res.error || "unavailable"}) [referenced on: ${refs}]`);
      return;
    }
    if (res.contentType.includes("text/html")) {
      fail("T1.6", assetPath, `Static asset returned text/html instead of binary/asset MIME [referenced on: ${refs}]`);
      return;
    }
    const expectedMime = expectedMimePatternForUrl(assetPath);
    if (expectedMime && res.contentType && !expectedMime.test(res.contentType)) {
      fail("T1.6", assetPath, `Unexpected Content-Type "${res.contentType}" for asset ${assetPath}`);
    }
  });

  // T1.6: Favicons (/favicon.ico and /apple-icon.png)
  for (const iconPath of ["/favicon.ico", "/apple-icon.png"]) {
    const iconRes = await client.checkBinaryGet(iconPath);
    if (iconRes.status !== 200) {
      fail("T1.6", iconPath, `Favicon returned HTTP ${iconRes.status} (${iconRes.error || "expected 200"})`);
    } else if (iconRes.byteLength <= 0) {
      fail("T1.6", iconPath, `Favicon body is empty (0 bytes)`);
    } else if (
      iconRes.contentType.includes("text/html") ||
      !/(?:image\/|icon|octet-stream)/i.test(iconRes.contentType)
    ) {
      fail("T1.6", iconPath, `Favicon has invalid Content-Type "${iconRes.contentType}"`);
    }
  }

  // T1.7: Hub & navigation reachability
  const hubGroups = [
    { hub: "/blog", prefix: "/blog/" },
    { hub: "/guides", prefix: "/guides/" },
    { hub: "/use-cases", prefix: "/use-cases/" },
    { hub: "/alternatives", prefix: "/alternatives/" },
    { hub: "/compare", prefix: "/compare/" },
  ];

  const allInbound = new Set();
  for (const [srcPath, entry] of pages.entries()) {
    if (!entry.parsed) continue;
    for (const l of entry.parsed.linksAll) {
      if (l.href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(l.href)) continue;
      try {
        const u = new URL(l.href, canonicalOrigin + (srcPath === "/" ? "/" : srcPath));
        if (u.origin === canonicalOrigin) {
          allInbound.add(normalizePath(u.pathname));
        }
      } catch {
        // ignore
      }
    }
  }

  for (const routePath of discovery.sitemapPaths) {
    if (routePath !== "/" && !allInbound.has(routePath)) {
      fail("T1.7", routePath, "Orphaned sitemap URL has zero inbound internal links");
    }
  }

  for (const { hub, prefix } of hubGroups) {
    const children = discovery.sitemapPaths.filter((p) => p.startsWith(prefix));
    if (children.length === 0) continue;
    const hubEntry = pages.get(hub);
    if (!hubEntry || !hubEntry.parsed) {
      fail("T1.7", hub, `Hub page ${hub} missing or failed to load`);
      continue;
    }
    const hubOut = new Set();
    for (const l of hubEntry.parsed.linksMain) {
      try {
        const u = new URL(l.href, canonicalOrigin + hub);
        if (u.origin === canonicalOrigin) hubOut.add(normalizePath(u.pathname));
      } catch {
        // ignore
      }
    }
    for (const child of children) {
      if (!hubOut.has(child)) {
        fail("T1.7", child, `Route ${child} is not linked from its hub ${hub}`);
      }
    }
  }
}

module.exports = {
  runTier1,
  LEGAL_UTILITY_RE,
  PRIVATE_PREFIX_RE,
};

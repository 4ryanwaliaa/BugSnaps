"use strict";

const { normalizeForParity, isStaticAssetUrl } = require("../lib/html-parser.cjs");
const { normalizePath } = require("../lib/http-client.cjs");

const MANDATORY_BREADCRUMB_RE =
  /^(?:\/(?:guides|use-cases|compare|alternatives|blog|solutions)\/.+|\/mypentest\/.+)/;

const CORE_EDITORIAL_HUBS = [
  "/products",
  "/mypentest",
  "/services",
  "/pricing",
  "/compare",
  "/resources",
  "/blog",
  "/guides",
  "/use-cases",
  "/alternatives",
];

const EDITORIAL_LEAF_RE = /^\/(?:blog|guides|use-cases|alternatives|compare|solutions)\/.+/;

function extractPathFromUrl(rawUrl, canonicalOrigin) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  try {
    const u = new URL(rawUrl, canonicalOrigin + "/");
    if (u.origin !== canonicalOrigin) return null;
    return normalizePath(u.pathname);
  } catch {
    return null;
  }
}

function bfsDepths(graph, startNode) {
  const depths = new Map([[startNode, 0]]);
  const queue = [startNode];
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i];
    const curDepth = depths.get(cur);
    const neighbors = graph.get(cur);
    if (!neighbors) continue;
    for (const nxt of neighbors) {
      if (!depths.has(nxt)) {
        depths.set(nxt, curDepth + 1);
        queue.push(nxt);
      }
    }
  }
  return depths;
}

async function runTier3(ctx) {
  const { client, discovery, pages, fail } = ctx;
  const canonicalOrigin = client.canonicalOrigin;
  const sitemapPathSet = new Set(discovery.sitemapPaths);

  // T3.1 & T3.2 per-page parity checks
  for (const routePath of discovery.sitemapPaths) {
    const entry = pages.get(routePath);
    if (!entry || !entry.parsed) continue;
    const { parsed } = entry;

    // T3.1: Bi-directional FAQPage JSON-LD <-> visible <main> FAQ parity
    const faqPages = parsed.jsonLdNodes.filter((n) => n["@type"] === "FAQPage");
    const mainNorm = normalizeForParity(parsed.mainText);
    const jsonLdQuestionNames = new Set();
    const visibleFaqItems = parsed.faqSections.flatMap((s) => s.items);
    const visibleByQuestion = new Map();
    for (const item of visibleFaqItems) {
      if (!visibleByQuestion.has(item.question)) {
        visibleByQuestion.set(item.question, item);
      }
    }

    for (const faqSchema of faqPages) {
      if (!Array.isArray(faqSchema.mainEntity) || faqSchema.mainEntity.length === 0) {
        continue; // T1.5 catches malformed/empty
      }
      for (const q of faqSchema.mainEntity) {
        if (!q || typeof q.name !== "string" || typeof q.acceptedAnswer?.text !== "string") continue;
        const normQ = normalizeForParity(q.name);
        const normA = normalizeForParity(q.acceptedAnswer.text);
        if (jsonLdQuestionNames.has(normQ)) {
          fail("T3.1", routePath, `Duplicate Question.name in FAQPage JSON-LD: "${q.name}"`);
        }
        jsonLdQuestionNames.add(normQ);

        const matchedItem = visibleByQuestion.get(normQ);
        if (!matchedItem) {
          if (normQ && !mainNorm.includes(normQ)) {
            fail("T3.1", routePath, `FAQPage question not visible in <main>: "${q.name}"`);
          } else if (normA && !mainNorm.includes(normA)) {
            fail("T3.1", routePath, `FAQPage answer not visible in <main> for question: "${q.name}"`);
          }
        } else if (normA && !matchedItem.answer.includes(normA)) {
          fail(
            "T3.1",
            routePath,
            `FAQPage answer mismatch for question "${q.name}": visible FAQ item answer does not contain acceptedAnswer.text`
          );
        }
      }
    }

    if (visibleFaqItems.length > 0) {
      if (faqPages.length === 0) {
        fail(
          "T3.1",
          routePath,
          `Visible FAQ section (${visibleFaqItems.length} items) found in <main> without FAQPage JSON-LD`
        );
      } else {
        for (const item of visibleFaqItems) {
          if (!jsonLdQuestionNames.has(item.question)) {
            fail(
              "T3.1",
              routePath,
              `Visible FAQ question missing from FAQPage JSON-LD: "${item.question}"`
            );
          }
        }
      }
    }

    // T3.2: Bi-directional BreadcrumbList JSON-LD <-> <nav aria-label="Breadcrumb"> parity
    const breadcrumbSchemas = parsed.jsonLdNodes.filter((n) => n["@type"] === "BreadcrumbList");
    const hasNav = parsed.breadcrumbs !== null;
    const hasSchema = breadcrumbSchemas.length > 0;

    if (hasNav !== hasSchema) {
      fail(
        "T3.2",
        routePath,
        `Breadcrumb parity mismatch: <nav aria-label="Breadcrumb">=${hasNav}, BreadcrumbList JSON-LD=${hasSchema}`
      );
    }

    if (MANDATORY_BREADCRUMB_RE.test(routePath)) {
      if (!hasNav || !hasSchema) {
        fail("T3.2", routePath, "Nested route missing mandatory visible breadcrumb and BreadcrumbList JSON-LD");
      }
    }

    if (hasNav && hasSchema) {
      const schema = breadcrumbSchemas[0];
      const items = Array.isArray(schema.itemListElement) ? schema.itemListElement : [];
      const navItems = parsed.breadcrumbs;

      if (MANDATORY_BREADCRUMB_RE.test(routePath) && items.length < 3) {
        fail("T3.2", routePath, `Nested route BreadcrumbList length ${items.length} < 3`);
      }

      if (items.length !== navItems.length) {
        fail(
          "T3.2",
          routePath,
          `Breadcrumb item count mismatch: nav has ${navItems.length}, JSON-LD has ${items.length}`
        );
      }

      if (items.length > 0) {
        const first = items[0];
        const firstPath = extractPathFromUrl(
          typeof first.item === "string" ? first.item : first.item?.["@id"],
          canonicalOrigin
        );
        if (normalizeForParity(first.name).toLowerCase() !== "home" || firstPath !== "/") {
          fail(
            "T3.2",
            routePath,
            `Breadcrumb root must be Home -> "/", got "${first.name}" -> "${firstPath}"`
          );
        }

        const last = items[items.length - 1];
        const lastPath = extractPathFromUrl(
          typeof last.item === "string" ? last.item : last.item?.["@id"],
          canonicalOrigin
        );
        if (lastPath !== routePath) {
          fail(
            "T3.2",
            routePath,
            `Breadcrumb leaf item URL path "${lastPath}" does not match canonical "${routePath}"`
          );
        }
      }

      const len = Math.min(items.length, navItems.length);
      for (let i = 0; i < len; i++) {
        const sch = items[i];
        const nav = navItems[i];
        if (sch.position !== i + 1) {
          fail("T3.2", routePath, `Breadcrumb position mismatch at index ${i}: got ${sch.position}`);
        }
        const schName = normalizeForParity(sch.name);
        const navName = normalizeForParity(nav.text);
        if (schName !== navName) {
          fail(
            "T3.2",
            routePath,
            `Breadcrumb label mismatch at step ${i + 1}: nav="${navName}" vs JSON-LD="${schName}"`
          );
        }
        const schPath = extractPathFromUrl(
          typeof sch.item === "string" ? sch.item : sch.item?.["@id"],
          canonicalOrigin
        );
        if (i < len - 1) {
          const navPath = extractPathFromUrl(nav.href, canonicalOrigin);
          if (!navPath || navPath !== schPath) {
            fail(
              "T3.2",
              routePath,
              `Breadcrumb intermediate link mismatch at step ${i + 1}: nav="${navPath}" vs JSON-LD="${schPath}"`
            );
          } else if (!sitemapPathSet.has(navPath)) {
            fail(
              "T3.2",
              routePath,
              `Breadcrumb intermediate target "${navPath}" is not an HTTP 200 sitemap route`
            );
          }
        } else if (!nav.isCurrent) {
          fail("T3.2", routePath, `Final breadcrumb item "${navName}" missing aria-current="page"`);
        }
      }
    }
  }

  // T3.3: Dual BFS click-depth & graph reachability
  const fullGraph = new Map();
  const editorialGraph = new Map();
  const inboundCounts = new Map();
  for (const p of discovery.sitemapPaths) {
    fullGraph.set(p, new Set());
    editorialGraph.set(p, new Set());
    inboundCounts.set(p, 0);
  }

  for (const srcPath of discovery.sitemapPaths) {
    const entry = pages.get(srcPath);
    if (!entry || !entry.parsed) continue;

    for (const l of entry.parsed.linksAll) {
      if (l.href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(l.href)) continue;
      if (isStaticAssetUrl(l.href)) continue;
      const target = extractPathFromUrl(l.href, canonicalOrigin);
      if (target && sitemapPathSet.has(target)) {
        fullGraph.get(srcPath).add(target);
      }
    }

    if (srcPath !== "/site-map") {
      for (const l of entry.parsed.linksEditorial) {
        if (l.href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(l.href)) continue;
        if (isStaticAssetUrl(l.href)) continue;
        const target = extractPathFromUrl(l.href, canonicalOrigin);
        if (target && sitemapPathSet.has(target)) {
          editorialGraph.get(srcPath).add(target);
        }
      }
    }
  }

  for (const [src, targets] of fullGraph.entries()) {
    for (const tgt of targets) {
      if (tgt !== src) {
        inboundCounts.set(tgt, (inboundCounts.get(tgt) || 0) + 1);
      }
    }
  }

  for (const p of discovery.sitemapPaths) {
    if (p !== "/" && (inboundCounts.get(p) || 0) < 1) {
      fail("T3.3", p, "Zero inbound internal links in fullGraph");
    }
  }

  const fullDepths = bfsDepths(fullGraph, "/");
  for (const p of discovery.sitemapPaths) {
    const d = fullDepths.get(p);
    if (d === undefined) {
      fail("T3.3", p, "Unreachable from / in fullGraph");
    } else if (d > 3) {
      fail("T3.3", p, `Click depth ${d} exceeds maximum 3 in fullGraph`);
    }
  }

  const siteMapTargets = fullGraph.get("/site-map") || new Set();
  for (const p of discovery.sitemapPaths) {
    if (!siteMapTargets.has(p)) {
      fail("T3.3", p, "Missing direct link from /site-map");
    }
  }

  const hubChecks = [
    { hub: "/blog", prefix: "/blog/" },
    { hub: "/guides", prefix: "/guides/" },
    { hub: "/use-cases", prefix: "/use-cases/" },
    { hub: "/alternatives", prefix: "/alternatives/" },
    { hub: "/compare", prefix: "/compare/" },
  ];
  for (const { hub, prefix } of hubChecks) {
    const children = discovery.sitemapPaths.filter((p) => p.startsWith(prefix));
    if (children.length === 0) continue;
    const hubOut = editorialGraph.get(hub) || new Set();
    for (const child of children) {
      if (!hubOut.has(child)) {
        fail("T3.3", child, `Editorial hub ${hub} missing link to ${child}`);
      }
    }
  }

  const editorialDepths = bfsDepths(editorialGraph, "/");
  for (const hub of CORE_EDITORIAL_HUBS) {
    if (!sitemapPathSet.has(hub)) continue;
    const d = editorialDepths.get(hub);
    if (d === undefined || d > 2) {
      fail(
        "T3.3",
        hub,
        `Core hub ${hub} not reachable via editorial nav/<main> within 2 clicks (depth=${d ?? "unreachable"})`
      );
    }
  }
  for (const p of discovery.sitemapPaths) {
    if (!EDITORIAL_LEAF_RE.test(p)) continue;
    const d = editorialDepths.get(p);
    if (d === undefined || d > 3) {
      fail(
        "T3.3",
        p,
        `Editorial leaf ${p} not reachable via editorial nav/<main> within 3 clicks (depth=${d ?? "unreachable"})`
      );
    }
  }
}

module.exports = {
  runTier3,
};

"use strict";

const { normalizeForParity } = require("../lib/html-parser.cjs");

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "your", "you", "are",
  "was", "were", "has", "have", "had", "not", "but", "can", "all", "any",
  "how", "what", "why", "when", "where", "who", "which", "into", "onto",
  "about", "more", "than", "then", "also", "just", "only", "over", "under",
  "use", "using", "used", "via", "per", "out", "off", "our", "its", "bugsnaps",
]);

const SKIP_INTENT_ALIGNMENT_RE =
  /^\/(?:site-map|privacy|terms|cookies|cookie-policy|refund-policy|data-processing|responsible-disclosure|legal|careers|contact)(\/|$)/;

function estimateSerpTitlePixels(title) {
  let px = 0;
  for (const ch of title) {
    if (ch === " ") px += 4.5;
    else if (/[ilI1.,:;|!']/.test(ch)) px += 5;
    else if (/[WMmw@]/.test(ch)) px += 13;
    else if (/[A-Z]/.test(ch)) px += 11;
    else px += 8.5;
  }
  return Math.round(px);
}

function stripBrandSuffix(title) {
  return title.replace(/\s*(?:-|\||–|—)\s*BugSnaps\s*$/i, "").trim();
}

function hasUnbalancedDelimiters(text) {
  let paren = 0;
  let dquotes = 0;
  for (const ch of text) {
    if (ch === "(") paren++;
    else if (ch === ")") {
      paren--;
      if (paren < 0) return true;
    } else if (ch === '"') {
      dquotes++;
    }
  }
  return paren !== 0 || dquotes % 2 !== 0;
}

function hasTruncatedOrDanglingEnding(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/(?:\.\.\.|…|[,:\-])$/.test(trimmed)) return true;
  if (/(?:checking|signing|logging|opting|built|baked|dropped|locked|tuned|dialed)\s+in$/i.test(trimmed)) {
    return false;
  }
  if (/\s+(?:with|for|and|or|to|of|in|by|the|a|an)$/i.test(trimmed)) return true;
  return false;
}

function extractDomainTokens(text) {
  const cleaned = normalizeForParity(text).toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  const out = new Set();
  for (const raw of cleaned.split(/\s+/)) {
    const tok = raw.replace(/^-+|-+$/g, "");
    if (tok.length >= 3 && !STOPWORDS.has(tok)) {
      out.add(tok);
    }
  }
  return out;
}

function getRouteCluster(routePath) {
  if (routePath.startsWith("/blog/")) return "blog";
  if (routePath.startsWith("/guides/")) return "guides";
  if (routePath.startsWith("/compare/")) return "compare";
  if (routePath.startsWith("/alternatives/")) return "alternatives";
  if (routePath.startsWith("/use-cases/")) return "use-cases";
  if (routePath.startsWith("/solutions/")) return "solutions";
  return "static";
}

function splitSentences(text) {
  if (!text) return [];
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/))
    .map((s) => s.trim())
    .filter(Boolean);
}

const QUESTION_RE = /\?\s*$/;
const GENERAL_NEGATION_RE =
  /\b(?:not|never|cannot|can't|does\s+not|doesn't|do\s+not|did\s+not|has\s+not|have\s+not|is\s+not|are\s+not|no\s+\w+\s+can|no\s+scanner\s+can|no\s+tool\s+can|neither|nor|unavailable|outside\s+the\s+current|on\s+the\s+roadmap|planned|not\s+currently|no\s+inflated|no\s+borrowed|no\s+testimonials|no\s+completed|pending|without\s+(?:claiming|promising|guaranteeing))\b/i;
const THIRD_PARTY_PROVIDER_RE = /\b(?:vercel|render|firebase|google|aws|cloudflare|github|paypal|razorpay)\b/i;
const CUSTOMER_READINESS_RE =
  /\b(?:preparing\s+for|readiness|for\s+your|auditors?|audit\s+evidence|your\s+(?:soc\s*2|iso\s*27001|compliance)|(?:soc\s*2|iso\s*27001|csa\s*star|pci\s*dss|hipaa)[\s-]+(?:compliant|ready|aligned)\s+(?:penetration\s+test(?:ing)?|pentest(?:ing)?|security\s+test(?:ing)?|audit)?\s*(?:documentation|reports?|reporting|deliverables?|evidence|assessments?|testing))\b/i;

const ISO_DURATION_RE = /^P(?=\d|T\d)(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/i;

function isIso8601Duration(str) {
  return ISO_DURATION_RE.test(String(str || "").trim());
}

function isValidCalendarDate(str) {
  const m = String(str || "").match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) return null;
  const iso = m[1];
  const ts = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(ts)) return null;
  if (new Date(ts).toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

async function runTier4(ctx) {
  const { discovery, pages, todayIST, fail, warn } = ctx;

  // T4.1: Simulated SERP snippet audit
  const clusters = new Map();

  for (const routePath of discovery.sitemapPaths) {
    const entry = pages.get(routePath);
    if (!entry || !entry.parsed) continue;
    const { parsed } = entry;
    const title = parsed.title;
    const strippedTitle = stripBrandSuffix(title);
    const desc = parsed.description;

    if (title) {
      if (/bugsnaps\s*[-|–—]\s*bugsnaps/i.test(title)) {
        fail("T4.1", routePath, `SERP title repeats brand name: "${title}"`);
      }
      if (title.length < 15) {
        fail("T4.1", routePath, `SERP title too short (${title.length} chars): "${title}"`);
      }
      if (title.length > 65) {
        fail("T4.1", routePath, `SERP title exceeds 65 chars (${title.length}): "${title}"`);
      } else if (title.length > 58) {
        warn("T4.1", routePath, `SERP title exceeds 58-char CTR target (${title.length}): "${title}"`);
      }
      const estPx = estimateSerpTitlePixels(title);
      if (estPx > 600) {
        fail("T4.1", routePath, `SERP title estimated width ${estPx}px exceeds 600px desktop limit`);
      }
      if (hasTruncatedOrDanglingEnding(strippedTitle) || hasUnbalancedDelimiters(strippedTitle)) {
        fail("T4.1", routePath, `SERP title has truncated, dangling, or unbalanced ending: "${strippedTitle}"`);
      }
    }

    if (desc) {
      if (desc.length > 150 && desc.length <= 165) {
        warn("T4.1", routePath, `SERP description exceeds 150-char CTR target (${desc.length} chars)`);
      }
      if (hasTruncatedOrDanglingEnding(desc) || hasUnbalancedDelimiters(desc)) {
        fail("T4.1", routePath, `SERP description has truncated, dangling, or unbalanced ending`);
      }
      if (strippedTitle && desc === strippedTitle) {
        fail("T4.1", routePath, "SERP description duplicates <title>");
      }
    }

    const h1Text = parsed.headingsMain.find((h) => h.level === 1)?.text || parsed.headingsFull.find((h) => h.level === 1)?.text || "";
    if (desc && h1Text && desc === h1Text) {
      fail("T4.1", routePath, "SERP description duplicates <h1>");
    }

    // Search-intent keyword alignment
    if (!SKIP_INTENT_ALIGNMENT_RE.test(routePath) && strippedTitle) {
      const titleTokens = extractDomainTokens(strippedTitle);
      const bodyTokens = extractDomainTokens(`${h1Text} ${parsed.leadParagraph}`);
      if (titleTokens.size >= 2) {
        let overlap = 0;
        for (const t of titleTokens) {
          if (bodyTokens.has(t)) overlap++;
        }
        if (overlap === 0) {
          fail(
            "T4.1",
            routePath,
            `SERP title keywords [${[...titleTokens].join(", ")}] do not align with <h1> or lead paragraph`
          );
        }
      }
    }

    const cluster = getRouteCluster(routePath);
    if (!clusters.has(cluster)) clusters.set(cluster, []);
    clusters.get(cluster).push({ routePath, strippedTitle: strippedTitle.toLowerCase() });
  }

  // Cluster boilerplate prefix/suffix detection
  for (const [cluster, items] of clusters.entries()) {
    if (items.length < 5) continue;

    const prefixCounts = new Map();
    const suffixCounts = new Map();

    for (const item of items) {
      const words = item.strippedTitle.split(/\s+/).filter(Boolean);
      if (words.length >= 4) {
        const prefix4 = words.slice(0, 4).join(" ");
        if (prefix4.length >= 28 && !prefix4.startsWith("mypentest vs ")) {
          if (!prefixCounts.has(prefix4)) prefixCounts.set(prefix4, []);
          prefixCounts.get(prefix4).push(item.routePath);
        }
      }

      // Check trailing multi-word suffixes >= 20 chars
      for (let start = 1; start < words.length; start++) {
        const suf = words.slice(start).join(" ");
        if (suf.length >= 20) {
          if (!suffixCounts.has(suf)) suffixCounts.set(suf, []);
          suffixCounts.get(suf).push(item.routePath);
        }
      }
    }

    for (const [prefix, routes] of prefixCounts.entries()) {
      if (routes.length >= 3) {
        fail(
          "T4.1",
          routes[0],
          `Cluster [${cluster}] boilerplate title prefix "${prefix}" shared across ${routes.length} pages`,
          { cluster, count: routes.length }
        );
      }
    }

    // Deduplicate overlapping suffix matches by keeping longest matching boilerplate suffix
    const flaggedSuffixes = [...suffixCounts.entries()]
      .filter(([, routes]) => routes.length >= 5)
      .sort((a, b) => b[0].length - a[0].length);
    if (flaggedSuffixes.length > 0) {
      const [longestSuf, routes] = flaggedSuffixes[0];
      fail(
        "T4.1",
        routes[0],
        `Cluster [${cluster}] boilerplate title suffix "${longestSuf}" shared across ${routes.length} pages`,
        { cluster, count: routes.length }
      );
    }
  }

  // T4.2: Authenticity, factual contradictions, future dates, and blog reading-time guardrails
  for (const routePath of discovery.sitemapPaths) {
    const entry = pages.get(routePath);
    if (!entry || !entry.parsed) continue;
    const { parsed } = entry;

    const fullText = [parsed.title, parsed.description, parsed.mainTextNewlined || parsed.mainText]
      .filter(Boolean)
      .join("\n");
    const sentences = splitSentences(fullText);

    for (const sentence of sentences) {
      const isQuestion = QUESTION_RE.test(sentence);
      const hasNegation = GENERAL_NEGATION_RE.test(sentence);

      // 1. AUTH-NO-ZERO-FP
      if (/\b(?:zero|0%?|no|eliminat(?:e|es|ing)|free\s+of|without\s+any)[- ]+false[- ]+positives?\b/i.test(sentence)) {
        if (!isQuestion && !hasNegation) {
          fail("T4.2", routePath, `Claimed zero/eliminated false positives: "${sentence}"`, {
            ruleId: "AUTH-NO-ZERO-FP",
          });
        }
      }

      // 2. AUTH-NO-GUARANTEED-DETECTION
      const guaranteeMatch =
        /\b100%\s*(?:detection|accuracy|coverage|catch|recall|precision|secure|safe|protected)\b/i.test(sentence) ||
        /\b(?:catches?|finds?|detects?|stops?|prevents?)\s+(?:every|all|100%\s+of)\s+(?:vulnerabilities|flaws|bugs|exploits|attacks|breaches|threats)\b/i.test(sentence) ||
        /\bguaranteed\s+(?:detection|coverage|compliance|acceptance|security)\b/i.test(sentence) ||
        /\bguarantees?\s+(?:complete\s+(?:legal|security|protection)|reproducible\s+evidence)\b/i.test(sentence) ||
        /\bdefinitive,\s*proven\s+detection\b/i.test(sentence) ||
        /\bdefinitive\s+(?:and\s+)?proven\s+detection\b/i.test(sentence);
      if (guaranteeMatch) {
        if (!isQuestion && !hasNegation && !/\bnot\s+a\b/i.test(sentence)) {
          fail("T4.2", routePath, `Unverified detection/legal guarantee claim: "${sentence}"`, {
            ruleId: "AUTH-NO-GUARANTEED-DETECTION",
          });
        }
      }

      // 3. AUTH-NO-SELF-CERT
      const selfCertMatch =
        /(?:\b(?:bugsnaps|mypentest|endpointradar|phishlens|myrecon|we|our\s+(?:company|platform|service|tool))\b[^.!?]{0,70}\b(?:soc\s*2|iso\s*27001|csa\s*star|pci\s*dss|hipaa)\b[^.!?]{0,50}\b(?:certified|certification|type\s*ii|type\s*2|attestation|attested|compliant|compliance|listed|listing|audited)\b)|(?:\b(?:soc\s*2|iso\s*27001|csa\s*star|pci\s*dss|hipaa)\s+(?:certified|type\s*ii|type\s*2|attested|attestation)\b[^.!?]{0,60}\b(?:bugsnaps|mypentest|endpointradar|phishlens|myrecon)\b)|\b(?:certified\s+retesting|verified\s+auditor\s+attestations?|satisfy\s+soc\s*2)\b/i.test(
          sentence
        );
      if (selfCertMatch) {
        if (
          !isQuestion &&
          !hasNegation &&
          !THIRD_PARTY_PROVIDER_RE.test(sentence) &&
          !CUSTOMER_READINESS_RE.test(sentence)
        ) {
          fail("T4.2", routePath, `Unverified self-certification claim: "${sentence}"`, {
            ruleId: "AUTH-NO-SELF-CERT",
          });
        }
      }

      // 4. AUTH-NO-FABRICATED-PROOF
      const fabricatedMatch =
        /\b(?:trusted\s+by|used\s+by|over|more\s+than)\s*\d[\d,]*(?:\+|\s*(?:k|thousand|million))?\s+(?:companies|enterprises|teams|developers|organizations|organisations|customers|clients)\b/i.test(
          sentence
        ) ||
        /\b(?:customer\s+(?:testimonials?|logos?|case\s+studies|reviews)|what\s+our\s+customers\s+say|fortune\s+500\s+(?:clients|customers))\b/i.test(
          sentence
        ) ||
        /\b(?:mypentest|bugsnaps)\s+(?:outperforms?|beats?|scored\s+\d+%)\b/i.test(sentence) ||
        /\breduces?\s+(?:average\s+)?mttr\s+from\s+\w+\s+to\s+\w+/i.test(sentence);
      if (fabricatedMatch) {
        if (!isQuestion && !hasNegation) {
          fail("T4.2", routePath, `Fabricated social proof / unverified quantitative claim: "${sentence}"`, {
            ruleId: "AUTH-NO-FABRICATED-PROOF",
          });
        }
      }

      // 5. AUTH-NO-UNSHIPPED-MYPENTEST-CLAIMS
      const unshippedMatch =
        /\b(?:mypentest|bugsnaps)\b[^.!?]{0,90}\b(?:native\s+ci(?:\/cd)?\s+(?:triggers?|integration)|github\s+actions\s+integration|scheduled\s+(?:retests?|scans?)|cron\s+scans?|openapi(?:\s*\/\s*swagger)?\s+import|swagger\s+import|unlimited\s+free\s+scans?|headless[- ]+browser|proof[- ]+of[- ]+exploit)\b/i.test(
          sentence
        ) ||
        /\bmyrecon\b[^.!?]{0,50}\b(?:feeds?|pipes?|sends?|passes?|pushes?)\b[^.!?]{0,50}\bmypentest\b/i.test(sentence) ||
        /\bmypentest\b[^.!?]{0,60}\bfree\s+(?:to\s+run\s+)?on\s+every\s+release\b/i.test(sentence) ||
        /\bunlimited\s+free\s+scans?\b/i.test(sentence);
      if (unshippedMatch) {
        if (!isQuestion && !hasNegation && !/\bseparate\s+from\b/i.test(sentence)) {
          fail("T4.2", routePath, `Unshipped or contradictory product capability claim: "${sentence}"`, {
            ruleId: "AUTH-NO-UNSHIPPED-MYPENTEST-CLAIMS",
          });
        }
      }
    }

    // 6. AUTH-NO-FUTURE-DATES
    const dateCandidates = [];
    for (const node of parsed.jsonLdNodes) {
      for (const key of ["datePublished", "dateModified", "uploadDate"]) {
        if (typeof node[key] === "string") {
          dateCandidates.push({ label: `JSON-LD.${key}`, value: node[key] });
        }
      }
    }
    for (const metaKey of ["article:published_time", "article:modified_time"]) {
      if (parsed.meta[metaKey]) {
        dateCandidates.push({ label: `meta[${metaKey}]`, value: parsed.meta[metaKey] });
      }
    }
    for (const dt of parsed.times) {
      if (isIso8601Duration(dt)) continue;
      dateCandidates.push({ label: "time[datetime]", value: dt });
    }
    for (const cand of dateCandidates) {
      const iso = isValidCalendarDate(cand.value);
      if (!iso) {
        fail("T4.2", routePath, `Invalid calendar date in ${cand.label}: "${cand.value}"`, {
          ruleId: "AUTH-NO-FUTURE-DATES",
        });
      } else if (iso > todayIST) {
        fail("T4.2", routePath, `Future date in ${cand.label}: ${iso} > ${todayIST}`, {
          ruleId: "AUTH-NO-FUTURE-DATES",
        });
      }
    }

    // 7. Blog reading-time consistency
    if (routePath.startsWith("/blog/")) {
      const readTimeMatch = parsed.mainText.match(/\b(\d+)\s+min\s+read\b/i);
      if (readTimeMatch) {
        const claimed = Number(readTimeMatch[1]);
        const wc = parsed.mainSubstantiveWordCount;
        const expectedMin = Math.max(1, Math.round(wc / 200));
        if ((claimed >= 5 && wc < 300) || Math.abs(claimed - expectedMin) > 3) {
          fail(
            "T4.2",
            routePath,
            `Inflated blog reading time "${claimed} min read" vs ${wc} substantive words (expected ~${expectedMin} min)`,
            { ruleId: "AUTH-READING-TIME-MISMATCH" }
          );
        }
      }
    }
  }

  // Also enforce AUTH-NO-FUTURE-DATES on sitemap <lastmod>
  for (const entry of discovery.sitemapEntries || []) {
    if (entry.lastmod && isValidCalendarDate(entry.lastmod) && entry.lastmod > todayIST) {
      fail("T4.2", entry.loc, `Future sitemap <lastmod>: ${entry.lastmod} > ${todayIST}`, {
        ruleId: "AUTH-NO-FUTURE-DATES",
      });
    }
  }
}

module.exports = {
  runTier4,
  estimateSerpTitlePixels,
  stripBrandSuffix,
};

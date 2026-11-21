"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { extractPage } = require("./lib/html-parser.cjs");
const { parseSitemapXml } = require("./lib/xml-robots-llms.cjs");
const { createHttpClient, normalizePath } = require("./lib/http-client.cjs");
const { runTier1 } = require("./checks/tier1-discovery-technical.cjs");
const { runTier2 } = require("./checks/tier2-routes-depth.cjs");
const { runTier3 } = require("./checks/tier3-parity-graph.cjs");
const { runTier4 } = require("./checks/tier4-ctr-authenticity.cjs");
const { startMockSite } = require("./fixtures/mock-server.cjs");

function getTodayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseCliArgs(argv) {
  const opts = {
    selfTest: false,
    base: "http://localhost:3100",
    wwwBase: null,
    report: null,
    tiers: new Set([1, 2, 3, 4]),
    concurrency: 8,
    today: getTodayIST(),
    json: false,
  };

  function requireArgValue(flag, index) {
    if (index + 1 >= argv.length) {
      throw new Error(`Missing value for CLI flag: ${flag}`);
    }
    const val = argv[index + 1];
    if (!val || val.startsWith("--")) {
      throw new Error(`Missing value for CLI flag: ${flag}`);
    }
    return val;
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--self-test") opts.selfTest = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--base") {
      opts.base = requireArgValue(arg, i);
      i++;
    } else if (arg === "--www-base") {
      opts.wwwBase = requireArgValue(arg, i);
      i++;
    } else if (arg === "--report") {
      opts.report = requireArgValue(arg, i);
      i++;
    } else if (arg === "--concurrency") {
      const raw = requireArgValue(arg, i);
      i++;
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1) {
        throw new Error(`Invalid --concurrency argument: ${raw}`);
      }
      opts.concurrency = n;
    } else if (arg === "--today") {
      const val = requireArgValue(arg, i);
      i++;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        throw new Error(`Invalid --today argument (expected YYYY-MM-DD): ${val}`);
      }
      opts.today = val;
    } else if (arg === "--tier") {
      const raw = requireArgValue(arg, i);
      i++;
      const tokens = raw.split(",").map((s) => s.trim());
      if (tokens.length === 0 || tokens.some((t) => !/^[1-4]$/.test(t))) {
        throw new Error(`Invalid --tier argument: ${raw}`);
      }
      opts.tiers = new Set(tokens.map(Number));
    } else {
      throw new Error(`Unknown CLI argument: ${arg}`);
    }
  }
  return opts;
}

async function executeAudit(options) {
  const canonicalOrigin = "https://bugsnaps.in";
  const client = createHttpClient({
    baseUrl: options.base,
    wwwBaseUrl: options.wwwBase,
    canonicalOrigin,
    concurrency: options.concurrency,
  });

  const errors = [];
  const warnings = [];
  const fail = (checkId, url, message, meta = {}) => {
    errors.push({ checkId, url, message, ...meta });
  };
  const warn = (checkId, url, message, meta = {}) => {
    warnings.push({ checkId, url, message, ...meta });
  };

  async function safeDiscoveryFetch(routePath) {
    try {
      return await client.getText(routePath);
    } catch (err) {
      return {
        url: client.mapToBaseUrl(routePath),
        status: 0,
        contentType: "",
        xRobotsTag: "",
        location: "",
        csp: "",
        headers: new Headers(),
        body: "",
        error: err.message || String(err),
      };
    }
  }

  // Discovery fetch
  const [robotsRes, sitemapRes, llmsRes] = await Promise.all([
    safeDiscoveryFetch("/robots.txt"),
    safeDiscoveryFetch("/sitemap.xml"),
    safeDiscoveryFetch("/llms.txt"),
  ]);

  if (!options.tiers.has(1)) {
    for (const [p, r] of [
      ["/robots.txt", robotsRes],
      ["/sitemap.xml", sitemapRes],
      ["/llms.txt", llmsRes],
    ]) {
      if (r.error) fail("T1.1", p, `Discovery fetch failed: ${r.error}`);
    }
  }

  const parsedSitemap = parseSitemapXml(sitemapRes.body);
  const sitemapPathSet = new Set();
  const sitemapPaths = [];
  for (const entry of parsedSitemap.entries) {
    try {
      const u = new URL(entry.loc);
      const p = normalizePath(u.pathname);
      if (!sitemapPathSet.has(p)) {
        sitemapPathSet.add(p);
        sitemapPaths.push(p);
      }
    } catch {
      // caught in T1.1
    }
  }

  // Ensure /site-map is fetched even if missing from sitemap.xml
  const pathsToFetch = [...new Set([...sitemapPaths, "/site-map"])];
  const pages = new Map();

  await client.runPool(pathsToFetch, async (routePath) => {
    try {
      const res = await client.getText(routePath);
      const parsed =
        res.status === 200 && res.contentType.includes("text/html")
          ? extractPage(res.body, routePath, canonicalOrigin)
          : null;
      pages.set(routePath, { res, parsed });
    } catch (err) {
      pages.set(routePath, {
        res: { status: 0, contentType: "", xRobotsTag: "", body: "", error: err.message },
        parsed: null,
      });
    }
  });

  const ctx = {
    client,
    discovery: {
      robotsRes,
      sitemapRes,
      llmsRes,
      sitemapEntries: parsedSitemap.entries,
      sitemapPaths,
    },
    pages,
    todayIST: options.today || getTodayIST(),
    fail,
    warn,
  };

  if (options.tiers.has(1)) await runTier1(ctx);
  if (options.tiers.has(2)) await runTier2(ctx);
  if (options.tiers.has(3)) await runTier3(ctx);
  if (options.tiers.has(4)) await runTier4(ctx);

  return {
    base: client.baseUrl.origin,
    checkedAt: new Date().toISOString(),
    todayIST: ctx.todayIST,
    sitemapEntries: parsedSitemap.entries.length,
    pagesCrawled: pages.size,
    tiersRun: [...options.tiers].sort(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

const SELF_TEST_MUTATIONS = [
  { id: "T1.1-ROBOTS", expectedCheckId: "T1.1", tiers: new Set([1]) },
  { id: "T1.1-LLMS", expectedCheckId: "T1.1", tiers: new Set([1]) },
  { id: "T1.1-SITEMAP-BAD-CDATA", expectedCheckId: "T1.1", tiers: new Set([1]) },
  { id: "T1.2-STATUS", expectedCheckId: "T1.2", tiers: new Set([1]) },
  { id: "T1.2-CANONICAL", expectedCheckId: "T1.2", tiers: new Set([1]) },
  { id: "T1.3-TITLE-DUP", expectedCheckId: "T1.3", tiers: new Set([1]) },
  { id: "T1.3-TITLE-DUP-BRAND", expectedCheckId: "T1.3", tiers: new Set([1]) },
  { id: "T1.3-DESC-BOUNDS", expectedCheckId: "T1.3", tiers: new Set([1]) },
  { id: "T1.4-H1", expectedCheckId: "T1.4", tiers: new Set([1]) },
  { id: "T1.4-HIDDEN-IMPORTANT", expectedCheckId: "T1.4", tiers: new Set([1]) },
  { id: "T1.5-JSONLD", expectedCheckId: "T1.5", tiers: new Set([1]) },
  { id: "T1.6-LINKS", expectedCheckId: "T1.6", tiers: new Set([1]) },
  { id: "T1.6-TRAILING-SLASH", expectedCheckId: "T1.6", tiers: new Set([1]) },
  { id: "T1.6-ASSETS", expectedCheckId: "T1.6", tiers: new Set([1]) },
  { id: "T1.6-FAVICON", expectedCheckId: "T1.6", tiers: new Set([1]) },
  { id: "T1.6-PREFETCH-BLOAT", expectedCheckId: "T1.6", tiers: new Set([1]) },
  { id: "T1.7-HUBS", expectedCheckId: "T1.7", tiers: new Set([1]) },
  { id: "T2.1-TRUNC", expectedCheckId: "T2.1", tiers: new Set([2]) },
  { id: "T2.2-NOINDEX", expectedCheckId: "T2.2", tiers: new Set([2]) },
  { id: "T2.2-ENDPOINT-XROBOTS", expectedCheckId: "T2.2", tiers: new Set([2]) },
  { id: "T2.3-TRANSPORT", expectedCheckId: "T2.3", tiers: new Set([2]) },
  { id: "T2.3-RSC", expectedCheckId: "T2.3", tiers: new Set([2]) },
  { id: "T2.3-SOFT404", expectedCheckId: "T2.3", tiers: new Set([2]) },
  { id: "T2.4-THIN", expectedCheckId: "T2.4", tiers: new Set([2]) },
  { id: "T3.1-FAQ-HIDDEN", expectedCheckId: "T3.1", tiers: new Set([3]) },
  { id: "T3.1-FAQ-UNMARKED", expectedCheckId: "T3.1", tiers: new Set([3]) },
  { id: "T3.1-FAQ-DIV-UNMARKED", expectedCheckId: "T3.1", tiers: new Set([3]) },
  { id: "T3.1-FAQ-ANSWER-SWAPPED", expectedCheckId: "T3.1", tiers: new Set([3]) },
  { id: "T3.2-BREADCRUMB", expectedCheckId: "T3.2", tiers: new Set([3]) },
  { id: "T3.3-DEPTH", expectedCheckId: "T3.3", tiers: new Set([3]) },
  { id: "T4.1-SERP-PREFIX", expectedCheckId: "T4.1", tiers: new Set([4]) },
  { id: "T4.2-ZERO-FP", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-ZERO-FP", tiers: new Set([4]) },
  { id: "T4.2-ZERO-FP-HYPHEN", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-ZERO-FP", tiers: new Set([4]) },
  { id: "T4.2-HEADING-BYPASS", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-ZERO-FP", tiers: new Set([4]) },
  { id: "T4.2-GUARANTEE", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-GUARANTEED-DETECTION", tiers: new Set([4]) },
  { id: "T4.2-SELFCERT", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-SELF-CERT", tiers: new Set([4]) },
  { id: "T4.2-FABRICATED", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-FABRICATED-PROOF", tiers: new Set([4]) },
  { id: "T4.2-UNSHIPPED", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-UNSHIPPED-MYPENTEST-CLAIMS", tiers: new Set([4]) },
  { id: "T4.2-UNSHIPPED-EXTRA", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-UNSHIPPED-MYPENTEST-CLAIMS", tiers: new Set([4]) },
  { id: "T4.2-FUTURE-DATE", expectedCheckId: "T4.2", expectedRuleId: "AUTH-NO-FUTURE-DATES", tiers: new Set([4]) },
  { id: "T4.2-READING-TIME", expectedCheckId: "T4.2", expectedRuleId: "AUTH-READING-TIME-MISMATCH", tiers: new Set([4]) },
];

async function runSelfTest(options) {
  const results = [];
  let allPassed = true;

  // 1. Clean baseline across ALL 4 tiers
  const cleanSite = await startMockSite(null);
  let cleanReport;
  try {
    cleanReport = await executeAudit({
      ...options,
      base: cleanSite.baseUrl,
      wwwBase: null,
      tiers: new Set([1, 2, 3, 4]),
      today: "2026-11-21",
    });
  } finally {
    await cleanSite.close();
  }

  const cleanOk = cleanReport.errorCount === 0 && cleanReport.warningCount === 0;
  if (!cleanOk) allPassed = false;
  results.push({
    case: "CLEAN-BASELINE",
    passed: cleanOk,
    pagesCrawled: cleanReport.pagesCrawled,
    errorCount: cleanReport.errorCount,
    warningCount: cleanReport.warningCount,
    errors: cleanReport.errors,
    warnings: cleanReport.warnings,
  });

  // 2. Negative defect mutations
  for (const mut of SELF_TEST_MUTATIONS) {
    const site = await startMockSite(mut.id);
    let report;
    try {
      report = await executeAudit({
        ...options,
        base: site.baseUrl,
        wwwBase: null,
        tiers: mut.tiers,
        today: "2026-11-21",
      });
    } finally {
      await site.close();
    }

    const matched = report.errors.filter(
      (e) =>
        e.checkId === mut.expectedCheckId &&
        (!mut.expectedRuleId || e.ruleId === mut.expectedRuleId)
    );
    const caught = matched.length > 0;
    if (!caught) allPassed = false;
    results.push({
      case: mut.id,
      expectedCheckId: mut.expectedCheckId,
      expectedRuleId: mut.expectedRuleId || null,
      passed: caught,
      matchedErrors: matched.length,
      sampleMessage: matched[0]?.message || null,
    });
  }

  const summary = {
    mode: "self-test",
    passed: allPassed,
    cleanBaselinePassed: cleanOk,
    mutationsTotal: SELF_TEST_MUTATIONS.length,
    mutationsCaught: results.slice(1).filter((r) => r.passed).length,
    results,
  };

  if (options.report) {
    fs.writeFileSync(path.resolve(options.report), JSON.stringify(summary, null, 2) + "\n");
  }

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(
      `Clean baseline: ${cleanOk ? "PASS" : "FAIL"} (${cleanReport.pagesCrawled} pages, ${cleanReport.errorCount} errors, ${cleanReport.warningCount} warnings)`
    );
    if (!cleanOk) {
      for (const e of cleanReport.errors) console.error(`  [ERR ${e.checkId}] ${e.url}: ${e.message}`);
      for (const w of cleanReport.warnings) console.error(`  [WARN ${w.checkId}] ${w.url}: ${w.message}`);
    }
    for (const r of results.slice(1)) {
      console.log(
        `  [${r.passed ? "CAUGHT" : "MISSED"}] ${r.case} -> ${r.expectedCheckId}${r.expectedRuleId ? ` (${r.expectedRuleId})` : ""}${r.sampleMessage ? `: ${r.sampleMessage}` : ""}`
      );
    }
    console.log(
      `\nSelf-test summary: ${summary.mutationsCaught}/${summary.mutationsTotal} mutations caught; clean baseline ${cleanOk ? "PASSED" : "FAILED"}.`
    );
  }

  process.exitCode = allPassed ? 0 : 1;
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.selfTest) {
    await runSelfTest(options);
    return;
  }

  const report = await executeAudit(options);
  if (options.report) {
    fs.writeFileSync(path.resolve(options.report), JSON.stringify(report, null, 2) + "\n");
  }

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      `E2E SEO Audit (${report.base}): ${report.pagesCrawled} pages crawled, ${report.errorCount} errors, ${report.warningCount} warnings (tiers: ${report.tiersRun.join(",")})`
    );
    for (const w of report.warnings) {
      console.warn(`WARN [${w.checkId}] ${w.url}: ${w.message}`);
    }
    for (const e of report.errors) {
      console.error(`FAIL [${e.checkId}] ${e.url}: ${e.message}`);
    }
  }

  process.exitCode = report.errorCount > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(`Fatal E2E runner error: ${err.stack || err.message}`);
  process.exitCode = 1;
});

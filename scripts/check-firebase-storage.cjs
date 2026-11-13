/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");

function createTsLoader(mocks) {
  const originalLoad = Module._load;
  const prevTs = require.extensions[".ts"];
  const prevTsx = require.extensions[".tsx"];

  function compile(mod, filename) {
    const source = fs.readFileSync(filename, "utf8");
    const { outputText } = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    });
    return mod._compile(outputText, filename);
  }

  require.extensions[".ts"] = compile;
  require.extensions[".tsx"] = compile;

  Module._load = function patchedLoad(request, parent, isMain) {
    if (Object.prototype.hasOwnProperty.call(mocks, request)) {
      return mocks[request];
    }
    if (request.startsWith("@/")) {
      const target = path.join(ROOT, request.slice(2));
      return originalLoad.call(this, target, parent, isMain);
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  return () => {
    Module._load = originalLoad;
    require.extensions[".ts"] = prevTs;
    require.extensions[".tsx"] = prevTsx;
  };
}

function testClientExports(exportMod) {
  const exampleReport = JSON.parse(
    fs.readFileSync(path.join(ROOT, "lib/mypentest/example-report.json"), "utf8"),
  );

  for (const fmt of ["json", "md", "html", "sarif"]) {
    const res = exportMod.clientExportContent(exampleReport, fmt);
    assert.equal(res.extension, fmt);
    assert.ok(typeof res.content === "string" && res.content.length > 50, `${fmt} output too short`);
    if (fmt === "json") {
      const parsed = JSON.parse(res.content);
      assert.equal(parsed.asset, exampleReport.asset);
      assert.equal(parsed.scan_id, exampleReport.scan_id);
    } else if (fmt === "md") {
      assert.ok(res.content.includes(exampleReport.asset), "Markdown should contain asset");
      assert.ok(res.content.includes(`# Security assessment - ${exampleReport.asset}`), "Markdown heading missing");
    } else if (fmt === "html") {
      assert.ok(res.content.startsWith("<!doctype html>"), "HTML doctype missing");
      assert.ok(res.content.includes("</html>"), "HTML closing tag missing");
      assert.ok(res.content.includes(exampleReport.asset), "HTML should contain asset");
    } else if (fmt === "sarif") {
      const sarif = JSON.parse(res.content);
      assert.equal(sarif.version, "2.1.0");
      assert.ok(Array.isArray(sarif.runs) && sarif.runs.length === 1);
      const expectedCount = Array.isArray(exampleReport.findings)
        ? exampleReport.findings.length
        : (exampleReport.clusters ?? []).reduce(
            (sum, group) =>
              group.confidence === "hypothesis"
                ? sum
                : sum + (group.locations?.length ? group.locations.length : 1),
            0,
          );
      assert.equal(sarif.runs[0].results.length, expectedCount);
    }
  }

  // XSS escaping + empty/withheld findings edge case
  const maliciousReport = {
    scan_id: "scan-xss-1",
    authorization_id: "auth-1",
    asset: 'evil.test"><script>alert(1)</script>',
    started_at: "2026-11-13T00:00:00Z",
    finished_at: "2026-11-13T00:01:00Z",
    duration_seconds: 60,
    endpoints_probed: 1,
    requests_sent: 5,
    counts: { critical: 2, high: 0, medium: 1, low: 0, info: 0 },
    withheld: { critical: 2 },
    clusters: [],
    findings: [
      {
        rule_id: "xss.test",
        title: 'Reflected <img src=x onerror="alert(2)">',
        severity: "medium",
        confidence: "confirmed",
        asset: "evil.test",
        location: 'https://evil.test/?q="><script>alert(3)</script>',
        cvss: { base_score: 6.1, vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N" },
        cwe: 79,
        owasp: "A03:2021",
        summary: "Test <script>alert(4)</script>",
        description: "Desc <b>raw</b>",
        impact: "Impact",
        remediation: "Escape output",
        references: ["https://owasp.org"],
        evidence: [
          { kind: "body", summary: "Payload", detail: "<script>alert(5)</script>", redacted: false },
        ],
        tags: [],
      },
    ],
    notes: ["Note <script>alert(6)</script>"],
  };

  const htmlRes = exportMod.clientExportContent(maliciousReport, "html");
  assert.ok(!htmlRes.content.includes("<script>"), "HTML export must escape raw <script> tags");
  assert.ok(htmlRes.content.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(htmlRes.content.includes("&lt;img src=x onerror=&quot;alert(2)&quot;&gt;"));
  assert.ok(htmlRes.content.includes("2 critical"), "Withheld critical count must be preserved");
  assert.ok(!htmlRes.content.includes("undefined"), "HTML export should not leak undefined");

  const emptyReport = {
    scan_id: "scan-empty",
    authorization_id: "auth-empty",
    asset: "clean.example.com",
    started_at: "2026-11-13T00:00:00Z",
    finished_at: "2026-11-13T00:00:10Z",
    duration_seconds: 10,
    endpoints_probed: 0,
    requests_sent: 0,
    counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    withheld: null,
    clusters: [],
    findings: [],
    notes: [],
  };
  for (const fmt of ["json", "md", "html", "sarif"]) {
    const res = exportMod.clientExportContent(emptyReport, fmt);
    assert.ok(!res.content.includes("NaN"), `${fmt} leaked NaN on empty report`);
    if (fmt === "sarif") {
      const sarif = JSON.parse(res.content);
      assert.equal(sarif.runs[0].results.length, 0);
    }
  }

  assert.throws(() => exportMod.clientExportContent(emptyReport, "pdf"), /Unsupported client export format/);
}

async function testPlansModule(plansMod) {
  assert.ok(Array.isArray(plansMod.FALLBACK_PLANS) && plansMod.FALLBACK_PLANS.length >= 2);
  for (const plan of plansMod.FALLBACK_PLANS) {
    assert.equal(plan.history, false, `FALLBACK_PLANS.${plan.id}.history must be false`);
    for (const fmt of ["json", "md", "html", "sarif", "pdf"]) {
      assert.ok(plan.exports.includes(fmt), `FALLBACK_PLANS.${plan.id}.exports must include ${fmt}`);
    }
  }

  const origFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        free: {
          title: "Free",
          public: true,
          order: 0,
          history: true,
          exports: "none",
          severities: ["medium", "low"],
        },
        plus: {
          title: "Plus",
          public: true,
          order: 1,
          price: 49900,
          scans: 2,
          scanPack: true,
          lifetimeScans: true,
          history: true,
          exports: [],
        },
      }),
    });

    const catalog = await plansMod.getPlans();
    const staleFree = catalog.find((p) => p.id === "free");
    const stalePlus = catalog.find((p) => p.id === "plus");
    assert.ok(staleFree && stalePlus);
    assert.equal(staleFree.history, false, "getPlans must override stale Firebase catalog history:true");
    assert.deepEqual(staleFree.exports, ["json", "md", "html", "sarif", "pdf"]);
    assert.equal(stalePlus.history, false);
    assert.deepEqual(stalePlus.exports, ["json", "md", "html", "sarif", "pdf"]);

    const merged = plansMod.withEngine(stalePlus, {
      name: "plus",
      title: "Plus",
      price: 49900,
      yearly_price: 0,
      currency: "INR",
      period_days: 30,
      max_concurrent_scans: 2,
      max_scans: 2,
      scan_window_days: 30,
      lifetime_scans: true,
      scan_pack: true,
      purchasable: true,
      max_targets_per_scan: 10000,
      max_crawl_pages: 50000,
      max_crawl_depth: 4,
      scan_deadline_seconds: 3600,
      allow_active_safe: true,
      severities: ["critical", "high", "medium", "low", "info"],
      manual_testing: false,
      history: true,
      exports: [],
    });
    assert.equal(merged.history, false);
    assert.deepEqual(merged.exports, ["json", "md", "html", "sarif", "pdf"]);
    assert.ok(!/saved to your history/i.test(plansMod.historyLabel(stalePlus.history)));
  } finally {
    globalThis.fetch = origFetch;
  }
}

function testUiComponentWiring() {
  const assessmentSrc = fs.readFileSync(
    path.join(ROOT, "components/mypentest/app/assessment.tsx"),
    "utf8",
  );
  assert.ok(!assessmentSrc.includes("saveToHistory"), "assessment.tsx must not reference saveToHistory");
  assert.ok(!assessmentSrc.includes("firebase/database"), "assessment.tsx must not directly import firebase/database");
  assert.ok(assessmentSrc.includes("await api.scan(id)"), "progress must poll the memory API");
  assert.ok(!assessmentSrc.includes("@/lib/mypentest/history"));

  const dashboardSrc = fs.readFileSync(
    path.join(ROOT, "components/mypentest/app/dashboard.tsx"),
    "utf8",
  );
  assert.ok(!dashboardSrc.includes("saveToHistory"), "dashboard.tsx must not reference saveToHistory");
  const mountEffectMatch = dashboardSrc.match(/useEffect\(\(\) => \{[\s\S]*?\n\s*\}, \[\]\);/);
  assert.ok(mountEffectMatch, "dashboard.tsx mount useEffect missing");
  assert.ok(
    !/refreshHistory|listHistory/.test(mountEffectMatch[0]),
    "dashboard.tsx must not auto-read Firebase history on mount",
  );
  assert.ok(!/deleteFromHistory|listHistory|loadFromHistory/.test(dashboardSrc), "no legacy reads or deletes");

  const resultViewSrc = fs.readFileSync(
    path.join(ROOT, "components/mypentest/app/result-view.tsx"),
    "utf8",
  );
  assert.ok(resultViewSrc.includes("clientExportContent"), "result-view.tsx must use clientExportContent for direct downloads");
  assert.ok(resultViewSrc.includes("Download your report"), "result-view.tsx must display the post-scan download banner");

  const progressSrc = fs.readFileSync(
    path.join(ROOT, "components/mypentest/app/progress.tsx"),
    "utf8",
  );
  assert.ok(progressSrc.includes("job.target_count ?? job.targets.length"), "progress.tsx must support target_count from slim live snapshots");
}

async function main() {
  const restore = createTsLoader({
    "server-only": {},
    "@/lib/firebase-auth": {},
    "firebase/database": new Proxy({}, { get() { throw new Error("Scan code must never access Firebase Database"); } }),
  });

  try {
    const exportMod = require(path.join(ROOT, "lib/mypentest/export-client.ts"));
    const plansMod = require(path.join(ROOT, "lib/plans.ts"));

    testClientExports(exportMod);
    await testPlansModule(plansMod);
    testUiComponentWiring();
    console.log("check-firebase-storage: PASS (local exports, non-storage plans, no history access verified)");
  } finally {
    restore();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

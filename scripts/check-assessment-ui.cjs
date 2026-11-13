/* Behavioral verification for Assessment lifecycle, post-scan exports, Dashboard, and api.download.
 * Run: node scripts/check-assessment-ui.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

function sameDeps(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
}

let activeView = null;
const react = {
  useState(initial) {
    const view = activeView;
    const idx = view.cursor++;
    if (!(idx in view.hooks)) {
      view.hooks[idx] = { value: typeof initial === "function" ? initial() : initial };
    }
    const set = (next) => {
      const prev = view.hooks[idx].value;
      view.hooks[idx].value = typeof next === "function" ? next(prev) : next;
    };
    return [view.hooks[idx].value, set];
  },
  useMemo(fn, deps) {
    const view = activeView;
    const idx = view.cursor++;
    if (!view.hooks[idx] || !sameDeps(view.hooks[idx].deps, deps)) {
      view.hooks[idx] = { value: fn(), deps };
    }
    return view.hooks[idx].value;
  },
  useCallback(fn, deps) {
    const view = activeView;
    const idx = view.cursor++;
    if (!view.hooks[idx] || !sameDeps(view.hooks[idx].deps, deps)) {
      view.hooks[idx] = { fn, deps };
    }
    return view.hooks[idx].fn;
  },
  useEffect(fn, deps) {
    const view = activeView;
    const idx = view.cursor++;
    if (!view.hooks[idx] || !sameDeps(view.hooks[idx].deps, deps)) {
      view.hooks[idx]?.cleanup?.();
      view.hooks[idx] = { deps };
      view.effects.push(() => {
        view.hooks[idx].cleanup = fn();
      });
    }
  },
};

const jsx = (type, props, key) => ({ type, props: props ?? {}, key });
const marker = (name) => Object.assign((props) => jsx(name, props), { displayName: name });
const expand = (tree) => {
  if (!tree || typeof tree !== "object") return tree;
  if (Array.isArray(tree)) return tree.map(expand);
  if (typeof tree.type === "function" && !tree.type.displayName) {
    return expand(tree.type(tree.props));
  }
  return tree;
};
const nodes = (tree) => {
  const resolved = expand(tree);
  if (!resolved || typeof resolved !== "object") return [];
  if (Array.isArray(resolved)) return resolved.flatMap(nodes);
  return [resolved, ...nodes(resolved.props?.children)];
};
const copy = (tree) => {
  const resolved = expand(tree);
  if (Array.isArray(resolved)) return resolved.map(copy).join(" ");
  if (resolved && typeof resolved === "object") {
    return [resolved.props?.title ?? "", copy(resolved.props?.children)].filter(Boolean).join(" ");
  }
  return resolved == null || resolved === false ? "" : String(resolved);
};

function mount(Component, props = {}) {
  const view = {
    hooks: [],
    effects: [],
    cursor: 0,
    tree: null,
    render(nextProps = props) {
      activeView = this;
      this.cursor = 0;
      this.tree = Component(nextProps);
      activeView = null;
      for (const eff of this.effects.splice(0)) eff();
      return this.tree;
    },
    dispose() {
      for (const h of this.hooks) h?.cleanup?.();
    },
  };
  view.render(props);
  return view;
}

const flush = async (ticks = 10) => {
  for (let i = 0; i < ticks; i++) await new Promise(setImmediate);
};

function createLoader(modules = {}, extraGlobals = {}) {
  const cache = new Map();
  function load(relative) {
    const resolved = fs.existsSync(path.join(root, relative)) ? relative : `${relative}.ts`;
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const mod = { exports: {} };
    cache.set(resolved, mod);
    const code = ts.transpileModule(fs.readFileSync(path.join(root, resolved), "utf8"), {
      fileName: resolved,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const sandbox = {
      module: mod,
      exports: mod.exports,
      URL,
      URLSearchParams,
      Blob,
      console,
      Promise,
      Error,
      Date,
      JSON,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      ...extraGlobals,
      require(id) {
        if (id in modules) return modules[id];
        if (id.startsWith("@/")) {
          const base = id.slice(2);
          for (const candidate of [base, `${base}.ts`, `${base}.tsx`]) {
            if (fs.existsSync(path.join(root, candidate))) return load(candidate);
          }
        }
        throw new Error(`Unmocked module: ${id}`);
      },
    };
    vm.runInNewContext(code, sandbox, { filename: resolved });
    return mod.exports;
  }
  return load;
}

function testClientExports() {
  const load = createLoader();
  const exp = load("lib/mypentest/export-client.ts");
  const exampleReport = JSON.parse(
    fs.readFileSync(path.join(root, "lib/mypentest/example-report.json"), "utf8"),
  );

  // 1. Real example report exports cleanly in all 4 client formats.
  const jsonOut = exp.reportToJson(exampleReport);
  assert.equal(JSON.parse(jsonOut).asset, exampleReport.asset);

  const mdOut = exp.reportToMarkdown(exampleReport);
  assert.ok(mdOut.startsWith("# Security assessment"));
  assert.ok(mdOut.includes(exampleReport.asset));
  assert.ok(!mdOut.includes("undefined"));

  const htmlOut = exp.reportToHtml(exampleReport);
  assert.ok(htmlOut.startsWith("<!doctype html>"));
  assert.ok(htmlOut.includes(exampleReport.asset));
  assert.ok(!htmlOut.includes("undefined"));

  const sarifObj = JSON.parse(exp.reportToSarif(exampleReport));
  assert.equal(sarifObj.version, "2.1.0");
  assert.ok(sarifObj.runs[0].results.length > 0);
  assert.ok(sarifObj.runs[0].results.every((r) => r.locations?.[0]?.physicalLocation?.artifactLocation?.uri));

  // 2. Edge cases: empty locations/findings, optional attack.url and chain.peak_severity omitted, XSS payload.
  const edgeReport = {
    scan_id: "scan_edge12345678",
    asset: "victim.test/<script>alert(1)</script>",
    started_at: "2026-10-01T00:00:00Z",
    duration_seconds: 12,
    requests_sent: 25,
    plugins_run: ["headers"],
    counts: { critical: 0, high: 1, medium: 0, low: 0, info: 0 },
    findings: [],
    clusters: [
      {
        rule_id: "xss.reflected",
        title: "Reflected XSS <img src=x onerror=alert(2)>",
        severity: "high",
        count: 1,
        locations: [],
        representative: {
          fingerprint: "fp1",
          rule_id: "xss.reflected",
          title: "Reflected XSS <img src=x onerror=alert(2)>",
          severity: "high",
          confidence: "confirmed",
          cwe: 79,
          owasp: "A03",
          cvss: { base_score: 7.5, vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N" },
          description: "Desc <b>bold</b>",
          impact: "Impact",
          remediation: "Fix <script>bad()</script>",
          evidence: [{ kind: "probe", summary: "Reflected", detail: "<script>alert(3)</script>" }],
          attack: [{ id: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access" }],
        },
      },
    ],
    attack_chains: [
      {
        id: "chain.test",
        title: "Chain <script>xss</script>",
        confidence: "likely",
        narrative: "Attacker pivots",
        first_step: "Sanitize output",
      },
    ],
    passes: [{ title: "HSTS header", location: "", detail: "" }],
    unchecked: [],
    limitations: [],
  };

  const edgeMd = exp.reportToMarkdown(edgeReport);
  assert.ok(!edgeMd.includes("undefined"), "Markdown must never render 'undefined' for optional fields");
  assert.ok(edgeMd.includes("T1190 Exploit Public-Facing Application (Initial Access)"));
  assert.ok(!edgeMd.includes("(undefined)"));

  const edgeHtml = exp.reportToHtml(edgeReport);
  assert.ok(!edgeHtml.includes("undefined"), "HTML must never render 'undefined' for optional fields");
  assert.ok(!edgeHtml.includes("<script>alert("), "HTML must escape script tags");
  assert.ok(!edgeHtml.includes("<img src=x"), "HTML must escape img tags");
  assert.ok(edgeHtml.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));

  const edgeSarif = JSON.parse(exp.reportToSarif(edgeReport));
  assert.equal(edgeSarif.runs[0].results.length, 1, "Empty cluster locations must still emit a SARIF result using asset URI");
  assert.equal(edgeSarif.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri, edgeReport.asset);
  assert.ok(edgeSarif.runs[0].tool.driver.rules[0].properties.tags.includes("CWE-79"));
}

async function testApiDownload401Retry() {
  const fetchCalls = [];
  const tokenCalls = [];
  const downloads = [];
  const anchor = {
    href: "",
    download: "",
    click() {
      downloads.push({ href: this.href, download: this.download });
    },
    remove() {},
  };
  const load = createLoader(
    {
      "@/lib/firebase-auth": {
        idToken: async (force = false) => {
          tokenCalls.push(force);
          return force ? "fresh-token" : "stale-token";
        },
      },
      "@/lib/mypentest": { routes: { api: "/mypentest/api" } },
    },
    {
      URL: { createObjectURL: () => "blob:test-url", revokeObjectURL: () => {} },
      document: { createElement: () => anchor, body: { appendChild: () => {} } },
      fetch: async (url, init) => {
        fetchCalls.push({ url, auth: init.headers.Authorization });
        if (init.headers.Authorization === "Bearer stale-token") {
          return { ok: false, status: 401, json: async () => ({ error: "Expired token" }) };
        }
        return {
          ok: true,
          status: 200,
          blob: async () => new Blob(["# Report"], { type: "text/markdown" }),
        };
      },
    },
  );
  const { api } = load("lib/mypentest/api.ts");
  await api.download("scan_a1b2c3d4e5f6", "md");
  assert.deepEqual(tokenCalls, [false, true], "api.download retries with forced token refresh after 401");
  assert.equal(fetchCalls.length, 2);
  assert.equal(downloads[0].download, "scan_a1b2c3d4e5f6.md");
}

function makeAssessmentHarness({ initialScanId = "scan_a1b2c3d4e5f6", scanResponder, historyResponder } = {}) {
  let onLiveError = null;
  const intervals = [];
  let fakeNow = 1_000_000;
  class FakeDate extends Date {
    static now() {
      return fakeNow;
    }
  }
  let liveCb = null;
  let unsubscribed = 0;
  const interruptedCalls = [];
  const scanCalls = [];
  const historyCalls = [];

  class ApiError extends Error {
    constructor(message, status, kind = "http") {
      super(message);
      this.status = status;
      this.kind = kind;
    }
  }

  const modules = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/navigation": { useSearchParams: () => new URLSearchParams({ id: initialScanId }) },
    "next/link": { default: marker("Link") },
    "lucide-react": { ArrowLeft: marker("ArrowLeft"), Loader2: marker("Loader2") },
    "@/lib/mypentest": { routes: { app: "/mypentest/app" } },
    "@/components/mypentest/app/ui": { Notice: marker("Notice") },
    "@/components/mypentest/app/progress": { AssessmentProgress: marker("AssessmentProgress") },
    "@/components/mypentest/app/result-view": { ResultView: marker("ResultView") },
    "@/components/mypentest/app/upgrade": { markShown: () => {}, useUpgrade: () => ({ open: () => {} }) },
    "@/lib/mypentest/api": {
      ApiError,
      api: {
        billing: async () => ({ current: { exports: ["json", "md", "html", "sarif", "pdf"] } }),
        scan: async (id) => {
          scanCalls.push(id);
          return scanResponder(id, scanCalls.length, ApiError);
        },
        stopScan: async () => {},
      },
    },
    "@/lib/mypentest/history": {
      INTERRUPTED: "This assessment stopped before finishing because the testing engine restarted. Your quota for it wasn't used.",
      liveToJob: (id, rec) => ({
        id,
        asset: rec.asset ?? "example.com",
        targets: [],
        target_count: rec.target_count ?? 1,
        state: rec.state,
        phase: rec.phase ?? rec.state,
        progress: rec.progress ?? "",
        checks_done: rec.checks_done ?? 0,
        checks_total: rec.checks_total ?? 10,
        error: rec.error ?? null,
        saved: Boolean(rec.saved),
        history: false,
        email_status: rec.email_status,
        email_error: rec.email_error ?? null,
        email_to: rec.email_to ?? null,
      }),
      watchLive: async (_id, cb, onErr) => {
        liveCb = cb;
        onLiveError = onErr;
        return () => {
          unsubscribed += 1;
        };
      },
      markInterrupted: async (id, reason) => {
        interruptedCalls.push({ id, reason });
      },
      loadFromHistory: async (id) => {
        historyCalls.push(id);
        return historyResponder ? historyResponder(id) : null;
      },
    },
  };

  const load = createLoader(modules, {
    Date: FakeDate,
    setInterval: (fn, ms) => {
      intervals.push({ fn, ms });
      return intervals.length;
    },
    clearInterval: () => {},
  });
  const { Assessment } = load("components/mypentest/app/assessment.tsx");
  const view = mount(Assessment);
  return {
    view,
    pushLive: async (rec) => {
      await flush();
      liveCb(rec);
      await flush();
      view.render();
    },
    advanceSilence: async (ms) => {
      fakeNow += ms;
      for (const entry of intervals) entry.fn();
      await flush();
      view.render();
    },
    triggerLiveError: async () => {
      onLiveError?.();
      await flush();
      view.render();
    },
    get unsubscribed() {
      return unsubscribed;
    },
    interruptedCalls,
    scanCalls,
    historyCalls,
  };
}

async function testAssessmentLifecycle() {
  const exampleReport = JSON.parse(
    fs.readFileSync(path.join(root, "lib/mypentest/example-report.json"), "utf8"),
  );

  // Scenario 1: Completed scan whose 24h engine memory expired (404) MUST NOT markInterrupted!
  const expired = makeAssessmentHarness({
    scanResponder: async (_id, _n, ApiError) => {
      throw new ApiError("Not found", 404);
    },
  });
  try {
    await expired.pushLive({ state: "done", asset: "done.example", saved: false, history: false, updatedAt: 100 });
    assert.equal(expired.interruptedCalls.length, 0, "Completed expired scan must never call markInterrupted");
    const expiredText = copy(expired.view.tree);
    assert.ok(!expiredText.includes("This assessment was interrupted"), "Must not show interrupted banner on finished scan");
    const notice = nodes(expired.view.tree).find((n) => n.type.displayName === "Notice");
    assert.ok(notice, "Must show explanatory expired error Notice");
    assert.ok(copy(notice).includes("Firebase"), "Explains expiry and non-storage");
  } finally {
    expired.view.dispose();
  }

  // Scenario 2: Active running scan interrupted (silence watchdog -> 404) MUST call markInterrupted.
  const interrupted = makeAssessmentHarness({
    scanResponder: async (_id, _n, ApiError) => {
      throw new ApiError("Not found", 404);
    },
  });
  try {
    await interrupted.pushLive({ state: "running", asset: "run.example", phase: "testing", updatedAt: 100 });
    await interrupted.advanceSilence(95_000);
    assert.equal(interrupted.interruptedCalls.length, 1, "Mid-scan 404 must still markInterrupted");
    assert.ok(copy(interrupted.view.tree).includes("This assessment was interrupted"));
  } finally {
    interrupted.view.dispose();
  }

  // Scenario 3: Live `done` with pending email stays subscribed and updates email status after report loads.
  const emailFlow = makeAssessmentHarness({
    scanResponder: async (id) => ({
      id,
      asset: "mail.example",
      targets: ["https://mail.example/"],
      state: "done",
      phase: "finished",
      progress: "Finished",
      checks_done: 10,
      checks_total: 10,
      saved: false,
      history: false,
      email_status: "pending",
      email_to: "owner@mail.example",
      report: exampleReport,
    }),
  });
  try {
    await emailFlow.pushLive({
      state: "done",
      asset: "mail.example",
      saved: false,
      history: false,
      email_status: "pending",
      email_to: "owner@mail.example",
      updatedAt: 100,
    });
    assert.equal(emailFlow.unsubscribed, 0, "Must keep watchLive open while email_status is pending");
    assert.ok(nodes(emailFlow.view.tree).some((n) => n.type.displayName === "ResultView"), "Report rendered immediately");
    assert.ok(copy(emailFlow.view.tree).includes("Emailing the report to your address"));

    await emailFlow.pushLive({
      state: "done",
      asset: "mail.example",
      saved: false,
      history: false,
      email_status: "sent",
      email_to: "owner@mail.example",
      updatedAt: 200,
    });
    assert.equal(emailFlow.unsubscribed, 1, "Stops watching once terminal email_status arrives");
    assert.ok(copy(emailFlow.view.tree).includes("The report was emailed"));
  } finally {
    emailFlow.view.dispose();
  }

  // Scenario 4: Race where live says `done` slightly before api.scan returns `done` with report.
  let raceAttempt = 0;
  const race = makeAssessmentHarness({
    scanResponder: async (id) => {
      raceAttempt += 1;
      if (raceAttempt === 1) {
        return {
          id,
          asset: "race.example",
          targets: [],
          state: "running",
          phase: "reporting",
          progress: "Building the report",
          checks_done: 10,
          checks_total: 10,
        };
      }
      return {
        id,
        asset: "race.example",
        targets: ["https://race.example/"],
        state: "done",
        phase: "finished",
        progress: "Finished",
        checks_done: 10,
        checks_total: 10,
        saved: false,
        report: exampleReport,
      };
    },
  });
  try {
    await race.pushLive({ state: "done", asset: "race.example", saved: false, history: false, updatedAt: 100 });
    assert.equal(race.scanCalls.length, 1);
    assert.equal(
      nodes(race.view.tree).find((n) => n.type.displayName === "AssessmentProgress"),
      undefined,
      "Must not flash back to running progress during brief store update race",
    );
    await new Promise((r) => setTimeout(r, 500));
    race.view.render();
    assert.ok(race.scanCalls.length >= 2, "Retries api.scan briefly until report lands");
    assert.ok(nodes(race.view.tree).some((n) => n.type.displayName === "ResultView"));
  } finally {
    race.view.dispose();
  }

  // Scenario 5: Missing/expired scan with no live record and no ?source=history must NOT auto-read Firebase reports!
  const missing = makeAssessmentHarness({
    scanResponder: async (_id, _n, ApiError) => {
      throw new ApiError("Not found", 404);
    },
  });
  try {
    await missing.triggerLiveError();
    assert.equal(missing.historyCalls.length, 0, "Must never hit Firebase history on non-history 404");
    const notice = nodes(missing.view.tree).find((n) => n.type.displayName === "Notice");
    assert.ok(notice, "Must render clear expiry/not-found Notice");
    assert.ok(copy(notice).includes("24-hour"), "Explains 24h engine window and non-storage");
  } finally {
    missing.view.dispose();
  }
}

async function testResultViewAndDashboard() {
  const exampleReport = JSON.parse(
    fs.readFileSync(path.join(root, "lib/mypentest/example-report.json"), "utf8"),
  );
  const downloadedApi = [];
  const savedBlobs = [];
  let printed = 0;

  class ApiError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }

  const rvLoad = createLoader(
    {
      react,
      "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
      "next/link": { default: marker("Link") },
      "lucide-react": { Download: marker("Download"), Printer: marker("Printer"), RotateCcw: marker("RotateCcw") },
      "@/lib/mypentest/api": {
        ApiError,
        api: {
          download: async (id, fmt) => {
            downloadedApi.push({ id, fmt });
            if (fmt === "md") throw new ApiError("Expired", 404);
          },
        },
        saveBlob: (blob, filename) => {
          savedBlobs.push({ size: blob.size, type: blob.type, filename });
        },
      },
      "@/lib/mypentest/history": { loadExport: async () => null },
      "@/lib/mypentest": { newAssessmentUrl: (a) => `/new?t=${a}`, routes: { billing: "/billing" } },
      "@/components/mypentest/report/report-view": {
        FindingCard: marker("FindingCard"),
        ReportView: (props) => jsx("ReportView", props),
        referenceFor: (_r, c) => c.rule_id,
      },
      "@/components/mypentest/severity": { SEVERITY_LABEL: { critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info" } },
      "@/components/mypentest/app/ui": { Notice: marker("Notice"), buttonClass: { primary: "p", secondary: "s", small: "sm" }, inputClass: "in" },
      "@/lib/utils": { cn: (...xs) => xs.filter(Boolean).join(" ") },
    },
    { window: { print: () => { printed += 1; }, addEventListener: () => {}, removeEventListener: () => {} } },
  );
  const { ResultView } = rvLoad("components/mypentest/app/result-view.tsx");
  const rv = mount(ResultView, {
    scanId: "scan_998877665544",
    report: exampleReport,
    stored: false,
    exports: null,
  });
  const rvText = copy(rv.tree);
  assert.ok(rvText.includes("Download your report"), "Post-scan download banner must show for non-stored results");
  const rvReport = nodes(rv.tree).find((n) => n.type === "ReportView");
  const actionButtons = nodes(rvReport.props.actions).filter((n) => n.type === "button");
  await actionButtons.find((b) => copy(b).includes("JSON")).props.onClick();
  await actionButtons.find((b) => copy(b).includes("Markdown")).props.onClick();
  await actionButtons.find((b) => copy(b).includes("HTML")).props.onClick();
  actionButtons.find((b) => copy(b).includes("Print")).props.onClick();
  assert.deepEqual(
    downloadedApi,
    [
      { id: "scan_998877665544", fmt: "md" },
      { id: "scan_998877665544", fmt: "html" },
    ],
    "Even when exports === null (billing pending), non-JSON formats try api.download",
  );
  assert.equal(savedBlobs.filter((b) => b.filename.endsWith(".json")).length, 1);
  assert.equal(savedBlobs.filter((b) => b.filename.endsWith(".md")).length, 1, "MD falls back cleanly to client generator on 404");
  assert.equal(printed, 1);

  // Dashboard: zero listHistory calls on mount; manual button triggers listHistory.
  let listCalls = 0;
  const deleted = [];
  const dashLoad = createLoader(
    {
      react,
      "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
      "next/link": { default: marker("Link") },
      "lucide-react": { ArrowRight: marker("ArrowRight"), Globe: marker("Globe"), Plus: marker("Plus"), Trash2: marker("Trash2") },
      "@/lib/mypentest/api": {
        ApiError,
        api: {
          state: async () => ({
            plan: { name: "free", title: "Free", severities: ["medium", "low"], history: false, exports: ["json", "md", "html", "sarif", "pdf"] },
            usage: { scans_used: 0, scans_limit: 1, scans_remaining: 1 },
            authorizations: [],
            scans: [
              { id: "scan_recent123456", asset: "app.example", targets: ["https://app.example/"], state: "done", phase: "finished", checks_done: 10, checks_total: 10, started_at: "2026-10-01T00:00:00Z", finished_at: "2026-10-01T00:05:00Z", counts: { critical: 0, high: 0, medium: 1, low: 0, info: 0 } },
            ],
          }),
        },
      },
      "@/lib/mypentest/history": {
        listHistory: async () => {
          listCalls += 1;
          return [{ id: "scan_legacy123456", asset: "old.example", finishedAt: "2026-09-01T00:00:00Z", counts: { critical: 1, high: 0, medium: 0, low: 0, info: 0 } }];
        },
        deleteFromHistory: async (id) => {
          deleted.push(id);
        },
      },
      "@/lib/mypentest": { newAssessmentUrl: (a) => `/new?t=${a}`, routes: { assessment: (id) => `/assessment?id=${id}`, newAssessment: "/new", billing: "/billing" } },
      "@/components/mypentest/severity": { SeverityBar: marker("SeverityBar"), SeverityPill: marker("SeverityPill") },
      "@/components/mypentest/app/ui": { Notice: marker("Notice"), Panel: marker("Panel"), Spinner: marker("Spinner"), buttonClass: { primary: "p", secondary: "s", small: "sm" }, formatDate: (v) => String(v ?? "-") },
      "@/lib/plans": { reachLabel: () => "Medium & low", scansLabel: () => "1 scan", windowLabel: () => "1 scan" },
    },
    { window: { confirm: () => true } },
  );
  const { Dashboard } = dashLoad("components/mypentest/app/dashboard.tsx");
  const dash = mount(Dashboard);
  await flush();
  dash.render();
  assert.equal(listCalls, 0, "Dashboard mount must NEVER auto-fetch Firebase legacy history");
  const dashText = copy(dash.tree);
  assert.ok(dashText.includes("app.example"));
  assert.ok(dashText.includes("Open & download"));
  const checkBtn = nodes(dash.tree).find((n) => n.type === "button" && copy(n).includes("Check legacy saved history"));
  assert.ok(checkBtn);
  await checkBtn.props.onClick();
  await flush();
  dash.render();
  assert.equal(listCalls, 1, "Manual button loads legacy history on demand");
  assert.ok(copy(dash.tree).includes("old.example"));
  const delBtn = nodes(dash.tree).find((n) => n.type === "button" && (n.props["aria-label"] ?? "").includes("Delete"));
  await delBtn.props.onClick();
  await flush();
  assert.deepEqual(deleted, ["scan_legacy123456"]);
}

async function main() {
  testClientExports();
  await testApiDownload401Retry();
  await testAssessmentLifecycle();
  await testResultViewAndDashboard();
  console.log("PASS: assessment lifecycle, 404 expiry vs interruption, live email updates, 401 download retry, client exports, ResultView, and Dashboard verified.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

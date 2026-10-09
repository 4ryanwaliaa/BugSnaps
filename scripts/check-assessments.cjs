/* Regression checks at the wizard/API and report-presentation boundaries.
 * Run: node scripts/check-assessments.cjs. Uses no real accounts or requests.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const plain = (value) => JSON.parse(JSON.stringify(value));
const marker = (name) => Object.assign(() => {}, { displayName: name });
const jsx = (type, props, key) => ({ type, props: props ?? {}, key });
const nodes = (tree) => !tree || typeof tree !== "object" ? [] : Array.isArray(tree)
  ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const text = (tree) => Array.isArray(tree) ? tree.map(text).join(" ") : tree && typeof tree === "object"
  ? text(tree.props?.children) : tree == null || tree === false ? "" : String(tree);
let active;
const react = {
  useState(initial) {
    const view = active, i = view.cursor++;
    view.hooks[i] ??= { value: typeof initial === "function" ? initial() : initial };
    return [view.hooks[i].value, (value) => { view.hooks[i].value = typeof value === "function" ? value(view.hooks[i].value) : value; }];
  },
  useMemo: (fn) => fn(),
  useEffect(fn) {
    const view = active, i = view.cursor++;
    if (!view.hooks[i]) { view.hooks[i] = {}; view.effects.push(fn); }
  },
};
function loader(modules = {}) {
  const cache = new Map();
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative).exports;
    const module = { exports: {} }; cache.set(relative, module);
    const code = ts.transpileModule(fs.readFileSync(path.join(root, relative), "utf8"), {
      fileName: relative,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, URL, URLSearchParams, console,
      require(id) {
        if (id in modules) return modules[id];
        if (id.startsWith("@/")) return load(`${id.slice(2)}.ts`);
        throw new Error(`Unexpected test dependency: ${id}`);
      },
    }, { filename: relative });
    return module.exports;
  }
  return load;
}
function runner(component) {
  return { hooks: [], cursor: 0, effects: [], tree: null,
    render() { active = this; this.cursor = 0; this.tree = component(); active = null; for (const f of this.effects.splice(0)) f(); return this.tree; },
  };
}
function wizard() {
  const calls = [], redirects = [];
  class ApiError extends Error { constructor(message, status, kind) { super(message); this.status = status; this.kind = kind; } }
  const modules = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/navigation": { useSearchParams: () => new URLSearchParams({ target: "myrecon.xyz" }), useRouter: () => ({ push: (url) => redirects.push(url) }) },
    "next/link": { default: marker("Link") },
    "lucide-react": { Check: marker("Check"), Copy: marker("Copy"), Loader2: marker("Loader2"), ShieldCheck: marker("ShieldCheck") },
    "@/components/mypentest/app/auth": { useAuth: () => ({ status: "signed-in", user: { email: "fixture@example.test", emailVerified: true } }) },
    "@/components/mypentest/app/upgrade": { useUpgrade: () => ({ open: async () => false }) },
    "@/components/mypentest/app/ui": { Notice: marker("Notice"), Panel: marker("Panel"), inputClass: "input", buttonClass: { primary: "primary", secondary: "secondary", small: "small" } },
    "@/components/mypentest/app/test-accounts": { TestAccounts: marker("TestAccounts") },
    "@/lib/mypentest/api": { ApiError, scanQuota: () => null, api: {
      state: async () => ({ dns_verification: true }),
      claimDomain: async (body) => { calls.push({ kind: "claim", body }); return { authorization: { id: "verified-fixture", asset: body.asset, status: "valid", tier_ceiling: body.tier }, challenge: {} }; },
      startScan: async (body) => { calls.push({ kind: "start", body }); return { scan_id: "fixture-scan" }; },
    } },
  };
  const NewAssessment = loader(modules)("components/mypentest/app/new-assessment.tsx").NewAssessment;
  const view = runner(NewAssessment); view.render();
  return { view, calls, redirects,
    checkbox: (label) => nodes(view.tree).find((n) => n.props.label === label),
    accounts: () => nodes(view.tree).find((n) => n.type.displayName === "TestAccounts"),
    claim: async () => { await nodes(view.tree).find((n) => n.type === "form").props.onSubmit({ preventDefault() {} }); view.render(); },
    start: async () => { await nodes(view.tree).find((n) => n.type === "button" && text(n).trim() === "Start assessment").props.onClick(); view.render(); },
  };
}
const load = loader();
const { buildTestAccounts } = load("lib/mypentest/test-accounts.ts");
const account = () => ({ username: "", password: "", owns: "", session: "", sessionKind: "bearer" });
const form = () => ({ mode: "session", host: "myrecon.xyz", loginUrl: "", encoding: "form", userField: "email", passField: "password", tokenPath: "", a: account(), b: account(), raw: "" });
function accountChecks() {
  const empty = form(); assert.equal(buildTestAccounts(empty).identities, null);
  const session = form(); session.a.session = "Bearer fixture-firebase-id-token"; session.a.owns = "https://myrecon.xyz/api/test-record";
  let built = plain(buildTestAccounts(session));
  assert.equal(built.error, null);
  assert.deepEqual(built.identities.identities[1], { id: "account-a", role: "user", host: "myrecon.xyz", header: { Authorization: "Bearer fixture-firebase-id-token" }, owns: [session.a.owns] });
  assert.equal(built.identities.identities.length, 2, "one session plus anonymous is valid; no password required");
  session.b.session = "test-session=fixture-cookie"; session.b.sessionKind = "cookie";
  assert.equal(plain(buildTestAccounts(session)).identities.identities[2].cookie, session.b.session);
  assert.ok(buildTestAccounts({ ...session, host: "https://myrecon.xyz/" }).error, "session host must be exact");
  assert.ok(buildTestAccounts({ ...session, a: { ...session.a, session: "bad\nheader" } }).error);
  assert.ok(buildTestAccounts({ ...session, b: { ...session.b, session: "", owns: "https://myrecon.xyz/b" } }).error, "partially entered account cannot disappear silently");
  const login = form(); login.mode = "login"; login.loginUrl = "https://myrecon.xyz/login"; login.a.username = "fixture-user"; login.a.password = "fixture-password";
  built = plain(buildTestAccounts(login)); assert.equal(built.error, null); assert.ok(built.identities.identities[1].login);
  assert.equal(built.identities.identities[1].header, undefined, "login mode cannot reuse hidden session values");
  login.b.username = "unfinished"; assert.ok(buildTestAccounts(login).error);
  const json = form(); json.mode = "json"; json.raw = '{"identities": []}'; assert.ok(buildTestAccounts(json).error);
}
const { reportPresentation } = load("lib/mypentest/report-presentation.ts");
function reportChecks() {
  const pub = { fingerprint: "public", rule_id: "secret.google-api-key", confidence: "informational", severity: "info", evidence: [{ kind: "public-credential", summary: "Firebase client config" }] };
  const secret = { fingerprint: "private", rule_id: "secret.stripe-secret-key", confidence: "confirmed", severity: "high", evidence: [{ kind: "secret", summary: "Secret credential" }] };
  const chain = { id: "chain.live-credential", links: ["public"], title: "Provider account abuse", narrative: "Public key permits billable misuse.", first_step: "Rotate the key" };
  const fixture = { asset: "myrecon.xyz", clusters: [], findings: [pub], attack_chains: [chain], counts: { critical: 0, high: 0, medium: 1, low: 0, info: 1 }, engine_build: { version: "0.2.0", commit: "fixture-original" },
    brief: { executive_summary: "myrecon.xyz has no critical or high-severity issues; the findings are hardening work, and 1 of the findings connect into attack path worth treating together.", attack_narrative: chain.narrative, action_plan: [{ about: chain.title, action: chain.first_step }, { about: "HSTS", action: "Enable HSTS" }], prioritized_actions: [chain.first_step, "Enable HSTS"] } };
  const original = JSON.stringify(fixture), projected = reportPresentation(fixture);
  assert.equal(projected.removedPublicCredentialPaths, 1);
  assert.equal(projected.report.attack_chains.length, 0);
  assert.equal(projected.report.brief.attack_narrative, undefined);
  assert.equal(projected.report.brief.action_plan.length, 1);
  assert.deepEqual(plain(projected.report.brief.prioritized_actions), ["Enable HSTS"]);
  assert.ok(!projected.report.brief.executive_summary.includes("attack path"));
  assert.ok(projected.report.brief.executive_summary.includes("observed in completed checks"));
  assert.equal(JSON.stringify(fixture), original, "projection never mutates assessment source");
  assert.equal(projected.report.engine_build, fixture.engine_build);
  assert.equal(projected.report.counts, fixture.counts);
  const mixed = { ...fixture, findings: [pub, secret], attack_chains: [{ ...chain, links: ["public", "private"] }] };
  assert.equal(reportPresentation(mixed).removedPublicCredentialPaths, 0, "real secret in chain must preserve it");
  const unknown = { ...fixture, attack_chains: [{ ...chain, links: ["missing"] }] };
  assert.equal(reportPresentation(unknown).removedPublicCredentialPaths, 0, "unresolved links cannot prove public-only");
  const privateOnly = { ...fixture, findings: [secret], attack_chains: [{ ...chain, links: ["private"] }] };
  assert.equal(reportPresentation(privateOnly).removedPublicCredentialPaths, 0);
  const legacyServiceRole = { ...secret, rule_id: "secret.supabase-service-role", severity: "critical", evidence: [{ kind: "public-credential", summary: "Legacy evidence kind" }] };
  assert.equal(reportPresentation({ ...privateOnly, findings: [legacyServiceRole] }).removedPublicCredentialPaths, 0, "legacy service-role secret keeps its chain despite misleading evidence kind");
  assert.equal(reportPresentation({ ...privateOnly, findings: [{ ...legacyServiceRole, confidence: "informational" }] }).removedPublicCredentialPaths, 0, "service-role key is never public client configuration");
  const other = { id: "chain.other", title: "Other path", narrative: "Other supported inference", links: ["other"], first_step: "Fix other" };
  const two = { ...fixture, attack_chains: [chain, other], brief: { ...fixture.brief, executive_summary: fixture.brief.executive_summary.replace("1 of", "2 of").replace("attack path worth", "attack paths worth") } };
  const remaining = reportPresentation(two).report;
  assert.equal(remaining.attack_chains.length, 1);
  assert.ok(remaining.brief.executive_summary.includes("1 of the findings connect into attack path"));
  assert.equal(remaining.brief.attack_narrative, other.narrative);
  const custom = { ...fixture, brief: { ...fixture.brief, attack_narrative: "Custom analysis of a different finding" } };
  assert.equal(reportPresentation(custom).report.brief.attack_narrative, custom.brief.attack_narrative);
  const ReportView = loader({
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "lucide-react": { AlertTriangle: marker("AlertTriangle"), CheckCircle2: marker("CheckCircle2") },
    "@/components/mypentest/severity": { SeverityBar: marker("SeverityBar"), SeverityCounts: marker("SeverityCounts"), SeverityPill: marker("SeverityPill") },
  })("components/mypentest/report/report-view.tsx").ReportView;
  const rendered = { ...fixture, scan_id: "fixture", started_at: "2026-10-09T00:00:00Z", duration_seconds: 0, requests_sent: 0, plugins_run: [], unchecked: [], limitations: [] };
  const copy = text(ReportView({ report: rendered }));
  assert.ok(copy.includes("Presentation corrected"));
  assert.ok(!copy.includes(chain.narrative));
  assert.ok(copy.includes("observed in completed checks"));
  const withheld = text(ReportView({ report: { ...rendered, withheld: { high: 1 } } }));
  assert.ok(withheld.includes("Higher-severity findings are counted but not detailed by this plan"));
}
async function wizardChecks() {
  const passive = wizard(); await passive.claim(); await passive.start();
  assert.equal(passive.calls[0].body.tier, "passive");
  assert.equal(passive.calls[1].body.identities, undefined);
  const active = wizard();
  active.checkbox("Safe active checks (no target login needed)").props.onChange(true); active.view.render(); await active.claim();
  assert.equal(active.calls[0].body.tier, "active-safe");
  assert.equal(active.accounts(), undefined, "test logins are an independent optional setting");
  await active.start(); assert.equal(active.calls[1].body.identities, undefined);
  assert.equal(active.redirects.length, 1, "anonymous safe active assessment starts normally");
  const auth = wizard(); auth.checkbox("Safe active checks (no target login needed)").props.onChange(true); auth.view.render(); await auth.claim();
  auth.checkbox("Add authenticated testing (optional)").props.onChange(true); auth.view.render(); await auth.start();
  assert.equal(auth.calls.filter((c) => c.kind === "start").length, 0, "selected authenticated testing cannot silently run anonymously");
  const identityFixture = { identities: [{ id: "fixture", host: "myrecon.xyz", header: { Authorization: "Bearer fixture-session" } }] };
  auth.accounts().props.onChange({ identities: identityFixture, error: null }); auth.view.render(); await auth.start();
  assert.deepEqual(plain(auth.calls.find((c) => c.kind === "start").body.identities), identityFixture);
  auth.checkbox("Add authenticated testing (optional)").props.onChange(false); auth.view.render(); await auth.start();
  assert.equal(auth.calls.filter((c) => c.kind === "start").at(-1).body.identities, undefined, "turning it off excludes remembered credentials");
  auth.checkbox("Add authenticated testing (optional)").props.onChange(true); auth.view.render(); await auth.start();
  assert.equal(auth.calls.filter((c) => c.kind === "start").length, 2, "turning it back on cannot submit stale credentials");
}
async function main() {
  accountChecks(); reportChecks(); await wizardChecks();
  console.log("PASS: anonymous active-safe setup, optional auth gating, Firebase/cookie session payloads, partial-account validation, public-only legacy correction, mixed-secret controls, and immutable original reports.");
  const index = process.argv.indexOf("--report");
  if (index >= 0) {
    const source = JSON.parse(fs.readFileSync(process.argv[index + 1], "utf8"));
    const before = JSON.stringify(source), projected = reportPresentation(source);
    assert.equal(JSON.stringify(source), before);
    assert.deepEqual(projected.report.counts, source.counts);
    assert.deepEqual(projected.report.findings, source.findings);
    assert.deepEqual(projected.report.engine_build, source.engine_build);
    console.log(JSON.stringify({ historical_report: {
      finding_groups: source.clusters.length,
      paths_before: source.attack_chains.length,
      paths_after: projected.report.attack_chains.length,
      public_credential_paths_removed: projected.removedPublicCredentialPaths,
      narrative_changed: source.brief?.attack_narrative !== projected.report.brief?.attack_narrative,
      unsupported_summary_chain_claim_removed: !projected.report.brief?.executive_summary?.includes("attack path"),
      actions_before: source.brief?.action_plan?.length ?? 0,
      actions_after: projected.report.brief?.action_plan?.length ?? 0,
      original_data_and_build_preserved: true,
    } }));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

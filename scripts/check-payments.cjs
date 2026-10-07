/* Payment regression checks with mocked browser/provider boundaries.
 * Run: node scripts/check-payments.cjs
 * No Firebase account, provider credentials, or real payment is used.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
let active;

function same(a, b) { return a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i])); }
const react = {
  useState(initial) {
    const runner = active, index = runner.cursor++;
    runner.hooks[index] ??= { value: typeof initial === "function" ? initial() : initial };
    return [runner.hooks[index].value, (value) => {
      runner.hooks[index].value = typeof value === "function" ? value(runner.hooks[index].value) : value;
    }];
  },
  useRef(value) {
    const index = active.cursor++;
    active.hooks[index] ??= { current: value };
    return active.hooks[index];
  },
  useCallback(fn, deps) {
    const index = active.cursor++;
    if (!same(active.hooks[index]?.deps, deps)) active.hooks[index] = { deps, fn };
    return active.hooks[index].fn;
  },
  useEffect(fn, deps) {
    const index = active.cursor++;
    if (!same(active.hooks[index]?.deps, deps)) {
      active.hooks[index]?.cleanup?.();
      active.hooks[index] = { deps };
      const runner = active;
      runner.effects.push(() => { runner.hooks[index].cleanup = fn(); });
    }
  },
};
const jsx = (type, props, key) => ({ type, props: props ?? {}, key });
const marker = (name) => Object.assign(() => {}, { displayName: name });
const nodes = (tree) => {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
};
const copy = (tree) => {
  if (Array.isArray(tree)) return tree.map(copy).join(" ");
  if (tree && typeof tree === "object") return copy(tree.props?.children);
  return tree == null || tree === false ? "" : String(tree);
};
const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(setImmediate); };

function runner(component, props) {
  return {
    hooks: [], effects: [], cursor: 0,
    render() {
      active = this;
      this.cursor = 0;
      this.tree = component(props);
      active = null;
      for (const node of nodes(this.tree)) if (node.props?.ref) node.props.ref.current = {};
      for (const effect of this.effects.splice(0)) effect();
      return this.tree;
    },
    dispose() { for (const hook of this.hooks) hook?.cleanup?.(); },
  };
}

function fixture({ uid = "alice", providers = true, paypalEnabled = true, payment = null, storage = new Map() } = {}) {
  const calls = [];
  let captureStatus = 200;
  let captureResponder = null;
  let owner = uid;
  const window = { confirm: () => true };
  const modules = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/navigation": { useSearchParams: () => new URLSearchParams(payment ? { payment } : {}) },
    "lucide-react": { CreditCard: marker("icon"), Loader2: marker("loader") },
    "@/lib/firebase-auth": { firebaseConfig: { databaseURL: "https://fixture.invalid" }, idToken: async () => `test-${owner}` },
    "@/lib/mypentest": { routes: { api: "/mypentest/api", consultation: "/contact" } },
    "@/lib/mypentest/checkout": { openCheckout: async () => ({ kind: "dismissed", lastError: null }) },
    "@/components/mypentest/plan-cards": { PlanCard: marker("PlanCard"), EnterpriseCard: marker("EnterpriseCard") },
    "@/components/mypentest/app/ui": { Notice: marker("Notice"), Panel: marker("Panel"), Spinner: marker("Spinner"), buttonClass: { primary: "primary", secondary: "secondary" } },
    "@/components/mypentest/app/upgrade": { OfferTimer: marker("OfferTimer") },
    "@/components/mypentest/app/paypal-checkout": { PayPalCheckout: marker("PayPalCheckout") },
    "@/components/mypentest/app/auth": { useAuth: () => ({ status: "signed-in", user: { uid: owner } }) },
    "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
  };
  const state = {
    enabled: true, test_mode: false, current: { name: "free", title: "Free", price: 0 },
    subscription: null, plans: [], offer: { percent: 25, expires_at: "2030-01-01", seconds_left: 100 },
    ...(providers ? { providers: {
      razorpay: { enabled: true, test_mode: false },
      paypal: { enabled: paypalEnabled, test_mode: true, client_id: "public-fixture-client", currency: "USD", prices: { plus: 799 } },
    } } : {}),
  };
  const sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  const context = { console, URL, URLSearchParams, Promise, Error, Date, JSON, window, sessionStorage, setTimeout: (fn) => setTimeout(fn, 0), clearTimeout,
    fetch: async (url, options) => {
      const body = options.body ? JSON.parse(options.body) : null;
      calls.push({ url, body, authorization: options.headers.Authorization });
      if (url.endsWith("capture-order") && captureResponder) return captureResponder();
      const status = url.endsWith("capture-order") ? captureStatus : 200;
      const data = url.endsWith("/billing") ? state
        : url.endsWith("create-order") ? { order_id: "FIXTUREORDER12345", amount: 599, list_amount: 799, currency: "USD", plan: { name: "plus", title: "Plus" } }
        : status === 200 ? { ok: true, subscription: { plan: "plus", title: "Plus", scan_pack: true, scan_credits: 2 } }
        : { error: "Confirmation is temporarily unavailable." };
      return { ok: status >= 200 && status < 300, status, json: async () => data };
    },
  };
  function load(relative, name) {
    const code = ts.transpileModule(fs.readFileSync(path.join(root, relative), "utf8"), {
      fileName: relative,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(code, { ...context, module, exports: module.exports, require: (id) => {
      if (!(id in modules)) throw new Error(`Unexpected fixture dependency ${id}`);
      return modules[id];
    } }, { filename: relative });
    if (name) modules[name] = module.exports;
    return module.exports;
  }
  load("lib/mypentest/types.ts", "@/lib/mypentest/types");
  const plans = load("lib/plans.ts", "@/lib/plans");
  const apiModule = load("lib/mypentest/api.ts", "@/lib/mypentest/api");
  const Billing = load("components/mypentest/app/billing.tsx").Billing;
  const view = runner(Billing, { plans: plans.FALLBACK_PLANS.filter((plan) => ["free", "plus"].includes(plan.id)) });
  return {
    calls, storage, state, plans, modules, context, load, view, apiModule,
    setCaptureStatus: (status) => { captureStatus = status; },
    setCaptureResponder: (fn) => { captureResponder = fn; },
    setUid: (value) => { owner = value; },
    find: (name) => nodes(view.tree).find((node) => node.type.displayName === name),
    button: (text) => nodes(view.tree).find((node) => node.type === "button" && copy(node).includes(text)),
    async startInternational() {
      view.render(); await flush(); view.render();
      const method = this.button("International"); assert.ok(method, "international choice is visible");
      method.props.onClick(); view.render();
      return this.find("PayPalCheckout").props;
    },
  };
}

async function main() {
  const legacy = fixture({ providers: false });
  legacy.view.render(); await flush(); legacy.view.render();
  assert.equal(legacy.button("International"), undefined, "old engine keeps domestic checkout available");
  assert.equal(legacy.button("Buy 2 more scans").props.disabled, false);
  const unavailable = fixture({ paypalEnabled: false });
  unavailable.view.render(); await flush(); unavailable.view.render();
  assert.equal(unavailable.button("International"), undefined, "disabled PayPal must be hidden");

  const linked = fixture({ payment: "paypal" });
  linked.view.render(); await flush(); linked.view.render();
  assert.ok(linked.find("PayPalCheckout"), "international pricing link selects PayPal automatically");
  assert.ok(linked.plans.planFeatures(linked.plans.FALLBACK_PLANS.find((plan) => plan.id === "plus")).includes("Priority support for paid users"));
  assert.ok(!linked.plans.planFeatures(linked.plans.FALLBACK_PLANS.find((plan) => plan.id === "free")).includes("Priority support for paid users"));

  const success = fixture();
  const checkout = await success.startInternational();
  const usdCard = nodes(success.view.tree).find((node) => node.type.displayName === "PlanCard" && node.props.plan.id === "plus");
  assert.equal(usdCard.props.plan.currency, "USD"); assert.equal(usdCard.props.plan.price, 799);
  const orderId = await checkout.createOrder();
  assert.deepEqual(success.calls.find((call) => call.url.endsWith("create-order")).body, { plan: "plus", cycle: "monthly" }, "browser cannot submit a price");
  await checkout.onApprove(orderId); success.view.render();
  assert.equal(success.find("Notice").props.tone, "ok");
  assert.deepEqual(success.calls.find((call) => call.url.endsWith("capture-order")).body, { order_id: orderId });
  assert.equal(success.storage.size, 0, "confirmed order clears recovery storage");

  const cancelled = fixture();
  const cancelCheckout = await cancelled.startInternational();
  await cancelCheckout.createOrder(); cancelCheckout.onCancel(); cancelled.view.render();
  assert.equal(cancelled.calls.filter((call) => call.url.endsWith("capture-order")).length, 0, "cancel never captures");
  assert.equal(cancelled.find("Notice").props.title, "PayPal payment cancelled");

  const failure = fixture();
  failure.setCaptureStatus(409);
  const failedCheckout = await failure.startInternational();
  const failedOrder = await failedCheckout.createOrder(); await failedCheckout.onApprove(failedOrder); failure.view.render();
  assert.equal(failure.find("Notice").props.tone, "warn", "approval must not show success when capture confirmation fails");
  assert.equal(failure.find("PayPalCheckout").props.disabled, true, "unconfirmed order blocks a second purchase");
  assert.ok(failure.storage.has("mypentest:pending-paypal-payment:alice"), "recovery is scoped to the owner");
  assert.equal(failure.button("India").props.disabled, true);
  failure.setCaptureStatus(200); failure.button("Retry PayPal confirmation").props.onClick(); await flush(); failure.view.render();
  assert.equal(failure.find("Notice").props.tone, "ok");
  assert.equal(failure.calls.filter((call) => call.url.endsWith("create-order")).length, 1, "recovery never starts another charge");
  assert.deepEqual(failure.calls.filter((call) => call.url.endsWith("capture-order")).map((call) => call.body.order_id), [failedOrder, failedOrder]);

  const pending = new Map([["mypentest:pending-paypal-payment:alice", JSON.stringify({ orderId: "OLDORDER12345", title: "Plus" })]]);
  const other = fixture({ uid: "bob", storage: pending });
  other.view.render(); await flush(); other.view.render();
  assert.equal(other.calls.filter((call) => call.url.endsWith("capture-order")).length, 0, "another user cannot recover or see the owner's order");
  assert.ok(!copy(other.view.tree).includes("OLDORDER12345"));
  const reload = fixture({ storage: pending });
  reload.view.render(); await flush(); reload.view.render();
  assert.deepEqual(reload.calls.filter((call) => call.url.endsWith("capture-order")).map((call) => call.body.order_id), ["OLDORDER12345"]);
  assert.equal(reload.calls.filter((call) => call.url.endsWith("create-order")).length, 0, "reload retries the existing order");
  assert.equal(pending.size, 0);

  const switched = fixture();
  let finishCapture;
  switched.setCaptureResponder(() => new Promise((resolve) => { finishCapture = resolve; }));
  const switchedCheckout = await switched.startInternational();
  const switchedOrder = await switchedCheckout.createOrder();
  const inFlight = switchedCheckout.onApprove(switchedOrder);
  await flush(); switched.setUid("bob"); switched.view.render(); await flush(); switched.view.render();
  finishCapture({ ok: false, status: 502, json: async () => ({ error: "Temporary connection failure" }) });
  await inFlight; switched.view.render();
  assert.equal(switched.calls.filter((call) => call.url.endsWith("capture-order")).length, 1, "changing account stops automatic retries");
  assert.ok(switched.storage.has("mypentest:pending-paypal-payment:alice"), "the original owner can still recover after signing back in");
  assert.equal(switched.find("Notice"), undefined, "late payment results cannot appear to the new user");

  assert.equal(success.plans.discountedPrice(799, 50, "USD"), 400, "USD rounds half cents up");
  assert.equal(success.plans.discountedPrice(799, 25, "USD"), 599);
  assert.equal(success.plans.discountedPrice(100, 80, "USD"), 100, "USD minimum matches the server");
  assert.equal(success.plans.discountedPrice(49900, 25, "INR"), 37400, "INR retains whole-rupee pricing");

  const sdk = fixture();
  let options, script, approved = 0, closed = 0, disabled = 0, rejected = 0;
  sdk.context.document = {
    createElement: () => ({ dataset: {}, remove() {} }),
    body: { appendChild(value) {
      script = value;
      sdk.context.window.MyPentestPayPal = {
        FUNDING: { PAYPAL: "paypal" },
        Buttons(opts) {
          options = opts;
          return { isEligible: () => true, render: async () => { opts.onInit(null, { enable() {}, disable() { disabled++; } }); }, close: async () => { closed++; } };
        },
      };
      script.onload();
    } },
  };
  const SDKCheckout = sdk.load("components/mypentest/app/paypal-checkout.tsx").PayPalCheckout;
  const sdkView = runner(SDKCheckout, {
    clientId: "public-fixture-client", disabled: true, canStart: () => true,
    createOrder: async () => "SDKORDER", onApprove: async () => { approved++; }, onCancel() {}, onError() {},
  });
  sdkView.render(); await flush();
  const url = new URL(script.src);
  assert.equal(url.origin + url.pathname, "https://www.paypal.com/sdk/js");
  assert.equal(url.searchParams.get("currency"), "USD"); assert.equal(url.searchParams.get("intent"), "capture");
  assert.equal(script.dataset.namespace, "MyPentestPayPal"); assert.equal(options.fundingSource, "paypal");
  assert.equal(disabled, 1); options.onClick(null, { resolve() { throw new Error("disabled checkout started"); }, reject() { rejected++; } });
  assert.equal(rejected, 1);
  await options.onApprove({ orderID: "SDKORDER" }); assert.equal(approved, 1);
  sdkView.dispose(); await options.onApprove({ orderID: "SDKORDER" }); assert.equal(approved, 1, "disposed checkout cannot act for a different user");
  assert.equal(closed, 1);

  const broken = fixture();
  let sdkAttempts = 0;
  broken.context.document = {
    createElement: () => ({ dataset: {}, remove() {} }),
    body: { appendChild(value) {
      sdkAttempts++;
      if (sdkAttempts === 1) { value.onerror(); return; }
      broken.context.window.MyPentestPayPal = {
        FUNDING: { PAYPAL: "paypal" },
        Buttons: () => ({ isEligible: () => true, render: async () => {}, close: async () => {} }),
      };
      value.onload();
    } },
  };
  const BrokenCheckout = broken.load("components/mypentest/app/paypal-checkout.tsx").PayPalCheckout;
  const brokenView = runner(BrokenCheckout, {
    clientId: "public-fixture-client", disabled: false, canStart: () => true,
    createOrder: async () => "ORDER", onApprove: async () => {}, onCancel() {}, onError() {},
  });
  brokenView.render(); await flush(); brokenView.render();
  const retrySdk = nodes(brokenView.tree).find((node) => node.type === "button" && copy(node) === "Retry PayPal");
  assert.ok(retrySdk, "failed SDK download offers a retry"); retrySdk.props.onClick(); brokenView.render(); await flush(); brokenView.render();
  assert.equal(sdkAttempts, 2, "SDK load failure clears the failed loading promise");
  assert.equal(nodes(brokenView.tree).some((node) => node.props?.role === "alert"), false);
  brokenView.dispose();
  console.log("PASS: provider gating, server-priced USD checkout, cancellation, same-order recovery, reload recovery, account isolation, currency rounding, and SDK lifecycle.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

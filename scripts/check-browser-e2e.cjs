"use strict";

const assert = require("node:assert/strict");
const { execFileSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SCANNER_DIR = path.resolve(ROOT, "..", "pentesting tool + Ai", "services", "scanner");
const EXAMPLE_REPORT_PATH = path.join(ROOT, "lib", "mypentest", "example-report.json");

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("Could not find Chrome or Edge binary.");
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForHttp(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return res;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function waitForFile(filePath, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.size > 0) return fs.readFileSync(filePath, "utf8");
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Timed out waiting for downloaded file ${filePath}`);
}

function startPythonEngine(reportJsonPath, certPath, keyPath) {
  return new Promise((resolve, reject) => {
    const pyScript = `
import ipaddress, json, sys, threading
from datetime import datetime, timedelta, timezone
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
from werkzeug.serving import make_server

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "127.0.0.1")])
now = datetime.now(timezone.utc)
cert = (
    x509.CertificateBuilder()
    .subject_name(subject)
    .issuer_name(issuer)
    .public_key(private_key.public_key())
    .serial_number(x509.random_serial_number())
    .not_valid_before(now - timedelta(minutes=5))
    .not_valid_after(now + timedelta(days=1))
    .add_extension(x509.SubjectAlternativeName([x509.IPAddress(ipaddress.IPv4Address("127.0.0.1"))]), critical=False)
    .sign(private_key, hashes.SHA256())
)
with open(${JSON.stringify(keyPath)}, "wb") as fh:
    fh.write(private_key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.TraditionalOpenSSL, serialization.NoEncryption()))
with open(${JSON.stringify(certPath)}, "wb") as fh:
    fh.write(cert.public_bytes(serialization.Encoding.PEM))

sys.path.insert(0, "tests")
import firebase_test_keys as keys
from fake_database import FakeRealtimeDatabase
from scanner.findings import Confidence, Evidence, Finding, Pass, Unchecked
from scanner.netguard import Settings
from scanner.runner import ScanReport
from scanner.web import Store, create_hosted_app
from scanner.web import app as app_module
from scanner.web.database import LiveProgress, RealtimeDatabase
from scanner.web.firebase_auth import FirebaseTokenVerifier
from scanner.web.hosted import HostedConfig
from scanner.web.store import ScanState

fake = FakeRealtimeDatabase(history_rule=True)
db = RealtimeDatabase(
    "https://mypentest-test-default-rtdb.firebaseio.com",
    tokens=lambda: "test-token",
    send=fake,
)
store = Store()
verifier = FirebaseTokenVerifier("mypentest-bugsnaps", keys=keys.keys())
config = HostedConfig(
    firebase_project_id="mypentest-bugsnaps",
    challenge_secret=b"e2e-browser-secret-" * 3,
)
settings = Settings.from_env({"SCAN_ENV": "production"})

job = store.new_scan("shop.example.com", ("https://shop.example.com",), owner="user:alice")
scan_id = job.id
finished_at = datetime.now(timezone.utc)
started_at = finished_at - timedelta(minutes=2)
report = ScanReport(
    scan_id=scan_id,
    authorization_id="auth-e2e-1",
    asset="shop.example.com",
    started_at=started_at,
    finished_at=finished_at,
    findings=[
        Finding(
            rule_id="xss-reflected",
            title="Reflected cross-site scripting on search",
            location="https://shop.example.com/search?q=probe",
            asset="shop.example.com",
            confidence=Confidence.CONFIRMED,
            description="User input from query parameter q is echoed without output encoding.",
            impact="Attackers can run JavaScript in a visitor session.",
            remediation="HTML-encode untrusted values in the template and add a strict Content-Security-Policy.",
            cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
            evidence=(Evidence(kind="http", summary="Reflected payload echoed in HTML body", detail="<script>alert(1)</script>"),),
            cwe=79,
            owasp="A03:2021",
        ),
        Finding(
            rule_id="headers-csp",
            title="Missing Content-Security-Policy header",
            location="https://shop.example.com/",
            asset="shop.example.com",
            confidence=Confidence.CONFIRMED,
            description="Responses omit Content-Security-Policy.",
            impact="Reduces defense in depth against script injection.",
            remediation="Serve a strict Content-Security-Policy response header.",
            cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N",
            cwe=693,
            owasp="A05:2021",
        ),
    ],
    passes=[
        Pass(rule_id="tls-cert", title="Valid TLS certificate", location="https://shop.example.com/", detail="Chain verified."),
    ],
    unchecked=[
        Unchecked(rule_id="auth-flows", title="Authenticated admin routes", location="https://shop.example.com/admin", reason="No credentials provided."),
    ],
    plugins_run=["headers", "xss"],
    requests_sent=42,
    notes=["Completed passive + safe active checks on shop.example.com."],
)
store.update(
    scan_id,
    state=ScanState.DONE,
    phase="finished",
    progress="Finished",
    finished_at=finished_at,
    report=report,
    saved=False,
    history=False,
    discovery={
        "pages_fetched": 12,
        "endpoint_count": 30,
        "targets_added": 2,
        "stopped_early": False,
        "attack_surface": {"forms": 2},
    },
)
flask_app = create_hosted_app(config, verifier=verifier, store=store, settings=settings, database=db)
app_module._save_finished(store, scan_id, report, finished_at, db, None, history=False)

def wrapped_app(environ, start_response):
    if environ.get("PATH_INFO") == "/__e2e__/db":
        body = json.dumps({"tree": fake.tree, "requests": fake.requests}).encode("utf-8")
        start_response("200 OK", [("Content-Type", "application/json"), ("Content-Length", str(len(body)))])
        return [body]
    return flask_app(environ, start_response)

server = make_server("127.0.0.1", 0, wrapped_app, threaded=True)
token = keys.token(
    "alice",
    iss="https://securetoken.google.com/mypentest-bugsnaps",
    aud="mypentest-bugsnaps",
)
print(json.dumps({"port": server.server_port, "token": token, "scanId": scan_id}), flush=True)
server.serve_forever()
`;
    const child = spawn("python", ["-u", "-"], {
      cwd: SCANNER_DIR,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    let settled = false;
    child.stdout.on("data", (chunk) => {
      out += chunk.toString("utf8");
      const line = out.split(/\r?\n/).find((l) => l.trim().startsWith("{"));
      if (line && !settled) {
        settled = true;
        try {
          const parsed = JSON.parse(line);
          resolve({ child, port: parsed.port, token: parsed.token, scanId: parsed.scanId });
        } catch (e) {
          reject(e);
        }
      }
    });
    child.stderr.on("data", (chunk) => {
      err += chunk.toString("utf8");
    });
    child.on("exit", (code) => {
      if (!settled) {
        settled = true;
        reject(new Error(`Python engine exited early (${code}): ${err || out}`));
      }
    });
    child.stdin.write(pyScript);
    child.stdin.end();
  });
}

function startHttpsBridge(targetPort, certPath, keyPath) {
  return new Promise((resolve, reject) => {
    const server = https.createServer(
      {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      },
      (req, res) => {
        const proxyReq = http.request(
          {
            hostname: "127.0.0.1",
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: { ...req.headers, host: `127.0.0.1:${targetPort}` },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res);
          },
        );
        proxyReq.on("error", (err) => {
          res.writeHead(502);
          res.end(String(err));
        });
        req.pipe(proxyReq);
      },
    );
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

function startNextServer(nextPort, engineUrl) {
  const nextCli = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextCli, "start", "-H", "127.0.0.1", "-p", String(nextPort)], {
    cwd: ROOT,
    env: {
      ...process.env,
      MYPENTEST_ENGINE_URL: engineUrl,
      NODE_TLS_REJECT_UNAUTHORIZED: "0",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", (c) => (logs += c.toString("utf8")));
  child.stderr.on("data", (c) => (logs += c.toString("utf8")));
  return { child, getLogs: () => logs };
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id) {
        const entry = this.pending.get(msg.id);
        if (!entry) return;
        this.pending.delete(msg.id);
        if (msg.error) entry.reject(new Error(`${entry.method}: ${msg.error.message}`));
        else entry.resolve(msg.result);
      } else if (msg.method) {
        const list = this.listeners.get(msg.method);
        if (list) for (const fn of list) fn(msg.params);
      }
    });
  }

  on(method, fn) {
    const list = this.listeners.get(method) || [];
    list.push(fn);
    this.listeners.set(method, list);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        `Browser eval exception: ${result.exceptionDetails.text || JSON.stringify(result.exceptionDetails)}`,
      );
    }
    return result.result ? result.result.value : undefined;
  }

  async waitFor(fnExpr, timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const ok = await this.eval(`Boolean(${fnExpr})`);
      if (ok) return;
      await new Promise((r) => setTimeout(r, 120));
    }
    const text = await this.eval("document.body ? document.body.innerText.slice(0, 1200) : ''");
    throw new Error(`Timed out waiting for (${fnExpr}). Body preview:\n${text}`);
  }

  async goto(url) {
    const loaded = new Promise((resolve) => {
      const onLoad = () => {
        const list = this.listeners.get("Page.loadEventFired") || [];
        const idx = list.indexOf(onLoad);
        if (idx >= 0) list.splice(idx, 1);
        resolve();
      };
      this.on("Page.loadEventFired", onLoad);
    });
    await this.send("Page.navigate", { url });
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 8000))]);
    await new Promise((r) => setTimeout(r, 350));
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  if (!fs.existsSync(SCANNER_DIR)) {
    throw new Error(`Scanner workspace not found at ${SCANNER_DIR}`);
  }
  const browserBin = findBrowser();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bugsnap-e2e-"));
  const certPath = path.join(tempDir, "cert.pem");
  const keyPath = path.join(tempDir, "key.pem");
  const profileDir = path.join(tempDir, "chrome-profile");
  const downloadDir = path.join(tempDir, "downloads");
  fs.mkdirSync(profileDir, { recursive: true });
  fs.mkdirSync(downloadDir, { recursive: true });

  let pyEngine = null;
  let bridge = null;
  let nextServer = null;
  let chrome = null;
  let cdp = null;

  try {
    console.log("1. Starting Python engine with FakeRealtimeDatabase...");
    pyEngine = await startPythonEngine(EXAMPLE_REPORT_PATH, certPath, keyPath);

    bridge = await startHttpsBridge(pyEngine.port, certPath, keyPath);
    const nextPort = await getFreePort();
    const baseUrl = `http://127.0.0.1:${nextPort}`;
    console.log(`2. Starting Next.js production server at ${baseUrl} -> https://127.0.0.1:${bridge.port}...`);
    nextServer = startNextServer(nextPort, `https://127.0.0.1:${bridge.port}`);
    await waitForHttp(`${baseUrl}/`, 45000);

    console.log("3. Verifying SEO & rendered public routes...");
    execFileSync(process.execPath, [path.join(__dirname, "check-seo.cjs"), "--base", baseUrl], {
      cwd: ROOT,
      stdio: "inherit",
    });

    console.log(`4. Launching headless browser (${path.basename(browserBin)})...`);
    chrome = spawn(browserBin, [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--disable-background-networking",
      "about:blank",
    ], { stdio: ["ignore", "pipe", "pipe"] });

    let chromeStderr = "";
    const debugPort = await new Promise((resolve, reject) => {
      const deadline = setTimeout(() => reject(new Error(`Chrome DevTools failed to start: ${chromeStderr}`)), 20000);
      chrome.stderr.on("data", (chunk) => {
        chromeStderr += chunk.toString("utf8");
        const match = chromeStderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
        if (match) {
          clearTimeout(deadline);
          resolve(Number(match[1]));
        }
      });
      chrome.on("exit", (code) => {
        clearTimeout(deadline);
        reject(new Error(`Chrome exited early (${code}): ${chromeStderr}`));
      });
    });

    const targetsRes = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === "page") || targets[0];
    assert(pageTarget && pageTarget.webSocketDebuggerUrl, "Expected a Chrome page target");

    cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");
    await cdp.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: downloadDir });

    const requests = [];
    const webSockets = [];
    const consoleErrors = [];
    const pageErrors = [];

    cdp.on("Network.requestWillBeSent", (params) => {
      requests.push(params.request.url);
    });
    cdp.on("Network.webSocketCreated", (params) => {
      webSockets.push(params.url);
    });
    cdp.on("Runtime.consoleAPICalled", (params) => {
      if (params.type === "error") {
        const text = (params.args || []).map((a) => a.value || a.description || "").join(" ");
        consoleErrors.push(text);
      }
    });
    cdp.on("Runtime.exceptionThrown", (params) => {
      pageErrors.push(params.exceptionDetails.text || JSON.stringify(params.exceptionDetails));
    });

    await cdp.send("Fetch.enable", {
      patterns: [
        { urlPattern: "https://identitytoolkit.googleapis.com/*" },
        { urlPattern: "https://securetoken.googleapis.com/*" },
        { urlPattern: "https://*.firebaseapp.com/*" },
        { urlPattern: "https://*.firebasedatabase.app/*" },
        { urlPattern: "https://*.firebaseio.com/*" },
      ],
    });

    const jsonFulfill = (requestId, obj) =>
      cdp.send("Fetch.fulfillRequest", {
        requestId,
        responseCode: 200,
        responseHeaders: [
          { name: "Content-Type", value: "application/json" },
          { name: "Access-Control-Allow-Origin", value: "*" },
        ],
        body: Buffer.from(JSON.stringify(obj)).toString("base64"),
      });

    cdp.on("Fetch.requestPaused", async (params) => {
      const url = params.request.url;
      try {
        if (params.request.method === "OPTIONS") {
          await cdp.send("Fetch.fulfillRequest", {
            requestId: params.requestId,
            responseCode: 204,
            responseHeaders: [
              { name: "Access-Control-Allow-Origin", value: "*" },
              { name: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
              { name: "Access-Control-Allow-Headers", value: "*" },
            ],
            body: "",
          });
          return;
        }
        if (url.includes("accounts:signInWithPassword")) {
          await jsonFulfill(params.requestId, {
            kind: "identitytoolkit#VerifyPasswordResponse",
            localId: "alice",
            email: "alice@example.com",
            displayName: "Alice",
            idToken: pyEngine.token,
            registered: true,
            refreshToken: "mock-refresh-alice",
            expiresIn: "3600",
          });
          return;
        }
        if (url.includes("accounts:lookup")) {
          await jsonFulfill(params.requestId, {
            kind: "identitytoolkit#GetAccountInfoResponse",
            users: [
              {
                localId: "alice",
                email: "alice@example.com",
                displayName: "Alice",
                emailVerified: true,
                providerUserInfo: [
                  {
                    providerId: "password",
                    displayName: "Alice",
                    federatedId: "alice@example.com",
                    email: "alice@example.com",
                    rawId: "alice@example.com",
                  },
                ],
                validSince: "1700000000",
                lastLoginAt: "1700000000000",
                createdAt: "1700000000000",
              },
            ],
          });
          return;
        }
        if (url.includes("securetoken.googleapis.com/v1/token")) {
          await jsonFulfill(params.requestId, {
            access_token: pyEngine.token,
            expires_in: "3600",
            token_type: "Bearer",
            refresh_token: "mock-refresh-alice",
            id_token: pyEngine.token,
            user_id: "alice",
            project_id: "mypentest-bugsnaps",
          });
          return;
        }
        if (url.includes(".firebaseapp.com/__/auth/")) {
          await cdp.send("Fetch.fulfillRequest", {
            requestId: params.requestId,
            responseCode: 200,
            responseHeaders: [{ name: "Content-Type", value: "text/html" }],
            body: Buffer.from("<!doctype html><html><body></body></html>").toString("base64"),
          });
          return;
        }
        if (url.includes("identitytoolkit.googleapis.com")) {
          await jsonFulfill(params.requestId, {});
          return;
        }
        if (url.includes("firebasedatabase.app") || url.includes("firebaseio.com")) {
          await jsonFulfill(params.requestId, null);
          return;
        }
        await cdp.send("Fetch.continueRequest", { requestId: params.requestId });
      } catch {
        // ignore if socket closed during teardown
      }
    });

    console.log("5. Checking rendered public marketing/policy pages in real Chrome...");
    const publicChecks = [
      {
        route: "/",
        mustInclude: ["MyPentest"],
        mustExclude: ["Reports stay under your account", "every tier up to a year of history"],
      },
      {
        route: "/mypentest",
        mustInclude: ["Download your report right on the website", "never stored in Firebase"],
        mustExclude: ["every tier up to a year of history", "reports are stored safely"],
      },
      {
        route: "/pricing",
        mustInclude: ["report downloads"],
        mustExclude: ["every tier up to a year of history", "12 months"],
      },
      {
        route: "/products",
        mustInclude: ["MyPentest"],
        mustExclude: ["Reports stay under your account", "stored in Firebase"],
      },
      {
        route: "/improvements",
        mustInclude: ["Direct post-scan report downloads", "without Firebase report storage"],
        mustExclude: ["saved under your account", "paid tiers unlock"],
      },
      {
        route: "/privacy",
        mustInclude: ["New finished assessment reports are not saved in Firebase Realtime Database"],
        mustExclude: ["Reports stay saved in your account"],
      },
      {
        route: "/security",
        mustInclude: ["downloaded directly from the website rather than stored in Firebase"],
        mustExclude: ["stored in your Firebase history"],
      },
      {
        route: "/mypentest/example-report",
        mustInclude: ["Security assessment"],
        mustExclude: [],
      },
    ];

    for (const check of publicChecks) {
      await cdp.goto(`${baseUrl}${check.route}`);
      const visibleText = await cdp.eval("document.body.innerText");
      const text = await cdp.eval("document.body.textContent");
      assert(visibleText && visibleText.length > 100, `Empty body on ${check.route}`);
      for (const phrase of check.mustInclude) {
        assert(
          text.toLowerCase().includes(phrase.toLowerCase()),
          `Expected "${phrase}" in rendered ${check.route}`,
        );
      }
      for (const forbidden of check.mustExclude) {
        assert(
          !text.toLowerCase().includes(forbidden.toLowerCase()),
          `Forbidden stale phrase "${forbidden}" found in rendered ${check.route}`,
        );
      }
    }

    console.log("6. Signing into /mypentest/app and auditing Dashboard network calls...");
    await cdp.goto(`${baseUrl}/mypentest/app`);
    await cdp.waitFor("document.querySelector('input[type=\"email\"]')");

    const preSignInReqIdx = requests.length;
    await cdp.eval(`(() => {
      const setVal = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const email = document.querySelector('input[type="email"]');
      const pass = document.querySelector('input[type="password"]');
      setVal(email, 'alice@example.com');
      setVal(pass, 'Password123!');
      document.querySelector('form button[type="submit"]').click();
    })()`);

    await cdp.waitFor("document.body.innerText.includes('Recent assessments (kept 24 hours for download)')", 20000);
    await cdp.waitFor("document.body.innerText.includes('shop.example.com')", 20000);

    const dashboardText = await cdp.eval("document.body.innerText");
    assert(dashboardText.includes("Reports are not stored in Firebase"), "Dashboard should explain no Firebase storage");
    assert(dashboardText.includes("Open & download"), "Dashboard should offer Open & download");
    assert(dashboardText.includes("Check legacy saved history"), "Dashboard should keep manual legacy history button");

    const dashboardFirebaseReqs = requests
      .slice(preSignInReqIdx)
      .filter((u) => u.includes("firebasedatabase.app") || u.includes("firebaseio.com") || /\/(scans|reports|exports)\b/.test(u) && !u.includes("/mypentest/api/"));
    assert.equal(
      dashboardFirebaseReqs.length,
      0,
      `Dashboard load should NOT touch Firebase RTDB or history branches, got: ${dashboardFirebaseReqs.join(", ")}`,
    );

    console.log("7. Opening finished assessment and downloading JSON / Markdown / HTML / SARIF / Print-PDF...");
    await cdp.eval(`(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const open = links.find((a) => a.textContent && a.textContent.includes('Open & download'));
      if (!open) throw new Error('Open & download link not found');
      open.click();
    })()`);

    await cdp.waitFor("document.body.innerText.includes('Download your report')", 20000);
    await cdp.waitFor("Boolean(document.querySelector('article.pentest-report'))", 20000);

    await cdp.eval("window.__printCalls = 0; window.print = () => { window.__printCalls += 1; };");

    const clickActionBtn = async (label) => {
      const ok = await cdp.eval(`(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find((b) => b.textContent && b.textContent.trim() === ${JSON.stringify(label)});
        if (!btn) return false;
        btn.click();
        return true;
      })()`);
      assert(ok, `Download button "${label}" not found`);
    };

    await clickActionBtn("JSON");
    const downloadedJson = await waitForFile(path.join(downloadDir, `${pyEngine.scanId}.json`));
    const parsedJson = JSON.parse(downloadedJson);
    assert.equal(parsedJson.asset, "shop.example.com");

    await clickActionBtn("Markdown");
    const downloadedMd = await waitForFile(path.join(downloadDir, `${pyEngine.scanId}.md`));
    assert(downloadedMd.includes("shop.example.com"), "Markdown download missing target asset");

    await clickActionBtn("HTML");
    const downloadedHtml = await waitForFile(path.join(downloadDir, `${pyEngine.scanId}.html`));
    assert(/<!doctype html>|<html/i.test(downloadedHtml) && downloadedHtml.includes("shop.example.com"), "HTML download invalid");

    await clickActionBtn("SARIF");
    const downloadedSarif = await waitForFile(path.join(downloadDir, `${pyEngine.scanId}.sarif`));
    const parsedSarif = JSON.parse(downloadedSarif);
    assert.equal(parsedSarif.version, "2.1.0");
    assert(Array.isArray(parsedSarif.runs) && parsedSarif.runs.length === 1);

    await clickActionBtn("Print / PDF");
    const printCalls = await cdp.eval("window.__printCalls");
    assert.equal(printCalls, 1, "Print / PDF button should invoke window.print()");

    console.log("8. Checking missing/expired assessment error handling without crash...");
    const preMissingReqIdx = requests.length;
    await cdp.goto(`${baseUrl}/mypentest/app/assessment?id=scan-missing-404`);
    await cdp.waitFor(
      "document.body.innerText.includes('24-hour temporary report window') && document.body.innerText.includes('Reports are not stored in Firebase')",
      15000,
    );
    const missingHistoryReqs = requests
      .slice(preMissingReqIdx)
      .filter((u) => /\/(scans|reports|exports)\b/.test(u) && !u.includes("/mypentest/api/"));
    assert.equal(missingHistoryReqs.length, 0, "Missing scan 404 must NOT auto-query Firebase history");

    console.log("9. Auditing Python engine FakeRealtimeDatabase writes...");
    const dbRes = await fetch(`http://127.0.0.1:${pyEngine.port}/__e2e__/db`);
    const dbSnapshot = await dbRes.json();
    const aliceTree = dbSnapshot.tree && dbSnapshot.tree.users && dbSnapshot.tree.users.alice;
    assert(aliceTree && aliceTree.live && aliceTree.live[pyEngine.scanId], "Expected slim live node in RTDB");
    const liveNode = aliceTree.live[pyEngine.scanId];
    assert.equal(liveNode.state, "done");
    assert.equal(liveNode.saved, false);
    assert.equal(liveNode.history, false);
    assert.equal(liveNode.report, undefined, "Live node must NOT embed report");
    assert.equal(liveNode.targets, undefined, "Live node must NOT embed targets");
    assert.equal(aliceTree.scans, undefined, "Engine must NEVER write users/{uid}/scans");
    assert.equal(aliceTree.reports, undefined, "Engine must NEVER write users/{uid}/reports");
    assert.equal(aliceTree.exports, undefined, "Engine must NEVER write users/{uid}/exports");
    for (const [uid, writes] of dbSnapshot.requests) {
      for (const relPath of Object.keys(writes || {})) {
        assert(!/\/(scans|reports|exports)\b/.test(relPath), `Unexpected DB write (${uid}) to history path: ${relPath}`);
      }
    }

    assert.equal(pageErrors.length, 0, `Uncaught page errors: ${pageErrors.join("; ")}`);
    const unexpectedConsoleErrors = consoleErrors.filter(
      (msg) => !msg.includes("scan-missing-404") && !msg.includes("404 (Not Found)"),
    );
    assert.equal(
      unexpectedConsoleErrors.length,
      0,
      `Unexpected browser console errors: ${unexpectedConsoleErrors.join(" | ")}`,
    );

    console.log("PASS: Real Next.js production server + Python hosted engine + headless Chrome E2E verification succeeded.");
    console.log(`- Verified 7 public routes + SEO audit`);
    console.log(`- Verified sign-in, Dashboard zero-RTDB load, and 24h recent scan listing`);
    console.log(`- Verified JSON (${downloadedJson.length}B), Markdown (${downloadedMd.length}B), HTML (${downloadedHtml.length}B), SARIF (${downloadedSarif.length}B) real browser downloads + Print/PDF`);
    console.log(`- Verified 0 writes to Firebase scans/reports/exports and slim live marker only`);
    console.log(`- Observed RTDB WebSocket URLs on assessment page: ${webSockets.length}`);
  } finally {
    if (cdp) {
      try {
        cdp.close();
      } catch {}
    }
    if (chrome && !chrome.killed) chrome.kill("SIGKILL");
    if (nextServer && nextServer.child && !nextServer.child.killed) nextServer.child.kill("SIGKILL");
    if (bridge && bridge.server) bridge.server.close();
    if (pyEngine && pyEngine.child && !pyEngine.child.killed) pyEngine.child.kill("SIGKILL");
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

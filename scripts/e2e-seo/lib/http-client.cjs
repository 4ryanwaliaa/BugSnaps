"use strict";

const http = require("node:http");
const https = require("node:https");

const TRANSIENT_ERROR_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EPIPE",
  "EAI_AGAIN",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
]);

function isTransientError(err) {
  if (!err) return false;
  if (err.name === "TimeoutError" || err.name === "AbortError") return true;
  const code = err.code || err.cause?.code;
  return Boolean(code && TRANSIENT_ERROR_CODES.has(code));
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function createHttpClient(options = {}) {
  const baseUrl = new URL(options.baseUrl || "http://localhost:3100");
  const canonicalOrigin = (options.canonicalOrigin || "https://bugsnaps.in").replace(/\/+$/, "");
  const concurrency = Math.max(1, Number(options.concurrency) || 8);
  const timeoutMs = Math.max(1000, Number(options.timeoutMs) || 15000);
  const retries = Math.max(0, Number(options.retries ?? 2));
  const wwwBaseUrl = options.wwwBaseUrl ? new URL(options.wwwBaseUrl) : null;

  const assetCache = new Map();

  function mapToBaseUrl(urlOrPath) {
    if (!urlOrPath) return baseUrl.origin + "/";
    if (urlOrPath.startsWith(canonicalOrigin)) {
      const rest = urlOrPath.slice(canonicalOrigin.length) || "/";
      return new URL(rest, baseUrl.origin).toString();
    }
    try {
      const parsed = new URL(urlOrPath);
      if (parsed.origin === baseUrl.origin) return parsed.toString();
      return parsed.toString();
    } catch {
      return new URL(urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`, baseUrl.origin).toString();
    }
  }

  function toCanonicalUrl(pathname) {
    const p = normalizePath(pathname);
    return p === "/" ? canonicalOrigin : `${canonicalOrigin}${p}`;
  }

  async function fetchWithRetry(targetUrl, fetchOpts = {}) {
    let lastErr = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(targetUrl, {
          redirect: "manual",
          ...fetchOpts,
          signal: AbortSignal.timeout(timeoutMs),
        });
        return res;
      } catch (err) {
        lastErr = err;
        if (attempt < retries && isTransientError(err)) {
          await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

  async function getText(urlOrPath, extraHeaders = {}) {
    const targetUrl = mapToBaseUrl(urlOrPath);
    const res = await fetchWithRetry(targetUrl, {
      method: "GET",
      headers: extraHeaders,
    });
    const body = await res.text();
    return {
      url: targetUrl,
      status: res.status,
      contentType: (res.headers.get("content-type") || "").toLowerCase(),
      xRobotsTag: res.headers.get("x-robots-tag") || "",
      location: res.headers.get("location") || "",
      csp: res.headers.get("content-security-policy") || "",
      headers: res.headers,
      body,
    };
  }

  async function checkAsset(urlOrPath) {
    const targetUrl = mapToBaseUrl(urlOrPath);
    if (assetCache.has(targetUrl)) {
      return assetCache.get(targetUrl);
    }

    const promise = (async () => {
      try {
        let res = await fetchWithRetry(targetUrl, { method: "HEAD" });
        if (res.status === 405 || res.status === 501) {
          try {
            await res.body?.cancel();
          } catch {
            // ignore body cancel errors
          }
          res = await fetchWithRetry(targetUrl, {
            method: "GET",
            headers: { Range: "bytes=0-1023" },
          });
        }

        let contentLengthHeader = res.headers.get("content-length");
        let byteLength = contentLengthHeader !== null ? Number(contentLengthHeader) : null;
        if (res.body) {
          if (byteLength === null && res.status >= 200 && res.status < 300) {
            const buf = await res.arrayBuffer();
            byteLength = buf.byteLength;
          } else {
            try {
              await res.body.cancel();
            } catch {
              // ignore
            }
          }
        }

        return {
          url: targetUrl,
          rawUrl: urlOrPath,
          status: res.status,
          contentType: (res.headers.get("content-type") || "").toLowerCase(),
          byteLength,
          ok: res.status === 200 || res.status === 206,
          error: null,
        };
      } catch (err) {
        return {
          url: targetUrl,
          rawUrl: urlOrPath,
          status: 0,
          contentType: "",
          byteLength: 0,
          ok: false,
          error: err.message,
        };
      }
    })();

    assetCache.set(targetUrl, promise);
    return promise;
  }

  async function checkBinaryGet(urlOrPath) {
    const targetUrl = mapToBaseUrl(urlOrPath);
    try {
      const res = await fetchWithRetry(targetUrl, { method: "GET" });
      const buf = await res.arrayBuffer();
      return {
        url: targetUrl,
        status: res.status,
        contentType: (res.headers.get("content-type") || "").toLowerCase(),
        byteLength: buf.byteLength,
        error: null,
      };
    } catch (err) {
      return {
        url: targetUrl,
        status: 0,
        contentType: "",
        byteLength: 0,
        error: err.message,
      };
    }
  }

  function probeHostRedirect(reqPath = "/", hostHeader = "www.bugsnaps.in") {
    return new Promise((resolve) => {
      let target = baseUrl;
      let sendHost = hostHeader;

      if (wwwBaseUrl) {
        target = wwwBaseUrl;
      } else if (
        baseUrl.protocol === "https:" &&
        baseUrl.hostname !== "localhost" &&
        baseUrl.hostname !== "127.0.0.1"
      ) {
        const apexHost = baseUrl.hostname.replace(/^www\./, "");
        target = new URL(`https://www.${apexHost}`);
        sendHost = target.host;
      }

      const transport = target.protocol === "https:" ? https : http;
      const req = transport.request(
        {
          hostname: target.hostname,
          port: target.port || (target.protocol === "https:" ? 443 : 80),
          path: reqPath,
          method: "GET",
          headers: {
            Host: sendHost,
            "User-Agent": "BugSnaps-E2E-SEO/1.0",
          },
          timeout: timeoutMs,
        },
        (res) => {
          res.resume();
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            location: res.headers.location || "",
            error: null,
          });
        }
      );

      req.on("timeout", () => {
        req.destroy(new Error(`Timeout probing Host: ${sendHost} ${reqPath}`));
      });
      req.on("error", (err) => {
        resolve({
          statusCode: 0,
          headers: {},
          location: "",
          error: err.message,
        });
      });
      req.end();
    });
  }

  async function runPool(items, workerFn, limit = concurrency) {
    const results = new Array(items.length);
    let idx = 0;
    const count = Math.min(Math.max(1, limit), items.length);
    await Promise.all(
      Array.from({ length: count }, async () => {
        while (idx < items.length) {
          const cur = idx++;
          results[cur] = await workerFn(items[cur], cur);
        }
      })
    );
    return results;
  }

  return {
    baseUrl,
    canonicalOrigin,
    concurrency,
    mapToBaseUrl,
    toCanonicalUrl,
    normalizePath,
    getText,
    checkAsset,
    checkBinaryGet,
    probeHostRedirect,
    runPool,
  };
}

module.exports = {
  createHttpClient,
  normalizePath,
};

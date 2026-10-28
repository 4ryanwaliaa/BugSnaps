/** Optional, user-initiated domain lookup. The destination is never visited. */
export type PhishDestroyResult = {
  status: "listed" | "unlisted" | "inconclusive" | "unavailable" | "rate-limited";
  message: string;
  retryAfterSeconds?: number;
  details?: {
    sources: string[];
    matchedDomain?: string;
    providerSignals?: string[];
    liveness?: "serving" | "dns-active" | "inactive";
    livenessCheckedAt?: string;
    listedSince?: string;
    checkedAt?: string;
  };
  health: { status: "healthy" | "degraded" | "unavailable"; lastSync?: string; fullSyncAt?: string };
};

const ORIGIN = "https://api.destroy.tools";
const TIMEOUT_MS = 7000;

type Health = PhishDestroyResult["health"];
const unknownHealth = (): Health => ({ status: "unavailable" });

export function publicHost(value: string): string | null {
  const host = value.toLowerCase().replace(/\.$/, "");
  if (!host || host !== host.trim() || host.length > 253 || !/^[a-z0-9.-]+$/.test(host)) return null;
  const parts = host.split(".");
  if (parts.length < 2 || parts.some((part) => part.length < 1 || part.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(part))) return null;
  if (/^[\d.]+$/.test(host) || ["localhost", "local", "localdomain", "internal", "intranet", "lan", "home", "private", "test", "invalid", "onion", "arpa"].includes(parts[parts.length - 1])) return null;
  return host;
}

export function timestamp(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 40 || !/^\d{4}-\d\d-\d\dT/.test(value) || !Number.isFinite(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}

export type JsonReply = { kind: "ok"; body: Record<string, unknown> } | { kind: "rate-limited" | "unavailable" | "invalid"; retryAfterSeconds?: number };
export async function getJson(url: string, body?: { domains: string[] }): Promise<JsonReply> {
  // Only our fixed provider routes are allowed. Never fetch a submitted URL.
  if (!/^https:\/\/api\.destroy\.tools\/v1\/(check(?:\/bulk)?|health|investigate)(?:\?|$)/.test(url)) return { kind: "invalid" };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), url.includes("/v1/investigate?") ? 15000 : TIMEOUT_MS);
  try {
    const response = await fetch(url, { method: body ? "POST" : "GET", ...(body ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } } : {}), credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", cache: "no-store", signal: controller.signal });
    if (response.status === 429) {
      const retry = response.headers?.get("Retry-After");
      const seconds = retry && /^\d+$/.test(retry) ? Number(retry) : retry ? Math.ceil((Date.parse(retry) - Date.now()) / 1000) : 60;
      return { kind: "rate-limited", retryAfterSeconds: Number.isFinite(seconds) ? Math.max(1, Math.min(86400, seconds)) : 60 };
    }
    // Health uses 503 to signal an unhealthy service; still parse that status body.
    if (!response.ok && !(url === `${ORIGIN}/v1/health` && response.status === 503)) return { kind: "unavailable" };
    if (!response.body) return { kind: "invalid" };
    // Bound provider payloads before parsing, including chunked responses.
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 524288) { await reader.cancel(); return { kind: "invalid" }; }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data)) return { kind: "invalid" };
    return { kind: "ok", body: data as Record<string, unknown> };
  } catch { return { kind: "unavailable" }; }
  finally { clearTimeout(timeout); }
}

export function parseHealth(reply: JsonReply): Health {
  if (reply.kind !== "ok") return unknownHealth();
  const data = reply.body;
  if (data.status !== "ok" && data.status !== "healthy" && data.status !== "degraded") return unknownHealth();
  const full = data.full_sync && typeof data.full_sync === "object" && !Array.isArray(data.full_sync) ? data.full_sync as Record<string, unknown> : null;
  // A reported stale or failed full sync is degraded even if the summary says OK.
  const lastSync = timestamp(data.last_sync);
  const fullSyncAt = timestamp(full?.last);
  // Missing, implausible or stale timestamps cannot establish healthy freshness.
  if (!lastSync || Date.parse(lastSync) > Date.now() + 300_000 || (fullSyncAt && Date.parse(fullSyncAt) > Date.now() + 300_000)) return unknownHealth();
  const degraded = data.status === "degraded" || Date.now() - Date.parse(lastSync) > 7_200_000 || (full && (full.ok === false || full.status === "degraded")) || (fullSyncAt && Date.now() - Date.parse(fullSyncAt) > 172_800_000) || (Array.isArray(data.stale_lists) && data.stale_lists.length > 0);
  return { status: degraded ? "degraded" : "healthy", lastSync, fullSyncAt };
}

/** Check only a hostname; the browser sends it and its IP address to PhishDestroy. */
export async function checkPhishDestroy(hostname: string): Promise<PhishDestroyResult> {
  const host = publicHost(hostname);
  if (!host) return { status: "inconclusive", message: "This address is not a public DNS hostname and cannot be sent for this check.", health: unknownHealth() };
  const endpoint = new URL(`${ORIGIN}/v1/check`);
  endpoint.searchParams.set("domain", host);
  const [reply, healthReply] = await Promise.all([getJson(endpoint.toString()), getJson(`${ORIGIN}/v1/health`)]);
  const health = parseHealth(healthReply);
  if (reply.kind === "rate-limited") return { status: "rate-limited", message: "PhishDestroy is rate limiting this browser. Wait before trying again.", retryAfterSeconds: reply.retryAfterSeconds, health };
  if (reply.kind === "unavailable") return { status: "unavailable", message: "PhishDestroy could not be reached. Try again later.", health };
  if (reply.kind !== "ok") return { status: "inconclusive", message: "PhishDestroy returned an unexpected response. No result can be determined.", health };
  return parsePhishDestroy(reply.body, host, health);
}

/** Validate every per-domain result, including results returned by the bulk API. */
export function parsePhishDestroy(data: Record<string, unknown>, host: string, health: Health): PhishDestroyResult {
  if (typeof data.domain !== "string" || ![host, ...(host.startsWith("www.") ? [host.slice(4)] : [])].includes(data.domain.toLowerCase().replace(/\.$/, "")) || typeof data.threat !== "boolean") {
    return { status: "inconclusive", message: "PhishDestroy returned an incomplete or mismatched response. No result can be determined.", health };
  }
  const lists = data.lists && typeof data.lists === "object" && !Array.isArray(data.lists) ? data.lists as Record<string, unknown> : {};
  const sources: string[] = [];
  if (lists.primary === true) sources.push("PhishDestroy primary list");
  if (lists.community === true) sources.push("Community list");
  const matched = typeof data.matched_domain === "string" ? publicHost(data.matched_domain) : null;
  const matchedDomain = matched && (host === matched || host.endsWith(`.${matched}`)) ? matched : undefined;
  // External strings are never rendered directly; map only known heuristic labels.
  const signalLabels: Record<string, string> = { suspicious_keywords: "Suspicious words in hostname", risky_tld: "Top-level domain associated with abuse", brand_impersonation: "Brand impersonation pattern", homoglyph: "Look-alike characters" };
  const providerSignals = Array.isArray(data.heuristic_flags) ? data.heuristic_flags.slice(0, 20).filter((flag): flag is string => typeof flag === "string" && Object.prototype.hasOwnProperty.call(signalLabels, flag)).map(flag => signalLabels[flag]) : [];
  const details: NonNullable<PhishDestroyResult["details"]> = {
    sources,
    matchedDomain,
    providerSignals,
    checkedAt: timestamp(data.checked_at),
    listedSince: timestamp(data.listed_since),
    livenessCheckedAt: timestamp(data.liveness_checked_at),
  };
  // This is the provider's last liveness observation, not a check we ran.
  if (data.liveness === "serving") details.liveness = "serving";
  else if (data.liveness === "resolving" || data.liveness === "active" || data.liveness === "dns_active") details.liveness = "dns-active";
  else if (data.liveness === "offline" || data.liveness === "inactive") details.liveness = "inactive";
  if (data.threat) return { status: "listed", message: "PhishDestroy reports this hostname or a matching domain in its threat data. The provider can make mistakes; review the evidence and avoid interacting with the link.", details, health };
  return { status: "unlisted", message: data.suspicious === true ? "PhishDestroy found heuristic patterns but no confirmed listing. Its prediction is not proof of a threat or safety." : "PhishDestroy did not report a threat listing for this hostname. This does not mean the link or page is safe.", details, health };
}

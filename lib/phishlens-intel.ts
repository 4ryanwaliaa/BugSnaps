import { getJson, parseHealth, parsePhishDestroy, publicHost, timestamp, type PhishDestroyResult } from "./phishdestroy";

export type Investigation = {
  status: "complete" | "inconclusive" | "unavailable" | "rate-limited";
  message: string;
  observedAt: string;
  retryAfterSeconds?: number;
  health: PhishDestroyResult["health"];
  evidence?: {
    hostname: string;
    listed: boolean;
    checkedAt?: string;
    prediction?: { risk: "high" | "elevated" | "low" | "none"; signals: string[] };
    registration?: { created?: string; registrar?: string; source: "rdap" | "intel_record" };
    infrastructure?: { addresses: string[]; source: "live_dns" | "intel_record"; sharedPlatform: boolean; relatedCount?: number };
    related: { hostname: string; relation: string; detectedAt?: string }[];
  };
};

const origin = "https://api.destroy.tools";
const unknownHealth = (): PhishDestroyResult["health"] => ({ status: "unavailable" });
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function cleanText(value: unknown): string | undefined {
  return typeof value === "string" && value.length <= 160 && !/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069<>]/u.test(value) ? value : undefined;
}
function dateOnly(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) && time <= Date.now() && new Date(time).toISOString().startsWith(value) ? value : undefined;
}
const signalLabels: Record<string, string> = {
  brand_in_name: "Brand name appears in the hostname",
  brand_with_scam_terms: "Brand name combined with scam-related terms",
  scam_terms: "Scam-related naming pattern",
  lookalike_of_known_phishing: "Resembles a previously listed domain",
  shared_name_pattern: "Naming pattern shared with listed domains",
  phishing_infrastructure_ip: "IP address associated with listed domains",
  high_risk_tld: "Suffix associated with abuse",
  brand_homoglyph: "Characters visually resemble a brand name",
  newly_registered: "Recently registered domain",
};
const relations: Record<string, string> = { lookalike: "Similar spelling", same_name_pattern: "Shared naming pattern", imitates_this_name: "Name imitation" };

function validIp(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 45) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return value.split(".").every(v => Number(v) <= 255 && (v === "0" || !v.startsWith("0")));
  if (!/^[0-9a-f:]+$/i.test(value) || !value.includes(":")) return false;
  try { return new URL(`https://[${value}]/`).hostname.length > 0; } catch { return false; }
}

/** Parse bounded, attributed fields only; never render provider HTML or follow indicator links. */
export function parseInvestigation(data: Record<string, unknown>, host: string, health: Investigation["health"], observedAt = new Date().toISOString()): Investigation {
  const base = { observedAt, health };
  const domain = typeof data.domain === "string" ? publicHost(data.domain) : null;
  const verdict = record(data.verdict);
  if (!domain || ![host, host.replace(/^www\./, "")].includes(domain) || typeof verdict.threat !== "boolean" || !["listed", "not_listed", "whitelisted"].includes(String(verdict.status)) || verdict.threat !== (verdict.status === "listed")) {
    return { ...base, status: "inconclusive", message: "The provider returned incomplete or mismatched evidence. No conclusion was drawn." };
  }
  const assessment = record(data.assessment);
  const prediction = assessment.type === "prediction" && ["high", "elevated", "low", "none"].includes(String(assessment.risk)) ? {
    risk: assessment.risk as "high" | "elevated" | "low" | "none",
    signals: Array.isArray(assessment.signals) ? [...new Set(assessment.signals.slice(0, 30).map(item => record(item).signal).filter((key): key is string => typeof key === "string" && Object.hasOwn(signalLabels, key)).map(key => signalLabels[key]))] : [],
  } : undefined;
  const registration = record(data.registration);
  const infrastructure = record(data.infrastructure);
  const related = Array.isArray(data.related) ? data.related.slice(0, 12).flatMap(item => {
    const row = record(item);
    const hostname = typeof row.domain === "string" ? publicHost(row.domain) : null;
    const relation = typeof row.relation === "string" && Object.hasOwn(relations, row.relation) ? relations[row.relation] : undefined;
    return hostname && relation ? [{ hostname, relation, detectedAt: timestamp(row.detected_at) }] : [];
  }) : [];
  return {
    ...base, status: "complete", message: "Provider evidence retrieved. Predictions and shared infrastructure are investigative leads, not proof of phishing.",
    evidence: {
      hostname: host, listed: verdict.threat, checkedAt: timestamp(data.checked_at), prediction, related,
      registration: registration.source === "rdap" || registration.source === "intel_record" ? { created: dateOnly(registration.created), registrar: cleanText(registration.registrar), source: registration.source } : undefined,
      infrastructure: infrastructure.source === "live_dns" || infrastructure.source === "intel_record" ? {
        addresses: Array.isArray(infrastructure.resolved_ips) ? infrastructure.resolved_ips.slice(0, 16).filter(validIp) : [],
        source: infrastructure.source,
        sharedPlatform: infrastructure.shared_platform === true || infrastructure.cloudflare === true,
        relatedCount: typeof infrastructure.known_phishing_on_ip === "number" && Number.isSafeInteger(infrastructure.known_phishing_on_ip) && infrastructure.known_phishing_on_ip >= 0 ? infrastructure.known_phishing_on_ip : undefined,
      } : undefined,
    },
  };
}

export async function investigateDomain(hostname: string): Promise<Investigation> {
  const host = publicHost(hostname);
  const observedAt = new Date().toISOString();
  if (!host) return { status: "inconclusive", message: "Only public DNS hostnames can be investigated externally.", observedAt, health: unknownHealth() };
  const [reply, healthReply] = await Promise.all([getJson(`${origin}/v1/investigate?domain=${encodeURIComponent(host)}`), getJson(`${origin}/v1/health`)]);
  const health = parseHealth(healthReply);
  if (reply.kind !== "ok") return { status: reply.kind === "invalid" ? "inconclusive" : reply.kind, observedAt, health, retryAfterSeconds: reply.retryAfterSeconds, message: reply.kind === "rate-limited" ? "Provider quota reached. Retry after the displayed cooldown." : "Investigation evidence is unavailable. This does not clear the domain." };
  return parseInvestigation(reply.body, host, health, observedAt);
}

export type BulkIntelligence = {
  status: "complete" | "partial" | "inconclusive" | "unavailable" | "rate-limited";
  observedAt: string;
  retryAfterSeconds?: number;
  results: Record<string, PhishDestroyResult>;
  health: PhishDestroyResult["health"];
};

/** One consented request, maximum 100 unique public hostnames. No paths or queries. */
export async function checkBulkDomains(hostnames: string[]): Promise<BulkIntelligence> {
  const hosts = [...new Set(hostnames.map(host => publicHost(host)).filter((host): host is string => !!host))];
  const base = { observedAt: new Date().toISOString(), results: {}, health: unknownHealth() };
  if (!hosts.length || hosts.length > 100) return { ...base, status: "inconclusive" };
  const [reply, healthReply] = await Promise.all([getJson(`${origin}/v1/check/bulk`, { domains: hosts }), getJson(`${origin}/v1/health`)]);
  const health = parseHealth(healthReply);
  if (reply.kind !== "ok") return { ...base, health, status: reply.kind === "invalid" ? "inconclusive" : reply.kind, retryAfterSeconds: reply.retryAfterSeconds };
  const rows = record(reply.body.results);
  const results: BulkIntelligence["results"] = Object.create(null);
  let incomplete = false;
  for (const host of hosts) {
    const key = Object.hasOwn(rows, host) ? host : host.replace(/^www\./, "");
    const row = Object.hasOwn(rows, key) ? record(rows[key]) : {};
    // The documented bulk response uses object keys as domain identity.
    results[host] = parsePhishDestroy({ ...row, domain: row.domain ?? key, checked_at: row.checked_at ?? reply.body.checked_at }, host, health);
    if (results[host].status === "inconclusive") incomplete = true;
  }
  return { ...base, status: incomplete ? "partial" : "complete", results, health };
}

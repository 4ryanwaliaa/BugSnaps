import { parse } from "tldts";
import { analyzePhishingUrl, type AnalysisResult } from "./phishing-detector";
import type { PhishDestroyResult } from "./phishdestroy";
import type { DnsCheckResult } from "./phishlens-dns";
import type { Investigation } from "./phishlens-intel";

export type LocalReview = Extract<AnalysisResult, { ok: true }>;
export type Evidence = {
  threat?: { observedAt: string; result: PhishDestroyResult };
  dns?: { observedAt: string; result: DnsCheckResult };
  investigation?: Investigation;
};

export function inspectInput(input: string): AnalysisResult {
  // Refang only the scheme and authority. Paths and secrets are left untouched.
  const trimmed = input.trim();
  if (trimmed.length > 4096) return analyzePhishingUrl(trimmed);
  const scheme = trimmed.replace(/^hxxp(s?):(?:\/\/)/i, "http$1://");
  const split = scheme.match(/^((?:https?:\/\/)?)([^/?#]*)(.*)$/i);
  const normalized = split ? split[1] + split[2].replace(/\[\.\]|\(\.\)/g, ".") + split[3] : scheme;
  const result = analyzePhishingUrl(normalized);
  if (result.ok && normalized !== trimmed) result.findings.unshift({ id: "defanged-input", title: "Defanged address restored for parsing", detail: "hxxp(s) and bracketed dots were normalized locally. No destination was opened.", severity: "info" });
  return result;
}

export function domainBoundary(hostname: string) {
  const parsed = parse(hostname, { allowPrivateDomains: true });
  const known = parsed.isIcann || parsed.isPrivate;
  return { registrableDomain: known ? parsed.domain : null, publicSuffix: known ? parsed.publicSuffix : null, subdomain: known ? parsed.subdomain || null : null, privateSuffix: parsed.isPrivate === true, isIp: parsed.isIp === true };
}

export type BatchRow = { id: number; occurrences: number; result: AnalysisResult };
export function reviewBatch(input: string): { ok: true; rows: BatchRow[]; submitted: number } | { ok: false; error: string } {
  if (input.length > 410_000) return { ok: false, error: "The batch is too large. Use up to 100 links, each at most 4,096 characters." };
  const lines = input.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
  if (!lines.length || lines.length > 100) return { ok: false, error: "Enter between 1 and 100 links, one per line." };
  const rows: BatchRow[] = [];
  const seen = new Map<string, BatchRow>();
  lines.forEach((line, index) => {
    const result = inspectInput(line);
    const key = result.ok ? result.normalizedUrl : line;
    const existing = seen.get(key);
    if (existing) {
      existing.occurrences++;
      // Normalization can erase encoding or invisible-character evidence.
      // Keep every warning from equivalent inputs rather than trusting the first.
      if (existing.result.ok && result.ok) {
        const rank = { "no-obvious-signals": 0, review: 1, "high-risk": 2 };
        if (rank[result.verdict] > rank[existing.result.verdict]) existing.result.verdict = result.verdict;
        const ids = new Set(existing.result.findings.map(finding => finding.id));
        existing.result.findings.push(...result.findings.filter(finding => !ids.has(finding.id)));
        existing.result.embeddedHosts = [...new Set([...existing.result.embeddedHosts, ...result.embeddedHosts])];
      }
      return;
    }
    const row = { id: index + 1, occurrences: 1, result };
    seen.set(key, row); rows.push(row);
  });
  return { ok: true, rows, submitted: lines.length };
}

export function evidenceDecision(local: LocalReview, evidence: Evidence) {
  const threat = evidence.threat?.result;
  const deep = evidence.investigation;
  const dns = evidence.dns?.result;
  const listed = threat?.status === "listed" || deep?.evidence?.listed === true;
  const conflicting = (threat?.status === "listed" && deep?.evidence?.listed === false) || (threat?.status === "unlisted" && deep?.evidence?.listed === true);
  const caution = local.verdict !== "no-obvious-signals" || !!threat?.details?.providerSignals?.length || ["high", "elevated"].includes(deep?.evidence?.prediction?.risk ?? "");
  const completed = Number(threat?.status === "listed" || threat?.status === "unlisted") + Number(deep?.status === "complete") + Number(dns?.status === "filtered" || dns?.status === "unlisted");
  const gaps = [threat && !["listed", "unlisted"].includes(threat.status), dns && !["filtered", "unlisted"].includes(dns.status), deep && deep.status !== "complete"].some(Boolean);
  const degraded = [threat?.health, deep?.health].some(health => health && health.status !== "healthy");
  return {
    level: listed || dns?.status === "filtered" ? "danger" as const : caution ? "caution" as const : "unknown" as const,
    title: conflicting ? "Provider observations disagree — treat with caution" : listed ? "Threat listing reported — avoid interacting" : dns?.status === "filtered" ? "DNS filter signal — avoid interacting" : caution ? "Warning signals need review" : "Safety has not been established",
    detail: conflicting ? "A listing changed or separate provider endpoints disagree. The positive observation remains visible; verify it before taking action." : listed ? "PhishDestroy reports a domain-level threat listing. This does not identify every harmful page, and provider mistakes are possible." : dns?.status === "filtered" ? "Cloudflare returned a filter signal, confirmed against its ordinary resolver. This is a domain-level observation." : caution ? "Review the evidence below and verify the sender through a trusted channel before sharing information." : "No strong warning is currently visible. Unlisted, new or compromised pages may still be harmful.",
    completed, gaps, degraded,
    scope: "The URL and page content were not scanned. Redirects were not followed. PhishDestroy lookup and enrichment are one intelligence source, not independent votes.",
  };
}

export function createReport(local: LocalReview, evidence: Evidence, reviewedAt: string) {
  return {
    schemaVersion: 1,
    product: "PhishLens by BugSnaps",
    reviewedAt,
    exportedAt: new Date().toISOString(),
    hostname: local.hostname,
    domainBoundary: domainBoundary(local.hostname),
    conclusion: evidenceDecision(local, evidence),
    local: { verdict: local.verdict, findings: local.findings, embeddedHostnames: local.embeddedHosts },
    checks: { phishDestroy: evidence.threat ?? { status: "not-run" }, cloudflareDns: evidence.dns ?? { status: "not-run" }, investigation: evidence.investigation ?? { status: "not-run" } },
    redaction: "Full URL, credentials, path, query, fragment and original input omitted. Hostnames and provider evidence remain; review before sharing.",
  };
}

export function reportMarkdown(report: ReturnType<typeof createReport>): string {
  const defang = (host: string) => host.replace(/\./g, "[.]");
  // JSON code fence preserves bounded evidence as text. Escape backticks in external registrar names.
  const payload = JSON.stringify(report.checks, null, 2).replace(/`/g, "\\u0060");
  return `# PhishLens investigation\n\nHostname: ${defang(report.hostname)}\n\nReviewed: ${report.reviewedAt}\n\n## Assessment\n\n${report.conclusion.title}\n\n${report.conclusion.detail}\n\n${report.conclusion.scope}\n\n## Local evidence\n\n${report.local.findings.map(item => `- ${item.title}: ${item.detail}`).join("\n") || "No local warning patterns matched."}\n\n## Provider evidence\n\n\`\`\`json\n${payload}\n\`\`\`\n\n${report.redaction}\n`;
}

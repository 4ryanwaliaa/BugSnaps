"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FileDown } from "lucide-react";

// Keep this interface structural so reports can consume the imported scanner records.
export type ReportScan = {
  hostname: string; ip: string; level: string; score: number | null; date: string; connection: string;
  findings: { title: string; severity: string; description: string; fix: string }[];
  antivirus: string; firewall: string; patches: string;
  managedDeviceId?: string; managedDeviceName?: string; managedReceivedAt?: string;
};

const priority: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
const parsedDate = (value: string) => { const timestamp = Date.parse(value); return Number.isFinite(timestamp) ? timestamp : null; };
const dateLabel = (value: string) => { const timestamp = parsedDate(value); return timestamp === null ? "Not provided" : new Date(timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); };
const recordTime = (scan: ReportScan) => parsedDate(scan.date);
const recordDate = (scan: ReportScan) => scan.date;
const deviceKey = (scan: ReportScan) => JSON.stringify([scan.hostname.trim().toLowerCase(), scan.ip.trim().toLowerCase()]);
const findingKey = (title: string) => title.trim().toLowerCase();

export function buildReport(scans: ReportScan[]) {
  const groups = new Map<string, ReportScan[]>();
  for (const scan of scans) {
    // Records without a reliable identity and timestamp cannot safely be matched.
    const time = recordTime(scan);
    const key = time === null || time > Date.now() ? `unknown:${groups.size}` : scan.managedDeviceId ? `managed:${scan.managedDeviceId}` : scan.hostname === "Unnamed endpoint" || scan.ip === "Not provided" ? `unknown:${groups.size}` : `local:${deviceKey(scan)}`;
    groups.set(key, [...(groups.get(key) || []), scan]);
  }
  return [...groups.values()].map(group => {
    const dated = group.filter(scan => recordTime(scan) !== null).sort((a, b) => recordTime(b)! - recordTime(a)!);
    const current = dated[0] || group[group.length - 1];
    const previous = dated.find(scan => recordTime(scan)! < recordTime(current)!);
    const currentTitles = new Set(current.findings.map(finding => findingKey(finding.title)));
    const previousTitles = new Set(previous?.findings.map(finding => findingKey(finding.title)) || []);
    const changes = previous ? [
      ...(["antivirus", "firewall", "patches"] as const).filter(key => current[key] !== previous[key]).map(key => `${key === "patches" ? "Patching" : key[0].toUpperCase() + key.slice(1)}: ${previous[key]} → ${current[key]}`),
      ...current.findings.filter(finding => !previousTitles.has(findingKey(finding.title))).map(finding => `Newly reported: ${finding.title}`),
      ...previous.findings.filter(finding => !currentTitles.has(findingKey(finding.title))).map(finding => `Not reported in the later scan: ${finding.title}`),
    ] : [];
    return { current, previous, changes };
  }).sort((a, b) => a.current.hostname.localeCompare(b.current.hostname));
}

export default function ClientReport({ scans, isDemo = false }: { scans: ReportScan[]; isDemo?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [client, setClient] = useState("");
  const [consultant, setConsultant] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const report = useMemo(() => buildReport(scans), [scans]);
  const topFindings = report.flatMap(({ current }) => current.findings.map(finding => ({ finding, device: current.managedDeviceName || current.hostname })))
    .sort((a, b) => (priority[a.finding.severity] ?? 5) - (priority[b.finding.severity] ?? 5));
  const download = async () => {
    setDownloading(true); setDownloadError("");
    try {
      const [module, response] = await Promise.all([import("./report-pdf"), fetch("/fonts/DejaVuSans.ttf")]);
      if (!response.ok) throw new Error("Could not load the report font.");
      const bytes = await module.makeReportPdf(report, client, consultant, new Uint8Array(await response.arrayBuffer()), isDemo);
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
      const link = document.createElement("a"); link.href = url; link.download = "endpointradar-client-report.pdf"; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) { setDownloadError(error instanceof Error ? error.message : "Could not generate the PDF."); }
    finally { setDownloading(false); }
  };
  return <section className="rounded-2xl border border-white/[0.08] bg-[#10141d] p-5">
    <h2 className="text-sm font-semibold">Client report</h2>
    <p className="mt-2 text-xs leading-5 text-zinc-400">Prepare a printable report from the scans in this browser. Choose “Save as PDF” in the print dialog.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-zinc-400">Client name<input value={client} onChange={event => setClient(event.target.value)} maxLength={100} placeholder="Client name" className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white" /></label>
      <label className="text-xs text-zinc-400">Prepared by (optional)<input value={consultant} onChange={event => setConsultant(event.target.value)} maxLength={100} placeholder="Your business" className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white" /></label>
    </div>
    <button type="button" onClick={download} disabled={!report.length || downloading} className="mt-4 mr-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"><FileDown size={16} /> {downloading ? "Preparing PDF…" : "Download PDF"}</button><button type="button" onClick={() => window.print()} disabled={!report.length} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-200 hover:bg-blue-500/20 disabled:opacity-50"><FileDown size={16} /> Print / save PDF</button>
    {downloadError && <p role="alert" className="mt-3 text-sm text-amber-200">{downloadError}</p>}
    {mounted && createPortal(<div className="endpoint-report-print">
      <style>{`
        .endpoint-report-print { display: none; }
        @media print {
          @page { margin: 16mm; }
          body > :not(.endpoint-report-print) { display: none !important; }
          .endpoint-report-print { display: block !important; color: #172033; background: white; font: 10pt/1.45 Arial, sans-serif; overflow-wrap: anywhere; }
          .endpoint-report-print h1 { font-size: 24pt; margin: 5mm 0 2mm; }
          .endpoint-report-print h2 { font-size: 15pt; margin: 8mm 0 3mm; border-bottom: 1px solid #cbd5e1; padding-bottom: 2mm; }
          .endpoint-report-print h3 { font-size: 11pt; margin: 0 0 2mm; }
          .endpoint-report-print p { margin: 1.5mm 0; }
          .endpoint-report-print table { border-collapse: collapse; width: 100%; font-size: 9pt; }
          .endpoint-report-print th, .endpoint-report-print td { text-align: left; vertical-align: top; padding: 2mm; border-bottom: 1px solid #e2e8f0; }
          .endpoint-report-print th { color: #475569; }
          .endpoint-report-print article { break-inside: avoid; border-bottom: 1px solid #e2e8f0; padding: 3mm 0; }
          .endpoint-report-print .report-kicker { color: #2563eb; text-transform: uppercase; letter-spacing: .12em; font-size: 9pt; font-weight: bold; }
          .endpoint-report-print .report-note { color: #475569; font-size: 9pt; }
          .endpoint-report-print ul { padding-left: 5mm; }
        }
      `}</style>
      <p className="report-kicker">EndpointRadar · posture review</p>
      <h1>{client.trim() || "Client"} security report</h1>
      <p>{consultant.trim() ? `Prepared by ${consultant.trim()} · ` : ""}Generated {new Date().toLocaleDateString(undefined, { dateStyle: "long" })}</p>
      {isDemo && <p><strong>Illustrative sample data; this is not a scan of a client device.</strong></p>}
      <p className="report-note">Based on imported point-in-time scan records. Unknown and missing results are not evidence of a passing control.</p>
      <h2>Devices</h2>
      <table><thead><tr><th>Device / last checked</th><th>Antivirus</th><th>Firewall</th><th>Updates</th><th>Findings</th></tr></thead><tbody>{report.map(({ current }, index) => {
        const time = recordTime(current); const age = time === null ? "Missing date" : time > Date.now() ? "Future date" : Date.now() - time > 7 * 86400000 ? "Older than 7 days" : "";
        return <tr key={index}><td><strong>{current.managedDeviceName || current.hostname}</strong><br />{current.ip}<br />{dateLabel(recordDate(current))}{age && <><br /><strong>{age}</strong></>}</td><td>{current.antivirus}</td><td>{current.firewall}</td><td>{current.patches}</td><td>{current.findings.length}</td></tr>;
      })}</tbody></table>
      <h2>Priority issues and recommended actions</h2>
      {topFindings.length ? topFindings.slice(0, 30).map(({ finding, device }, index) => <article key={index}><h3>{finding.severity} · {finding.title}</h3><p><strong>Device:</strong> {device}</p><p><strong>Scanner description:</strong> {finding.description}</p><p><strong>Recommended action:</strong> {finding.fix}</p></article>) : <p>No findings were included in the latest imported records.</p>}
      {topFindings.length > 30 && <p className="report-note">Showing the first 30 issues by severity of {topFindings.length} reported issues. Review the workspace for the complete list.</p>}
      <h2>Changes since the previous scan</h2>
      {report.map(({ current, previous, changes }, index) => <article key={index}><h3>{current.managedDeviceName || current.hostname}</h3>{previous ? <><p className="report-note">Comparing {dateLabel(recordDate(previous))} with {dateLabel(recordDate(current))}.</p>{changes.length ? <ul>{changes.map((change, changeIndex) => <li key={changeIndex}>{change}</li>)}</ul> : <p>No changes detected in reported statuses or finding titles.</p>}</> : <p>No earlier dated scan is available for comparison.</p>}</article>)}
      <p className="report-note">A finding absent from a later scan is not by itself proof of remediation. Confirm the same check ran with sufficient visibility. Managed devices are matched by enrolled device identifier and ordered by scan capture time. Imported records require the same reported hostname and address. Records with invalid or future scan times are not compared.</p>
    </div>, document.body)}
  </section>;
}

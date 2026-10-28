import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { ReportScan } from "./client-report";

type Group = { current: ReportScan; previous?: ReportScan; changes: string[]; noNewScan?: boolean };
const colors = { ink: rgb(0.08, 0.12, 0.19), muted: rgb(0.29, 0.34, 0.42), blue: rgb(0.11, 0.29, 0.69), line: rgb(0.84, 0.88, 0.92) };
const date = (s: string) => { const time = Date.parse(s); return Number.isFinite(time) && time <= Date.now() ? new Date(time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC" : "Unknown"; };
export async function makeReportPdf(groups: Group[], client: string, preparer: string, fontBytes: Uint8Array, demo = false, reviewAt?: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create(); doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: true });
  const glyphs = new Set(font.getCharacterSet());
  const test = (s: string) => { for (const c of s) if (c !== "\n" && c !== "\r" && !glyphs.has(c.codePointAt(0)!)) throw new Error(`The PDF font cannot display character ${c}. Use Print / save PDF for this report.`); return s; };
  let page: PDFPage; let y = 0; const width = 595.28, height = 841.89, margin = 48;
  const addPage = () => { page = doc.addPage([width, height]); y = height - margin; };
  const ensure = (n: number) => { if (y - n < margin + 20) addPage(); };
  const wrap = (text: string, size: number, f: PDFFont, max: number): string[] => {
    const out: string[] = []; let line = "";
    for (const word of test(text).replace(/\r/g, "").split(/\s+/)) {
      if (!word) continue; const candidate = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(candidate, size) <= max) { line = candidate; continue; }
      if (line) { out.push(line); line = ""; }
      for (const c of word) { if (f.widthOfTextAtSize(line + c, size) > max && line) { out.push(line); line = ""; } line += c; }
    }
    if (line) out.push(line); return out.length ? out : [""];
  };
  const write = (text: string, size = 10, color = colors.ink, indent = 0) => { const lines = wrap(text, size, font, width - 2 * margin - indent); for (const line of lines) { ensure(size * 1.5); page.drawText(line, { x: margin + indent, y, size, font, color }); y -= size * 1.45; } };
  const section = (title: string) => { ensure(55); y -= 10; write(title, 15, colors.blue); page.drawLine({ start: { x: margin, y: y + 3 }, end: { x: width - margin, y: y + 3 }, thickness: .7, color: colors.line }); y -= 6; };
  addPage(); write("ENDPOINTRADAR  |  POSTURE REVIEW", 9, colors.blue); y -= 6; write(`${client.trim() || "Client"} security report`, 22); write(`${preparer.trim() ? `Prepared by ${preparer.trim()}  |  ` : ""}Generated ${date(new Date().toISOString())}`, 9, colors.muted); if (demo) write("Illustrative sample data; this is not a scan of a client device.", 10, colors.blue);
  write("Point-in-time records. Unknown and missing results are not evidence of a passing control.", 9, colors.muted);
  section("Devices");
  for (const { current } of groups) { ensure(70); const time = Date.parse(current.date); const age = !Number.isFinite(time) || time > Date.now() ? "Unknown scan time" : Date.now() - time > 7 * 86400000 ? "Older than 7 days" : "Recent"; write(`${current.managedDeviceName || current.hostname}  |  ${current.ip}`, 11); write(`Last checked: ${date(current.date)}  |  ${age}`, 9, colors.muted); write(`Firewall: ${current.firewall}  |  Antivirus: ${current.antivirus}  |  Updates: ${current.patches}`, 9); write(`Findings: ${current.findings.length}`, 9); y -= 5; }
  section("Priority issues and recommended actions");
  const rank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  const findings = groups.flatMap(g => g.current.findings.map(f => ({ f, device: g.current.managedDeviceName || g.current.hostname }))).sort((a, b) => (rank[a.f.severity] ?? 5) - (rank[b.f.severity] ?? 5));
  if (!findings.length) write("No findings were included in the latest available records.");
  for (const { f, device } of findings.slice(0, 30)) { ensure(75); write(`${f.severity}  |  ${f.title}`, 11, colors.blue); write(`Device: ${device}`, 9, colors.muted); write(`Evidence: ${f.description}`); write(`Recommended action: ${f.fix}`); y -= 7; }
  if (findings.length > 30) write(`Showing 30 of ${findings.length} reported issues. Review the workspace for the complete list.`, 9, colors.muted);
  section(reviewAt ? `Changes since review ${date(reviewAt)}` : "Changes since previous scan");
  for (const group of groups) { ensure(55); write(group.current.managedDeviceName || group.current.hostname, 11, colors.blue); if (!group.previous) write(reviewAt ? "No comparable scan was recorded for this device at the last review." : "No earlier comparable scan is available.", 9, colors.muted); else { write(`Comparing ${date(group.previous.date)} with ${date(group.current.date)}.`, 9, colors.muted); if (group.noNewScan) write("No newer scan has been received since this review."); else if (!group.changes.length) write("No changes detected in reported statuses or finding titles."); for (const change of group.changes) write(`- ${change}`, 9, colors.ink, 8); } y -= 6; }
  write("A finding absent from a later scan is not proof of remediation. Confirm that the same check ran with sufficient visibility.", 9, colors.muted);
  const pages = doc.getPages(); pages.forEach((p, i) => { const label = `EndpointRadar  |  ${i + 1} / ${pages.length}`; p.drawText(label, { x: margin, y: 25, size: 8, font, color: colors.muted }); });
  return doc.save();
}

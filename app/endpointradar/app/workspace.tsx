"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { KevContext } from "./kev-context";
import ClientReport from "./client-report";
import { Activity, ArrowLeft, ArrowUpRight, ChevronDown, CircleHelp, FileJson, Filter, Laptop, LockKeyhole, Radar, Search, Shield, ShieldAlert, Trash2, Upload } from "lucide-react";

export type Finding = { title: string; severity: string; description: string; fix: string };
export type Scan = {
  hostname: string; ip: string; level: string; score: number | null; date: string; connection: string;
  findings: Finding[]; warnings: string[]; antivirus: string; firewall: string; patches: string; secureBoot: string; driveEncryption: string;
};
const MAX_FILE = 5 * 1024 * 1024;
const MAX_RECORDS = 100;
const MAX_FINDINGS = 1000;
const demo: Scan = {
  hostname: "WIN-DEMO-01", ip: "10.0.0.51", level: "MEDIUM", score: 9,
  date: "2026-09-14T10:15:00+00:00", connection: "Local Scan", antivirus: "Enabled", firewall: "All profiles on", patches: "4 days since last patch", secureBoot: "Enabled", driveEncryption: "Enabled",
  warnings: [],
  findings: [
    { severity: "HIGH", title: "Risky port listening: 445", description: "SMB exposure can increase the risk of lateral movement. Port 445 is used for Windows file sharing.", fix: "If file sharing is not needed, disable it. Otherwise restrict it to trusted networks and keep Windows updated." },
    { severity: "HIGH", title: "Potentially risky service running: LanmanServer", description: "The SMB file-sharing server is running on this device.", fix: "If file sharing is needed, restrict sharing and firewall access; otherwise disable the service." },
    { severity: "MEDIUM", title: "Potentially risky service running: LanmanWorkstation", description: "The SMB client component is running, which is normal for many systems.", fix: "Review this in the context of your SMB hardening policy." },
    { severity: "MEDIUM", title: "Unusually low patch count", description: "A low hotfix count may indicate missing updates or incomplete visibility.", fix: "Run Windows Update and verify patch inventory with your IT team." },
  ],
};
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const value = (v: unknown, fallback = "Unknown") => typeof v === "string" && v.trim() ? v.trim().slice(0, 5000) : fallback;
const obj = (v: unknown) => isObject(v) ? v : {};
export function normalize(raw: unknown): Scan {
  if (!isObject(raw) || !Array.isArray(raw.vulnerabilities)) throw new Error("This does not look like an EndpointRadar scan record with findings. Import a scan JSON file, not a discovery or threat report.");
  const findings = raw.vulnerabilities;
  if (findings.length > MAX_FINDINGS) throw new Error(`This record exceeds the ${MAX_FINDINGS} findings limit.`);
  const av = obj(raw.antivirus), firewall = obj(raw.firewall), profiles = obj(firewall.profiles), patches = obj(raw.patches);
  const states = ["Domain", "Private", "Public"].map(name => value(obj(profiles[name]).state).toUpperCase());
  const avStatus = value(av.status);
  const firewallStatus = states.some(s => s === "OFF") ? "Profile off" : states.every(s => s === "ON") ? "All profiles on" : "Unknown";
  const days = patches.days_since_last_patch;
  const protection = obj(raw.device_protection);
  // Older scan files do not contain these optional checks.
  const protectionState = (entry: unknown) => {
    const state = value(obj(entry).state, "unknown").toLowerCase();
    return state === "enabled" ? "Enabled" : state === "disabled" ? "Disabled" : "Unknown";
  };
  return {
    hostname: value(raw.hostname, value(obj(raw.system_info).hostname, "Unnamed endpoint")),
    ip: value(raw.target_ip, value(raw.device_id, "Not provided")),
    level: value(raw.risk_level).toUpperCase(),
    score: typeof raw.risk_score === "number" && Number.isFinite(raw.risk_score) ? raw.risk_score : null,
    date: value(raw.last_scan_at, ""), connection: value(raw.connection_status, "Not provided"),
    antivirus: avStatus === "Unknown" ? "Unknown" : avStatus.toLowerCase().replace(/^./, c => c.toUpperCase()),
    firewall: firewallStatus,
    patches: typeof days === "number" && Number.isFinite(days) && days >= 0 ? `${days} days since last patch` : "Unknown",
    secureBoot: protectionState(protection.secure_boot), driveEncryption: protectionState(protection.system_drive_encryption),
    warnings: Array.isArray(raw.warnings) ? raw.warnings.filter((item: unknown): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 20).map((item: string) => item.trim().slice(0, 1000)) : [],
    findings: findings.map((item: unknown) => { const f = obj(item); return { title: value(f.title, "Untitled finding"), severity: value(f.severity, "INFO").toUpperCase(), description: value(f.description, "No description provided."), fix: value(f.fix, "No remediation provided.") }; }),
  };
}
const severityColor: Record<string, string> = { CRITICAL: "text-red-300 bg-red-400/10 border-red-400/20", HIGH: "text-orange-300 bg-orange-400/10 border-orange-400/20", MEDIUM: "text-amber-300 bg-amber-400/10 border-amber-400/20", LOW: "text-blue-300 bg-blue-400/10 border-blue-400/20" };
const rank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
// Import identity is intentionally conservative: records must agree on both fields.
// A hostname or address can be reused, so an operator should verify matches.
const deviceKey = (scan: Scan) => `${scan.hostname.trim().toLowerCase()}\u0000${scan.ip.trim().toLowerCase()}`;
const scanTime = (scan: Scan) => { const time = Date.parse(scan.date); return Number.isFinite(time) && time <= Date.now() ? time : null; };
function freshness(scan: Scan) {
  const time = scanTime(scan);
  if (time === null || time > Date.now()) return "Missing or invalid time";
  return Date.now() - time > 7 * 24 * 60 * 60_000 ? "Old result" : "Recent result";
}
function dateLabel(date: string) { const d = new Date(date); return date && !Number.isNaN(d.getTime()) ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not provided"; }
const panel = "rounded-2xl border border-white/[0.08] bg-[#10141d]";
const button = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";
function Badge({ severity }: { severity: string }) { return <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold tracking-wider ${severityColor[severity] || "border-white/10 bg-white/5 text-zinc-300"}`}>{severity}</span>; }

export default function Workspace() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [scan, setScan] = useState<Scan | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);
  const findings = useMemo(() => (scan?.findings || []).map((f, i) => ({...f, i})).filter(f => (severity === "ALL" || f.severity === severity) && `${f.title} ${f.description} ${f.fix}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (rank[a.severity] ?? 4) - (rank[b.severity] ?? 4)), [scan, query, severity]);
  const latest = useMemo(() => {
    const byDevice = new Map<string, Scan>();
    for (const [index, record] of scans.entries()) {
      const key = record.hostname === "Unnamed endpoint" || record.ip === "Not provided" || scanTime(record) === null ? `unidentified-${index}` : deviceKey(record), current = byDevice.get(key);
      if (!current || (scanTime(record) ?? -Infinity) > (scanTime(current) ?? -Infinity)) byDevice.set(key, record);
    }
    return [...byDevice.values()];
  }, [scans]);
  const previous = useMemo(() => {
    if (!scan || scanTime(scan) === null || scan.hostname === "Unnamed endpoint" || scan.ip === "Not provided") return null;
    return scans.filter(record => deviceKey(record) === deviceKey(scan) && scanTime(record) !== null && scanTime(record)! < scanTime(scan)!).sort((a, b) => scanTime(b)! - scanTime(a)!)[0] ?? null;
  }, [scan, scans]);
  const newInLaterScan = scan?.findings.filter(f => previous && !previous.findings.some(old => old.title.trim().toLowerCase() === f.title.trim().toLowerCase())) ?? [];
  const missingFromLaterScan = previous?.findings.filter(f => !scan?.findings.some(current => current.title.trim().toLowerCase() === f.title.trim().toLowerCase())) ?? [];
  const clear = () => { setScan(null); setScans([]); setIsDemo(false); setError(""); setQuery(""); setSeverity("ALL"); setExpanded(null); if (fileRef.current) fileRef.current.value = ""; };
  const load = (next: Scan, sample = false) => { setScan(next); if (sample) setScans([next]); setIsDemo(sample); setError(""); setQuery(""); setSeverity("ALL"); setExpanded(null); };
  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    setError("");
    if (file.size > MAX_FILE) { setError("File exceeds the 5 MB import limit. Export a single endpoint and try again."); return; }
    try {
      const raw: unknown = JSON.parse(await file.text());
      const records = Array.isArray(raw) ? raw : [raw];
      if (!records.length || records.length > MAX_RECORDS) throw new Error(`Import a file containing 1 to ${MAX_RECORDS} scan records.`);
      const next = records.map(normalize);
      // Import replaces demo data and otherwise adds records for comparison.
      const all = isDemo ? next : [...scans, ...next];
      if (all.length > MAX_RECORDS) throw new Error(`Keep at most ${MAX_RECORDS} records in this browser session.`);
      setScans(all);
      const imported = [...next].sort((a, b) => (scanTime(b) ?? -Infinity) - (scanTime(a) ?? -Infinity))[0];
      // An older import is historical evidence, not the current posture.
      const sameDevice = imported.hostname !== "Unnamed endpoint" && imported.ip !== "Not provided" && scanTime(imported) !== null
        ? all.filter(record => deviceKey(record) === deviceKey(imported) && scanTime(record) !== null)
        : [imported];
      load([...sameDevice].sort((a, b) => (scanTime(b) ?? -Infinity) - (scanTime(a) ?? -Infinity))[0]);
    } catch (e) { setError(e instanceof SyntaxError ? "Could not read this JSON file. Check the file and try again." : e instanceof Error ? e.message : "Could not import this file."); }
  }
  const high = scan?.findings.filter(f => f.severity === "HIGH" || f.severity === "CRITICAL").length ?? 0;
  return <div className="min-h-screen bg-[#090d14] text-zinc-100">
    <header className="border-b border-white/[0.08] bg-[#0d1119]/95"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 md:px-8">
      <Link href="/endpointradar" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-400"><Radar size={22} /></span><span><strong className="block text-sm tracking-tight">EndpointRadar</strong><span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">by BugSnaps</span></span></Link>
      <div className="flex items-center gap-3"><span className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400 sm:inline-flex">Free workspace</span><Link className="text-xs text-zinc-400 transition hover:text-white" href="/endpointradar">About the product <ArrowUpRight className="inline" size={14}/></Link></div>
    </div></header>
    <main id="main" className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 md:px-8 md:pt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-400"><span className="h-1.5 w-1.5 rounded-full bg-blue-400"/> Endpoint security workspace</div><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Know where you stand.</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Turn a Windows posture scan into a clearer path to remediation.</p></div><div className="flex flex-wrap gap-2"><input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={onFile}/><button onClick={() => fileRef.current?.click()} className={`${button} bg-blue-600 text-white hover:bg-blue-500`}><Upload size={16}/>Import scan</button>{(!scans.length || isDemo) && <button onClick={() => load(demo, true)} className={`${button} border border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]`}><Activity size={16}/>Explore demo</button>}</div></div>
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-400/15 bg-blue-500/[0.06] px-4 py-3 text-xs leading-5 text-blue-100/80"><LockKeyhole size={16} className="mt-0.5 shrink-0 text-blue-400"/><p><strong className="text-blue-200">Your scan stays in your browser.</strong> Files are read locally and aren’t uploaded by this workspace. Imported records remain in this browser tab until you clear them or leave the page. <span className="text-blue-100/55">This page does not scan your device.</span></p></div>
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {scans.length > 0 && <ClientReport scans={scans} isDemo={isDemo} />}
      {latest.length > 0 && <section className={`${panel} mb-5 overflow-hidden`} aria-label="Imported devices"><div className="border-b border-white/[0.07] p-5"><h2 className="text-lg font-semibold">Device overview</h2><p className="mt-1 text-xs leading-5 text-zinc-400">Latest dated imported result per identified device. Records with missing identity or scan time are shown separately. Old means more than 7 days; missing or invalid scan times need attention. This view does not detect devices that have not been imported.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-xs"><thead className="text-zinc-500"><tr><th className="p-4">Device</th><th className="p-4">Last checked</th><th className="p-4">Freshness</th><th className="p-4">Firewall</th><th className="p-4">Antivirus</th><th className="p-4">Updates</th><th className="p-4">Findings</th></tr></thead><tbody className="divide-y divide-white/[0.06]">{latest.map((device, i) => <tr key={i} className="text-zinc-300"><td className="p-4"><button onClick={() => load(device, isDemo)} className="font-semibold text-blue-300 hover:underline">{device.hostname}</button><span className="mt-1 block text-zinc-500">{device.ip}</span></td><td className="p-4">{dateLabel(device.date)}</td><td className={`p-4 font-semibold ${freshness(device) === "Recent result" ? "text-emerald-300" : "text-amber-300"}`}>{freshness(device)}</td><td className="p-4">{device.firewall}</td><td className="p-4">{device.antivirus}</td><td className="p-4">{device.patches}</td><td className="p-4">{device.findings.length}</td></tr>)}</tbody></table></div></section>}
      {!scan ? <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]"><section className={`${panel} flex min-h-[360px] flex-col items-center justify-center p-8 text-center`}><div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-blue-400/20 bg-blue-500/10 text-blue-400"><FileJson size={34}/></div><h2 className="text-xl font-semibold">Your workspace is ready</h2><p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">Import a scan created with EndpointRadar, or explore a sample to see how your results come together.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={() => fileRef.current?.click()} className={`${button} bg-blue-600 hover:bg-blue-500`}><Upload size={16}/>Import JSON</button><button onClick={() => load(demo, true)} className={`${button} border border-white/10 hover:bg-white/5`}>View sample</button></div><p className="mt-5 text-xs text-zinc-500">JSON only · 5 MB per file · up to 100 records</p></section><aside className={`${panel} p-6`}><div className="flex items-center gap-2 text-sm font-semibold"><CircleHelp size={17} className="text-blue-400"/> How to get a scan</div><ol className="mt-6 space-y-5 text-sm leading-6 text-zinc-400"><li><span className="mr-2 font-semibold text-blue-400">01</span> Install EndpointRadar on a Windows machine you are authorized to assess.</li><li><span className="mr-2 font-semibold text-blue-400">02</span> Run the command below in PowerShell.</li></ol><code className="mt-4 block overflow-x-auto rounded-xl border border-white/5 bg-black/30 p-4 text-xs leading-6 text-blue-200">endpointradar scan -f json -o scan.json</code><p className="mt-5 text-sm leading-6 text-zinc-400"><span className="mr-2 font-semibold text-blue-400">03</span> Import <code className="text-zinc-200">scan.json</code> here to review it.</p><a href="https://github.com/4ryanwalia/EndpointRadar#installation" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300">Installation instructions <ArrowUpRight size={15}/></a></aside></div> : <>
        {isDemo && <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-200">Sample data · This is an illustrative scan, not a scan of your device.</div>}
        {scan.warnings.length > 0 && <section className="mb-5 rounded-xl border border-amber-400/20 bg-amber-500/[0.08] p-4" aria-label="Scan visibility warnings"><h2 className="text-sm font-semibold text-amber-200">Scan visibility warnings</h2><ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-amber-100/80">{scan.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></section>}
        {previous && <section className={`${panel} mb-5 p-5`}><h2 className="text-sm font-semibold">Comparison with previous scan</h2><p className="mt-2 text-xs leading-5 text-zinc-400">Previous: {dateLabel(previous.date)} · Current: {dateLabel(scan.date)}. Matching uses hostname and address; verify that both records refer to the same device.</p><p className="mt-3 text-sm text-zinc-300">{newInLaterScan.length} newly reported · {missingFromLaterScan.length} previous finding{missingFromLaterScan.length === 1 ? " is" : "s are"} no longer reported{previous.firewall !== scan.firewall ? ` · Firewall: ${previous.firewall} → ${scan.firewall}` : ""}{previous.antivirus !== scan.antivirus ? ` · Antivirus: ${previous.antivirus} → ${scan.antivirus}` : ""}.</p>{missingFromLaterScan.length > 0 && <ul className="mt-3 space-y-2 text-sm text-zinc-400">{missingFromLaterScan.map((f, i) => <li key={i}>• {f.title}</li>)}</ul>}<p className="mt-3 text-xs leading-5 text-amber-200/80">Not reported is not proof of a fix: verify that the later scan checked the same control with comparable permissions and coverage.</p></section>}
        <section className={`${panel} mb-5 overflow-hidden`}><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-5 md:p-6"><div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400"><Laptop size={23}/></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{scan.hostname}</h2><Badge severity={scan.level}/></div><p className="mt-1 text-xs text-zinc-500">{scan.ip} <span className="mx-1.5">·</span> {scan.connection} <span className="mx-1.5">·</span> {dateLabel(scan.date)}</p></div></div><button onClick={clear} className={`${button} border border-white/10 text-zinc-400 hover:text-white`}><Trash2 size={15}/>Clear data</button></div>
          <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4"><div className="bg-[#10141d] p-5"><p className="text-xs font-medium text-zinc-500">Risk score</p><div className="mt-3 flex items-baseline gap-2"><span className="text-3xl font-semibold">{scan.score ?? "—"}</span><span className="text-xs text-zinc-500">points</span></div><p className="mt-2 text-xs text-zinc-500">As reported by the scanner</p></div><div className="bg-[#10141d] p-5"><p className="text-xs font-medium text-zinc-500">Findings</p><p className="mt-3 text-3xl font-semibold">{scan.findings.length}</p><p className="mt-2 text-xs text-zinc-500">Across this scan</p></div><div className="bg-[#10141d] p-5"><p className="text-xs font-medium text-zinc-500">High priority</p><p className="mt-3 text-3xl font-semibold text-orange-300">{high}</p><p className="mt-2 text-xs text-zinc-500">High and critical findings</p></div><div className="bg-[#10141d] p-5"><p className="text-xs font-medium text-zinc-500">Scan visibility</p><p className="mt-4 text-sm font-semibold">{scan.connection}</p><p className="mt-3 text-xs text-zinc-500">Point-in-time assessment</p></div></div></section>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><section className={panel}><div className="border-b border-white/[0.07] p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Findings &amp; fixes</h2><p className="mt-1 text-xs text-zinc-500">Review the evidence and suggested next steps from your scan.</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">{findings.length} shown</span></div><div className="mt-5 flex flex-wrap gap-2"><label className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-zinc-500"><Search size={16}/><span className="sr-only">Search findings</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search findings" className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-600"/></label><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-zinc-500"><Filter size={15}/><span className="sr-only">Filter severity</span><select value={severity} onChange={e => setSeverity(e.target.value)} className="bg-transparent py-3 text-sm text-zinc-300 outline-none"><option value="ALL">All severities</option>{["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].map(s => <option key={s} value={s}>{s}</option>)}</select></label></div></div>
          <div className="divide-y divide-white/[0.06]">{findings.length ? findings.map(f => <article key={f.i} className="p-5 md:px-6"><button onClick={() => setExpanded(expanded === f.i ? null : f.i)} aria-expanded={expanded === f.i} className="flex w-full items-center gap-3 text-left"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-zinc-400"><ShieldAlert size={17}/></span><span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold">{f.title}</span></span><Badge severity={f.severity}/><ChevronDown size={16} className={`shrink-0 text-zinc-500 transition ${expanded === f.i ? "rotate-180" : ""}`}/></button>{expanded === f.i && <div className="ml-12 mt-4 space-y-4 text-sm leading-6 text-zinc-400"><p>{f.description}</p><div className="rounded-xl border border-blue-400/10 bg-blue-500/[0.06] p-4"><p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-300">Recommended action</p><p className="text-zinc-300">{f.fix}</p></div></div>}</article>) : <p className="p-8 text-center text-sm text-zinc-500">{scan.findings.length ? "No findings match these filters." : "No findings were included in this scan."}</p>}</div></section>
          <aside className="space-y-5"><div className={`${panel} p-5`}><h2 className="flex items-center gap-2 text-sm font-semibold"><Shield size={17} className="text-blue-400"/> Posture snapshot</h2><p className="mt-1 text-xs text-zinc-500">Values reported by the scan</p><div className="mt-5 divide-y divide-white/[0.06]">{[["Antivirus",scan.antivirus],["Firewall",scan.firewall],["Patching",scan.patches],["Secure Boot",scan.secureBoot],["System drive protection",scan.driveEncryption]].map(([label, state]) => <div key={label} className="flex justify-between gap-3 py-3 text-xs"><span className="text-zinc-500">{label}</span><span className="text-right text-zinc-200">{state}</span></div>)}</div><p className="mt-3 text-xs leading-5 text-zinc-500">Unknown means the scan did not establish a status, including older reports without these checks. System drive protection may be disabled because encryption is suspended or the drive is unencrypted. Confirm status on the device. Limited-visibility scans cannot assess every control.</p></div><div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.06] p-5"><div className="flex items-center gap-2 text-sm font-semibold text-blue-200"><LockKeyhole size={16}/> Free workspace</div><p className="mt-3 text-xs leading-5 text-zinc-400">Import additional device scans or later scans to compare results. This view is local to this browser tab.</p><p className="mt-3 text-xs leading-5 text-zinc-500">No account or paid checkout is available here.</p></div></aside></div>
      </>}
      <div className="mt-5"><KevContext /></div>
      <div className="mt-8 flex flex-wrap justify-between gap-3 text-xs text-zinc-500"><Link href="/endpointradar" className="inline-flex items-center gap-1 hover:text-zinc-300"><ArrowLeft size={14}/> Back to EndpointRadar</Link><span>Built by BugSnaps · Point-in-time posture, not continuous monitoring</span></div>
    </main></div>;
}

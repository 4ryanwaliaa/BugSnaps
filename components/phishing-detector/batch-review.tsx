"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Database, Download, FileSearch, Link2, ListFilter, LoaderCircle, LockKeyhole, ScanLine, ShieldAlert } from "lucide-react";
import { checkBulkDomains, type BulkIntelligence } from "@/lib/phishlens-intel";
import { publicHost, type PhishDestroyResult } from "@/lib/phishdestroy";
import { createReport, reviewBatch, type BatchRow, type LocalReview } from "@/lib/phishlens-review";
import { downloadFile } from "./report-actions";
import { useCooldown } from "./investigation-check";

export function BatchReview({ onInspect }: { onInspect: (result: LocalReview) => void }) {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [submitted, setSubmitted] = useState(0);
  const [reviewedAt, setReviewedAt] = useState("");
  const [error, setError] = useState("");
  const [intel, setIntel] = useState<BulkIntelligence>();
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "flagged" | "invalid">("all");
  const revision = useRef(0);
  const cooldown = useCooldown();
  useEffect(() => () => { revision.current++; }, []);
  function clearResults() { revision.current++; setRows([]); setIntel(undefined); setError(""); setSubmitted(0); setBusy(false); }
  function review(event: FormEvent) {
    event.preventDefault(); clearResults();
    const result = reviewBatch(input);
    if (!result.ok) { setError(result.error); return; }
    setRows(result.rows); setSubmitted(result.submitted); setReviewedAt(new Date().toISOString()); setFilter("all");
  }
  const hosts = [...new Set(rows.flatMap(row => row.result.ok ? [publicHost(row.result.hostname)] : []).filter((host): host is string => !!host))];
  async function check() {
    if (busy || cooldown.remaining || !hosts.length) return;
    const version = ++revision.current;
    setBusy(true); setIntel(undefined);
    const result = await checkBulkDomains(hosts);
    if (version !== revision.current) return;
    setIntel(result); setBusy(false); cooldown.start(result.retryAfterSeconds);
  }
  function status(row: BatchRow): PhishDestroyResult | undefined {
    const host = row.result.ok ? publicHost(row.result.hostname) : null;
    if (!host || !intel) return undefined;
    return intel.results[host] ?? {
      status: intel.status === "rate-limited" ? "rate-limited" : intel.status === "unavailable" ? "unavailable" : "inconclusive",
      message: "The batch request did not return usable evidence for this hostname.",
      health: intel.health,
      retryAfterSeconds: intel.retryAfterSeconds,
    };
  }
  function flagged(row: BatchRow) { return row.result.ok && (row.result.verdict !== "no-obvious-signals" || status(row)?.status === "listed" || !!status(row)?.details?.providerSignals?.length); }
  const ordered = [...rows].sort((a, b) => Number(status(b)?.status === "listed") - Number(status(a)?.status === "listed") || Number(flagged(b)) - Number(flagged(a)) || a.id - b.id);
  const visible = ordered.filter(row => filter === "all" || (filter === "flagged" ? flagged(row) : !row.result.ok));
  function exportBatch() {
    downloadFile(JSON.stringify({ schemaVersion: 1, product: "PhishLens batch review", reviewedAt, submitted, uniqueLinks: rows.length, providerStatus: intel?.status ?? "not-run", providerHealth: intel?.health ?? null, rows: rows.map(row => ({ row: row.id, occurrences: row.occurrences, ...(row.result.ok ? { report: createReport(row.result, status(row) ? { threat: { observedAt: intel!.observedAt, result: status(row)! } } : {}, reviewedAt) } : { error: row.result.error }) })) }, null, 2), "phishlens-batch.json", "application/json");
  }
  const lineCount = input.split(/\r?\n/).filter(line => line.trim()).length;
  const reviewCount = rows.filter(flagged).length;
  const invalidCount = rows.filter(row => !row.result.ok).length;
  const stats = [
    { label: "Submitted", value: submitted, note: "Input lines" },
    { label: "Unique links", value: rows.length, note: "Duplicates grouped" },
    { label: "Needs review", value: reviewCount, note: "Signals or listing" },
    { label: "Invalid", value: invalidCount, note: "Could not parse" },
  ];
  function rowLabels(row: BatchRow) {
    const provider = status(row);
    const local = row.result.ok ? row.result.verdict === "high-risk" ? "High concern" : row.result.verdict === "review" ? "Review" : "No patterns" : "Invalid";
    const providerLabels: Record<PhishDestroyResult["status"], string> = { listed: "Listed", unlisted: "Not listed", inconclusive: "Inconclusive", unavailable: "Unavailable", "rate-limited": "Rate limited" };
    const providerLabel = provider ? providerLabels[provider.status] : row.result.ok && !publicHost(row.result.hostname) ? "Not eligible" : intel && intel.status !== "complete" ? "Unavailable" : "Not checked";
    return { local, provider, providerLabel };
  }
  const localTone = (row: BatchRow) => !row.result.ok ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-300" : row.result.verdict === "high-risk" ? "border-rose-400/25 bg-rose-400/10 text-rose-200" : row.result.verdict === "review" ? "border-amber-400/25 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[.04] text-zinc-400";
  const providerTone = (value?: PhishDestroyResult) => value?.status === "listed" ? "border-rose-400/25 bg-rose-400/10 text-rose-200" : value && !["unlisted"].includes(value.status) ? "border-amber-400/20 bg-amber-400/[.07] text-amber-200" : "border-white/10 bg-white/[.04] text-zinc-400";
  const chip = "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium leading-none";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0b1117]">
        <div className="grid gap-5 border-b border-white/[.07] p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[.07] text-cyan-300"><FileSearch className="h-5 w-5" /></span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-cyan-400">Batch triage</p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">Review more links, in one place.</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">Paste up to 100 addresses to surface warning patterns and decide which links need a closer look.</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-[11px] text-zinc-400"><LockKeyhole className="h-3.5 w-3.5 text-cyan-400" /> Local review first</span>
        </div>
        <form onSubmit={review} className="p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><label htmlFor="batch-links" className="text-sm font-medium text-zinc-200">URLs or domains</label><span className="font-mono text-[11px] text-zinc-500">{lineCount} / 100 lines</span></div>
          <div className="relative mt-3">
            <textarea id="batch-links" aria-describedby="batch-input-help" value={input} onChange={event => { setInput(event.target.value); clearResults(); }} maxLength={410000} rows={7} autoComplete="off" spellCheck={false} placeholder={"https://example.com\nhxxps://suspicious[.]example/login"} className="block w-full resize-y rounded-xl border border-white/10 bg-[#070c10] p-4 font-mono text-sm leading-7 text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/10" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p id="batch-input-help" className="text-xs leading-relaxed text-zinc-500">One link per line. Defanged addresses are supported; duplicates are grouped.</p><button type="button" onClick={() => { setInput(""); clearResults(); }} className="min-h-10 text-xs font-medium text-zinc-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Clear batch</button></div>
          <div className="mt-3 flex flex-wrap items-center gap-4"><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-[#071319] transition-colors hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Review batch <ArrowRight className="h-4 w-4" /></button><p className="flex items-center gap-1.5 text-xs text-zinc-500"><LockKeyhole className="h-3.5 w-3.5" /> No links are sent during this review</p></div>
        </form>
      </section>

      {error && <p role="alert" className="flex gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[.06] p-4 text-sm text-rose-200"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
      {!!rows.length && <>
        <section aria-labelledby="batch-overview-title" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-cyan-400">Your review</p><h3 id="batch-overview-title" className="mt-2 text-lg font-semibold text-white">Batch overview</h3></div><p className="text-xs text-zinc-500">Local pattern results are signals, not safety verdicts.</p></div>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">{stats.map(stat => <div key={stat.label} className="rounded-xl border border-white/[.08] bg-[#0b1117] p-4"><p className="text-xs text-zinc-400">{stat.label}</p><p className={`mt-3 font-mono text-2xl leading-none ${stat.label === "Needs review" && stat.value ? "text-amber-200" : "text-zinc-100"}`}>{stat.value}</p><p className="mt-2 text-[11px] text-zinc-500">{stat.note}</p></div>)}</div>
        </section>

        <section aria-labelledby="batch-provider-title" className="overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#0b171c]">
          <div className="flex flex-wrap items-start justify-between gap-5 p-5 sm:p-6"><div className="flex max-w-2xl gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[.07] text-cyan-300"><Database className="h-5 w-5" /></span><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-cyan-400">Optional intelligence</p><h3 id="batch-provider-title" className="mt-2 text-base font-semibold text-zinc-100">Check {hosts.length} unique public {hosts.length === 1 ? "hostname" : "hostnames"}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">Compare eligible domains against PhishDestroy’s phishing and scam lists. Results cover domains, not individual pages.</p><p className="mt-3 text-xs leading-relaxed text-zinc-500">Your browser sends these hostnames and your IP address to PhishDestroy in one request. Paths, queries and full links stay here; private and invalid names are excluded.</p></div></div><button type="button" disabled={busy || cooldown.remaining > 0 || !hosts.length} onClick={check} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 px-4 text-sm font-medium text-cyan-200 hover:bg-cyan-400/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}{busy ? "Checking domain list…" : cooldown.remaining ? `Retry in ${cooldown.remaining}s` : "Check with PhishDestroy"}</button></div>
          {intel && <p role="status" className={`border-t border-white/[.08] px-5 py-3 text-xs leading-relaxed sm:px-6 ${intel.health.status === "healthy" && intel.status === "complete" ? "text-zinc-300" : "text-amber-200"}`}>Provider request: <span className="font-medium">{intel.status}</span> · Source health: <span className="font-medium">{intel.health.status}</span>. {intel.status === "partial" ? "Some results are missing or invalid; those rows are inconclusive." : "No listing is not a safety verdict."}</p>}
        </section>

        <section aria-labelledby="batch-results-title" className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0b1117]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[.07] p-5 sm:p-6"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-cyan-400">Prioritized queue</p><h3 id="batch-results-title" className="mt-2 text-lg font-semibold text-white">Review results</h3><p className="mt-1.5 text-xs text-zinc-500">Listed domains appear first, followed by local warnings.</p></div><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-xs text-zinc-400"><ListFilter className="h-4 w-4" /><span className="sr-only">Filter batch results</span><select value={filter} onChange={event => setFilter(event.target.value as typeof filter)} className="min-h-11 rounded-lg border border-white/10 bg-[#101920] px-3 text-zinc-200 focus-visible:outline-2 focus-visible:outline-cyan-300"><option value="all">All links</option><option value="flagged">Needs review</option><option value="invalid">Invalid input</option></select></label><button type="button" onClick={exportBatch} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-zinc-200 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-cyan-300"><Download className="h-4 w-4" />Export JSON</button></div></div>
          {visible.length ? <>
            <ul className="divide-y divide-white/[.07] lg:hidden">{visible.map(row => { const labels = rowLabels(row); return <li key={row.id} className="space-y-3 p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Row {row.id}{row.occurrences > 1 ? ` · ${row.occurrences} occurrences` : ""}</p><p className="mt-2 break-all font-mono text-sm text-zinc-100">{row.result.ok ? row.result.hostname.replace(/\./g, "[.]") : row.result.error}</p></div>{row.result.ok && <Link2 className="h-4 w-4 shrink-0 text-zinc-600" />}</div><div className="flex flex-wrap gap-2"><span className={`${chip} ${localTone(row)}`}>Local: {labels.local}</span><span className={`${chip} ${providerTone(labels.provider)}`}>Provider: {labels.providerLabel}</span>{!!labels.provider?.details?.providerSignals?.length && <span className={`${chip} border-amber-400/20 bg-amber-400/[.07] text-amber-200`}>Provider signals</span>}</div>{row.result.ok && <button type="button" onClick={() => row.result.ok && onInspect(row.result)} className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300" aria-label={`Investigate row ${row.id}`}>Open investigation <ArrowRight className="h-3.5 w-3.5" /></button>}</li>; })}</ul>
            <div className="hidden overflow-x-auto lg:block"><table className="w-full text-left text-xs"><caption className="sr-only">Batch review. Listed domains appear first, followed by local warnings. No result establishes safety.</caption><thead className="bg-white/[.025] text-[10px] uppercase tracking-wider text-zinc-500"><tr><th scope="col" className="px-5 py-4">Row</th><th scope="col" className="px-5 py-4">Destination hostname</th><th scope="col" className="px-5 py-4">Local patterns</th><th scope="col" className="px-5 py-4">Domain intelligence</th><th scope="col" className="px-5 py-4"><span className="sr-only">Action</span></th></tr></thead><tbody className="divide-y divide-white/[.06]">{visible.map(row => { const labels = rowLabels(row); return <tr key={row.id} className="align-middle transition-colors hover:bg-white/[.025]"><td className="whitespace-nowrap px-5 py-4 font-mono text-zinc-500">{row.id}{row.occurrences > 1 ? ` ×${row.occurrences}` : ""}</td><td className="max-w-xs break-all px-5 py-4 font-mono text-zinc-200">{row.result.ok ? row.result.hostname.replace(/\./g, "[.]") : row.result.error}</td><td className="px-5 py-4"><span className={`${chip} ${localTone(row)}`}>{labels.local}</span></td><td className="px-5 py-4"><span className={`${chip} ${providerTone(labels.provider)}`}>{labels.providerLabel}</span>{!!labels.provider?.details?.providerSignals?.length && <p className="mt-1.5 text-[10px] text-amber-200">Provider signals</p>}</td><td className="px-5 py-4 text-right">{row.result.ok && <button type="button" onClick={() => row.result.ok && onInspect(row.result)} className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap font-medium text-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300" aria-label={`Investigate row ${row.id}`}>Investigate <ArrowRight className="h-3.5 w-3.5" /></button>}</td></tr>; })}</tbody></table></div>
          </> : <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-center"><ShieldAlert className="h-5 w-5 text-zinc-600" /><p className="text-sm text-zinc-400">No rows match this filter.</p></div>}
          <div className="flex gap-2 border-t border-white/[.07] px-5 py-4 text-xs leading-relaxed text-zinc-500 sm:px-6"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" /><p>Rows and results stay in page memory. Export omits original input and complete URLs, but includes hostnames and available provider evidence. Review it before sharing.</p></div>
        </section>
      </>}
    </div>
  );
}

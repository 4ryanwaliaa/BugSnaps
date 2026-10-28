"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Download, ListFilter, LoaderCircle } from "lucide-react";
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
  return <div className="space-y-5">
    <form onSubmit={review}><div className="flex flex-wrap justify-between gap-2"><label htmlFor="batch-links" className="text-sm font-medium">Review up to 100 links</label><span className="text-xs text-zinc-500">One per line • local first</span></div><textarea id="batch-links" value={input} onChange={event => { setInput(event.target.value); clearResults(); }} maxLength={410000} rows={7} autoComplete="off" spellCheck={false} placeholder={"https://example.com\nhxxps://suspicious[.]example/login"} className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-[#080d11] p-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none" /><div className="mt-3 flex flex-wrap items-center gap-4"><button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-[#071319] hover:bg-cyan-200">Review batch <ArrowRight className="h-4 w-4" /></button><p className="text-xs text-zinc-500">Duplicate links are grouped. Defanged addresses are supported.</p><button type="button" onClick={() => { setInput(""); clearResults(); }} className="text-xs text-zinc-400 hover:text-white">Clear batch</button></div></form>
    {error && <p role="alert" className="rounded-xl border border-rose-400/20 p-4 text-sm text-rose-200">{error}</p>}
    {!!rows.length && <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Submitted", submitted], ["Unique links", rows.length], ["Need review", rows.filter(flagged).length], ["Invalid", rows.filter(row => !row.result.ok).length]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="font-mono text-2xl text-zinc-100">{value}</p><p className="mt-1 text-xs text-zinc-500">{label}</p></div>)}</div>
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><p className="text-sm font-medium">Optional: check {hosts.length} unique public hostnames</p><p className="mt-2 text-xs leading-relaxed text-zinc-400">Sends the public hostnames in this batch and your IP address to PhishDestroy in one request. Paths, queries and full links stay here. Private and invalid names are excluded. Results cover domains, not individual pages.</p><button type="button" disabled={busy || cooldown.remaining > 0 || !hosts.length} onClick={check} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-400/30 px-4 text-sm text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-50">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{busy ? "Checking domain list…" : cooldown.remaining ? `Retry in ${cooldown.remaining}s` : "Check batch with PhishDestroy"}</button>{intel && <p role="status" className="mt-3 text-xs leading-relaxed text-zinc-300">Provider request: {intel.status}. Source health: {intel.health.status}. {intel.status === "partial" ? "Some results are missing or invalid; those rows are inconclusive." : "No listing is not a safety verdict."}</p>}</div>
      <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs text-zinc-400"><ListFilter className="h-4 w-4" /> Show<select value={filter} onChange={event => setFilter(event.target.value as typeof filter)} className="min-h-10 rounded-lg border border-white/10 bg-[#101920] px-3 text-zinc-200"><option value="all">All links</option><option value="flagged">Needs review</option><option value="invalid">Invalid input</option></select></label><button type="button" onClick={exportBatch} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-xs text-zinc-200 hover:bg-white/5"><Download className="h-4 w-4" />Export redacted JSON</button></div>
      <div className="overflow-x-auto rounded-xl border border-white/10"><table className="w-full min-w-[600px] text-left text-xs"><caption className="sr-only">Batch review. Listed domains appear first, followed by local warnings. No result establishes safety.</caption><thead className="bg-white/5 text-zinc-400"><tr><th scope="col" className="p-4">Row</th><th scope="col" className="p-4">Destination hostname</th><th scope="col" className="p-4">Local patterns</th><th scope="col" className="p-4">Domain intelligence</th><th scope="col" className="p-4">Review</th></tr></thead><tbody className="divide-y divide-white/5">{visible.map(row => <tr key={row.id} className="align-top"><td className="p-4 text-zinc-500">{row.id}{row.occurrences > 1 ? ` ×${row.occurrences}` : ""}</td><td className="max-w-xs break-all p-4 font-mono text-zinc-200">{row.result.ok ? row.result.hostname.replace(/\./g, "[.]") : row.result.error}</td><td className={`p-4 ${flagged(row) ? "text-amber-200" : "text-zinc-400"}`}>{row.result.ok ? row.result.verdict === "high-risk" ? "High concern" : row.result.verdict === "review" ? "Review" : "No patterns" : "Invalid"}</td><td className={`p-4 ${status(row)?.status === "listed" ? "text-rose-300" : "text-zinc-400"}`}>{status(row)?.status ?? (row.result.ok && !publicHost(row.result.hostname) ? "Not eligible" : intel && intel.status !== "complete" ? "Unavailable" : "Not checked")}</td><td className="p-4">{row.result.ok && <button type="button" onClick={() => row.result.ok && onInspect(row.result)} className="text-cyan-300 underline underline-offset-4" aria-label={`Investigate row ${row.id}`}>Investigate</button>}</td></tr>)}</tbody></table>{!visible.length && <p className="p-5 text-sm text-zinc-500">No rows match this filter.</p>}</div>
      <p className="text-xs leading-relaxed text-zinc-500">Rows and results remain in memory while this page is open. Export omits original input and complete URLs, but includes hostnames and available provider evidence.</p>
    </>}
  </div>;
}

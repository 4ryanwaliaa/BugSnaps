"use client";

import { useEffect, useRef, useState } from "react";
import { Database, LoaderCircle } from "lucide-react";
import { checkPhishDestroy, type PhishDestroyResult } from "@/lib/phishdestroy";

function dateLabel(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleString();
}

export function ThreatCheck({ hostname }: { hostname: string }) {
  const [result, setResult] = useState<PhishDestroyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const current = useRef(true);
  useEffect(() => { current.current = true; return () => { current.current = false; }; }, []);

  async function check() {
    setBusy(true);
    setResult(null);
    const answer = await checkPhishDestroy(hostname);
    if (current.current) { setResult(answer); setBusy(false); }
  }

  const labels: Record<PhishDestroyResult["status"], string> = {
    listed: "Domain found in provider list", unlisted: "No listing found", inconclusive: "Check inconclusive", unavailable: "Provider unavailable", "rate-limited": "Provider rate limit reached",
  };
  const liveness: Record<string, string> = { serving: "Serving at last check", "dns-active": "DNS active at last check", inactive: "Inactive at last check" };
  return (
    <section aria-labelledby="intel-title" className="rounded-2xl border border-cyan-400/15 bg-[#0d171c] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5"><div className="flex max-w-3xl gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[.06] text-cyan-300"><Database className="h-5 w-5" /></span><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-cyan-400">Optional provider lookup</p><h3 id="intel-title" className="mt-2 text-lg font-semibold text-zinc-100">PhishDestroy domain intelligence</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">Look for this hostname in a third-party phishing and scam domain list. This check covers the domain, not the full URL or page content.</p><p className="mt-3 text-xs leading-relaxed text-zinc-400">If you choose to check, your browser sends <strong className="break-all font-medium text-zinc-200">{hostname}</strong> and your IP address directly to PhishDestroy. The path, query and full link are not sent. <a href="https://phishdestroy.io/" className="text-cyan-300 underline underline-offset-2">About the provider</a>.</p></div></div><button type="button" onClick={check} disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-400/30 px-4 text-sm font-medium text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{busy ? "Checking…" : result ? "Check again" : "Check with PhishDestroy"}</button></div>
      {result && <div role="status" className={`mt-5 rounded-xl border p-4 text-sm leading-relaxed ${result.status === "listed" ? "border-rose-400/25 bg-rose-400/[.07] text-rose-200" : "border-white/10 bg-black/20 text-zinc-300"}`}><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{labels[result.status]}</p><span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${result.health.status === "healthy" ? "border-cyan-400/25 text-cyan-300" : "border-amber-400/25 text-amber-300"}`}>Provider {result.health.status}</span></div><p className="mt-2">{result.message}</p><p className="mt-2 text-xs text-zinc-400">No listing does not establish that a link is safe. Provider data can be delayed or incomplete.</p>{result.details && <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-xs sm:grid-cols-2">{result.details.matchedDomain && <div><dt className="text-zinc-500">Provider matched domain</dt><dd className="mt-1 break-all font-mono text-zinc-300">{result.details.matchedDomain}</dd></div>}<div><dt className="text-zinc-500">Source list</dt><dd className="mt-1 break-words text-zinc-300">{result.details.sources.length ? result.details.sources.join(", ") : "Not provided"}</dd></div><div><dt className="text-zinc-500">Last known activity</dt><dd className="mt-1 text-zinc-300">{result.details.liveness ? liveness[result.details.liveness] : "Not provided"}{result.details.livenessCheckedAt ? ` · ${dateLabel(result.details.livenessCheckedAt)}` : ""}</dd></div><div><dt className="text-zinc-500">Provider last sync</dt><dd className="mt-1 text-zinc-300">{dateLabel(result.health.lastSync)}</dd></div><div><dt className="text-zinc-500">Listed since</dt><dd className="mt-1 text-zinc-300">{dateLabel(result.details.listedSince)}</dd></div>{result.details.providerSignals?.length ? <div className="sm:col-span-2"><dt className="text-zinc-500">Provider heuristic signals</dt><dd className="mt-1 text-zinc-300">{result.details.providerSignals.join(", ")}. These are indications, not proof.</dd></div> : null}</dl>}</div>}
    </section>
  );
}

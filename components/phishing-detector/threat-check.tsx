"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDot, Database, LoaderCircle } from "lucide-react";
import { checkPhishDestroy, type PhishDestroyResult } from "@/lib/phishdestroy";
import { useCooldown } from "./investigation-check";

function dateLabel(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleString();
}

export function ThreatCheck({ hostname, onResult }: { hostname: string; onResult: (result: PhishDestroyResult | undefined) => void }) {
  const [result, setResult] = useState<PhishDestroyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const current = useRef(true);
  const cooldown = useCooldown();
  useEffect(() => { current.current = true; return () => { current.current = false; }; }, []);

  async function check() {
    if (busy || cooldown.remaining) return;
    setBusy(true); onResult(undefined);
    setResult(null);
    const answer = await checkPhishDestroy(hostname);
    if (current.current) { setResult(answer); setBusy(false); onResult(answer); cooldown.start(answer.retryAfterSeconds); }
  }

  const labels: Record<PhishDestroyResult["status"], string> = {
    listed: "Domain found in provider list", unlisted: "No listing found", inconclusive: "Check inconclusive", unavailable: "Provider unavailable", "rate-limited": "Provider rate limit reached",
  };
  const liveness: Record<string, string> = { serving: "Serving at last check", "dns-active": "DNS active at last check", inactive: "Inactive at last check" };
  return (
    <section aria-labelledby="intel-title" className="overflow-hidden rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-400/[.065] to-[#0c141b] shadow-[0_18px_55px_-35px_rgba(0,0,0,.8)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-300/10 text-violet-300"><Database aria-hidden="true" className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-violet-300">Threat intelligence</p><span className="rounded-full border border-violet-300/20 bg-violet-300/[.07] px-2.5 py-1 text-[10px] font-semibold text-violet-200">Optional</span></div>
            <h3 id="intel-title" className="mt-2 text-lg font-semibold text-zinc-100">Check domain reputation</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">Look for this hostname in PhishDestroy’s phishing and scam domain lists. This covers the domain, not the full URL or page content.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col items-start gap-4 rounded-xl border border-white/[.07] bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-xs leading-relaxed text-zinc-400">If you choose to check, your browser sends <strong className="break-all font-medium text-zinc-200">{hostname}</strong> and your IP address directly to PhishDestroy. The path, query and full link are not sent. <a href="https://phishdestroy.io/" className="text-violet-300 underline underline-offset-2">About the provider</a> · <a href="https://phishdestroy.io/acceptable-use" className="text-violet-300 underline underline-offset-2">Provider use policy</a>.</p>
          <button type="button" onClick={check} disabled={busy || cooldown.remaining > 0} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-300/30 bg-violet-300/10 px-4 text-sm font-semibold text-violet-200 transition-colors hover:border-violet-300/50 hover:bg-violet-300/20 disabled:opacity-60 sm:w-auto">{busy && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}{busy ? "Checking…" : cooldown.remaining ? `Retry in ${cooldown.remaining}s` : result ? "Check again" : "Check with PhishDestroy"}</button>
        </div>
      </div>
      {result && <div className={`border-t p-5 sm:p-6 ${result.status === "listed" ? "border-rose-400/20 bg-rose-400/[.05]" : "border-white/[.07] bg-black/10"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className={`flex items-center gap-2 text-sm font-semibold ${result.status === "listed" ? "text-rose-200" : "text-zinc-100"}`}><CircleDot aria-hidden="true" className="h-4 w-4 shrink-0" />{labels[result.status]}</p><span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${result.health.status === "healthy" ? "border-cyan-400/25 text-cyan-300" : "border-amber-400/25 text-amber-300"}`}>Provider {result.health.status}</span></div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{result.message}</p><p className="mt-2 text-xs leading-relaxed text-zinc-400">No listing does not establish that a link is safe. Provider data can be delayed or incomplete.</p>
        {result.details && <div className="mt-4 rounded-xl border border-white/[.08] bg-black/20 p-4">
          <p className="text-xs font-semibold text-zinc-300">PhishDestroy {result.details.score?.kind === "heuristic" ? "hostname pattern score" : "reputation risk score"}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{result.details.score ? <>{result.details.score.value}<span className="text-sm font-normal text-zinc-400">{result.details.score.kind === "heuristic" ? " points" : " / 100"}</span></> : <span className="text-base">Not provided</span>}</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">{result.details.score?.kind === "heuristic" ? "These points reflect hostname patterns, not a known listing. They are not a score out of 100." : result.details.score ? "This is the provider’s risk indicator for a listed domain, on a scale of 0 to 100." : "The provider did not supply a numerical score for this result."} A higher number means more provider signals; it is not a probability or a safety rating. A missing score is not zero.</p>
          <p className="mt-2 text-xs text-zinc-500">Source: <a className="text-violet-300 underline underline-offset-2" href="https://phishdestroy.io/">PhishDestroy</a> · Received {dateLabel(result.details.receivedAt)}</p>
        </div>}
        {result.details && <dl className="mt-5 grid gap-4 border-t border-white/[.08] pt-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-zinc-500">Provider check time</dt><dd className="mt-1 text-zinc-200">{dateLabel(result.details.checkedAt)}</dd></div>
          {result.details.matchedDomain && <div><dt className="text-zinc-500">Provider matched domain</dt><dd className="mt-1 break-all font-mono text-zinc-200">{result.details.matchedDomain}</dd></div>}
          <div><dt className="text-zinc-500">Source list</dt><dd className="mt-1 break-words text-zinc-200">{result.details.sources.length ? result.details.sources.join(", ") : "Not provided"}</dd></div>
          <div><dt className="text-zinc-500">Last known activity</dt><dd className="mt-1 text-zinc-200">{result.details.liveness ? liveness[result.details.liveness] : "Not provided"}{result.details.livenessCheckedAt ? ` · ${dateLabel(result.details.livenessCheckedAt)}` : ""}</dd></div>
          <div><dt className="text-zinc-500">Provider last sync</dt><dd className="mt-1 text-zinc-200">{dateLabel(result.health.lastSync)}</dd></div>
          <div><dt className="text-zinc-500">Listed since</dt><dd className="mt-1 text-zinc-200">{dateLabel(result.details.listedSince)}</dd></div>
          {result.details.providerSignals?.length ? <div className="sm:col-span-2"><dt className="text-zinc-500">Provider heuristic signals</dt><dd className="mt-1 text-zinc-200">{result.details.providerSignals.join(", ")}. These are indications, not proof.</dd></div> : null}
        </dl>}
      </div>}
    </section>
  );
}

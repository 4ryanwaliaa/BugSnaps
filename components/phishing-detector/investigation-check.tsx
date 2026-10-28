"use client";

import { useEffect, useRef, useState } from "react";
import { Fingerprint, LoaderCircle } from "lucide-react";
import { investigateDomain, type Investigation } from "@/lib/phishlens-intel";

export function useCooldown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!until) return;
    const timer = setInterval(() => { const time = Date.now(); setNow(time); if (time >= until) setUntil(0); }, 1000);
    return () => clearInterval(timer);
  }, [until]);
  return { remaining: Math.max(0, Math.ceil((until - now) / 1000)), start: (seconds?: number) => { if (seconds) { const time = Date.now(); setNow(time); setUntil(time + seconds * 1000); } } };
}

export function InvestigationCheck({ hostname, onResult }: { hostname: string; onResult: (result: Investigation | undefined) => void }) {
  const [result, setResult] = useState<Investigation>();
  const [busy, setBusy] = useState(false);
  const current = useRef(true);
  const cooldown = useCooldown();
  useEffect(() => { current.current = true; return () => { current.current = false; }; }, []);
  async function investigate() {
    if (busy || cooldown.remaining) return;
    setBusy(true); setResult(undefined); onResult(undefined);
    const answer = await investigateDomain(hostname);
    if (!current.current) return;
    setResult(answer); onResult(answer); setBusy(false); cooldown.start(answer.retryAfterSeconds);
  }
  const data = result?.evidence;
  return <section aria-labelledby="deep-title" className="rounded-2xl border border-violet-400/20 bg-[#12131e] p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="flex max-w-3xl gap-3"><Fingerprint className="mt-1 h-6 w-6 shrink-0 text-violet-300" /><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-violet-300">Domain investigation</p><h3 id="deep-title" className="mt-2 text-lg font-semibold">Go beyond the blocklist</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">Request registration, infrastructure and related-domain evidence from PhishDestroy. Availability varies by domain. Predictions are shown separately from listings.</p><p className="mt-3 text-xs leading-relaxed text-zinc-400">Shares <strong className="break-all text-zinc-200">{hostname}</strong> and your IP address with PhishDestroy. The provider may query DNS and registry RDAP services. Your full link is not sent, and PhishLens does not visit the website.</p></div></div>
      <button type="button" disabled={busy || cooldown.remaining > 0} onClick={investigate} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-violet-400/30 px-4 text-sm font-medium text-violet-200 hover:bg-violet-400/10 disabled:opacity-50">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{busy ? "Gathering evidence…" : cooldown.remaining ? `Retry in ${cooldown.remaining}s` : result ? "Refresh investigation" : "Investigate with PhishDestroy"}</button>
    </div>
    {result && <div role="status" className="mt-5 space-y-4 border-t border-white/10 pt-5">
      <div className="flex flex-wrap justify-between gap-3 text-sm"><p className="text-zinc-300">{result.message}</p><span className="text-xs text-zinc-400">Provider: {result.health.status}</span></div>
      {data && <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs text-zinc-500">Blocklist observation</p><p className={`mt-2 font-medium ${data.listed ? "text-rose-300" : "text-zinc-200"}`}>{data.listed ? "Threat listing reported" : "No threat listing reported"}</p><p className="mt-2 text-xs text-zinc-500">{data.checkedAt ? new Date(data.checkedAt).toLocaleString() : "Provider timestamp unavailable"}</p></div>
          <div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs text-zinc-500">Provider prediction • not a probability</p><p className="mt-2 font-medium text-amber-200">{data.prediction ? `${data.prediction.risk} concern` : "No prediction supplied"}</p><p className="mt-2 text-xs leading-relaxed text-zinc-500">A prediction is not a confirmed listing. Low or no concern does not establish safety.</p></div>
          <div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs text-zinc-500">Registration reported by provider</p><p className="mt-2 text-sm text-zinc-200">{data.registration?.created ?? "Creation date unavailable"}</p><p className="mt-2 break-words text-xs text-zinc-400">{data.registration?.registrar ?? "Registrar unavailable"}</p><p className="mt-2 text-xs text-zinc-500">Source: {data.registration?.source === "rdap" ? "Registry RDAP via PhishDestroy" : data.registration ? "PhishDestroy intel record" : "Not supplied"}. Registration does not verify ownership.</p></div>
        </div>
        {!!data.prediction?.signals.length && <ul className="grid gap-2 sm:grid-cols-2">{data.prediction.signals.map(signal => <li key={signal} className="rounded-lg border border-amber-400/15 bg-amber-400/5 p-3 text-sm text-amber-100">{signal}</li>)}</ul>}
        <div className="grid gap-4 lg:grid-cols-2"><div className="min-w-0 rounded-xl border border-white/10 p-4"><h4 className="text-sm font-medium">Infrastructure observations</h4><p className="mt-2 text-xs leading-relaxed text-zinc-500">Source: {data.infrastructure?.source === "live_dns" ? "Provider DNS lookup" : data.infrastructure ? "Provider intel record" : "Unavailable"}. Shared IPs and hosting are common and do not establish guilt by association.</p><ul className="mt-3 space-y-1 font-mono text-xs text-zinc-300">{data.infrastructure?.addresses.length ? data.infrastructure.addresses.map(ip => <li key={ip} className="break-all">{ip}</li>) : <li>No IP evidence supplied</li>}</ul>{data.infrastructure?.sharedPlatform && <p className="mt-3 text-xs text-amber-200">Shared hosting or proxy platform reported.</p>}{data.infrastructure?.relatedCount !== undefined && <p className="mt-2 text-xs text-zinc-400">Provider reports {data.infrastructure.relatedCount} listed domains associated with an IP.</p>}</div>
        <div className="min-w-0 rounded-xl border border-white/10 p-4"><h4 className="text-sm font-medium">Related indicators</h4><p className="mt-2 text-xs text-zinc-500">Up to 12 provider leads. Similarity does not establish a shared operator. Indicators are defanged and never linked.</p><ul className="mt-3 space-y-3">{data.related.length ? data.related.map((item, index) => <li key={`${item.hostname}-${index}`}><p className="break-all font-mono text-xs text-zinc-200">{item.hostname.replace(/\./g, "[.]")}</p><p className="mt-1 text-xs text-zinc-500">{item.relation}{item.detectedAt ? ` · ${new Date(item.detectedAt).toLocaleDateString()}` : ""}</p></li>) : <li className="text-sm text-zinc-400">No related indicators supplied.</li>}</ul></div></div>
      </>}
      {result.health.status !== "healthy" && <p className="text-xs leading-relaxed text-amber-200">Provider freshness is {result.health.status}. Missing evidence may reflect incomplete or delayed data. Last full sync: {result.health.fullSyncAt ? new Date(result.health.fullSyncAt).toLocaleString() : "not supplied"}.</p>}
    </div>}
  </section>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDot, Globe2, LoaderCircle } from "lucide-react";
import { checkCloudflareDns, type DnsCheckResult } from "@/lib/phishlens-dns";

export function DnsCheck({ hostname, onResult }: { hostname: string; onResult: (result: DnsCheckResult | undefined) => void }) {
  const [status, setStatus] = useState<DnsCheckResult | null>(null);
  const [busy, setBusy] = useState(false);
  const current = useRef(true);
  useEffect(() => { current.current = true; return () => { current.current = false; }; }, []);

  async function check() {
    if (busy) return;
    setBusy(true); onResult(undefined);
    setStatus(null);
    const result = await checkCloudflareDns(hostname);
    if (current.current) { setStatus(result); setBusy(false); onResult(result); }
  }

  const label = status?.status === "filtered" ? "Cloudflare DNS filter signal" : status?.status === "unlisted" ? "No DNS filter signal observed" : status?.status === "inconclusive" ? "DNS check inconclusive" : "DNS check unavailable";
  return (
    <section aria-labelledby="dns-check-title" className="overflow-hidden rounded-2xl border border-white/[.09] bg-[#0c141b]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.07] text-cyan-300"><Globe2 aria-hidden="true" className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-cyan-300">DNS filtering</p><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400">Optional</span></div>
            <h3 id="dns-check-title" className="mt-2 text-lg font-semibold text-zinc-100">Check with Cloudflare DNS</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">See whether Cloudflare’s malware-filtering DNS returns a block signal for this hostname. This is a domain-level check, not a full URL or page scan.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col items-start gap-4 border-t border-white/[.07] pt-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-xs leading-relaxed text-zinc-400">If you choose to check, your browser sends <strong className="break-all font-medium text-zinc-200">{hostname}</strong> and your IP address to Cloudflare. The path, query and full link are not sent. DNS resolution may also involve the domain’s authoritative DNS provider. <a href="https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/" className="text-cyan-300 underline underline-offset-2">Cloudflare privacy</a>.</p>
          <button type="button" onClick={check} disabled={busy} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[.06] px-4 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-300/10 disabled:opacity-60 sm:w-auto">{busy && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}{busy ? "Checking DNS…" : status ? "Check again" : "Check with Cloudflare"}</button>
        </div>
      </div>
      {status && <div className={`border-t p-5 sm:p-6 ${status.status === "filtered" ? "border-rose-400/20 bg-rose-400/[.05]" : "border-white/[.07] bg-black/10"}`}><p role="status" className={`flex items-center gap-2 text-sm font-semibold ${status.status === "filtered" ? "text-rose-200" : "text-zinc-100"}`}><CircleDot aria-hidden="true" className="h-4 w-4 shrink-0" />{label}</p><p className="mt-3 text-sm leading-relaxed text-zinc-300">{status.message}</p></div>}
    </section>
  );
}

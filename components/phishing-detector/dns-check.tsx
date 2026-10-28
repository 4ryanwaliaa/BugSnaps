"use client";

import { useEffect, useRef, useState } from "react";
import { Globe2, LoaderCircle } from "lucide-react";
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

  return (
    <section aria-labelledby="dns-check-title" className="rounded-xl border border-cyan-400/15 bg-cyan-400/[.035] p-4 sm:p-5">
      <div className="flex gap-3"><Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" /><div className="min-w-0"><h3 id="dns-check-title" className="text-sm font-semibold text-zinc-100">Optional: check Cloudflare DNS filtering</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">Check whether Cloudflare’s malware-filtering DNS returns a block signal for this hostname. This is a domain-level check, not a full URL or page scan.</p><p className="mt-2 text-xs leading-relaxed text-zinc-400">If you choose to check, your browser sends <strong className="break-all font-medium text-zinc-200">{hostname}</strong> and your IP address to Cloudflare. The path, query and full link are not sent. DNS resolution may also involve the domain’s authoritative DNS provider. <a href="https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/" className="text-cyan-300 underline underline-offset-2">Cloudflare privacy</a>.</p>
      <button type="button" onClick={check} disabled={busy} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-400/30 px-4 text-sm font-medium text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />} {busy ? "Checking DNS…" : status ? "Check again" : "Check hostname with Cloudflare"}</button>
      {status && <div role="status" className={`mt-4 rounded-lg border p-3 text-sm leading-relaxed ${status.status === "filtered" ? "border-rose-400/25 bg-rose-400/[.07] text-rose-200" : "border-white/10 bg-black/20 text-zinc-300"}`}><p className="font-semibold">{status.status === "filtered" ? "Cloudflare DNS filter signal" : status.status === "unlisted" ? "No DNS filter signal observed" : status.status === "inconclusive" ? "DNS check inconclusive" : "DNS check unavailable"}</p><p className="mt-1">{status.message}</p></div>}
      </div></div>
    </section>
  );
}

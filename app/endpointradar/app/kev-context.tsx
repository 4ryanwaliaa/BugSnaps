"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Globe2 } from "lucide-react";

type Catalog = { released: string; entries: { id: string; name: string; vendor: string; added: string }[] };
const source = "https://www.cisa.gov/known-exploited-vulnerabilities-catalog";

export function KevContext() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/endpointradar/api/kev", { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => setCatalog(data))
      .catch(() => { if (!controller.signal.aborted) setUnavailable(true); });
    return () => controller.abort();
  }, []);
  const releaseDate = catalog && new Date(catalog.released);
  return <section className="rounded-2xl border border-white/[0.08] bg-[#10141d] p-5" aria-labelledby="kev-title">
    <h2 id="kev-title" className="flex items-center gap-2 text-sm font-semibold"><Globe2 size={17} className="text-blue-400"/> CISA exploited vulnerabilities</h2>
    <p className="mt-2 text-xs leading-5 text-zinc-400">Recent catalog additions for general awareness. These are not matched to this endpoint and do not indicate that it is affected.</p>
    {catalog ? <><p className="mt-4 text-xs text-zinc-500">Catalog released: {releaseDate && !Number.isNaN(releaseDate.getTime()) ? releaseDate.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : catalog.released}</p><ul className="mt-3 divide-y divide-white/[0.06]">{catalog.entries.map(item => <li key={item.id} className="py-3"><p className="text-xs font-semibold text-blue-300">{item.id}</p><p className="mt-1 text-xs leading-5 text-zinc-300">{item.name || item.vendor}</p><p className="mt-1 text-[11px] text-zinc-500">Added {item.added}</p></li>)}</ul></> : <p className="mt-4 text-xs text-zinc-500" role="status">{unavailable ? "Catalog temporarily unavailable. Visit CISA for the latest entries." : "Loading CISA catalog…"}</p>}
    <a href={source} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300">View CISA catalog <ArrowUpRight size={14}/></a>
  </section>;
}

import type { Metadata } from "next";
import { ArrowUpRight, Binary, Eye, Globe2, LockKeyhole, ScanSearch, ShieldAlert } from "lucide-react";
import { Breadcrumbs, JsonLd, Section, SiteShell } from "@/components/site/page-parts";
import { PhishLensWorkspace } from "@/components/phishing-detector/workspace";
import { ORG_ID, SITE_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "PhishLens - Phishing Link Investigation",
  description: "Investigate suspicious links individually or in batches of 100. Review domain boundaries, threat intelligence, registration and DNS evidence, then export redacted reports.",
  path: "/phishing-detector",
});

const layers = [
  { icon: ScanSearch, label: "01 / TRIAGE", title: "One link or a hundred", detail: "Review URLs and defanged indicators locally. Group duplicate links, identify domain boundaries and prioritize warning signals." },
  { icon: Globe2, label: "02 / INVESTIGATE", title: "Follow the evidence", detail: "Request domain listings, registration, infrastructure and related indicators from PhishDestroy. Add an independent Cloudflare DNS observation." },
  { icon: Binary, label: "03 / REPORT", title: "Keep an evidence record", detail: "Export JSON or Markdown with findings, provider observations, timestamps and missing coverage. Full URLs and queries stay out of the report." },
];

export default function PhishingDetectorPage() {
  return (
    <SiteShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "PhishLens", applicationCategory: "SecurityApplication", operatingSystem: "Web", url: `${SITE_URL}/phishing-detector`, description: "A free browser-based tool for examining URL warning signs.", publisher: { "@id": ORG_ID }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }} />
      <div className="relative overflow-hidden border-b border-white/[.07] bg-[#090d11]">
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[600px] rounded-full bg-cyan-500/[.08] blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-16 sm:px-8 sm:pt-36 lg:px-10">
          <Breadcrumbs items={[{ name: "Products", path: "/products" }, { name: "PhishLens", path: "/phishing-detector" }]} />
          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] pb-5">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.2em] text-cyan-300"><Eye className="h-4 w-4" /> PhishLens <span className="text-zinc-600">/</span> BugSnaps</p>
            <div className="flex items-center gap-2 text-xs text-zinc-400"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Free investigation workspace</div>
          </div>
          <div className="grid gap-6 pt-9 pb-9 lg:grid-cols-[1fr_.65fr] lg:items-end">
            <div><h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Investigate the link.<br /><span className="text-zinc-400">Understand the risk.</span></h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">Turn a suspicious address into a clear, evidence-led review. See where it points and the signals worth checking before you interact.</p></div>
            <p className="flex gap-3 text-sm leading-relaxed text-zinc-400 lg:justify-self-end lg:max-w-xs"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> Your initial review runs locally. External checks are optional and explain what they share.</p>
          </div>
          <PhishLensWorkspace />
        </div>
      </div>
      <Section labelledBy="how-title">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[11px] uppercase tracking-[.2em] text-cyan-400">The investigation</p><h2 id="how-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A clearer way to review a link.</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted">The evidence behind the result is visible at every step.</p></div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">{layers.map(({ icon: Icon, label, title, detail }) => <article key={label} className="rounded-2xl border border-white/[.08] bg-surface p-6"><div className="flex items-center justify-between gap-4"><span className="font-mono text-[10px] tracking-[.14em] text-zinc-500">{label}</span><Icon className="h-5 w-5 text-cyan-400" /></div><h3 className="mt-7 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{detail}</p></article>)}</div>
      </Section>
      <Section labelledBy="limits-title" className="border-t border-white/[.07] bg-surface/40">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-cyan-400">Know the boundaries</p><h2 id="limits-title" className="mt-4 text-3xl font-semibold tracking-tight">Evidence is not a guarantee.</h2></div><div className="space-y-4 text-sm leading-relaxed text-muted"><p>URL patterns are clues, not proof. Dangerous links can look ordinary, and legitimate links can trigger warnings. The optional PhishDestroy and Cloudflare checks cover domains, not complete URL reputation or page contents. Provider results may be unavailable, incomplete or outdated.</p><p>PhishLens does not visit the destination, follow redirects, inspect page content, or verify who owns a domain. If a message is unexpected, contact the sender through a known channel or navigate to the service using an address you already trust.</p><div className="flex flex-wrap gap-x-6 gap-y-3"><a href="https://github.com/4ryanwalia/Phishing-detection" className="inline-flex items-center gap-2 font-medium text-cyan-400 hover:underline">Original research <ArrowUpRight className="h-4 w-4" /></a><a href="/privacy" className="inline-flex items-center gap-2 font-medium text-cyan-400 hover:underline">Privacy policy <ArrowUpRight className="h-4 w-4" /></a></div></div></div>
      </Section>
    </SiteShell>
  );
}

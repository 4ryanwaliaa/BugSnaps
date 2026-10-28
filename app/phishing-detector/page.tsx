import type { Metadata } from "next";
import { ArrowUpRight, Binary, Eye, FileSearch, LockKeyhole, ScanSearch, ShieldCheck, Waypoints } from "lucide-react";
import { Breadcrumbs, JsonLd, Section, SiteShell } from "@/components/site/page-parts";
import { PhishLensWorkspace } from "@/components/phishing-detector/workspace";
import { ORG_ID, SITE_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "PhishLens - Phishing Link Investigation",
  description: "Investigate suspicious links individually or in batches of 100. Review domain boundaries, threat intelligence, registration and DNS evidence, then export redacted reports.",
  path: "/phishing-detector",
});

const layers = [
  { icon: ScanSearch, label: "01", title: "Read the link", detail: "Review URL structures, domain boundaries and embedded destinations locally, one at a time or in batches of 100." },
  { icon: Waypoints, label: "02", title: "Add context", detail: "Choose whether to check domain intelligence, registration and infrastructure, or Cloudflare DNS filtering." },
  { icon: Binary, label: "03", title: "Keep the evidence", detail: "Review the signals and their limits, then export a report that omits the complete URL and its query." },
];

export default function PhishingDetectorPage() {
  return (
    <SiteShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "PhishLens", applicationCategory: "SecurityApplication", operatingSystem: "Web", url: `${SITE_URL}/phishing-detector`, description: "A free browser-based tool for examining URL warning signs.", publisher: { "@id": ORG_ID }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }} />
      <div className="relative isolate overflow-hidden border-b border-white/[.07] bg-[#080d11]">
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-35" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_70%_0%,rgba(38,155,166,0.13),transparent_58%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[-15rem] top-24 h-[34rem] w-[34rem] rounded-full border border-cyan-300/[.045]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[-10rem] top-44 h-[24rem] w-[24rem] rounded-full border border-cyan-300/[.04]" />

        <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-12 sm:px-8 sm:pt-28 sm:pb-16 lg:px-10">
          <Breadcrumbs items={[{ name: "Products", path: "/products" }, { name: "PhishLens", path: "/phishing-detector" }]} />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 sm:mt-10">
            <div className="inline-flex items-center gap-2.5 text-cyan-300"><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[.07]"><Eye className="h-4 w-4" aria-hidden="true" /></span><span className="font-mono text-[10px] font-medium uppercase tracking-[.2em]">PhishLens <span className="text-zinc-600">/</span> by BugSnaps</span></div>
            <span className="rounded-full border border-white/[.09] bg-white/[.025] px-3 py-1.5 text-xs text-zinc-400">Free to use <span className="mx-1.5 text-zinc-700">·</span> No account required</span>
          </div>

          <div className="grid gap-7 pb-8 pt-7 sm:pb-10 sm:pt-8 lg:grid-cols-[1fr_19rem] lg:items-end lg:gap-12">
            <div>
              <h1 className="max-w-3xl text-[2.4rem] font-semibold leading-[1.06] tracking-[-.04em] text-zinc-50 sm:text-5xl lg:text-[3.65rem]">See beyond <span className="text-cyan-200">the link.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">Investigate a suspicious address, uncover the signals behind it, and decide what to check next.</p>
            </div>
            <div className="hidden border-l border-cyan-300/20 pl-5 lg:block"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-cyan-300/80">Privacy by choice</p><p className="mt-2 text-sm leading-relaxed text-zinc-400">The initial review stays in your browser. External checks happen only when you choose them.</p></div>
          </div>

          <PhishLensWorkspace />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-1 text-xs text-zinc-500"><p className="inline-flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5 text-cyan-400/80" aria-hidden="true" /> Local review first. Optional checks explain what they share.</p><p className="inline-flex items-center gap-2"><FileSearch className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" /> Evidence to guide your next step</p></div>
        </div>
      </div>

      <Section labelledBy="how-title" className="bg-[#0a0e12]">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-cyan-400">A closer look</p><h2 id="how-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From link to context.</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted">A focused workflow for reviewing the details that are easy to miss.</p></div>
        <div className="mt-9 grid overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1419] md:grid-cols-3">{layers.map(({ icon: Icon, label, title, detail }, index) => <article key={label} className={`p-6 sm:p-7 ${index ? "border-t border-white/[.08] md:border-l md:border-t-0" : ""}`}><div className="flex items-center justify-between gap-4"><span className="font-mono text-xs text-zinc-500">{label} <span className="ml-1 text-zinc-700">/ 03</span></span><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.05] text-cyan-300"><Icon className="h-4 w-4" aria-hidden="true" /></span></div><h3 className="mt-7 text-lg font-semibold text-zinc-100">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{detail}</p></article>)}</div>
      </Section>

      <Section labelledBy="limits-title" className="border-t border-white/[.07] bg-[#080d11]">
        <div className="grid gap-9 lg:grid-cols-[.8fr_1.2fr] lg:gap-16"><div><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.05] text-cyan-300"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span><p className="mt-6 font-mono text-[10px] uppercase tracking-[.2em] text-cyan-400">Know the boundaries</p><h2 id="limits-title" className="mt-3 max-w-sm text-3xl font-semibold tracking-tight">Evidence helps. It doesn’t guarantee safety.</h2></div><div className="space-y-4 text-sm leading-7 text-zinc-400"><p>URL patterns are clues, not proof. Dangerous links can look ordinary, and legitimate links can trigger warnings. The optional PhishDestroy and Cloudflare checks cover domains, not complete URL reputation or page contents. Provider results may be unavailable, incomplete or outdated.</p><p>PhishLens does not visit the destination, follow redirects, inspect page content, or verify who owns a domain. If a message is unexpected, contact the sender through a known channel or navigate to the service using an address you already trust.</p><div className="flex flex-wrap gap-x-6 gap-y-3 pt-2"><a href="https://github.com/4ryanwalia/Phishing-detection" className="inline-flex items-center gap-2 font-medium text-cyan-300 hover:text-cyan-200 hover:underline">Original research <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a><a href="/privacy" className="inline-flex items-center gap-2 font-medium text-cyan-300 hover:text-cyan-200 hover:underline">Privacy policy <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></div></div></div>
      </Section>
    </SiteShell>
  );
}

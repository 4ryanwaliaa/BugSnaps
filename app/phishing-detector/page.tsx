import type { Metadata } from "next";
import { ArrowUpRight, Binary, Eye, FileSearch, LockKeyhole, ScanSearch, ShieldAlert, Sparkles, Waypoints } from "lucide-react";
import { Breadcrumbs, JsonLd, Section, SiteShell } from "@/components/site/page-parts";
import { PhishLensWorkspace } from "@/components/phishing-detector/workspace";
import { ORG_ID, SITE_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "PhishLens - Phishing Link Investigation",
  description: "Investigate suspicious links individually or in batches of 100. Review domain boundaries, threat intelligence, registration and DNS evidence, then export redacted reports.",
  path: "/phishing-detector",
});

const layers = [
  { icon: ScanSearch, label: "01", title: "Read the link", detail: "Review URL structures, domain boundaries and embedded destinations locally, one at a time or in batches of 100.", color: "text-emerald-300", surface: "border-emerald-400/20 bg-emerald-400/10" },
  { icon: Waypoints, label: "02", title: "Add context", detail: "Choose whether to check domain intelligence, registration and infrastructure, or Cloudflare DNS filtering.", color: "text-sky-300", surface: "border-sky-400/20 bg-sky-400/10" },
  { icon: Binary, label: "03", title: "Keep the evidence", detail: "Review the signals and their limits, then export a report that omits the complete URL and its query.", color: "text-violet-300", surface: "border-violet-400/20 bg-violet-400/10" },
];

export default function PhishingDetectorPage() {
  return (
    <SiteShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "PhishLens", applicationCategory: "SecurityApplication", operatingSystem: "Web", url: `${SITE_URL}/phishing-detector`, description: "A free tool for investigating suspicious links.", publisher: { "@id": ORG_ID }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }} />
      <div className="relative isolate overflow-hidden border-b border-white/[.07] bg-[#080e11]">
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[620px] rounded-full bg-emerald-500/[.11] blur-[140px]" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[-10%] h-[340px] w-[450px] rounded-full bg-indigo-500/[.08] blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-12 sm:px-8 sm:pt-28 sm:pb-16 lg:px-10">
          <Breadcrumbs items={[{ name: "Products", path: "/products" }, { name: "PhishLens", path: "/phishing-detector" }]} />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 sm:mt-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[.07] px-3 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-emerald-300"><Eye className="h-4 w-4" aria-hidden="true" /> PhishLens · by BugSnaps</p>
            <span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-2 text-xs text-zinc-300">Free to use <span className="mx-1.5 text-zinc-600">·</span> No account required</span>
          </div>
          <div className="grid gap-6 pb-8 pt-7 sm:pb-10 sm:pt-8 lg:grid-cols-[1fr_21rem] lg:items-end lg:gap-12">
            <div><h1 className="max-w-3xl text-[2.4rem] font-semibold leading-[1.06] tracking-[-.04em] text-zinc-50 sm:text-5xl lg:text-[3.65rem]">Look closer <span className="text-emerald-300">before you click.</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">A suspicious link deserves a second look. Unpack the address, explore the evidence, and make a more informed next move.</p></div>
            <div className="flex gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[.05] p-4 text-sm leading-relaxed text-zinc-400"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" /><p>Your initial review stays in your browser. External checks run only when you choose them.</p></div>
          </div>
          <PhishLensWorkspace />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-1 text-xs text-zinc-400"><p className="inline-flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> Local review first. Optional checks explain what they share.</p><p className="inline-flex items-center gap-2"><FileSearch className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" /> Evidence to guide your next step</p></div>
        </div>
      </div>
      <Section labelledBy="how-title">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-emerald-400">A clearer first look</p><h2 id="how-title" className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">A little more context for an unfamiliar link.</h2></div><p className="max-w-sm text-sm leading-relaxed text-zinc-400">A focused workflow for reviewing details that are easy to miss.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">{layers.map(({ icon: Icon, label, title, detail, color, surface }) => <article key={label} className="rounded-2xl border border-white/[.08] bg-gradient-to-b from-white/[.045] to-white/[.015] p-6"><div className="flex items-center justify-between"><span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${surface} ${color}`}><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="font-mono text-xs text-zinc-500">{label} / 03</span></div><h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-zinc-400">{detail}</p></article>)}</div>
      </Section>
      <Section labelledBy="limits-title" className="border-t border-white/[.07] bg-[#0d1115]">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-amber-400/15 bg-gradient-to-br from-amber-400/[.07] to-transparent p-7 sm:p-9"><ShieldAlert className="h-6 w-6 text-amber-300" aria-hidden="true" /><p className="mt-6 font-mono text-xs uppercase tracking-[.2em] text-amber-300">Know the boundaries</p><h2 id="limits-title" className="mt-4 text-3xl font-semibold tracking-tight">Evidence helps. It doesn’t guarantee safety.</h2><p className="mt-4 text-sm leading-relaxed text-zinc-400">URL patterns are clues, not proof. Dangerous links can look ordinary, and legitimate links can trigger warnings. The optional PhishDestroy and Cloudflare checks cover domains, not complete URL reputation or page contents. Provider results may be unavailable, incomplete or outdated.</p></div>
          <div className="flex flex-col justify-between rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-400/[.07] to-transparent p-7 sm:p-9"><div><Sparkles className="h-6 w-6 text-violet-300" aria-hidden="true" /><p className="mt-6 font-mono text-xs uppercase tracking-[.2em] text-violet-300">Stay a step ahead</p><h3 className="mt-4 text-2xl font-semibold tracking-tight">When in doubt, go directly.</h3><p className="mt-4 text-sm leading-relaxed text-zinc-400">PhishLens does not visit the destination, follow redirects, inspect page content, or verify domain ownership. If a message is unexpected, contact the sender through a known channel or navigate to the service using an address you already trust.</p></div><div className="mt-7 flex flex-wrap gap-x-6 gap-y-3"><a href="https://github.com/4ryanwalia/Phishing-detection" className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200">Original research <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a><a href="/privacy" className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200">Privacy policy <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></div></div>
        </div>
      </Section>
    </SiteShell>
  );
}

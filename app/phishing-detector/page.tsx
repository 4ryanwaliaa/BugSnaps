import type { Metadata } from "next";
import { ArrowUpRight, Eye, LockKeyhole, ShieldAlert } from "lucide-react";
import { Breadcrumbs, JsonLd, Section, SiteShell } from "@/components/site/page-parts";
import { PhishLensWorkspace } from "@/components/phishing-detector/workspace";
import { ORG_ID, SITE_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "PhishLens - Free Phishing URL Checker",
  description: "Inspect a suspicious link for phishing warning signs with PhishLens, a free, private browser-based URL checker by BugSnaps.",
  path: "/phishing-detector",
});

export default function PhishingDetectorPage() {
  return (
    <SiteShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "PhishLens", applicationCategory: "SecurityApplication", operatingSystem: "Web", url: `${SITE_URL}/phishing-detector`, description: "A free browser-based tool for examining URL warning signs.", publisher: { "@id": ORG_ID }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }} />
      <div className="relative overflow-hidden border-b border-white/[.07]">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />
        <div aria-hidden="true" className="absolute -top-28 right-0 h-[450px] w-[500px] rounded-full bg-cyan-500/[.08] blur-[130px]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:px-8">
          <Breadcrumbs items={[{ name: "Products", path: "/products" }, { name: "PhishLens", path: "/phishing-detector" }]} />
          <div className="mt-9 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:gap-14">
            <div className="lg:sticky lg:top-28">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[.2em] text-cyan-400"><Eye className="h-4 w-4" /> PhishLens · by BugSnaps</p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">Look closer before you click.</h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">A suspicious link deserves a second look. Inspect its destination and common warning signs in seconds.</p>
              <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-zinc-300"><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Free to use</span><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">No account</span><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Runs in your browser</span></div>
              <p className="mt-8 flex max-w-md gap-3 text-sm leading-relaxed text-muted"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> The initial inspection stays in your browser. An optional DNS check shares only the hostname with Cloudflare.</p>
            </div>
            <PhishLensWorkspace />
          </div>
        </div>
      </div>
      <Section labelledBy="understand-title">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-cyan-400">A clearer first look</p><h2 id="understand-title" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Understand what the link is telling you.</h2></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-white/[.08] bg-surface p-6"><Eye className="h-5 w-5 text-cyan-400" /><h3 className="mt-5 font-semibold">See the real host</h3><p className="mt-2 text-sm leading-relaxed text-muted">Find the destination hostname, even when a link tries to hide it behind misleading text.</p></div><div className="rounded-2xl border border-white/[.08] bg-surface p-6"><ShieldAlert className="h-5 w-5 text-cyan-400" /><h3 className="mt-5 font-semibold">Review the signals</h3><p className="mt-2 text-sm leading-relaxed text-muted">Get plain-language explanations of patterns worth a closer look, and decide what to do next.</p></div></div></div>
      </Section>
      <Section labelledBy="limits-title" className="border-t border-white/[.07] bg-surface/40">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-cyan-400">Use with care</p><h2 id="limits-title" className="mt-4 text-3xl font-semibold tracking-tight">A useful signal, not a safety guarantee.</h2></div><div className="space-y-4 text-sm leading-relaxed text-muted"><p>PhishLens checks the structure and text of a URL in your browser. You can also choose to check the hostname using Cloudflare’s malware-filtering DNS resolver. This is a domain-level signal, not a full URL reputation check. PhishLens does not visit the page, follow redirects, or verify who owns a domain. Dangerous links can look ordinary, and legitimate links can trigger warnings.</p><p>If a message is unexpected, contact the sender through a known channel or navigate to the service using an address you already trust. Never enter a password or payment details just because a link looks convincing.</p><a href="https://github.com/4ryanwalia/Phishing-detection" className="inline-flex items-center gap-2 font-medium text-cyan-400 hover:underline">Explore the original research <ArrowUpRight className="h-4 w-4" /></a></div></div>
      </Section>
    </SiteShell>
  );
}

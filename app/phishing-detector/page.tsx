
import { SketchUnderline } from "@/components/ui/sketch-underline";
import { ProductReading } from "@/components/site/product-reading";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "@/components/site/content-link";
import { ArrowDown, ArrowUpRight, Binary, Eye, LockKeyhole, ScanSearch, ShieldAlert, Sparkles, Waypoints } from "lucide-react";
import { Breadcrumbs, JsonLd, Section, SiteShell } from "@/components/site/page-parts";
import { ORG_ID, SITE_URL, faqJsonLd, pageMetadata } from "@/lib/site";

const PhishLensWorkspace = dynamic(
  () => import("@/components/phishing-detector/workspace").then((m) => m.PhishLensWorkspace),
  {
    loading: () => (
      <div className="min-h-[340px] rounded-3xl border border-white/10 bg-[#0d1419]/80 p-6 text-sm text-zinc-400">
        Loading interactive URL inspector…
      </div>
    ),
  },
);

export const metadata: Metadata = pageMetadata({
  title: "Free Phishing Link Checker | PhishLens",
  description: "Check a suspicious link without opening it. PhishLens reviews URL warning signs in your browser, with optional domain checks. Free, no sign-up.",
  path: "/phishing-detector",
});

const faqs = [
  { question: "How can I check a suspicious link without opening it?", answer: "Copy the link address and paste it into PhishLens. The browser-based checker examines the URL text and highlights warning signs without visiting the destination. Verify unexpected requests through a known contact or the official app." },
  { question: "Does a phishing link checker prove a URL is safe?", answer: "No. A URL can look ordinary and still lead to a phishing page. The local check does not visit the destination or follow redirects. Optional external domain, reputation and DNS checks provide additional signals only when you choose them. Treat highlighted patterns as investigation leads and do not enter credentials based on a clean result." },
  { question: "Should I submit a password reset link to a public URL checker?", answer: "Keep reset links, private invitations and sign-in links out of public lookup services. They can contain a token that grants access. If the message is unexpected, open the official app or use a trusted bookmark to verify the request." },
  { question: "Can an HTTPS link still be phishing?", answer: "Yes. HTTPS protects the connection to a hostname; it does not establish that the site or sender is trustworthy. Check the actual hostname and verify the request independently before entering passwords or payment details." },
];

const layers = [
  { icon: ScanSearch, label: "01", title: "Read the link", detail: "Review URL structures, domain boundaries and embedded destinations locally, one at a time or in batches of 100.", color: "text-emerald-300", surface: "border-emerald-400/20 bg-emerald-400/10" },
  { icon: Waypoints, label: "02", title: "Add context", detail: "Choose whether to check domain intelligence, registration and infrastructure, or Cloudflare DNS filtering.", color: "text-sky-300", surface: "border-sky-400/20 bg-sky-400/10" },
  { icon: Binary, label: "03", title: "Keep the evidence", detail: "Review the signals and their limits, then export a report that omits the complete URL and its query.", color: "text-violet-300", surface: "border-violet-400/20 bg-violet-400/10" },
];

export default function PhishingDetectorPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "PhishLens", applicationCategory: "SecurityApplication", operatingSystem: "Web", url: `${SITE_URL}/phishing-detector`, description: "A free tool for investigating suspicious links.", featureList: ["Local URL lexical and Punycode inspection", "Batch URL review up to 100 links", "Optional Cloudflare DNS and PhishDestroy domain context", "Redacted evidence report export"], publisher: { "@id": ORG_ID }, offers: [{ "@type": "Offer", price: "0", priceCurrency: "USD" }, { "@type": "Offer", price: "0", priceCurrency: "INR" }] }} />
      <div className="relative isolate overflow-hidden border-b border-white/[.07] bg-[#080e11]">
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[620px] rounded-full bg-emerald-500/[.11] blur-[140px]" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[-10%] h-[340px] w-[450px] rounded-full bg-indigo-500/[.08] blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-12 sm:px-8 sm:pt-28 sm:pb-16 lg:px-10">
          <Breadcrumbs items={[{ name: "Products", path: "/products" }, { name: "PhishLens", path: "/phishing-detector" }]} />
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 sm:mt-10">
            <p className="inline-flex items-center gap-2 font-mono text-xs text-emerald-300">
              <Eye className="h-4 w-4" aria-hidden="true" /> PhishLens by BugSnaps
            </p>
            <p className="text-sm text-zinc-300">No account required</p>
          </div>
          <div className="mt-5 mb-6 sm:mt-7 sm:mb-9">
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-.04em] text-zinc-50 sm:text-5xl lg:text-[3.65rem]">
              Free phishing link checker
            </h1>
            <SketchUnderline className="mt-3 hidden h-8 w-48 sm:block" />
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Copy the suspicious link address and paste it below. PhishLens checks the address in your browser without opening the destination.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-6">
              <a href="#checker" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-300 px-4 text-sm font-semibold text-[#071b17] transition-colors hover:bg-emerald-200">
                Check a link <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                External checks run only when you choose them.
              </p>
            </div>
          </div>
          <PhishLensWorkspace />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[.04] p-5">
            <div>
              <h2 className="font-semibold text-zinc-100">Review suspicious messages with your team</h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">Submit messages, record decisions, and revisit previous reviews.</p>
            </div>
            {/* The team page needs its own document security policy for Firebase. */}
            <a href="/phishing-detector/team" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/30 px-4 text-sm font-semibold text-cyan-200 hover:bg-cyan-300/10">
              Open team inbox <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
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
      <Section labelledBy="url-guide-title" className="border-t border-white/[.07]">
        <h2 id="url-guide-title" className="text-2xl font-semibold">Investigate without opening the link.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">Learn how to interpret an address, verify an unexpected request and respond if you have already interacted with it.</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-base font-medium text-emerald-300">
          <Link href="/guides/how-to-assess-a-suspicious-url-safely" className="hover:underline">Read the suspicious URL guide</Link>
          <Link href="/guides/phishing-click-incident-triage" className="hover:underline">What to do after clicking a phishing link</Link>
          <Link href="/compare/phishing-link-checkers" className="hover:underline">Compare link checkers</Link>
          <Link href="/benchmarks/phishing-link-checker" className="hover:underline">See PhishLens benchmark results</Link>
        </div>
      </Section>
      <ProductReading productId="phishlens" />
      <Section labelledBy="link-checker-faq" className="border-t border-white/[.07]">
        <h2 id="link-checker-faq" className="text-2xl font-semibold">Questions about checking suspicious links</h2>
        <div className="mt-6 space-y-6">
          {faqs.map(({ question, answer }) => (
            <div key={question}>
              <h3 className="font-semibold">{question}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">{answer}</p>
            </div>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Fingerprint, Laptop, Link2, ScanSearch, Sparkles } from "lucide-react";
import { Breadcrumbs, Container, JsonLd, SiteShell } from "@/components/site/page-parts";
import { ProductVideo } from "@/components/site/product-video";
import { product } from "@/lib/products";
import { MYRECON_ANDROID_URL, MYRECON_URL, ORG_ID, absoluteUrl, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Products - MyPentest, EndpointRadar, PhishLens and MyRecon",
  description: "Explore BugSnaps products: MyPentest, EndpointRadar, PhishLens and MyRecon for security testing, phishing link assessment and digital footprint research.",
  path: "/products",
});

const showcases = [
  {
    id: "mypentest", videoId: "wZM29H-GTvU", number: "01", category: "WEB & API SECURITY", platform: "WEB", icon: ScanSearch,
    headline: "Your app has an attack surface. Get to know it.",
    why: "Built something? MyPentest helps you explore and test your verified web app, then understand what needs attention.",
    uses: ["Discover pages, APIs and exposed secrets", "Run defined checks on your verified domain", "Review evidence, severity and suggested fixes"],
    note: "For applications you own or are authorised to test.",
    color: "text-blue-300", border: "border-blue-400/20", tint: "bg-blue-400/[0.08]", glow: "bg-blue-500/15",
  },
  {
    id: "myrecon", videoId: "Elqf-OSSrSw", number: "02", category: "DIGITAL FOOTPRINT", platform: "WEB + ANDROID", icon: Fingerprint,
    headline: "There's more to your digital footprint.",
    why: "Follow the clues you can actually investigate. MyRecon brings public-source research and exposure checks into one place.",
    uses: ["Explore public username leads", "Check supported breach exposure", "Investigate domains, DNS and IP context"],
    note: "Matches are leads, not proof of identity. Coverage varies by platform and provider.",
    color: "text-cyan-300", border: "border-cyan-400/20", tint: "bg-cyan-400/[0.08]", glow: "bg-cyan-500/15",
  },
  {
    id: "endpointradar", videoId: "oEqp80naqvY", number: "03", category: "ENDPOINT SECURITY", platform: "WINDOWS + WEB", icon: Laptop,
    headline: "Give your Windows endpoint a closer look.",
    why: "A scan is only useful if you know what to do next. Turn a local endpoint report into a clearer picture of what to review.",
    uses: ["Scan an authorised Windows machine locally", "Import a report or explore a sample", "Filter findings and review remediation guidance"],
    note: "A point-in-time view; the free workspace handles one endpoint at a time.",
    color: "text-violet-300", border: "border-violet-400/20", tint: "bg-violet-400/[0.08]", glow: "bg-violet-500/15",
  },
  {
    id: "phishlens", videoId: "Q4S0Y2LtcUA", number: "04", category: "LINK SAFETY", platform: "WEB", icon: Link2,
    headline: "That link looks a little... off.",
    why: "Before you click, take a second look. PhishLens helps you inspect a link's destination and understand common warning signs.",
    uses: ["See the destination hostname", "Review URL signals in plain language", "Inspect a link in your browser with no account"],
    note: "Signals are not a safety guarantee. An optional DNS check shares the hostname with Cloudflare.",
    color: "text-emerald-300", border: "border-emerald-400/20", tint: "bg-emerald-400/[0.08]", glow: "bg-emerald-500/15",
  },
].map((item) => ({ ...item, product: product(item.id) }));

const itemList = {
  "@context": "https://schema.org", "@type": "ItemList", name: "BugSnaps products",
  itemListElement: showcases.map(({ product }, index) => ({
    "@type": "ListItem", position: index + 1,
    item: { "@type": "SoftwareApplication", name: product.name, description: product.summary, applicationCategory: "SecurityApplication", operatingSystem: product.id === "myrecon" ? "Web, Android" : product.id === "endpointradar" ? "Web, Windows" : "Web", url: absoluteUrl(product.href), publisher: { "@id": ORG_ID } },
  })),
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <JsonLd data={itemList} />
      <header className="relative overflow-hidden border-b border-white/[0.07]">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />
        <div aria-hidden="true" className="absolute -top-32 right-0 h-[500px] w-[600px] rounded-full bg-blue-600/10 blur-[130px]" />
        <Container className="relative pt-28 pb-16 sm:pt-36 sm:pb-20">
          <Breadcrumbs items={[{ name: "Products", path: "/products" }]} />
          <div className="mt-10 grid gap-9 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-400"><Sparkles className="h-4 w-4" aria-hidden="true" /> The BugSnaps toolkit</p>
              <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">Curiosity, meet <span className="text-blue-400">clarity.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">From a suspicious link to your app's attack surface, there's a tool for the question you want to answer.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">What's on your mind?</p>
              <nav aria-label="Jump to a product" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {showcases.map(({ id, product, icon: Icon, color }) => <a key={id} href={`#${id}`} className="group flex min-h-12 items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-black/20 px-3 text-sm transition-colors hover:border-white/20 hover:bg-white/[0.05]"><span className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />{product.name}</span><ArrowDown className="h-3.5 w-3.5 text-muted-2 transition-transform group-hover:translate-y-1" aria-hidden="true" /></a>)}
              </nav>
            </div>
          </div>
        </Container>
      </header>

      <section aria-labelledby="showcase-title" className="py-16 sm:py-24">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-14">
            <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">Four tools. Different jobs.</p><h2 id="showcase-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Pick your starting point.</h2></div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">Watch a quick product video and find the tool for your next step.</p>
          </div>
          <div className="space-y-5 sm:space-y-6">
            {showcases.map(({ id, number, category, platform, icon: Icon, headline, why, uses, note, color, border, tint, glow, videoId, product }, index) => (
              <article key={id} id={id} className="relative scroll-mt-24 overflow-hidden rounded-[28px] border border-white/10 bg-surface">
                <div aria-hidden="true" className={`pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full blur-[100px] ${glow}`} />
                <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-12">
                  <div className={index % 2 ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-3">
                      {id === "myrecon" ? <Image src="/myrecon-logo.svg" alt="" width={48} height={48} className="h-12 w-12" /> : <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${border} ${tint} ${color}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>}
                      <div><h3 className="text-lg font-semibold">{product.name}</h3><p className={`mt-1 font-mono text-[10px] tracking-[0.15em] ${color}`}>{category} <span className="text-muted-2">/ {platform}</span></p></div>
                      <span className="ml-auto font-mono text-xs text-muted-2">{number} / 04</span>
                    </div>
                    <div className="mt-7"><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted">{product.status === "beta" ? "Beta · free plan" : product.status === "available" ? "Available" : "Coming soon"}</span></div>
                    <h4 className="mt-5 max-w-lg text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">{headline}</h4>
                    <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">{why}</p>
                    <ul className="mt-6 space-y-3">{uses.map((use) => <li key={use} className="flex gap-3 text-sm leading-relaxed text-zinc-300"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />{use}</li>)}</ul>
                    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                      <Link href={product.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-blue-200">{product.cta}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                      {id === "myrecon" && <><a href={MYRECON_URL} className="inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-white">Website <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a><a href={MYRECON_ANDROID_URL} className="inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-white">Android app <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></>}
                    </div>
                    <p className="mt-5 max-w-lg text-xs leading-relaxed text-muted-2">{note}</p>
                  </div>
                  <div className={`relative overflow-hidden rounded-[24px] border ${border} bg-[#0c0e13] p-5 sm:p-7 ${index % 2 ? "lg:order-1" : ""}`}>
                    <ProductVideo name={product.name} videoId={videoId} />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold">Want to go deeper on MyPentest?</h2><p className="mt-1 text-sm text-muted">Explore the free plan, website testing and the AI pentesting guide.</p></div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">{["free-ai-pentesting", "website-pentesting-ai", "ai-penetration-testing"].map((id) => { const page = product(id); return <Link key={id} href={page.href} className="text-sm text-accent hover:underline">{page.name} <span aria-hidden="true">↗</span></Link>; })}</div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}

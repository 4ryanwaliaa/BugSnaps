import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Link2, Network, Radar, ScanSearch } from "lucide-react";
import { JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { product } from "@/lib/products";
import { MYRECON_ANDROID_URL, MYRECON_URL, ORG_ID, absoluteUrl, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Products - MyPentest, EndpointRadar, PhishLens and MyRecon",
  description:
    "Explore BugSnaps products: MyPentest, EndpointRadar, PhishLens and MyRecon for security testing, phishing link assessment and digital footprint research.",
  path: "/products",
});

const productCards = [
  { id: "mypentest", icon: ScanSearch, category: "WEB & API SECURITY", platform: "Web", color: "text-blue-300", iconBg: "border-blue-400/20 bg-blue-400/10", glow: "bg-blue-500/10" },
  { id: "myrecon", icon: Radar, category: "DIGITAL FOOTPRINT", platform: "Web + Android", color: "text-cyan-300", iconBg: "border-cyan-400/20 bg-cyan-400/10", glow: "bg-cyan-500/10" },
  { id: "endpointradar", icon: Network, category: "ENDPOINT SECURITY", platform: "Web + Windows", color: "text-violet-300", iconBg: "border-violet-400/20 bg-violet-400/10", glow: "bg-violet-500/10" },
  { id: "phishlens", icon: Link2, category: "LINK SAFETY", platform: "Web", color: "text-emerald-300", iconBg: "border-emerald-400/20 bg-emerald-400/10", glow: "bg-emerald-500/10" },
].map((card) => ({ ...card, product: product(card.id) }));

const relatedPentestPages = ["free-ai-pentesting", "website-pentesting-ai", "ai-penetration-testing"].map(product);

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BugSnaps products",
  itemListElement: productCards.map(({ product }, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SoftwareApplication",
      name: product.name,
      description: product.summary,
      applicationCategory: "SecurityApplication",
      operatingSystem: product.id === "myrecon" ? "Web, Android" : product.id === "endpointradar" ? "Web, Windows" : "Web",
      url: product.external ? product.href : absoluteUrl(product.href),
      publisher: { "@id": ORG_ID },
    },
  })),
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <JsonLd data={itemList} />
      <PageHeader
        crumbs={[{ name: "Products", path: "/products" }]}
        eyebrow="The BugSnaps toolkit"
        title="Four tools. A clearer view of your security."
        lead="Test your applications, investigate your digital footprint, review endpoint security, and check suspicious links—all in one toolkit."
      >
        <nav aria-label="Jump to a product" className="flex flex-wrap gap-2">
          {productCards.map(({ product }) => (
            <a key={product.id} href={`#${product.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-muted transition-colors hover:border-white/25 hover:text-foreground">
              {product.name}<span aria-hidden="true" className="text-accent">↘</span>
            </a>
          ))}
        </nav>
      </PageHeader>

      <Section labelledBy="products-list" className="!pt-14 sm:!pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Built for the work</p>
            <h2 id="products-list" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find your starting point.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">Choose the tool that fits what you want to investigate.</p>
        </div>

        <ul className="grid gap-5 lg:grid-cols-2">
          {productCards.map(({ product, icon: Icon, category, platform, color, iconBg, glow }, index) => (
            <li key={product.id} id={product.id} className="flex scroll-mt-24">
              <article className="relative flex w-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-surface p-6 sm:p-8">
                <div aria-hidden="true" className={`pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full blur-3xl ${glow}`} />
                <div className="relative flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconBg} ${color}`}>
                    <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs text-muted-2">0{index + 1} / 04</span>
                </div>
                <div className="relative mt-7 flex flex-wrap items-center gap-2">
                  <span className={`font-mono text-[11px] font-medium tracking-[0.15em] ${color}`}>{category}</span>
                  <span aria-hidden="true" className="text-muted-2">·</span>
                  <span className="text-xs text-muted">{platform}</span>
                </div>
                <div className="relative mt-3 flex flex-wrap items-center gap-3">
                  <h3 className="text-3xl font-semibold tracking-tight">{product.name}</h3>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted">
                    {product.status === "beta" ? "Beta · free plan" : product.status === "available" ? "Available" : "Coming soon"}
                  </span>
                </div>
                <p className="relative mt-2 text-sm font-medium text-foreground/80">{product.tagline}</p>
                <p className="relative mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{product.summary}</p>
                <ul className="relative mt-6 flex-1 space-y-2.5 border-t border-white/[0.07] pt-6">
                  {product.capabilities.map((capability) => (
                    <li key={capability} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                      <Check className={`mt-0.5 h-4 w-4 flex-none ${color}`} aria-hidden="true" />
                      {capability}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-8 flex flex-wrap items-center gap-3">
                  <Link href={product.href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent">
                    {product.cta}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  {product.id === "myrecon" && (
                    <>
                      <a href={MYRECON_URL} className="inline-flex min-h-11 items-center gap-1.5 px-1 text-sm text-muted transition-colors hover:text-foreground">Website <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
                      <a href={MYRECON_ANDROID_URL} className="inline-flex min-h-11 items-center gap-1.5 px-1 text-sm text-muted transition-colors hover:text-foreground">Android app <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
                    </>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Explore MyPentest in more detail</h2>
            <p className="mt-1 text-sm text-muted">Learn about the free plan, website testing, and how to evaluate AI pentesting.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {relatedPentestPages.map((page) => <Link key={page.id} href={page.href} className="text-sm text-accent hover:underline">{page.name} <span aria-hidden="true">↗</span></Link>)}
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}

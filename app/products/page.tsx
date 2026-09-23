import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { products } from "@/lib/products";
import { ORG_ID, absoluteUrl, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Products — MyPentest and MyRecon",
  description:
    "The BugSnaps product line: MyPentest for automated penetration testing, and MyRecon for reconnaissance and OSINT. Built by the BugSnaps security team.",
  path: "/products",
});

const STATUS: Record<string, string> = {
  available: "Available",
  beta: "Beta · free plan",
  "coming-soon": "Coming soon",
};

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BugSnaps products",
  itemListElement: products.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SoftwareApplication",
      name: product.name,
      description: product.summary,
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web",
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
        eyebrow="Products"
        title="Security tools from a team that does the testing."
        lead="Each BugSnaps product does one job well, and each is built by the same people who run our penetration tests."
      />

      <Section labelledBy="products-list">
        <h2 id="products-list" className="sr-only">
          Products
        </h2>
        <ul className="grid gap-6 lg:grid-cols-2">
          {products.map((product) => (
            <li key={product.id} className="flex">
              <article className="flex w-full flex-col rounded-2xl border border-white/[0.08] bg-surface p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-semibold tracking-tight">{product.name}</h3>
                  <span className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-muted">
                    {STATUS[product.status]}
                  </span>
                </div>
                <p className="mt-1 text-muted">{product.tagline}</p>
                <p className="mt-5 text-[15px] leading-relaxed text-muted">{product.summary}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {product.capabilities.map((c) => (
                    <li key={c} className="flex gap-2.5 text-sm text-muted">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {product.external ? (
                    <a
                      href={product.href}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium hover:border-white/20"
                    >
                      {product.cta} at myrecon.xyz
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <Link
                      href={product.href}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-accent"
                    >
                      {product.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-muted-2">
          MyRecon runs on its own site, myrecon.xyz, and is part of the BugSnaps ecosystem. More BugSnaps products will
          appear here as they launch.
        </p>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Radar, ScanSearch } from "lucide-react";
import { Section, SectionTitle } from "@/components/site/page-parts";
import { products } from "@/lib/products";
import { newAssessmentUrl } from "@/lib/mypentest";

const ICONS = { mypentest: ScanSearch, myrecon: Radar } as const;

export function HomeProducts() {
  return (
    <Section labelledBy="products-title" className="border-t border-white/[0.05]">
      <SectionTitle id="products-title" eyebrow="Products" title="Two tools, one security team behind them." />

      <ul className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2">
        {products.map((product) => {
          const Icon = ICONS[product.id as keyof typeof ICONS] ?? ScanSearch;
          const href = product.id === "mypentest" ? newAssessmentUrl() : product.href;
          return (
            <li key={product.id} className="flex">
              <article className="card-hover flex w-full flex-col rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-accent">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
                    <p className="text-sm text-muted">{product.tagline}</p>
                  </div>
                </div>
                <p className="mt-5 flex-1 text-[15px] leading-relaxed text-muted">{product.summary}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {product.external ? (
                    <a
                      href={href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                    >
                      {product.cta}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <>
                      <a
                        href={href}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent"
                      >
                        {product.cta}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <Link href={product.href} className="text-sm text-muted hover:text-foreground">
                        How it works
                      </Link>
                    </>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

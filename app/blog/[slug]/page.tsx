import type { Metadata } from "next";
import Link from "@/components/site/content-link";
import { notFound } from "next/navigation";
import { CtaBand, JsonLd, PageHeader, Prose, SiteShell } from "@/components/site/page-parts";
import { post, posts, vulnerabilityPosts, type Block } from "@/lib/blog";
import { OG_IMAGE, ORG_ID, absoluteUrl, pageMetadata } from "@/lib/site";
import { product } from "@/lib/products";
import { PreferredSource } from "@/components/site/preferred-source";
import { BinanceExplainerPage } from "@/components/site/binance-explainer-page";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = post((await params).slug);
  if (!found) return {};
  const metadata = pageMetadata({
    title: found.title,
    description: found.description,
    path: `/blog/${found.slug}`,
    type: "article",
    published: found.published,
    modified: found.updated ?? found.published,
  });
  if (found.slug === "binance-crypto-hack-october-2026-explained") {
    const image = { url: absoluteUrl("/images/binance-hack-2026-explained.png"), width: 1254, height: 1254, alt: "Binance hack explained: a signed permission, code and an asset transfer" };
    return {
      ...metadata,
      openGraph: { ...metadata.openGraph, type: "article", images: [image] },
      twitter: { card: "summary_large_image", title: `${found.title} - BugSnaps`, description: found.description, images: [image.url] },
    };
  }
  return metadata;
}

function render(block: Block, index: number) {
  switch (block.type) {
    case "p":
      return <p key={index}>{block.text}</p>;
    case "h2":
      return <h2 key={index} id={`section-${index}`} className="scroll-mt-24">{block.text}</h2>;
    case "ul":
      return (
        <ul key={index}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <p key={index} className="!mt-6 rounded-xl border border-accent/25 bg-accent/[0.06] px-5 py-4 text-foreground/90">
          {block.text}
        </p>
      );
    case "table":
      return (
        <div key={index} className="not-prose !my-8 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="px-4 pt-4 text-left text-sm font-semibold text-foreground/90">{block.caption}</caption>
            <thead>
              <tr className="border-b border-white/10">
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="px-4 py-3 font-semibold text-foreground/90">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, cellIndex) => cellIndex === 0
                    ? <th key={cellIndex} scope="row" className="px-4 py-3 align-top font-mono text-[13px] font-medium text-foreground/90">{cell}</th>
                    : <td key={cellIndex} className="px-4 py-3 align-top leading-relaxed text-muted">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default async function BlogPost({ params }: Params) {
  const found = post((await params).slug);
  if (!found) notFound();
  const path = `/blog/${found.slug}`;
  const featuredProduct = found.productId ? product(found.productId) : undefined;
  const inVulnerabilityCollection = vulnerabilityPosts.some((article) => article.slug === found.slug);
  const sources = found.related.filter((link) => link.href.startsWith("https://"));
  const related = found.related.filter((link) => !link.href.startsWith("https://"));

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: found.title,
    description: found.description,
    datePublished: found.published,
    dateModified: found.updated ?? found.published,
    author: { "@type": "Organization", name: found.author, url: absoluteUrl("/") },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: absoluteUrl(path),
    image:
      found.slug === "binance-crypto-hack-october-2026-explained"
        ? absoluteUrl("/images/binance-hack-2026-explained.png")
        : absoluteUrl(OG_IMAGE.url),
    ...(sources.length ? { citation: sources.map((source) => source.href) } : {}),
  };

  if (found.slug === "binance-crypto-hack-october-2026-explained") {
    return <BinanceExplainerPage article={found} articleJsonLd={articleJsonLd} />;
  }

  return (
    <SiteShell>
      <JsonLd data={articleJsonLd} />
      <PageHeader
        crumbs={[
          { name: "Blog", path: "/blog" },
          { name: found.title, path },
        ]}
        title={found.title}
        lead={found.description}
      >
        <p className="font-mono text-[12px] text-muted-2">
          By {found.author} · {found.readingMinutes} min read · {found.updated ? "Updated " : "Published "}<time dateTime={found.updated ?? found.published}>{found.updated ?? found.published}</time>
        </p>
        <PreferredSource />
      </PageHeader>

      <article className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20 lg:px-8">
        {inVulnerabilityCollection && <p className="mb-6 text-sm"><Link href="/vulnerability-guides" className="text-accent hover:underline">Explore all React2Shell and framework vulnerability guides →</Link></p>}
        <nav aria-label="On this page" className="mb-10 max-w-3xl rounded-2xl border border-white/10 bg-surface p-6">
          <p className="text-sm font-semibold">On this page</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {found.body.map((block, index) => block.type === "h2" ? (
              <li key={index}><a href={`#section-${index}`} className="text-sm text-muted hover:text-accent">{block.text}</a></li>
            ) : null)}
          </ul>
        </nav>
        <Prose>{found.body.map(render)}</Prose>
        {sources.length > 0 && (
          <aside className="mt-10 max-w-3xl rounded-xl border border-white/10 p-6" aria-labelledby="sources-title">
            <h2 id="sources-title" className="text-sm font-semibold">Sources and official guidance</h2>
            <ul className="mt-3 space-y-2">
              {sources.map((source) => <li key={source.href}><a href={source.href} className="text-sm text-accent hover:underline">{source.label}</a></li>)}
            </ul>
          </aside>
        )}
        <aside className="mt-14 max-w-3xl border-t border-white/[0.06] pt-8" aria-labelledby="related-title">
          <h2 id="related-title" className="text-sm font-semibold">
            Related
          </h2>
          <ul className="mt-3 space-y-2">
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="text-sm text-accent hover:underline">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </article>

      <CtaBand
        title={featuredProduct ? `Put this guide into practice with ${featuredProduct.name}.` : "Run a vulnerability scan on your website."}
        primary={featuredProduct ? { label: `Explore ${featuredProduct.name}`, href: featuredProduct.href } : undefined}
        lead={featuredProduct ? featuredProduct.summary : "Verify your domain and use MyPentest to check for supported web and API weaknesses. Review findings and coverage; a clean scan does not rule out every CVE."}
        secondary={featuredProduct ? { label: "Explore all security guides", href: "/blog" } : { label: "Discuss a specific vulnerability", href: "/contact" }}
      />
    </SiteShell>
  );
}

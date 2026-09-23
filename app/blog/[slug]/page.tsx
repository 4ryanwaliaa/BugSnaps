import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, JsonLd, PageHeader, Prose, SiteShell } from "@/components/site/page-parts";
import { post, posts, type Block } from "@/lib/blog";
import { ORG_ID, absoluteUrl, pageMetadata } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = post((await params).slug);
  if (!found) return {};
  return pageMetadata({
    title: found.title,
    description: found.description,
    path: `/blog/${found.slug}`,
    type: "article",
  });
}

function render(block: Block, index: number) {
  switch (block.type) {
    case "p":
      return <p key={index}>{block.text}</p>;
    case "h2":
      return <h2 key={index}>{block.text}</h2>;
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
  }
}

export default async function BlogPost({ params }: Params) {
  const found = post((await params).slug);
  if (!found) notFound();
  const path = `/blog/${found.slug}`;

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
  };

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
          By {found.author} · <time dateTime={found.published}>{found.published}</time> · {found.readingMinutes} min read
        </p>
      </PageHeader>

      <article className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20 lg:px-8">
        <Prose>{found.body.map(render)}</Prose>
        <aside className="mt-14 max-w-3xl border-t border-white/[0.06] pt-8" aria-labelledby="related-title">
          <h2 id="related-title" className="text-sm font-semibold">
            Related
          </h2>
          <ul className="mt-3 space-y-2">
            {found.related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="text-sm text-accent hover:underline">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </article>

      <CtaBand />
    </SiteShell>
  );
}

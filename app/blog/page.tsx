import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { posts } from "@/lib/blog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security Testing Blog",
  description:
    "Practical writing on penetration testing, automated security testing and application security from the BugSnaps team.",
  path: "/blog",
});

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndex() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Blog", path: "/blog" }]}
        eyebrow="Blog"
        title="Notes from the people who do the testing."
        lead="Straight answers about penetration testing and application security - what works, what doesn't, and what to ask for."
      />
      <Section labelledBy="posts-title">
        <h2 id="posts-title" className="sr-only">
          Articles
        </h2>
        <ul className="max-w-3xl divide-y divide-white/[0.06]">
          {posts.map((p) => (
            <li key={p.slug} className="py-7 first:pt-0">
              <article>
                <p className="font-mono text-[12px] text-muted-2">
                  <time dateTime={p.published}>{formatDate(p.published)}</time> · {p.readingMinutes} min read
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  <Link href={`/blog/${p.slug}`} className="hover:text-accent">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand />
    </SiteShell>
  );
}

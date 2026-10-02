import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { SECURITY_GUIDES, SECURITY_GUIDE_CATEGORIES, guidePath } from "@/lib/security-guides";
import { absoluteUrl, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security Testing Guides and Practical Checklists",
  description: "24 practical security testing guides for APIs, web applications, account access, evidence, and remediation, with primary sources and explicit assessment limits.",
  path: "/guides",
});

const categoryId = (category: string) => category.toLowerCase().replaceAll(" ", "-");

export default function SecurityGuidesIndex() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Security Testing Guides and Practical Checklists",
    description: "Practical guides for authorized security testing, evidence, and remediation.",
    url: absoluteUrl("/guides"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: SECURITY_GUIDES.length,
      itemListElement: SECURITY_GUIDES.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: absoluteUrl(guidePath(guide.slug)),
      })),
    },
  };

  return (
    <SiteShell>
      <JsonLd data={collectionSchema} />
      <PageHeader
        crumbs={[{ name: "Security guides", path: "/guides" }]}
        eyebrow="Security guides"
        title="Understand the boundary. Test it. Keep the evidence."
        lead="Practical guides to application security checks, what a result establishes, and which limits belong in the report. Choose a topic that matches the decision you need to make."
      >
        <nav aria-label="Guide categories" className="flex flex-wrap gap-3">
          {SECURITY_GUIDE_CATEGORIES.map((category) => (
            <a key={category} href={`#${categoryId(category)}`} className="rounded-full border border-white/[0.12] px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground">
              {category}
            </a>
          ))}
        </nav>
      </PageHeader>
      <Section labelledBy="guide-start-title" className="!pb-0">
        <div className="max-w-3xl">
          <h2 id="guide-start-title" className="text-2xl font-semibold tracking-tight">Choose the assessment you need.</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Preparing a test? Start with scope and inventory. Investigating a candidate? Use the relevant API, browser, or identity guide to identify controls and collect narrowly scoped evidence. Reviewing a result? Read the reporting and retesting guides before treating a finding count as assurance.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            Each guide includes a direct answer, specific assessment steps, limitations, FAQs, and links to primary technical sources. Active checks belong on targets you are authorized to assess, using the owner&apos;s intended policy and dedicated test fixtures.
          </p>
        </div>
      </Section>
      {SECURITY_GUIDE_CATEGORIES.map((category) => (
        <Section key={category} id={categoryId(category)} labelledBy={`${categoryId(category)}-title`}>
          <h2 id={`${categoryId(category)}-title`} className="text-2xl font-semibold tracking-tight">{category}</h2>
          <ul className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SECURITY_GUIDES.filter((guide) => guide.category === category).map((guide) => (
              <li key={guide.slug} className="rounded-2xl border border-white/[0.08] bg-surface/30 p-6">
                <article>
                  <p className="font-mono text-[11px] text-muted-2">Updated <time dateTime={guide.updated}>2 October 2026</time></p>
                  <h3 className="mt-3 text-lg font-semibold leading-snug">
                    <Link href={guidePath(guide.slug)} className="hover:text-accent">{guide.title}</Link>
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{guide.description}</p>
                </article>
              </li>
            ))}
          </ul>
        </Section>
      ))}
      <Section labelledBy="guide-next-title" className="border-t border-white/[0.06]">
        <h2 id="guide-next-title" className="text-2xl font-semibold tracking-tight">Compare coverage before choosing a tool.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Different approaches can provide different evidence. Compare the methods, scope, roles, and reporting you need, or discuss a focused assessment with the team.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link href="/compare" className="text-accent hover:underline">Security testing comparisons</Link>
          <Link href="/contact" className="text-accent hover:underline">Discuss your assessment</Link>
        </div>
      </Section>
    </SiteShell>
  );
}

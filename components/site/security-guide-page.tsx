import Link from "next/link";
import { JsonLd, PageHeader, Prose, Section, SiteShell } from "@/components/site/page-parts";
import { guidePath, getSecurityGuide, type SecurityGuide } from "@/lib/security-guides";
import { newAssessmentUrl } from "@/lib/mypentest";
import { absoluteUrl, faqJsonLd, OG_IMAGE, ORG, ORG_ID } from "@/lib/site";

export function SecurityGuidePage({ guide }: { guide: SecurityGuide }) {
  const path = guidePath(guide.slug);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#article`,
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    inLanguage: "en",
    articleSection: guide.category,
    author: { "@type": "Organization", name: ORG.name, url: absoluteUrl("/") },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: absoluteUrl(path),
    image: absoluteUrl(OG_IMAGE.url),
    citation: guide.sources.map((source) => source.url),
  };

  return (
    <SiteShell>
      <JsonLd data={articleSchema} />
      <JsonLd data={faqJsonLd(guide.faqs)} />
      <PageHeader
        crumbs={[{ name: "Security guides", path: "/guides" }, { name: guide.title, path }]}
        eyebrow={guide.category}
        title={guide.title}
        lead={guide.description}
      >
        <p className="font-mono text-[12px] text-muted-2">
          By BugSnaps · Updated <time dateTime={guide.updated}>2 October 2026</time>
        </p>
      </PageHeader>

      <article className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(210px,1fr)] lg:gap-16">
          <div className="min-w-0">
            <section aria-labelledby="direct-answer-title" className="max-w-3xl rounded-2xl border border-accent/20 bg-accent/[0.04] p-6 sm:p-8">
              <h2 id="direct-answer-title" className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-accent">
                Direct answer
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-foreground/90">{guide.answer}</p>
            </section>

            <Prose>
              {guide.sections.map((section, index) => {
                const source = section.source === undefined ? undefined : guide.sources[section.source];
                return (
                  <section key={section.title} aria-labelledby={`section-${index + 1}`}>
                    <h2 id={`section-${index + 1}`}>{section.title}</h2>
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.checklist && (
                      <ul>
                        {section.checklist.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    )}
                    {source && (
                      <p className="!mt-3 text-sm">
                        Reference: <a href={source.url}>{source.title}</a>.
                      </p>
                    )}
                  </section>
                );
              })}
              <section aria-labelledby="limits-title">
                <h2 id="limits-title">Assessment limits</h2>
                <p>{guide.limitations}</p>
              </section>
            </Prose>

            <section aria-labelledby="faq-title" className="mt-12 max-w-3xl">
              <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
              <div className="mt-5 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {guide.faqs.map((faq) => (
                  <div key={faq.question} className="py-5">
                    <h3 className="text-base font-semibold">{faq.question}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="sources-title" className="mt-12 max-w-3xl">
              <h2 id="sources-title" className="text-lg font-semibold">Primary sources and further reading</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                These guides combine published security guidance with practical assessment planning. Adapt checks to the owner&apos;s policy, environment, and authorized scope.
              </p>
              <ul className="mt-4 space-y-3">
                {guide.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} className="text-sm text-accent underline-offset-4 hover:underline">{source.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="self-start rounded-2xl border border-white/[0.08] bg-surface/50 p-6 lg:sticky lg:top-28" aria-labelledby="contents-title">
            <h2 id="contents-title" className="text-sm font-semibold">In this guide</h2>
            <ol className="mt-4 space-y-3">
              {guide.sections.map((section, index) => (
                <li key={section.title}>
                  <a href={`#section-${index + 1}`} className="text-sm leading-relaxed text-muted transition-colors hover:text-foreground">{section.title}</a>
                </li>
              ))}
              <li><a href="#limits-title" className="text-sm text-muted hover:text-foreground">Assessment limits</a></li>
              <li><a href="#faq-title" className="text-sm text-muted hover:text-foreground">Frequently asked questions</a></li>
            </ol>
          </aside>
        </div>
      </article>

      <Section labelledBy="related-guides-title" className="border-t border-white/[0.06]">
        <h2 id="related-guides-title" className="text-2xl font-semibold tracking-tight">Continue the assessment</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {guide.related.map((slug) => {
            const related = getSecurityGuide(slug);
            if (!related) return null;
            return (
              <li key={slug} className="rounded-2xl border border-white/[0.08] p-6">
                <h3 className="font-semibold"><Link href={guidePath(slug)} className="hover:text-accent">{related.title}</Link></h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{related.description}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link href="/guides" className="text-accent hover:underline">Browse all security guides</Link>
          <Link href="/compare" className="text-accent hover:underline">Compare security testing approaches</Link>
          <Link href="/contact" className="text-accent hover:underline">Discuss assessment scope</Link>
        </div>
      </Section>

      <Section labelledBy="guide-cta-title" className="border-t border-white/[0.06]">
        <h2 id="guide-cta-title" className="text-2xl font-semibold tracking-tight">Apply the guide to your own application.</h2>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          Start with an authorized target, known test data, and a clear scope. Use the report&apos;s evidence and coverage limits to decide which checks need further review.
        </p>
        <a href={newAssessmentUrl()} className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent">
          Open MyPentest
        </a>
      </Section>
    </SiteShell>
  );
}

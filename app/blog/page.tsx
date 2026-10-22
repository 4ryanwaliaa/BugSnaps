import type { Metadata } from "next";
import Link from "@/components/site/content-link";
import { CtaBand, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { posts, type Post } from "@/lib/blog";
import { newAssessmentUrl } from "@/lib/mypentest";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Website Vulnerability Guides & Security Testing Blog",
  description:
    "Understand web vulnerabilities, check affected software, plan patches and learn website security testing with practical guides from BugSnaps.",
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

function ArticleSummary({ article }: { article: Post }) {
  return (
    <article>
      <p className="font-mono text-[12px] text-muted-2">
        <time dateTime={article.published}>{formatDate(article.published)}</time> · {article.readingMinutes} min read
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">
        <Link href={`/blog/${article.slug}`} className="transition-colors hover:text-accent">
          {article.title}
        </Link>
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{article.description}</p>
    </article>
  );
}

export default function BlogIndex() {
  const sortedPosts = [...posts].sort((a, b) => b.published.localeCompare(a.published));
  const latestPosts = sortedPosts.slice(0, 6);
  const libraryPosts = sortedPosts.slice(6);

  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Blog", path: "/blog" }]}
        eyebrow="Security field notes"
        title="Understand the vulnerability. Know your next step."
        lead="Practical guides to web application vulnerabilities, affected software, patching and security testing. Turn a security headline into a plan for your website."
      >
        <nav aria-label="Explore security articles" className="flex flex-wrap gap-3">
          <Link href="/vulnerability-guides" className="rounded-full border border-accent/30 px-5 py-3 text-sm font-medium text-accent hover:border-accent">
            React2Shell & framework vulnerability hub
          </Link>
          <Link href="#latest-guides" className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent">
            Read the latest guides
          </Link>
          <Link href="#article-library" className="rounded-full border border-white/15 px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent">
            Browse the article library
          </Link>
          <Link href="/mypentest/example-report" className="rounded-full px-5 py-3 text-sm text-muted transition-colors hover:text-foreground">
            See a security report
          </Link>
        </nav>
      </PageHeader>
      <Section id="latest-guides" labelledBy="latest-title" className="scroll-mt-24">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Latest articles</p>
          <h2 id="latest-title" className="mt-3 text-3xl font-semibold tracking-tight">Vulnerability guides and practical checks</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Start with the affected product and version, then follow the remediation advice.
            Publication dates below refer to our guides, not the original vulnerability disclosures.
          </p>
        </div>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((article) => (
            <li key={article.slug} className="rounded-2xl border border-white/[0.08] bg-surface p-6 transition-colors hover:border-accent/40">
              <ArticleSummary article={article} />
            </li>
          ))}
        </ul>
        <aside aria-labelledby="scan-next-title" className="mt-10 rounded-2xl border border-primary/25 bg-primary/[0.06] p-6 sm:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <h3 id="scan-next-title" className="text-xl font-semibold">What does this mean for your website?</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Run a MyPentest scan on a site you own to review findings from supported security checks.
                For a specific CVE, also compare your deployed software and configuration with the vendor advisory.
                A scan with no findings does not establish that every vulnerability has been ruled out.
              </p>
            </div>
            <a href={newAssessmentUrl()} className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent">
              Run a scan on your site
            </a>
          </div>
        </aside>
      </Section>
      <Section id="article-library" labelledBy="posts-title" className="scroll-mt-24 border-t border-white/[0.06]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
          <div>
            <h2 id="posts-title" className="text-3xl font-semibold tracking-tight">More security testing guides</h2>
            <p className="mt-4 mb-8 text-muted">Explore application security fundamentals, testing decisions and remediation workflows.</p>
            <ul className="divide-y divide-white/[0.06]">
              {libraryPosts.map((article) => (
                <li key={article.slug} className="py-7 first:pt-0">
                  <ArticleSummary article={article} />
                </li>
              ))}
            </ul>
          </div>
          <aside aria-labelledby="resources-title" className="self-start rounded-2xl border border-white/[0.08] bg-surface p-6">
            <h2 id="resources-title" className="text-lg font-semibold">Put the reading into practice</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">Choose the next step that fits your application and the evidence you need.</p>
            <ul className="mt-6 space-y-5 text-sm">
              <li><Link href="/mypentest/example-report" className="text-accent hover:underline">Understand a website security report</Link></li>
              <li><Link href="/compare/automated-vs-manual-penetration-testing" className="text-accent hover:underline">Compare automated and manual testing</Link></li>
              <li><Link href="/penetration-testing" className="text-accent hover:underline">Explore penetration testing services</Link></li>
              <li><Link href="/contact" className="text-accent hover:underline">Discuss a specific vulnerability</Link></li>
            </ul>
          </aside>
        </div>
      </Section>
      <CtaBand
        title="Turn security reading into a check of your own site."
        lead="Verify your domain, run MyPentest and review the evidence for supported checks. Use the relevant vendor advisory alongside your results when assessing a specific vulnerability."
      />
    </SiteShell>
  );
}

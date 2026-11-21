import type { Metadata } from "next";
import Link from "@/components/site/content-link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { JsonLd, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { SecurityReviewFigure } from "@/components/site/security-review-figure";
import { HomeHero } from "@/components/home/hero";
import { ReadingPen } from "@/components/home/reading-pen";
import { TutorialVideo } from "@/components/site/tutorial-video";
import { HomeProducts } from "@/components/home/products";
import { HomeHowItRuns, HomeMarquee, HomeReport, HomeStats } from "@/components/home/sections";
import { HomeWhy } from "@/components/home/why";
import { HomeResearch } from "@/components/home/research";
import { HomeSafety, HomeScanClosing, HomeScanPrompt } from "@/components/home/scan-start";
import { LegacyHashRedirect } from "@/components/home/legacy-hash-redirect";
import { imageObjectJsonLd, pageMetadata } from "@/lib/site";
import { recentAdvisoryPosts } from "@/lib/articles/recent-advisories";

export const metadata: Metadata = pageMetadata({
  title: "Website Security Testing & API Pentesting | BugSnaps",
  absoluteTitle: true,
  description:
    "Test your website with MyPentest, free to start. Review vulnerability evidence and fixes, explore API security testing, or scope a manual pentest.",
  path: "/",
});

const CARD =
  "group flex flex-col rounded-2xl border border-white/[0.08] bg-surface p-6 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.03] motion-reduce:hover:translate-y-0";

/** A card that links to a tool or guide, with an arrow that nudges on hover. */
function LinkCard({ path, title, text }: { path: string; title: string; text: string }) {
  return (
    <Link href={path} className={CARD}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <ArrowUpRight
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-2 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
    </Link>
  );
}

export default function Home() {
  return (
    <SiteShell className="home-reading-pen">
      <ReadingPen />
      <JsonLd data={imageObjectJsonLd({
        id: "/#security-review-image",
        contentUrl: "/images/website-security-review.webp",
        caption: "Review evidence, assign a fix and retest the affected path. AI-generated illustration; not a product screenshot or customer assessment.",
        width: 1600,
        height: 900,
        creditText: "BugSnaps; AI-generated illustration",
      })} />
      <LegacyHashRedirect />
      <HomeHero />
      <HomeMarquee />
      <HomeHowItRuns />
      <HomeSafety />
      <TutorialVideo />
      <div className="mx-auto -mt-10 mb-8 w-full max-w-6xl px-6 lg:px-8">
        <Link href="/mypentest/how-to-use" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
          Open the full step-by-step MyPentest video tutorial with 13 chapters <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <HomeStats />
      <HomeReport />
      <HomeScanPrompt />
      <HomeProducts />

      <Section labelledBy="choose-security-check" className="border-t border-white/5">
        <SectionTitle
          id="choose-security-check"
          eyebrow="Pick a starting point"
          title="Choose the security check for your task."
          lead="Testing a website you own, reviewing an API, and inspecting an unexpected link need different workflows. Start with the tool or service that matches your scope."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            { path: "/mypentest", title: "Website vulnerability scanner", text: "Run automated web application checks on a verified domain. Review evidence, severity and remediation within your plan limits." },
            { path: "/api-security-testing", title: "API security testing for REST and GraphQL", text: "Scope a manual review of BOLA, IDOR, authentication and tenant boundaries with authorized test accounts." },
            { path: "/phishing-detector", title: "Free phishing link checker", text: "Inspect a suspicious URL for warning signs in your browser, without opening the destination. Results are signals, not a safety verdict." },
            { path: "/endpointradar", title: "Windows security posture assessment", text: "Use EndpointRadar for read-only endpoint checks and review imported device reports in a browser workspace." },
          ].map((item) => <LinkCard key={item.path} {...item} />)}
        </div>
      </Section>

      {/* World-Ready Security & Trust Banner */}
      <Section labelledBy="world-ready-trust-title" className="border-t border-white/5">
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-primary/[0.08] via-surface to-coral/[0.05] p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-coral">
                Trust &amp; methodology
              </p>
              <h2 id="world-ready-trust-title" className="mt-3 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
                Know exactly what a scan covers before you rely on it.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                We publish how MyPentest is tested, what it can and can&apos;t find, and when you need a human pentester instead. Read it, then decide.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/security-readiness"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
              >
                Visit the Trust Center <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href="/benchmarks"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.08]"
              >
                Benchmark methodology
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <HomeWhy />
      <Section labelledBy="improve-security-title" className="border-t border-white/5">
        <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-coral">From findings to fixes</p>
            <h2 id="improve-security-title" className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Improve your website security with a clear next step.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              A useful web application security assessment gives your team an affected path, evidence, severity and remediation. Check access control, exposed secrets, injection and session handling on systems you are authorized to test, then rerun the relevant checks after fixing them.
            </p>
            <div className="mt-6 flex flex-col items-start gap-3 text-sm">
              <Link href="/improvements" className="inline-flex items-center gap-2 text-accent hover:underline">
                The security improvement checklist <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/why-bugsnaps" className="text-accent hover:underline">Why give BugSnaps a try?</Link>
              <Link href="/compare/mypentest-vs-ai-assistants" className="text-accent hover:underline">Compare MyPentest with AI assistants</Link>
            </div>
          </div>
          <SecurityReviewFigure />
        </div>
      </Section>
      <HomeResearch />
      <Section labelledBy="security-resources-title" className="border-t border-white/5">
        <SectionTitle
          id="security-resources-title"
          eyebrow="Free resources"
          title="Plan your security assessment."
          lead="Understand what to test, choose a workflow for your application, and compare the tools that fit your scope."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { path: "/guides/api-security-test-cases", title: "API security test cases", text: "Download a CSV matrix for ownership, roles and tenant boundaries." },
            { path: "/guides/pentest-report-template", title: "Free pentest report template", text: "Track evidence, remediation and retest outcomes in a reusable CSV." },
            { path: "/blog/bola-idor-vulnerability-prevention-guide", title: "BOLA vs IDOR explained", text: "Understand object authorization failures and how to verify a fix." },
            { path: "/guides", title: "Practical security guides", text: "Access control, APIs, sessions, evidence and remediation." },
            { path: "/use-cases", title: "Workflows for your application", text: "SaaS, ecommerce, multi-tenant apps and release validation." },
            { path: "/alternatives", title: "Choose a testing tool", text: "Sourced alternatives with strengths and operating trade-offs." },
          ].map((item) => <LinkCard key={item.path} {...item} />)}
        </div>
        <Link href="/resources" className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
          All security resources <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </Section>
      <Section labelledBy="advisory-guides-title" className="border-t border-white/5">
        <SectionTitle
          id="advisory-guides-title"
          eyebrow="Vulnerability briefings"
          title="Check what the security headlines mean for your site."
          lead="Understand affected software, verify deployed patches and use a scoped scan to review supported security checks."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {recentAdvisoryPosts.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} prefetch={false} className={CARD}>
              <h3 className="text-lg font-semibold tracking-tight">{article.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{article.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Read the guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
        <Link href="/vulnerability-guides" prefetch={false} className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
          Explore the React2Shell and framework vulnerability guide collection
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </Section>
      <HomeScanClosing />
    </SiteShell>
  );
}

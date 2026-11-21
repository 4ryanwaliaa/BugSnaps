import Link from "@/components/site/content-link";
import { Check, FileText, X } from "lucide-react";
import { ScanTrustPoints } from "@/components/mypentest/trust-points";
import { Container, Section, SectionTitle } from "@/components/site/page-parts";
import { ScanForm } from "@/components/mypentest/scan-form";
import { SketchUnderline } from "@/components/ui/sketch-underline";
import { BOUNDARIES } from "@/lib/mypentest/content";
import { routes } from "@/lib/mypentest";
import { LAUNCH_OFFER } from "@/lib/plans";

/*
 * Homepage pieces that ask the visitor to run a scan. Every claim here comes
 * from ENGINE_FACTS, BOUNDARIES or the plan copy, so it stays true as the
 * engine changes. No invented numbers, logos or quotes.
 */

/** "Will it break my site?" answered up front, from the engine's real boundaries. */
export function HomeSafety() {
  return (
    <Section labelledBy="safety-title" className="border-t border-white/[0.05]">
      <SectionTitle
        id="safety-title"
        eyebrow="Safe to try"
        title="Built to test your site, not break it."
        lead="MyPentest only runs on a domain you prove you own, and it sticks to checks that read and probe - never ones that change things."
      />
      <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <Check className="h-4 w-4" aria-hidden="true" />
            </span>
            What it does
          </h3>
          <ul className="mt-5 space-y-3">
            {BOUNDARIES.does.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                <Check className="mt-1 h-4 w-4 flex-none text-emerald-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-muted">
              <X className="h-4 w-4" aria-hidden="true" />
            </span>
            What it never does
          </h3>
          <ul className="mt-5 space-y-3">
            {BOUNDARIES.doesNot.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                <X className="mt-1 h-4 w-4 flex-none text-muted-2" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted">
        Finished reports are kept by the engine for up to 24 hours so you can download them, and are never shared.{" "}
        <Link href={routes.product} className="text-accent hover:underline">More on how MyPentest works</Link>
      </p>
    </Section>
  );
}

/** A compact scan box between sections, for people who are convinced mid-page. */
export function HomeScanPrompt() {
  return (
    <section aria-labelledby="scan-prompt-title" className="py-6 sm:py-10">
      <Container>
        <div className="relative overflow-hidden rounded-[24px] border border-primary/25 bg-gradient-to-r from-primary/[0.10] via-surface to-surface p-6 sm:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-[90px]" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-10">
            <div>
              <h2 id="scan-prompt-title" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                See what MyPentest finds on your site.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Enter your domain. You&apos;ll sign in, add one DNS record to prove it&apos;s yours, and the scan starts.
              </p>
            </div>
            <ScanForm className="lg:max-w-none" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/** The last thing on the page: the scan box, with nothing else competing for it. */
export function HomeScanClosing() {
  return (
    <section aria-labelledby="closing-title" className="py-16 sm:py-24">
      <Container>
        <div className="spot relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-surface px-6 py-14 sm:px-12 sm:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[900px] -translate-x-1/2 -translate-y-1/2">
            <div className="radar-rings absolute inset-0 rounded-full" />
            <div className="radar absolute inset-0 rounded-full [mask-image:radial-gradient(circle,black_30%,transparent_68%)]" />
          </div>
          <div aria-hidden="true" className="absolute -top-32 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.16] blur-[110px]" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 id="closing-title" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Run MyPentest free.
            </h2>
            <SketchUnderline className="mx-auto mt-2 h-7 w-40" />
            <p className="mt-4 text-[17px] leading-relaxed text-muted">
              {LAUNCH_OFFER.detail}
            </p>
            <ScanForm className="mt-8 text-left" />
            <ScanTrustPoints className="justify-center text-left" />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
              <Link href={routes.exampleReport} className="inline-flex items-center gap-1.5 text-accent hover:underline">
                <FileText className="h-4 w-4" aria-hidden="true" />
                See an example report first
              </Link>
              <Link href="/contact" className="text-muted hover:text-foreground">
                Need a manual pentest? Talk to us
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

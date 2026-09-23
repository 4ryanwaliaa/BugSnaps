import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductPreview } from "@/components/mypentest/product-preview";
import { newAssessmentUrl } from "@/lib/mypentest";
import { LAUNCH_OFFER } from "@/lib/plans";
import { MYRECON_URL } from "@/lib/site";

export function HomeHero() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-[140px]" />
      </div>

      <section
        aria-labelledby="hero-title"
        className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 pt-28 pb-16 sm:pt-40 sm:pb-24 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-14 lg:px-8"
      >
        <div className="min-w-0">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-accent">
            Penetration testing · automated and expert-led
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-balance sm:text-6xl lg:text-[4rem]"
          >
            Security testing that actually tests.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">
            BugSnaps finds the vulnerabilities an attacker would use — with MyPentest, our automated
            penetration test, and with our testers when you need a human on it.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={newAssessmentUrl()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[15px] font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.08)_inset,0_8px_24px_-8px_rgb(37_99_235/0.5)] transition-colors hover:bg-accent"
            >
              Run MyPentest free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={MYRECON_URL}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 text-[15px] font-medium text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.07]"
            >
              Explore MyRecon
              <ArrowUpRight className="h-4 w-4 text-muted" aria-hidden="true" />
            </a>
          </div>

          <p className="mt-6 text-sm text-muted">
            Need a manual engagement?{" "}
            <Link href="/contact" className="text-foreground underline decoration-white/25 underline-offset-4 hover:decoration-foreground">
              Book a security consultation
            </Link>
          </p>

          <p className="mt-8 font-mono text-[12px] tracking-wide text-muted-2">
            {LAUNCH_OFFER.headline} · No credit card · Only tests domains you prove you own
          </p>
        </div>

        <ProductPreview />
      </section>
    </div>
  );
}

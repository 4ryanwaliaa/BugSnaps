import { SketchUnderline } from "@/components/ui/sketch-underline";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { ScanTheatre } from "@/components/home/scan-theatre";
import { EXAMPLE_REPORT } from "@/lib/mypentest/example";
import { theatreData } from "@/lib/mypentest/theatre";
import { newAssessmentUrl } from "@/lib/mypentest";
import { LAUNCH_OFFER } from "@/lib/plans";
import { MYRECON_URL } from "@/lib/site";

const delay = (seconds: number) => ({ ["--d" as string]: `${seconds}s` });

export function HomeHero() {
  const data = theatreData();

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="dot-grid absolute inset-0" />
        <div className="animate-glow-drift absolute -top-48 left-[12%] h-[560px] w-[760px] rounded-full bg-primary/[0.13] blur-[150px]" />
        <div className="animate-glow-drift absolute top-40 -right-40 h-[420px] w-[520px] rounded-full bg-coral/[0.09] blur-[140px] [animation-delay:-7s]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <section
        aria-labelledby="hero-title"
        className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:grid-cols-[1fr_1.02fr] lg:items-center lg:gap-12 lg:px-8"
      >
        <div className="min-w-0">
          <p
            className="rise inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent"
            style={delay(0)}
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Penetration testing · automated and expert-led
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-[4.3rem]"
          >
            <span className="block">
              Website & API{" "}
              <span className="text-sky-200">penetration</span>{" "}
              <span className="sketch-word">
                <span className="testing-gradient">testing.</span>
                <SketchUnderline className="sketch-underline" />
              </span>
            </span>
          </h1>
          <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty" style={delay(0.55)}>
            Run automated website security checks with MyPentest, review vulnerability evidence and suggested fixes,
            then retest after remediation. Start free or scope an expert-led assessment.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={newAssessmentUrl()}
              className="site-button site-button-primary min-h-14 w-full px-7 text-[15px] sm:w-auto"
            >
              Run MyPentest free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={MYRECON_URL}
              className="site-button site-button-secondary min-h-14 px-6 text-[15px]"
            >
              Explore MyRecon
              <ArrowUpRight className="h-4 w-4 text-muted" aria-hidden="true" />
            </a>
          </div>

          <p className="rise mt-6 text-sm text-muted" style={delay(0.82)}>
            Need a manual engagement?{" "}
            <Link href="/contact" className="text-foreground underline decoration-white/25 underline-offset-4 hover:decoration-foreground">
              Book a security consultation
            </Link>
          </p>

          <p className="rise mt-8 font-mono text-[12px] tracking-wide text-muted-2" style={delay(0.92)}>
            {LAUNCH_OFFER.headline} · No credit card · Only tests domains you prove you own
          </p>
        </div>

        <div className="rise relative min-w-0" style={delay(0.35)}>
          <div aria-hidden="true" className="pointer-events-none mb-4 flex items-center justify-end gap-3 text-coral">
            <span className="sketch-note">a closer look</span>
            <svg className="sketch-arrow h-12 w-16" viewBox="0 0 70 50" fill="none">
              <path d="M6 6C38 0 63 12 52 39M40 29L52 41L64 29" />
            </svg>
          </div>
          <svg aria-hidden="true" className="sketch-spark pointer-events-none absolute -left-5 top-20 h-10 w-10 text-coral" viewBox="0 0 50 50" fill="none">
            <path d="M25 3C24 18 20 23 5 25C20 26 24 31 25 46C27 31 31 27 46 25C31 23 27 18 25 3Z" />
          </svg>
          <div aria-hidden="true" className="absolute -inset-6 rounded-[36px] bg-primary/[0.07] blur-3xl" />
          <ScanTheatre data={data} identities={EXAMPLE_REPORT.identities_count} className="relative" />
        </div>
      </section>
    </div>
  );
}

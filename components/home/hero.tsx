import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { ScanTheatre } from "@/components/home/scan-theatre";
import { Magnetic } from "@/components/ui/motion";
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
        <div className="animate-glow-drift absolute top-40 -right-40 h-[420px] w-[520px] rounded-full bg-sky-500/[0.07] blur-[140px] [animation-delay:-7s]" />
        <div className="header-scan absolute inset-x-0 top-0 h-24" />
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
            className="scan-reveal mt-6 text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-[4.3rem]"
          >
            <span className="scan-text">
              Security testing that{" "}
              <span className="bg-gradient-to-r from-white via-sky-200 to-accent bg-clip-text text-transparent">
                actually tests.
              </span>
            </span>
          </h1>
          <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty" style={delay(0.55)}>
            BugSnaps finds the vulnerabilities an attacker would use - with MyPentest, our automated
            penetration test, and with our testers when you need a human on it.
          </p>

          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={delay(0.7)}>
            <Magnetic>
              <a
                href={newAssessmentUrl()}
                className="shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-[15px] font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.1)_inset,0_10px_34px_-8px_rgb(37_99_235/0.7)] transition-colors hover:bg-accent sm:w-auto"
              >
                Run MyPentest free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Magnetic>
            <a
              href={MYRECON_URL}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 text-[15px] font-medium text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.07]"
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
          <div aria-hidden="true" className="absolute -inset-6 rounded-[36px] bg-primary/[0.07] blur-3xl" />
          <ScanTheatre data={data} identities={EXAMPLE_REPORT.identities_count} className="relative" />
        </div>
      </section>
    </div>
  );
}

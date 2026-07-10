"use client";

import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { risks, promiseSteps } from "@/lib/data";

export function Explainer() {
  return (
    <Section id="why" className="border-y border-white/[0.05] bg-surface/40">
      <SectionHeading
        eyebrow="Why it matters"
        title="Your app holds things people trust you with"
        description="Names, emails, passwords, payments. One missed bug is all it takes for that trust to leak out. Here's what usually goes wrong — in plain words."
      />

      {/* The risks, explained simply — swipe row on phones, grid on sm+ */}
      <RevealGroup
        className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0"
        stagger={0.07}
      >
        {risks.map((risk) => (
          <RevealItem
            key={risk.title}
            className="h-full w-[82vw] max-w-[330px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink"
          >
            <div className="card-hover flex h-full gap-4 rounded-2xl border border-white/[0.07] bg-surface p-5 sm:gap-5 sm:p-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-accent">
                <risk.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">{risk.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{risk.description}</p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* What BugSnaps does about it */}
      <RevealGroup
        className="mt-8 grid overflow-hidden rounded-2xl border border-accent/20 bg-surface sm:grid-cols-3"
        stagger={0.1}
      >
        {promiseSteps.map((step, index) => (
          <RevealItem key={step.title} className="h-full">
            <div
              className={
                index > 0
                  ? "relative h-full border-t border-white/[0.07] p-5 sm:border-t-0 sm:p-8"
                  : "relative h-full p-5 sm:p-8"
              }
            >
              {index > 0 && (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-6 left-0 hidden w-px bg-white/[0.07] sm:block"
                />
              )}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] font-medium text-accent">{step.step}</span>
                <step.icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.description}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

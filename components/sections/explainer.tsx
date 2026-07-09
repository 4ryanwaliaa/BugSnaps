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

      {/* The risks, explained simply */}
      <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2" stagger={0.07}>
        {risks.map((risk) => (
          <RevealItem key={risk.title} className="h-full">
            <div className="card-hover flex h-full gap-5 rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
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
            <div className="relative h-full p-7 sm:p-8">
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

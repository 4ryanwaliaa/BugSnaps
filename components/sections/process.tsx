"use client";

import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { process } from "@/lib/data";

export function Process() {
  return (
    <Section id="how" className="border-y border-white/[0.05] bg-surface/40">
      <SectionHeading
        eyebrow="How it works"
        title="Four steps. No mystery."
        description="From first call to verified fix — you always know where things stand and what happens next."
      />

      <RevealGroup
        className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 sm:mx-0 sm:mt-16 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-2 lg:grid-cols-4"
        stagger={0.08}
      >
        {process.map((step, index) => (
          <RevealItem
            key={step.title}
            className="h-full w-[75vw] max-w-[300px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink"
          >
            <div className="card-hover relative flex h-full flex-col rounded-2xl border border-white/[0.07] bg-surface p-5 sm:p-6">
              <span className="font-mono text-[12px] font-medium tracking-wide text-accent">
                {step.label}
              </span>
              <h3 className="mt-3 text-base font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              <span
                aria-hidden="true"
                className="absolute top-6 right-6 font-mono text-[26px] font-semibold leading-none text-white/[0.06]"
              >
                {index + 1}
              </span>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-10 text-center font-mono text-[12px] tracking-wide text-muted-2">
        Testing mapped to OWASP WSTG &amp; PTES · Rules of engagement agreed in writing before anything starts
      </p>
    </Section>
  );
}

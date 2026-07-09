"use client";

import { Check, ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const included = [
  "Free 30-minute scoping call",
  "Fixed quote in writing — before you commit",
  "Retest of every fix included",
  "No surprise fees, ever",
];

export function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="It depends on what you've built"
        description="A one-page app and a sprawling platform aren't the same job — so we don't pretend one price fits all."
      />

      <Reveal className="mt-14" y={28}>
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-accent/25 bg-surface shadow-[0_0_60px_-20px_rgb(37_99_235/0.3)]">
          <div className="grid sm:grid-cols-[1.2fr_1fr]">
            <div className="p-8 sm:p-10">
              <h3 className="text-xl font-semibold tracking-tight">
                Let&apos;s figure it out together
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Book a short call, walk us through your product, and we&apos;ll scope
                the work with you. You get a clear, fixed quote before anything
                starts — and nothing is billed until you say go.
              </p>
              <div className="mt-7">
                <Button href="#contact" size="lg">
                  Discuss it on a call
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border-t border-white/[0.07] bg-white/[0.015] p-8 sm:border-t-0 sm:border-l sm:p-10">
              <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-muted-2 uppercase">
                Always included
              </p>
              <ul className="mt-5 space-y-3.5">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

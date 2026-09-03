"use client";

import { ArrowRight, Fingerprint, Ghost, Database, ShieldCheck } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const chips = [
  { icon: Ghost, label: "Forgotten accounts" },
  { icon: Database, label: "Data-broker listings" },
  { icon: Fingerprint, label: "Username trails" },
  { icon: ShieldCheck, label: "Breach exposure" },
];

export function PersonalTeaser() {
  return (
    <Section id="personal" className="border-y border-white/[0.05] bg-surface/40">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-surface p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-[-10%] h-[320px] w-[320px] rounded-full bg-primary/[0.12] blur-[120px]"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-medium text-muted">
                <Fingerprint className="h-3.5 w-3.5 text-accent" />
                New · BugSnaps Personal
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Not a business? We&apos;ll clean up your personal footprint too.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
                We find the accounts you forgot you had — old profiles, dead forums, data-broker
                listings — and help you delete them before someone else uses them. Consent-first,
                and it starts with a free scan.
              </p>
              <div className="mt-8">
                <Button href="/personal" size="lg">
                  Explore BugSnaps Personal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {chips.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-4"
                >
                  <c.icon className="h-4.5 w-4.5 shrink-0 text-accent" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium text-foreground/90">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

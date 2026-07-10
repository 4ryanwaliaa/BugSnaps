"use client";

import { Check } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { services } from "@/lib/data";

export function Services() {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        title="Offensive security, delivered as a service"
        description="Focused engagements with a clear scope, a fixed price, and deliverables your engineers can act on the same day."
      />

      <RevealGroup className="mt-14 grid gap-4 sm:mt-16 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <RevealItem key={service.title} className="h-full">
            <article className="card-hover group flex h-full flex-col rounded-2xl border border-white/[0.07] bg-surface p-6 transition-transform sm:p-7 max-lg:bg-gradient-to-b max-lg:from-surface max-lg:to-[#0d0d10] max-lg:active:scale-[0.985]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-accent transition-colors group-hover:border-accent/30 group-hover:bg-accent/10 max-lg:border-accent/20 max-lg:bg-accent/10 max-lg:shadow-[0_0_24px_-6px_rgba(37,99,235,0.55)]">
                <service.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>

              <h3 className="mt-6 text-lg font-semibold tracking-tight">{service.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                {service.description}
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-white/[0.06] pt-5">
                {service.deliverables.map((deliverable) => (
                  <li key={deliverable} className="flex items-center gap-2.5 text-sm text-muted">
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                    {deliverable}
                  </li>
                ))}
              </ul>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

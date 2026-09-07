"use client";

import {
  Check,
  ArrowRight,
  Building2,
  UserRound,
  Fingerprint,
  Trash2,
  Database,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/data";

type SimpleService = {
  icon: LucideIcon;
  title: string;
  description: string;
  deliverables: string[];
};

const individualServices: SimpleService[] = [
  {
    icon: Fingerprint,
    title: "Footprint Discovery",
    description:
      "We find every account and listing tied to your identity across 100+ platforms and public sources.",
    deliverables: ["Full exposure report", "Breach-exposure check", "Free — no obligation"],
  },
  {
    icon: Trash2,
    title: "Account Deletion",
    description:
      "Remove the old and forgotten accounts you no longer want — with your consent, using each platform's official process.",
    deliverables: ["Guided or authorized removal", "Before / after proof", "You approve each one"],
  },
  {
    icon: Database,
    title: "Data-Broker Removal",
    description:
      "Get your name, address, and phone number taken down from people-search sites that sell your data.",
    deliverables: ["Opt-out requests filed", "Tracked to completion", "Recurring option available"],
  },
  {
    icon: KeyRound,
    title: "Access Recovery",
    description:
      "Locked out of your own account? We help you regain access using only the platform's official recovery flow.",
    deliverables: ["Official flow only", "Verified to your inbox", "Re-secured afterwards"],
  },
];

const carouselClasses =
  "no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 " +
  "sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3";
const cardWrapClasses =
  "h-full w-[80vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink";

function GroupLabel({ icon: Icon, kicker, label }: { icon: LucideIcon; kicker: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-accent">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold tracking-tight text-foreground">{label}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-2">{kicker}</span>
      </div>
      <span aria-hidden="true" className="hairline hidden flex-1 sm:block" />
    </div>
  );
}

function ServiceCard({ service }: { service: SimpleService }) {
  return (
    <article className="card-hover group flex h-full flex-col rounded-2xl border border-white/[0.07] bg-surface p-6 transition-transform sm:p-7 max-lg:bg-gradient-to-b max-lg:from-surface max-lg:to-[#0d0d10] max-lg:active:scale-[0.985]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-accent transition-colors group-hover:border-accent/30 group-hover:bg-accent/10 max-lg:border-accent/20 max-lg:bg-accent/10 max-lg:shadow-[0_0_24px_-6px_rgba(37,99,235,0.55)]">
        <service.icon className="h-5 w-5" strokeWidth={1.75} />
      </div>

      <h3 className="mt-6 text-lg font-semibold tracking-tight">{service.title}</h3>
      <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{service.description}</p>

      <ul className="mt-6 space-y-2.5 border-t border-white/[0.06] pt-5">
        {service.deliverables.map((deliverable) => (
          <li key={deliverable} className="flex items-center gap-2.5 text-sm text-muted">
            <Check className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.5} />
            {deliverable}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Services() {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        title="Security for your business — and for you"
        description="For companies, hands-on penetration testing with fixed-scope engagements. For individuals, a clean sweep of the accounts and data you've left scattered online."
      />

      {/* ——— For companies ——— */}
      <div className="mt-14 sm:mt-16">
        <GroupLabel icon={Building2} kicker="Startups · SaaS · SMBs" label="For companies" />
        <RevealGroup className={carouselClasses}>
          {services.map((service) => (
            <RevealItem key={service.title} className={cardWrapClasses}>
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/* ——— For individuals ——— */}
      <div className="mt-16 sm:mt-20">
        <GroupLabel icon={UserRound} kicker="Personal footprint cleanup" label="For individuals" />
        <RevealGroup className={carouselClasses}>
          {individualServices.map((service) => (
            <RevealItem key={service.title} className={cardWrapClasses}>
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-accent/20 bg-accent/[0.05] p-6 sm:flex-row sm:items-center sm:p-7">
          <div>
            <h3 className="text-base font-semibold tracking-tight">BugSnaps Personal</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Consent-first, done-for-you, and it starts with a free scan of what&apos;s already out
              there about you.
            </p>
          </div>
          <Button href="/personal" size="lg" className="shrink-0">
            Explore BugSnaps Personal
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Section>
  );
}

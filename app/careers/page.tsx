
import type { Metadata } from "next";
import { Mail, Search, GraduationCap, HeartHandshake } from "lucide-react";
import { JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { Button } from "@/components/ui/button";
import { ORG_ID, absoluteUrl, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security Researcher & Pentester Careers - BugSnaps",
  absoluteTitle: true,
  description:
    "Join BugSnaps in offensive security and engineering—building MyPentest, PhishLens, EndpointRadar, and MyRecon alongside CEH-led pentesting.",
  path: "/careers",
});

const values = [
  {
    icon: Search,
    title: "Curiosity over credentials",
    description:
      "We care more about how you think than which certificates you hold. If you pull things apart to see how they break, you'll fit right in.",
  },
  {
    icon: GraduationCap,
    title: "Direct engineering ownership",
    description:
      "Small, practitioner-led security team—real ownership from day one across live tools, security research, and client assessments.",
  },
  {
    icon: HeartHandshake,
    title: "Honesty is the product",
    description:
      "We don't inflate findings, pad reports, or pretend to be bigger than we are. If that sounds refreshing rather than scary, we want to meet you.",
  },
];

export default function CareersPage() {
  return (
    <SiteShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Security Researcher & Pentester Careers - BugSnaps",
          description:
            "Join BugSnaps in offensive security and engineering—building MyPentest, PhishLens, EndpointRadar, and MyRecon alongside CEH-led pentesting.",
          url: absoluteUrl("/careers"),
          about: { "@id": ORG_ID },
        }}
      />
      <PageHeader
        crumbs={[{ name: "Careers", path: "/careers" }]}
        eyebrow="Careers"
        title="Break things, legally. Help us build BugSnaps."
        lead="An independent offensive security company in Gurugram—small team, zero bureaucracy, and direct engineering ownership across four live security tools."
      />
      <Section labelledBy="careers-values-title">
        <h2 id="careers-values-title" className="sr-only">How we work</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="spot rounded-2xl border border-white/[0.07] bg-surface p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-accent">
                <value.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-accent/25 bg-surface">
          <div className="p-8 sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight">How to apply</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
              No forms, no portals. Email us your CV and a few honest lines about{" "}
              <span className="text-foreground">why you want to join us</span> - what excites you about security, what you&apos;ve built or broken,
              what you want to learn. That&apos;s it.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button
                href="mailto:aryan@bugsnaps.in?subject=Joining%20BugSnaps"
                size="lg"
              >
                <Mail className="h-4 w-4" />
                aryan@bugsnaps.in
              </Button>
              <p className="text-[13px] text-muted-2">
                We read everything and reply to everyone.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}

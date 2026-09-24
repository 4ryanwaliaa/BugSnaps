import { Section, SectionTitle } from "@/components/site/page-parts";
import { ENGINE_FACTS } from "@/lib/mypentest";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

const POINTS = [
  {
    title: "Real security testing",
    body: `MyPentest maps your app, then runs ${ENGINE_FACTS.checks} checks against it - including signed-in access-control tests - not a sample report.`,
  },
  {
    title: "Automation, then experts",
    body: "Automated coverage on every release. BugSnaps testers for business logic, chained attacks and anything that needs judgement.",
  },
  {
    title: "Actionable findings",
    body: "Every finding has evidence, a CVSS score, how sure we are, and the specific fix - ready for your tracker, or your CI as SARIF.",
  },
  {
    title: "Built for developers and security teams",
    body: "Scoped to domains you prove you own, non-destructive by design, and exports that fit how engineering already works.",
  },
];

export function HomeWhy() {
  return (
    <Section labelledBy="why-title" className="border-t border-white/[0.05]">
      <SectionTitle id="why-title" eyebrow="Why BugSnaps" title="Testing you can act on." />
      <RevealGroup className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:mt-12 sm:grid-cols-2">
        {POINTS.map((point, i) => (
          <RevealItem key={point.title} className="spot h-full bg-background p-6 sm:p-8">
            <p className="font-mono text-[12px] text-accent">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-3 text-base font-semibold tracking-tight">{point.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{point.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

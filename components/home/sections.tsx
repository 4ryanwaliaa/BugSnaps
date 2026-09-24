import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Section, SectionTitle } from "@/components/site/page-parts";
import { ProductPreview } from "@/components/mypentest/product-preview";
import { ScanStory, type StoryStep } from "@/components/home/story";
import { CountUp, Tilt } from "@/components/ui/motion";
import { Reveal } from "@/components/ui/reveal";
import { CHECK_GROUPS, WORKFLOW } from "@/lib/mypentest/content";
import { EXAMPLE_LABEL, EXAMPLE_REPORT, exampleTotals } from "@/lib/mypentest/example";
import { theatreData } from "@/lib/mypentest/theatre";
import { ENGINE_FACTS, routes } from "@/lib/mypentest";
import { EXPORT_FORMATS } from "@/lib/plans";

/*
 * Homepage sections between the hero and the product cards. Every number and
 * console line is either an engine fact (ENGINE_FACTS, plans) or output from
 * the labelled example report - nothing is invented for the animation.
 */

/** An endless ticker of what MyPentest checks for. */
export function HomeMarquee() {
  const items = CHECK_GROUPS.flatMap((group) => [group.title, ...group.tag.split(" · ")]);
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-3 pr-3" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          className="flex items-center gap-3 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.14em] text-muted-2"
        >
          <span className="h-1 w-1 rounded-full bg-accent/70" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="What MyPentest checks" className="marquee edge-fade overflow-hidden border-y border-white/[0.05] bg-surface/40 py-4">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}

function storySteps(): StoryStep[] {
  const data = theatreData();
  const totals = exampleTotals();
  const paths = data.nodes.filter((n) => n.path !== "/").map((n) => n.path);
  const pick = (pattern: RegExp) => paths.find((p) => pattern.test(p));
  const found = [pick(/^\/api\//), pick(/^\/session/), pick(/\.js$/), pick(/^\/\./)].filter(Boolean) as string[];
  const bySeverity = (severity: string) => EXAMPLE_REPORT.clusters.find((c) => c.severity === severity);
  const idor = EXAMPLE_REPORT.clusters.find((c) => /IDOR/i.test(c.title));
  const flagged = [bySeverity("critical"), bySeverity("high"), idor].filter(Boolean) as typeof EXAMPLE_REPORT.clusters;
  const step = (title: string) => WORKFLOW.find((w) => w.title === title)?.body ?? "";

  return [
    {
      phase: "Verify",
      title: "Prove you own it.",
      body: step("Prove you own it"),
      lines: [
        { tone: "cmd", text: `verify ${data.asset}` },
        { tone: "muted", text: "looking up the DNS TXT record" },
        { tone: "ok", text: "record matches this account · ownership verified" },
        { tone: "muted", text: `scope locked to ${data.asset}` },
      ],
    },
    {
      phase: "Map",
      title: "Map the attack surface.",
      body: step("Discovery"),
      lines: [
        { tone: "cmd", text: "map" },
        { tone: "muted", text: "crawling pages, forms and scripts" },
        { tone: "muted", text: "reading JavaScript for API endpoints" },
        ...found.map((path) => ({ tone: "muted" as const, text: `found ${path}` })),
        { tone: "ok", text: `${data.nodes.length} paths with results mapped` },
      ],
    },
    {
      phase: "Test",
      title: "Test it like an attacker would.",
      body: `${step("Testing")} ${ENGINE_FACTS.passiveChecks} passive checks only read; ${ENGINE_FACTS.activeSafeChecks} safe-active checks send harmless probes or sign in as your test accounts.`,
      lines: [
        { tone: "cmd", text: "test" },
        { tone: "ok", text: `signed in as ${EXAMPLE_REPORT.identities_count} test accounts` },
        { tone: "muted", text: `${ENGINE_FACTS.checks} checks · passive and safe-active` },
        ...flagged.map((c) => ({ tone: c.severity as StoryStep["lines"][number]["tone"], text: c.title })),
      ],
    },
    {
      phase: "Report",
      title: "Get evidence and fixes.",
      body: step("Findings and fixes"),
      lines: [
        { tone: "cmd", text: "report" },
        { tone: "ok", text: `${totals.total} findings in ${totals.groups} groups · ${totals.urgent} critical or high` },
        { tone: "muted", text: "CVSS 3.1 · confidence · evidence · fix, for each" },
        { tone: "muted", text: `${EXAMPLE_REPORT.attack_chains.length} attack paths linked` },
        { tone: "muted", text: `exports: ${EXPORT_FORMATS.map((f) => f.toUpperCase()).join(" · ")}` },
      ],
    },
  ];
}

export function HomeHowItRuns() {
  return (
    <Section labelledBy="how-title" className="relative">
      <SectionTitle
        id="how-title"
        eyebrow="How a scan runs"
        title="From a domain to a fix list, in four phases."
        lead="Nothing is sent to your site until ownership is proved, and nothing on it is changed."
      />
      <div className="mt-6 lg:mt-2">
        <ScanStory steps={storySteps()} label={`Example output · ${EXAMPLE_LABEL.split(" · ")[1]}`} />
      </div>
    </Section>
  );
}

/** The engine's real numbers, counted up on arrival. */
export function HomeStats() {
  const stats = [
    { value: ENGINE_FACTS.checks, label: "checks per assessment" },
    { value: ENGINE_FACTS.passiveChecks, label: "passive checks that only read" },
    { value: ENGINE_FACTS.activeSafeChecks, label: "safe-active checks" },
    { value: EXPORT_FORMATS.length, label: "export formats, SARIF included" },
  ];
  return (
    <section aria-label="MyPentest in numbers" className="border-y border-white/[0.05] bg-surface/40">
      <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 lg:grid-cols-4 lg:px-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col-reverse px-6 py-10 sm:py-12 ${i % 2 ? "border-l border-white/[0.05]" : ""} ${i > 1 ? "border-t border-white/[0.05] lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <dt className="mt-3 max-w-[14rem] text-sm leading-relaxed text-muted">{stat.label}</dt>
            <dd className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
              <CountUp to={stat.value} className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-transparent" />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** The report, on a card that tilts under the cursor. */
export function HomeReport() {
  return (
    <Section labelledBy="report-title" className="border-t border-white/[0.05]">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal className="min-w-0">
          <SectionTitle
            id="report-title"
            eyebrow="The report"
            title="Findings you can hand straight to engineering."
            lead="Grouped findings with severity, CVSS 3.1, how certain each one is, the evidence, and the exact fix - plus attack paths and a remediation plan ranked by fix window."
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={routes.exampleReport}
              className="shine inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 text-[15px] font-medium transition-colors hover:border-white/20"
            >
              <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              Open the example report
            </Link>
            <Link href={routes.product} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
              How MyPentest works
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="min-w-0">
          <Tilt>
            <ProductPreview />
          </Tilt>
        </Reveal>
      </div>
    </Section>
  );
}

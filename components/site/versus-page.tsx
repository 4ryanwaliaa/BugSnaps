import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, FileText, HelpCircle, Minus, X } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import {
  FEATURES,
  MYPENTEST_CELLS,
  competitors,
  formatCheckedOn,
  versusPath,
  type Cell,
  type Competitor,
  type FeatureId,
} from "@/lib/competitors";
import { ENGINE_FACTS, newAssessmentUrl, routes } from "@/lib/mypentest";
import { formatPrice, isSingleScan, periodLabel, scansLabel, type Plan } from "@/lib/plans";
import { faqJsonLd } from "@/lib/site";
import { cn } from "@/lib/utils";

const SUPPORT = {
  yes: { Icon: Check, label: "Yes", className: "text-success" },
  partial: { Icon: Minus, label: "Partly", className: "text-medium" },
  no: { Icon: X, label: "No", className: "text-muted-2" },
  unstated: { Icon: HelpCircle, label: "Not stated on their site", className: "text-muted-2" },
} as const;

export function SupportMark({ cell, compact = false }: { cell: Cell; compact?: boolean }) {
  const { Icon, label, className } = SUPPORT[cell.v];
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={cn("mt-0.5 h-4 w-4 flex-none", className)} aria-hidden="true" />
      <span className="min-w-0">
        <span className={cn(compact ? "sr-only" : "block text-[13.5px] font-medium text-foreground")}>{label}</span>
        {!compact && cell.note && <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{cell.note}</span>}
      </span>
    </div>
  );
}

function Legend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-muted-2">
      {Object.values(SUPPORT).map(({ Icon, label, className }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className={cn("h-3.5 w-3.5", className)} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}

function FeatureMatrix({ them }: { them: Competitor }) {
  const groups = [...new Set(FEATURES.map((f) => f.group))];
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
        <caption className="sr-only">Feature comparison of MyPentest and {them.name}</caption>
        <thead>
          <tr className="border-b border-white/[0.08] bg-surface">
            <th scope="col" className="w-[30%] px-4 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">
              Feature
            </th>
            <th scope="col" className="w-[35%] px-4 py-4 text-[15px] font-semibold">
              MyPentest
            </th>
            <th scope="col" className="w-[35%] px-4 py-4 text-[15px] font-semibold">
              {them.name}
            </th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group}>
            <tr className="border-b border-white/[0.06] bg-surface/50">
              <th colSpan={3} scope="colgroup" className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                {group}
              </th>
            </tr>
            {FEATURES.filter((f) => f.group === group).map((feature) => (
              <tr key={feature.id} className="border-b border-white/[0.06]">
                <th scope="row" className="px-4 py-3.5 align-top text-[13.5px] font-medium">
                  {feature.label}
                </th>
                <td className="px-4 py-3.5 align-top">
                  <SupportMark cell={MYPENTEST_CELLS[feature.id]} />
                </td>
                <td className="px-4 py-3.5 align-top">
                  <SupportMark cell={them.cells[feature.id]} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function ProsCons({ title, pros, cons, ours = false }: { title: string; pros: string[]; cons: string[]; ours?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-surface p-6 sm:p-7",
        ours ? "border-primary/30 shadow-[0_0_0_1px_rgb(37_99_235/0.08)]" : "border-white/[0.07]",
      )}
    >
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-success">Strengths</p>
      <ul className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-muted">
        {pros.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Check className="mt-1 h-4 w-4 flex-none text-success" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-high">Trade-offs</p>
      <ul className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-muted">
        {cons.map((item) => (
          <li key={item} className="flex gap-2.5">
            <X className="mt-1 h-4 w-4 flex-none text-high" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ourPriceLine(plan: Plan): string {
  if (plan.price === 0) return `Free - ${scansLabel(plan).toLowerCase()}`;
  const price = formatPrice(plan.price, plan.currency);
  const scans = scansLabel(plan).toLowerCase();
  return isSingleScan(plan) ? `${price} once - ${scans}` : `${price} per ${periodLabel(plan.periodDays)} - ${scans}`;
}

export function VersusPageView({ them, plans }: { them: Competitor; plans: Plan[] }) {
  const path = versusPath(them.slug);
  const title = `MyPentest vs ${them.name}`;
  const checked = formatCheckedOn(them.checkedOn);
  const others = competitors.filter((c) => c.slug !== them.slug);

  return (
    <SiteShell footer="mypentest">
      <JsonLd data={faqJsonLd(them.faq)} />
      <PageHeader
        crumbs={[
          { name: "Compare", path: "/compare" },
          { name: title, path },
        ]}
        eyebrow={`Compare · ${them.category}`}
        title={`${title}: an honest comparison.`}
        lead={them.lead}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-white transition-colors hover:bg-accent"
          >
            Start your free pentest
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href={routes.exampleReport}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-6 text-[15px] text-muted transition-colors hover:border-white/20 hover:text-foreground"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            See an example report
          </Link>
        </div>
        <p className="mt-6 font-mono text-[12px] text-muted-2">
          Facts about {them.name} checked on {checked} against{" "}
          <a href="#sources" className="underline decoration-white/20 underline-offset-2 hover:text-foreground">
            their own pages
          </a>
          .
        </p>
      </PageHeader>

      <Section labelledBy="glance-title">
        <SectionTitle id="glance-title" eyebrow="At a glance" title="Two different tools for two different jobs." />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="spot rounded-2xl border border-primary/30 bg-surface p-6 sm:p-7">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent">MyPentest · by BugSnaps</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              A hosted automated penetration test for web apps and their APIs: discovery, {ENGINE_FACTS.checks} passive and safe-active
              checks, signed-in access-control testing, and a report with evidence, CVSS and fixes.
            </p>
            <p className="mt-5 text-[14px] leading-relaxed">
              <span className="font-medium text-foreground">Best for: </span>
              <span className="text-muted">{them.mypentestBestFor}</span>
            </p>
          </div>
          <div className="spot rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">
              {them.name} · {them.vendor}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{them.summary}</p>
            <p className="mt-5 text-[14px] leading-relaxed">
              <span className="font-medium text-foreground">Best for: </span>
              <span className="text-muted">{them.bestFor}</span>
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="matrix-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="matrix-title"
          eyebrow="Feature by feature"
          title={`What MyPentest and ${them.name} each do.`}
          lead={`Including where MyPentest says no. Where ${them.name}'s site doesn't say, we don't guess.`}
        />
        <div className="mt-10">
          <FeatureMatrix them={them} />
          <Legend />
        </div>
      </Section>

      <Section labelledBy="pc-title" className="border-t border-white/[0.05]">
        <SectionTitle
          id="pc-title"
          eyebrow="Pros and cons"
          title="Strengths and trade-offs - ours too."
          lead="Every tool gives something up. Here's what each one does well, and what you accept by choosing it."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <ProsCons title="MyPentest" pros={them.ourPros} cons={them.ourCons} ours />
          <ProsCons title={them.name} pros={them.theirPros} cons={them.theirCons} />
        </div>
      </Section>

      <Section labelledBy="price-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle id="price-title" eyebrow="Pricing" title="What each one costs." />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col spot rounded-2xl border border-primary/30 bg-surface p-6 sm:p-7">
            <h3 className="text-lg font-semibold tracking-tight">MyPentest</h3>
            <ul className="mt-4 flex-1 divide-y divide-white/[0.06]">
              {plans.map((plan) => (
                <li key={plan.id} className="flex flex-col gap-0.5 py-3 text-[14.5px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <span className="font-medium">{plan.title}</span>
                  <span className="text-muted sm:text-right">{ourPriceLine(plan)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-muted-2">Paid through Razorpay, in rupees. Nothing renews automatically.</p>
            <Link href="/pricing" className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              Full pricing
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col spot rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
            <h3 className="text-lg font-semibold tracking-tight">{them.name}</h3>
            <ul className="mt-4 flex-1 space-y-3 text-[14.5px] leading-relaxed text-muted">
              {them.pricing.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2.5 h-1 w-1 flex-none rounded-full bg-muted-2" />
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-muted-2">As listed on their site on {checked}. Check theirs for current prices.</p>
            <a
              href={them.website}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              {them.name}&apos;s site
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Section>

      <Section labelledBy="choose-title" className="border-t border-white/[0.05]">
        <SectionTitle id="choose-title" eyebrow="The verdict" title="Which one should you choose?" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="spot rounded-2xl border border-primary/30 bg-surface p-6 sm:p-7">
            <h3 className="text-base font-semibold">Choose MyPentest if…</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{them.chooseUs}</p>
            <a href={newAssessmentUrl()} className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              Run MyPentest free
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="spot rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
            <h3 className="text-base font-semibold">Choose {them.name} if…</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{them.chooseThem}</p>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-muted">
          Need more than any automated tool gives you?{" "}
          <Link href="/penetration-testing" className="text-accent hover:underline">
            A BugSnaps manual pentest
          </Link>{" "}
          covers business logic and chained attacks, with retesting of fixes.
        </p>
      </Section>

      <Section labelledBy="faq-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle id="faq-title" eyebrow="FAQ" title={`MyPentest vs ${them.name}: common questions.`} />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {them.faq.map((item) => (
            <details key={item.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <h3>{item.question}</h3>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section labelledBy="sources-title" id="sources" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 id="sources-title" className="text-xl font-semibold tracking-tight">
              Sources
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {them.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-accent hover:underline">
                    {s.label}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-2">
              Checked on {checked}. Products change - if something here is out of date,{" "}
              <Link href="/contact" className="underline decoration-white/20 underline-offset-2 hover:text-foreground">
                tell us
              </Link>{" "}
              and we&apos;ll correct it. {them.name} is a trademark of its owner; BugSnaps is not affiliated with{" "}
              {them.vendor}.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">More comparisons</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <Link href={versusPath(c.slug)} className="text-sm text-accent hover:underline">
                    MyPentest vs {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/compare" className="text-sm text-accent hover:underline">
                  All comparisons
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <CtaBand title={`Try MyPentest before you decide.`} />
    </SiteShell>
  );
}

/** The hub's all-tools matrix: compact icons, one column per tool. */
export function AllToolsMatrix({ features }: { features: FeatureId[] }) {
  const rows = FEATURES.filter((f) => features.includes(f.id));
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full min-w-[860px] border-collapse text-left text-[13.5px]">
        <caption className="sr-only">MyPentest compared with named alternatives</caption>
        <thead>
          <tr className="border-b border-white/[0.08] bg-surface">
            <th scope="col" className="sticky left-0 z-10 w-[24%] bg-surface px-4 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">
              Feature
            </th>
            <th scope="col" className="px-3 py-4 text-center font-semibold text-accent">
              MyPentest
            </th>
            {competitors.map((c) => (
              <th key={c.slug} scope="col" className="px-3 py-4 text-center font-semibold">
                <Link href={versusPath(c.slug)} className="hover:text-accent">
                  {c.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((feature) => (
            <tr key={feature.id} className="border-b border-white/[0.06] last:border-0">
              <th scope="row" className="sticky left-0 z-10 bg-background px-4 py-3 align-top font-medium">
                {feature.label}
              </th>
              <td className="bg-primary/[0.05] px-3 py-3">
                <div className="flex justify-center" title={MYPENTEST_CELLS[feature.id].note}>
                  <SupportMark cell={MYPENTEST_CELLS[feature.id]} compact />
                </div>
              </td>
              {competitors.map((c) => (
                <td key={c.slug} className="px-3 py-3">
                  <div className="flex justify-center" title={c.cells[feature.id].note}>
                    <SupportMark cell={c.cells[feature.id]} compact />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { Legend as SupportLegend };

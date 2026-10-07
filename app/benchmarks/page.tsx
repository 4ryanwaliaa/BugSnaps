import Link from "next/link";
import { ArrowRight, Download, FlaskConical, ListChecks, ShieldCheck } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "AI Pentesting Benchmarks: MyPentest Evaluation Method",
  description:
    "Compare MyPentest, Strix and DAST tools using reproducible AI pentesting benchmarks for precision, recall, evidence, coverage and cost. Download evaluation templates.",
  path: "/benchmarks",
});

const metrics = [
  ["Precision", "TP / (TP + FP)", "Deduplicate findings by vulnerability and endpoint; independently reproduce reported issues."],
  ["Recall", "TP / (TP + FN)", "Use a frozen set of seeded, reachable vulnerabilities. Disclose misses and excluded classes."],
  ["False positive rate", "FP / (FP + TN)", "Define benign cases first. FP / (TP + FP) is false discovery rate, a different metric."],
  ["Evidence completeness", "Reproducible findings / reported findings", "Review sanitized requests, responses, controls and reproduction steps. Label suspected findings separately."],
  ["Reachable case coverage", "Exercised cases / eligible cases", "Record authentication failures, blocked routes, scope exclusions and unfinished checks. Explain which cases can contribute to detection scores."],
  ["Setup and scan time", "Minutes per run", "Measure onboarding, authentication setup, scan duration and human triage separately."],
  ["Total cost", "Cost per run and validated finding", "Include plan allocation, model usage, infrastructure and operator time; state currency and billing assumptions."],
];

const protocol = [
  ["Freeze the target and ground truth", "Use an isolated, authorized copy of OWASP Juice Shop plus a versioned fixture with seeded tenant-access flaws and benign controls. Record image digests, source commits and known vulnerabilities. Do not scan public training instances."],
  ["Make access comparable", "Supply the same roles, accounts, endpoints and exclusions. Evaluate black-box runtime testing separately from source-assisted testing. Agree on eligible cases and record inaccessible cases rather than silently removing them."],
  ["Record each configuration", "Publish edition, engine version, enabled checks, scan budget and timeouts. For agents, record model, prompt, token usage and permitted actions. Redact credentials and customer data from artifacts."],
  ["Repeat and independently review", "Reset the fixture between runs and perform at least three runs per configuration. Publish per-run counts and variability. Have a reviewer reproduce findings against ground truth; label vendor-run work as vendor-run."],
  ["Publish enough to reproduce", "Release the fixture manifest, sanitized raw reports, TP/FP/FN/TN labels, exclusions, timings and cost calculations. Update scores only when linked artifacts support them. A lab score does not establish production security."],
];

const cases = [
  {
    id: "AUTH-01",
    category: "Cross-tenant access",
    fixture: "Two test accounts with separate records and a deliberately broken object authorization check.",
    evidence: "Show that the second account can read a record it does not own. Repeat against the fixed control, which must deny the same access.",
    limit: "Authentication and both records must be reachable. A failed login is a coverage gap.",
  },
  {
    id: "INPUT-01",
    category: "Input handling",
    fixture: "A seeded input vulnerability with a comparable endpoint that handles the same input safely.",
    evidence: "Provide a repeatable response difference attributable to the seeded flaw, with a benign control and the expected fixture behavior.",
    limit: "A reflected string or isolated error message is not sufficient proof of every injection class.",
  },
  {
    id: "SECRET-01",
    category: "Secret exposure",
    fixture: "An intentionally exposed, inert server-secret fixture beside a documented public client identifier.",
    evidence: "Identify the server-secret fixture and its source. Avoid treating the intentionally public identifier as a secret without additional evidence.",
    limit: "Use inert values in the lab. Do not publish usable credentials or probe real third-party accounts.",
  },
  {
    id: "SESSION-01",
    category: "Session lifecycle",
    fixture: "A test login with a seeded revocation failure and a control that correctly ends the session.",
    evidence: "Record whether the same session can still access a protected test route after logout, including the expected control result.",
    limit: "A different browser session or a public endpoint does not establish a logout failure.",
  },
  {
    id: "SCOPE-01",
    category: "Scope and interruption",
    fixture: "Explicitly permitted lab routes, an excluded route and a run stopped before completion.",
    evidence: "Retain the request trace and report which permitted cases ran, which were skipped and whether any excluded route was requested.",
    limit: "An unfinished run must remain visible. Do not present its missing findings as verified negatives.",
  },
  {
    id: "FIX-01",
    category: "Remediation usefulness",
    fixture: "The same lab finding before a patch and after a versioned fix, with access and configuration held constant.",
    evidence: "Review whether the report explains the affected boundary, reproduction and a useful fix, then repeat the original check against the patched version.",
    limit: "Measure operator review time separately. Automatic patching is not assumed.",
  },
];

const evidenceRequirements = [
  ["A specific affected boundary", "Identify the endpoint, role, preconditions and relevant test case. Explain what security property failed."],
  ["A repeatable observation", "Keep sanitized requests, responses and reproduction steps. The reviewer must be able to repeat the behavior in the frozen fixture."],
  ["A meaningful control", "Compare against the expected behavior of a benign or patched case. Rule out authentication failures and generic responses."],
  ["An explicit review outcome", "Label confirmed findings, false alarms, missed seeded cases and unresolved observations separately. Keep unresolved observations outside scores until reviewed, and publish their count."],
];

const faqs = [
  {
    question: "Does BugSnaps publish measured results against Strix?",
    answer:
      "No. This page publishes an evaluation method and proposed lab cases, not completed head-to-head results. Detection scores, false positive percentages and speed advantages are not established until reproducible run artifacts are published.",
  },
  {
    question: "How should I compare AI penetration testing tools?",
    answer:
      "Use the same authorized fixture, roles, endpoints and test budget. Record each tool's configuration, independently reproduce findings, count misses and false alarms, and measure setup, triage and total cost. Keep runtime testing and source-assisted testing in separate comparisons.",
  },
  {
    question: "Are the example test cases actual MyPentest results?",
    answer:
      "No. The cases are proposed evaluation fixtures and evidence requirements. They do not report scans, scores or confirmed coverage by MyPentest or any competitor. The downloadable CSV files are empty recording templates.",
  },
  {
    question: "What happens if a route or account is unavailable during a benchmark?",
    answer:
      "Record the access failure and its effect on coverage. Do not label an inaccessible case as a verified negative. Publish eligible cases, excluded cases and unresolved observations alongside scores so readers can see how much of the fixture was exercised.",
  },
  {
    question: "Which tool should I choose before benchmark results exist?",
    answer:
      "Compare workflow fit first. Review whether you need hosted web application assessment, an agent-driven testing workflow, source analysis or manual business-logic review. Check scope, data handling, evidence, setup and costs, then trial the same authorized staging target.",
  },
  {
    question: "Does a benchmark or automated report certify compliance?",
    answer:
      "No. Results describe a particular test configuration. A report may support remediation or an audit, but certification and acceptance depend on the applicable standard and assessor.",
  },
];

export default function BenchmarksPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[{ name: "Compare", path: "/compare" }, { name: "Benchmarks", path: "/benchmarks" }]}
        eyebrow="Reproducible evaluation"
        title="AI pentesting benchmarks that you can verify."
        lead="Compare MyPentest, Strix and DAST tools on the same target, with the same access and published ground truth. Measure the quality of the evidence and the effort to act on it before choosing a winner."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#evaluation-cases" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent">
            Explore evaluation cases <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="/benchmarks/run-template.csv" download className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium transition-colors hover:border-white/20">
            Download run template <Download className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </PageHeader>

      <Section labelledBy="results-title">
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-9">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-accent">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> Methodology only
          </p>
          <SectionTitle
            id="results-title"
            title="Results status: head-to-head measurements pending."
            lead="Prepared by BugSnaps. Methodology updated 8 October 2026. No completed comparative run artifacts are published here. This is not an independent assessment."
          />
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
            The material below defines what a useful comparison should contain. It does not establish that MyPentest is more accurate, faster or cheaper than another tool. Product comparisons describe workflow fit; published run evidence is needed to support performance claims.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-4 text-sm font-medium text-accent">
            <Link href="/compare/mypentest-vs-strix" className="hover:underline">MyPentest vs Strix</Link>
            <Link href="/us-vs-competitors" className="hover:underline">Compare AI security workflows</Link>
            <Link href="/mypentest/example-report" className="hover:underline">Review an example report</Link>
          </div>
        </div>
      </Section>

      <Section labelledBy="cases-title" id="evaluation-cases" className="scroll-mt-24 border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="cases-title"
          eyebrow="Proposed lab cases"
          title="Evaluate useful security outcomes."
          lead="These examples describe fixtures to build and evidence to review. They are evaluation criteria, not completed scans or claims that a tool detects every case."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {cases.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
              <p className="font-mono text-[11px] tracking-wide text-accent">{item.id} / Proposed case</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.category}</h3>
              <dl className="mt-5 space-y-4 text-sm leading-relaxed">
                <div><dt className="font-medium">Fixture</dt><dd className="mt-1 text-muted">{item.fixture}</dd></div>
                <div><dt className="font-medium">Evidence to review</dt><dd className="mt-1 text-muted">{item.evidence}</dd></div>
                <div className="border-t border-white/[0.07] pt-4"><dt className="font-medium">Interpretation limit</dt><dd className="mt-1 text-muted">{item.limit}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
          Keep a separate row for each tool, run and case. Record expected behavior before the run, then attach the observation and review outcome. A case template is available below.
        </p>
      </Section>

      <Section labelledBy="metrics-title" className="border-t border-white/[0.05]">
        <SectionTitle
          id="metrics-title"
          eyebrow="Counts before percentages"
          title="What to measure in a pentesting benchmark."
          lead="A high finding count is not enough. Measure validated issues, missed cases, coverage and the total work needed to turn a report into a decision."
        />
        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.07]" role="region" aria-label="Benchmark metrics table" tabIndex={0}>
          <table className="w-full min-w-[700px] text-left text-sm">
            <caption className="sr-only">Benchmark calculations and review requirements. Scroll horizontally on smaller screens.</caption>
            <thead className="bg-surface"><tr>{["Metric", "Calculation", "Review requirement"].map((heading) => <th key={heading} scope="col" className="p-4 font-medium">{heading}</th>)}</tr></thead>
            <tbody>{metrics.map(([metric, calculation, detail]) => (
              <tr key={metric} className="border-t border-white/[0.07]">
                <th scope="row" className="p-4 align-top font-medium">{metric}</th>
                <td className="p-4 align-top font-mono text-xs leading-relaxed text-accent">{calculation}</td>
                <td className="p-4 align-top leading-relaxed text-muted">{detail}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          TP: true positives. FP: false positives. FN: false negatives. TN: true negatives. Report counts beside percentages. A zero denominator means the metric is not available. Ground truth is the expected behavior defined and reviewed before testing.
        </p>
      </Section>

      <Section labelledBy="evidence-title" className="border-t border-white/[0.05] bg-surface/40">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <ShieldCheck className="mb-5 h-6 w-6 text-accent" aria-hidden="true" />
            <SectionTitle
              id="evidence-title"
              eyebrow="Finding review"
              title="Define what counts as a confirmed finding."
              lead="A reviewer should be able to follow the report from the affected boundary to a repeatable observation. An AI explanation or a generic error does not replace that evidence."
            />
            <Link href="/improvements" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              Connect findings to fixes and retests <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="space-y-3">
            {evidenceRequirements.map(([title, body]) => (
              <li key={title} className="rounded-xl border border-white/[0.07] bg-surface p-5">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section labelledBy="protocol-title" className="border-t border-white/[0.05]">
        <SectionTitle id="protocol-title" eyebrow="Repeatable method" title="The benchmark protocol." lead="Use this sequence for every configuration so the results remain comparable and the limits stay visible." />
        <ol className="mt-10 grid gap-4">
          {protocol.map(([title, body], index) => (
            <li key={title} className="flex gap-5 rounded-2xl border border-white/[0.07] bg-surface p-6">
              <span className="mt-0.5 font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
              <div><h3 className="font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{body}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
          Reference materials: <a className="text-accent underline" href="https://owasp.org/projects/juice-shop">OWASP Juice Shop</a> is an intentionally vulnerable application suitable for testing tools; the <a className="text-accent underline" href="https://owasp.org/projects/web-security-testing-guide">OWASP Web Security Testing Guide</a> provides web security testing guidance. Neither endorses BugSnaps or supplies a MyPentest score. The benchmark design above is proposed by BugSnaps.
        </p>
      </Section>

      <Section labelledBy="templates-title" className="border-t border-white/[0.05] bg-surface/40">
        <div className="rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-9">
          <ListChecks className="mb-5 h-6 w-6 text-accent" aria-hidden="true" />
          <SectionTitle
            id="templates-title"
            eyebrow="Bring your own evidence"
            title="Download empty evaluation templates."
            lead="The run record captures configuration, counts, time and cost. The case record connects each expected result to an observation and a review outcome. Both files contain a header only; they are not benchmark data."
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="/benchmarks/run-template.csv" download className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium transition-colors hover:border-white/20">
              Run record CSV <Download className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/benchmarks/case-template.csv" download className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium transition-colors hover:border-white/20">
              Case review CSV <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="AI pentesting benchmark questions." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {faqs.map((item) => (
            <details key={item.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Evaluate your authorized application."
        lead="Review the scope and example report, then compare findings on a controlled staging target."
        secondary={{ label: "Explore the improvement workflow", href: "/improvements" }}
      />
    </SiteShell>
  );
}

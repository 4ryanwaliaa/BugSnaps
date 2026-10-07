import Link from "next/link";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Pentesting Benchmarks: MyPentest vs Strix Evaluation Method",
  description: "Evaluate MyPentest, Strix and DAST tools with a reproducible benchmark protocol for precision, recall, evidence, setup and cost. Results status and limitations.",
  path: "/benchmarks",
});
const metrics = [
  ["Precision", "TP / (TP + FP)", "Deduplicate findings by vulnerability and endpoint; independently reproduce reported issues."],
  ["Recall", "TP / (TP + FN)", "Use a frozen list of seeded, reachable vulnerabilities. Count misses and disclose excluded classes."],
  ["False positive rate", "FP / (FP + TN)", "Define benign cases first. FP / (TP + FP) is false discovery rate, a different metric."],
  ["Evidence completeness", "Reproducible findings / reported findings", "Review sanitized requests, responses, controls and reproduction steps. Label suspected findings separately."],
  ["Setup and scan time", "Minutes per run", "Measure onboarding, authentication setup, scan duration and human triage separately."],
  ["Total cost", "Cost per run and validated finding", "Include plan allocation, model usage, infrastructure and operator time; state currency and billing assumptions."],
];
const protocol = [
  ["Freeze the target and ground truth", "Use an isolated, authorized copy of OWASP Juice Shop plus a versioned fixture with seeded tenant-access flaws and benign controls. Record image digests, source commits and known vulnerabilities. Do not scan public training instances."],
  ["Make access comparable", "Supply the same roles, accounts, endpoints and exclusions. Evaluate black-box runtime testing separately from source-assisted testing. Record inaccessible cases rather than silently removing them."],
  ["Record each configuration", "Publish edition, engine version, enabled checks, scan budget and timeouts. For agents, record model, prompt, token usage and permitted actions. Redact secrets from artifacts."],
  ["Repeat and independently review", "Reset the fixture between runs and perform at least three runs per configuration. Publish per-run counts and variability. Have a reviewer reproduce findings against ground truth; label vendor-run work as vendor-run."],
  ["Publish enough to reproduce", "Release the fixture manifest, sanitized raw reports, TP/FP/FN/TN labels, exclusions, timings and cost calculations. Update scores only when linked artifacts support them. A lab score does not establish production security."],
];
const faqs = [
  { question: "Does BugSnaps publish measured results against Strix?", answer: "No. This page publishes an evaluation method, not completed head-to-head results. Detection scores, false positive percentages and speed advantages are not established until reproducible run artifacts are published." },
  { question: "Which tool should I choose before benchmark results exist?", answer: "Compare workflow fit first. MyPentest offers a hosted assessment of a deployed web app. Strix offers agent-driven testing with local and cloud editions. Review scope, data handling and costs, then trial the same authorized staging target." },
  { question: "Does a benchmark or automated report certify compliance?", answer: "No. Results describe a particular test configuration. A report may support remediation or an audit, but certification and acceptance depend on the applicable standard and assessor." },
];
export default function BenchmarksPage() {
  return <SiteShell>
    <JsonLd data={faqJsonLd(faqs)} />
    <PageHeader crumbs={[{ name: "Compare", path: "/compare" }, { name: "Benchmarks", path: "/benchmarks" }]} eyebrow="Reproducible evaluation" title="Pentesting benchmarks that you can verify." lead="Compare MyPentest, Strix and DAST tools on the same target, with the same access and published ground truth. Measure findings and total effort before choosing a winner." />
    <Section labelledBy="results-title">
      <SectionTitle id="results-title" title="Results status: head-to-head measurements pending." lead="Prepared by BugSnaps. Methodology updated 7 October 2026. No completed comparative run artifacts are published here. This is not an independent assessment." />
      <div className="mt-6 flex flex-wrap gap-5 text-sm text-accent"><Link href="/compare/mypentest-vs-strix">MyPentest vs Strix</Link><Link href="/us-vs-competitors">Compare competitors</Link><a href="/benchmarks/run-template.csv" download>Download the empty run-record CSV</a></div>
    </Section>
    <Section labelledBy="metrics-title" className="border-t border-white/10">
      <SectionTitle id="metrics-title" title="What to measure." />
      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><caption className="sr-only">Benchmark calculations and review requirements</caption><thead><tr>{["Metric", "Calculation", "Review requirement"].map(h => <th key={h} scope="col" className="p-4">{h}</th>)}</tr></thead><tbody>{metrics.map(([metric, calculation, detail]) => <tr key={metric} className="border-t border-white/10"><th scope="row" className="p-4 font-medium">{metric}</th><td className="p-4 text-accent">{calculation}</td><td className="p-4 text-muted">{detail}</td></tr>)}</tbody></table></div>
      <p className="mt-4 text-sm text-muted">TP: true positives. FP: false positives. FN: false negatives. TN: true negatives. Report counts beside percentages. A zero denominator means the metric is not available.</p>
    </Section>
    <Section labelledBy="protocol-title" className="border-t border-white/10"><SectionTitle id="protocol-title" title="The benchmark protocol." /><ol className="mt-8 grid gap-5">{protocol.map(([title, body], i) => <li key={title} className="rounded-2xl border border-white/10 bg-surface p-6"><h3 className="font-semibold">{i + 1}. {title}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{body}</p></li>)}</ol><p className="mt-6 text-sm text-muted">Reference materials: <a className="text-accent underline" href="https://owasp.org/www-project-juice-shop/">OWASP Juice Shop</a> for a vulnerable fixture; <a className="text-accent underline" href="https://owasp.org/www-project-web-security-testing-guide/">OWASP Web Security Testing Guide</a> for test categories. Neither endorses BugSnaps or supplies a MyPentest score.</p></Section>
    <Section labelledBy="faq-title" className="border-t border-white/10"><SectionTitle id="faq-title" title="Pentesting benchmark questions." /><div className="mt-8 space-y-4">{faqs.map(f => <details key={f.question} className="rounded-xl border border-white/10 p-5"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-3 text-sm leading-relaxed text-muted">{f.answer}</p></details>)}</div></Section>
    <CtaBand title="Evaluate your authorized application." lead="Review the scope and example report, then compare findings on a controlled staging target." />
  </SiteShell>;
}

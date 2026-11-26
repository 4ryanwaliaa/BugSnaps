import Link from "@/components/site/content-link";
import { JsonLd, PageHeader, Prose, Section, SiteShell } from "@/components/site/page-parts";
import { absoluteUrl, ORG, ORG_ID, pageMetadata, techArticleJsonLd } from "@/lib/site";
import run from "@/public/benchmarks/phishlens-offline-2026-11-25.json";
import registryRun from "@/public/benchmarks/phishlens-dotgov-2026-11-26.json";

const path = "/benchmarks/phishing-link-checker";
const headline = "Phishing link checker benchmark";
const published = "2026-11-25";
const modified = "2026-11-27";
const description =
  "See how PhishLens reviewed 141,480 threat-listed hostnames and 17,149 registered .gov domains offline. Read the method and download aggregate results.";

export const metadata = pageMetadata({
  title: "Phishing Link Checker Benchmark | PhishLens",
  description,
  path,
  type: "article",
  published,
  modified,
});

const counts = run.counts;
const registryCounts = registryRun.counts;
const flagged = counts.highConcern + counts.review;
const registryFlagged = registryCounts.highConcern + registryCounts.review;
const formatCount = new Intl.NumberFormat("en-US");
const formatRate = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 });
const outcomes = [
  { name: "High concern", key: "highConcern", meaning: "Stronger patterns in the hostname text." },
  { name: "Review", key: "review", meaning: "Patterns worth a closer look." },
  { name: "No obvious signals", key: "noObviousSignals", meaning: "No pattern strong enough to flag." },
] as const;
const samples = [
  { label: "Threat-listed hostnames", counts },
  { label: "Registered .gov domains", counts: registryCounts },
];
const datasets = [
  {
    anchor: "aggregate-results",
    name: "PhishLens offline verdicts for threat-listed hostnames",
    description: "Aggregate verdict counts and run details from the 25 November 2026 PhishLens hostname-only evaluation. Includes counts for high concern, review, and no obvious signals.",
    datePublished: published,
    evaluatedAt: run.evaluatedAt,
    downloadPath: "/benchmarks/phishlens-offline-2026-11-25.json",
    downloadLabel: "Threat-listed results (JSON)",
  },
  {
    anchor: "dotgov-results",
    name: "PhishLens offline verdicts for registered U.S. .gov domains",
    description: "Aggregate verdict counts for 17,149 registered second-level .gov domain names from the 25 November 2026 CISA registry snapshot. Evaluated offline on 26 November 2026.",
    datePublished: "2026-11-26",
    evaluatedAt: registryRun.evaluatedAt,
    downloadPath: "/benchmarks/phishlens-dotgov-2026-11-26.json",
    downloadLabel: "Registered .gov results (JSON)",
  },
].map((dataset) => ({ ...dataset, url: `${absoluteUrl(path)}#${dataset.anchor}` }));
const formatDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" });
const benchmarkPublisher = { "@type": "Organization", "@id": ORG_ID, name: ORG.name };

export default function PhishingLinkCheckerBenchmark() {
  return (
    <SiteShell>
      <JsonLd data={techArticleJsonLd({ headline, description, path, datePublished: published, dateModified: modified })} />
      {datasets.map((dataset) => (
        <JsonLd key={dataset.anchor} data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          "@id": dataset.url,
          url: dataset.url,
          identifier: dataset.url,
          name: dataset.name,
          description: dataset.description,
          creator: benchmarkPublisher,
          publisher: benchmarkPublisher,
          datePublished: dataset.datePublished,
          isAccessibleForFree: true,
          distribution: {
            "@type": "DataDownload",
            contentUrl: absoluteUrl(dataset.downloadPath),
            encodingFormat: "application/json",
          },
        }} />
      ))}
      <PageHeader
        crumbs={[
          { name: "Benchmarks", path: "/benchmarks" },
          { name: "Phishing link checker", path },
        ]}
        title={headline}
        lead={`PhishLens flagged ${formatCount.format(flagged)} of ${formatCount.format(counts.parsed)} threat-listed hostnames (${formatRate.format(flagged / counts.parsed)}) and ${formatCount.format(registryFlagged)} of ${formatCount.format(registryCounts.parsed)} registered .gov domains (${formatRate.format(registryFlagged / registryCounts.parsed)}) for review in two offline evaluations.`}
      >
        <div className="flex flex-wrap gap-3">
          {datasets.map((dataset) => (
            <a key={dataset.anchor} href={dataset.downloadPath} download className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 py-2.5 text-base font-medium hover:border-accent/50">
              {dataset.downloadLabel}
            </a>
          ))}
        </div>
      </PageHeader>

      <Section labelledBy="phish-results">
        <h2 id="phish-results" className="text-2xl font-semibold tracking-tight">What PhishLens reported</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
          BugSnaps ran the threat-list evaluation on 25 November 2026 and the .gov registry evaluation on 26 November using the same engine revision. All entries were unique within each sample and parsed successfully. Shares use each sample’s own total.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm sm:text-base">
            <caption className="sr-only">Offline PhishLens verdict counts and shares by hostname sample</caption>
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="px-2.5 py-3 sm:px-4">Verdict</th>
                {samples.map((sample) => (
                  <th key={sample.label} scope="col" className="px-2.5 py-3 text-right sm:px-4">{sample.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {outcomes.map((outcome) => (
                <tr key={outcome.name} className="border-t border-white/10">
                  <th scope="row" className="px-2.5 py-3 font-medium sm:px-4">
                    {outcome.name}
                    <span className="block text-sm font-normal text-muted">{outcome.meaning}</span>
                  </th>
                  {samples.map((sample) => (
                    <td key={sample.label} className="px-2.5 py-3 text-right tabular-nums sm:px-4">
                      {formatCount.format(sample.counts[outcome.key])}
                      <span className="block text-sm text-muted">{formatRate.format(sample.counts[outcome.key] / sample.counts.parsed)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section labelledBy="phish-method" className="border-t border-white/10">
        <h2 id="phish-method" className="text-2xl font-semibold tracking-tight">Method and limits</h2>
        <Prose>
          <p>
            We verified the checksum of PhishDestroy’s 27 October 2026 DNS-active snapshot and passed its hostnames to the same URL-pattern engine used by PhishLens. PhishDestroy lists suspected phishing, scams and crypto-drainer infrastructure. Its DNS-active label means a hostname resolved during the provider’s check.
          </p>
          <p>
            The registry evaluation used the second-level names in CISA’s 25 November 2026 .gov registry snapshot. Only verified U.S. government organizations can register .gov domains. The snapshot includes domains on hold and domains that may lack a website. Registry membership describes the registrant. It leaves the safety of individual pages unverified.
          </p>
          <p>
            Each flagged rate describes its own hostname sample. These results cannot estimate false positives or overall accuracy. We contacted zero listed domains. URL paths, redirects, page content, message context and optional reputation or DNS lookups were outside both runs. The downloads record snapshot revisions, checksums and aggregate counts. BugSnaps develops PhishLens and ran both evaluations in-house.
          </p>
          <p>
            <a href="https://phishdestroy.io/dataset">PhishDestroy dataset documentation</a>{" · "}
            <a href="https://get.gov/about/data/">CISA .gov registry data</a>{" · "}
            <a href="https://get.gov/domains/eligibility/">.gov registration eligibility</a>
          </p>
        </Prose>
        <h3 className="mt-10 text-xl font-semibold tracking-tight">How to cite the benchmark data</h3>
        <ul className="mt-4 max-w-3xl space-y-4">
          {datasets.map((dataset) => (
            <li key={dataset.anchor} id={dataset.anchor} className="scroll-mt-24 rounded-xl border border-white/10 bg-surface/40 px-4 py-3 text-sm leading-relaxed sm:text-base">
              <p>{ORG.name}. <cite><a href={`#${dataset.anchor}`} className="font-medium text-accent underline underline-offset-4">{dataset.name}</a></cite>. Evaluated <time dateTime={dataset.evaluatedAt.slice(0, 10)}>{formatDate.format(new Date(dataset.evaluatedAt))}</time>.</p>
              <a href={dataset.downloadPath} download className="mt-2 inline-block text-sm text-accent hover:underline">{dataset.downloadLabel}</a>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="phish-use" className="border-t border-white/10">
        <h2 id="phish-use" className="text-2xl font-semibold tracking-tight">What to do with a clean-looking result</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
          Treat a link check as one piece of evidence. If a message asks you to sign in, pay or share a code, open the official app or use a trusted bookmark. If you already interacted with the message, follow the incident triage steps.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-base">
          <Link href="/phishing-detector" className="font-medium text-accent hover:underline">Try PhishLens</Link>
          <Link href="/compare/phishing-link-checkers" className="text-accent hover:underline">Compare link checkers</Link>
          <Link href="/guides/phishing-click-incident-triage" className="text-accent hover:underline">Phishing click incident triage</Link>
        </div>
      </Section>
    </SiteShell>
  );
}

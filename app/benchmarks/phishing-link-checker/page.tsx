import Link from "@/components/site/content-link";
import { JsonLd, PageHeader, Prose, Section, SiteShell } from "@/components/site/page-parts";
import { absoluteUrl, ORG, ORG_ID, pageMetadata, techArticleJsonLd } from "@/lib/site";
import run from "@/public/benchmarks/phishlens-offline-2026-11-25.json";

const path = "/benchmarks/phishing-link-checker";
const resultsPath = "/benchmarks/phishlens-offline-2026-11-25.json";
const headline = "Phishing link checker benchmark";
const published = "2026-11-25";
const description =
  "See how PhishLens flagged 6,536 of 141,480 threat-listed hostnames offline. Read the method, limitations and downloadable aggregate results.";

export const metadata = pageMetadata({
  title: "Phishing Link Checker Benchmark | PhishLens",
  description,
  path,
  type: "article",
  published,
});

const counts = run.counts;
const flagged = counts.highConcern + counts.review;
const formatCount = new Intl.NumberFormat("en-US");
const formatRate = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 });
const outcomes = [
  { name: "High concern", count: counts.highConcern, meaning: "The local review found stronger lexical signals." },
  { name: "Review", count: counts.review, meaning: "The local review found signals that warrant a closer look." },
  { name: "No obvious signals", count: counts.noObviousSignals, meaning: "The local review found no signal strong enough to flag the hostname." },
];
const resultsJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": `${absoluteUrl(path)}#aggregate-results`,
  url: absoluteUrl(path),
  name: "PhishLens offline phishing link checker results",
  description: "Aggregate verdict counts and run details from the 25 November 2026 PhishLens hostname-only evaluation. Includes counts for high concern, review, and no obvious signals.",
  creator: { "@type": "Organization", "@id": ORG_ID, name: ORG.name },
  datePublished: published,
  isAccessibleForFree: true,
  distribution: {
    "@type": "DataDownload",
    contentUrl: absoluteUrl(resultsPath),
    encodingFormat: "application/json",
  },
};

export default function PhishingLinkCheckerBenchmark() {
  return (
    <SiteShell>
      <JsonLd data={techArticleJsonLd({ headline, description, path, datePublished: published })} />
      <JsonLd data={resultsJsonLd} />
      <PageHeader
        crumbs={[
          { name: "Benchmarks", path: "/benchmarks" },
          { name: "Phishing link checker", path },
        ]}
        title={headline}
        lead={`PhishLens flagged ${formatCount.format(flagged)} of ${formatCount.format(counts.parsed)} threat-listed hostnames (${formatRate.format(flagged / counts.parsed)}) in an offline evaluation. A dangerous link can produce a clean-looking result.`}
      >
        <a
          href={resultsPath}
          download
          className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 py-2.5 text-base font-medium hover:border-accent/50"
        >
          Download aggregate results (JSON)
        </a>
      </PageHeader>

      <Section labelledBy="phish-results">
        <h2 id="phish-results" className="text-2xl font-semibold tracking-tight">What PhishLens reported</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
          BugSnaps ran this evaluation on 25 November 2026. All {formatCount.format(counts.inputEntries)} snapshot entries were unique and parsed successfully.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[32rem] text-left text-base">
            <caption className="sr-only">Local verdicts for the archived hostname sample</caption>
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="px-4 py-3">Verdict</th>
                <th scope="col" className="px-4 py-3 text-right">Hostnames</th>
                <th scope="col" className="px-4 py-3 text-right">Share</th>
                <th scope="col" className="px-4 py-3">What it means</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map((outcome) => (
                <tr key={outcome.name} className="border-t border-white/10">
                  <th scope="row" className="px-4 py-3 font-medium">{outcome.name}</th>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCount.format(outcome.count)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatRate.format(outcome.count / counts.parsed)}</td>
                  <td className="px-4 py-3 text-muted">{outcome.meaning}</td>
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
            We verified the checksum of PhishDestroy’s 27 October 2026 DNS-active snapshot and passed its hostnames to the same URL-pattern engine used by PhishLens. PhishDestroy lists suspected phishing, scams and crypto-drainer infrastructure. Its DNS-active label means a hostname resolved during the provider’s check. We ran the evaluation offline and contacted none of the hostnames. The download records the dataset revision, checksums and counts.
          </p>
          <p>
            The {formatRate.format(flagged / counts.parsed)} flagged rate applies to this particular list and hostname-only setup. We used no independently verified benign sample, so the run cannot estimate false positives or overall accuracy. Full URL paths, redirects, page content, message context and optional reputation or DNS lookups were outside the test. BugSnaps develops PhishLens and ran the evaluation in-house.
          </p>
          <p>
            <a href="https://phishdestroy.io/dataset">PhishDestroy dataset documentation</a>
          </p>
        </Prose>
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

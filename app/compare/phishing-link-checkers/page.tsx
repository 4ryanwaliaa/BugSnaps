import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "@/components/site/content-link";
import { PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { pageMetadata } from "@/lib/site";

const pathname = "/compare/phishing-link-checkers";

export const metadata: Metadata = pageMetadata({
  title: "Phishing Link Checker Comparison: 4 Tools",
  description:
    "Compare PhishLens, Malwarebytes, VirusTotal and Google Safe Browsing. See what each checks and which link details you share before you open anything.",
  path: pathname,
});

const providers = [
  {
    name: "PhishLens by BugSnaps",
    fit: "Inspect the hostname, review a displayed-address mismatch or triage up to 100 links locally.",
    evidence: "Highlights patterns in the URL text and explains the domain boundary. Optional DNS and domain intelligence give hostname-level context. The checker never opens the destination or follows its redirects.",
    sharing: "Your initial review stays in your browser. If you choose an external check, Cloudflare or PhishDestroy receives the hostname and your IP address. The URL path and query stay local.",
    sources: [{ name: "PhishLens workflow and limits", href: "/phishing-detector" }],
  },
  {
    name: "Malwarebytes Scam Link Check",
    fit: "Get a plain-language assessment and page preview for a public URL you are comfortable sharing.",
    evidence: "Malwarebytes describes checking the link with its threat intelligence, including redirects and signs of phishing or malware. Its report can include a preview, reasons for the verdict and next steps.",
    sharing: "Malwarebytes receives the URL you submit for review. If you also publish a report about the link, its help page says that report can appear when others search the same link.",
    sources: [
      { name: "Malwarebytes product announcement", href: "https://www.malwarebytes.com/press/2026/10/05/malwarebytes-launches-free-scam-link-check-so-anyone-can-verify-a-link-is-safe-before-they-click" },
      { name: "Malwarebytes help and reporting", href: "https://help.malwarebytes.com/hc/en-us/articles/56793303873563-Use-Malwarebytes-Scam-Link-Check" },
    ],
  },
  {
    name: "VirusTotal public web service",
    fit: "Review how multiple security vendors label a public URL and inspect community context.",
    evidence: "VirusTotal aggregates results from URL scanners and other sources. Its reports let you see the detections and labels that individual engines return.",
    sharing: "VirusTotal says indicators submitted or queried in its public web interface are scanned and added to its community-accessible dataset. Keep private, confidential or identifying information out of both forms.",
    sources: [
      { name: "VirusTotal analysis and sharing", href: "https://docs.virustotal.com/docs/how-it-works" },
      { name: "VirusTotal public search policy", href: "https://docs.virustotal.com/docs/searching" },
    ],
  },
  {
    name: "Google Safe Browsing Site Status",
    fit: "Check whether Google Safe Browsing has marked a site as dangerous.",
    evidence: "Google’s Transparency Report shows current site status according to Safe Browsing. Use it to understand Google’s warning signal for that site.",
    sharing: "The tool sends the address you search to Google. For a site-status check, start with the site’s public hostname and leave out private paths or tokens.",
    sources: [
      { name: "Google Safe Browsing overview", href: "https://safebrowsing.google.com/" },
      { name: "Google Site Status tool", href: "https://transparencyreport.google.com/safe-browsing/search" },
    ],
  },
];

export default function PhishingLinkCheckerComparisonPage() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[
          { name: "Compare", path: "/compare" },
          { name: "Phishing link checkers", path: pathname },
        ]}
        title="Compare phishing link checkers"
        lead="You can review a suspicious link without opening it. Decide whether you need to read the address, check reputation or see where a public URL leads, and whether you can share that URL with a service."
      >
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/phishing-detector" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90">
            Check a link with PhishLens <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="#checker-comparison" className="py-2 text-sm font-medium text-accent hover:underline">
            Compare the four tools
          </a>
        </div>
      </PageHeader>

      <Section id="checker-comparison" labelledBy="comparison-title" className="scroll-mt-24">
        <SectionTitle
          id="comparison-title"
          title="What each tool checks and what you share"
          lead="Written by BugSnaps, which makes PhishLens. We reviewed the linked provider documentation on November 25, 2026. This comparison covers documented workflows and data sharing."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {providers.map((provider) => (
            <article key={provider.name} className="flex flex-col rounded-2xl border border-white/10 bg-surface p-6 sm:p-7">
              <h3 className="text-lg font-semibold">{provider.name}</h3>
              <dl className="mt-5 grow space-y-4 text-sm">
                <div>
                  <dt className="font-medium">When to use it</dt>
                  <dd className="mt-1 leading-relaxed text-muted">{provider.fit}</dd>
                </div>
                <div>
                  <dt className="font-medium">What you learn</dt>
                  <dd className="mt-1 leading-relaxed text-muted">{provider.evidence}</dd>
                </div>
                <div>
                  <dt className="font-medium">What leaves your device</dt>
                  <dd className="mt-1 leading-relaxed text-muted">{provider.sharing}</dd>
                </div>
              </dl>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-sm text-accent">
                {provider.sources.map((source) => (
                  <li key={source.href}><a href={source.href} className="underline-offset-4 hover:underline">{source.name}</a></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section labelledBy="how-to-check-title" className="border-t border-white/10 bg-surface/30">
        <SectionTitle id="how-to-check-title" title="How to check a suspicious link without opening it" />
        <ol className="mt-6 max-w-3xl list-decimal space-y-4 pl-5 text-sm leading-relaxed text-muted sm:text-base">
          <li>Use your device’s copy-link command and paste the address into a local inspector. Check the actual hostname and compare it with the sender’s claim.</li>
          <li>Keep sign-in links, password resets and private file invitations out of online lookups. Tokens can appear in the path as well as the query. For public site reputation, you can look up the public hostname, with results applying only to that hostname.</li>
          <li>For an unexpected request to sign in, pay or share information, open the service’s official app or use a known address. Treat a result with no warning as limited evidence and confirm the request through a known channel.</li>
        </ol>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-accent">
          <Link href="/guides/how-to-assess-a-suspicious-url-safely" className="hover:underline">Read the suspicious URL guide</Link>
          <Link href="/benchmarks/phishing-link-checker" className="hover:underline">See the PhishLens benchmark results</Link>
        </div>
      </Section>
    </SiteShell>
  );
}

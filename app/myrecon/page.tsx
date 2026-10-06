import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Database, Globe, Key, Search, ShieldAlert } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { MYRECON_URL, ORG_ID, SITE_URL, faqJsonLd, pageMetadata } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = pageMetadata({
  title: "MyRecon: OSINT & Attack Surface Intelligence Platform",
  description:
    "MyRecon maps your organization's external attack surface: exposed subdomains, credential breach intelligence, shadow cloud assets, and OSINT reconnaissance.",
  path: "/myrecon",
});

const faqs = [
  {
    question: "What is MyRecon and how does it fit into the BugSnaps ecosystem?",
    answer:
      "MyRecon is BugSnaps' reconnaissance and open-source intelligence (OSINT) platform. While MyPentest executes automated penetration tests on verified web targets, MyRecon maps the entire digital footprint beforehand - discovering forgotten subdomains, credential leaks, and shadow cloud assets.",
  },
  {
    question: "Does MyRecon send intrusive traffic to target networks?",
    answer:
      "No. MyRecon operates primarily through passive reconnaissance techniques, aggregating data from public Certificate Transparency logs, passive DNS caches, ASN routing registries, and dark-web exposure archives without sending hostile traffic.",
  },
  {
    question: "Can I feed discovered MyRecon assets directly into MyPentest?",
    answer:
      "Yes. Discovered subdomains and active web services can be imported directly into MyPentest for cryptographic ownership verification and automated vulnerability assessment.",
  },
  {
    question: "What intelligence sources does MyRecon query?",
    answer:
      "MyRecon aggregates intelligence from global DNS root zones, Certificate Transparency streams, commercial and dark-web credential leak repositories, WHOIS databases, public cloud storage buckets, and developer code archives.",
  },
];

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyRecon",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  url: `${SITE_URL}/myrecon`,
  description:
    "Open-source intelligence (OSINT) and external attack surface management: subdomain discovery, credential breach monitoring, and shadow IT mapping.",
  publisher: { "@id": ORG_ID },
};

const capabilities = [
  {
    icon: Globe,
    title: "Subdomain & DNS Mapping",
    description: "Enumerate active subdomains, wildcard DNS configurations, dangling CNAME pointers, and historical IP resolutions across Certificate Transparency logs.",
  },
  {
    icon: Key,
    title: "Credential & Breach Intelligence",
    description: "Scan corporate domains against historical data breaches, paste sites, and dark web compilations to uncover compromised employee credentials.",
  },
  {
    icon: Database,
    title: "Shadow IT & Cloud Asset Discovery",
    description: "Identify unregistered development environments, public AWS S3 buckets, exposed Azure blobs, and orphan endpoints outside your primary inventory.",
  },
  {
    icon: ShieldAlert,
    title: "Subdomain Takeover Detection",
    description: "Detect dangling DNS entries pointing to decommissioned GitHub Pages, S3 buckets, Heroku apps, or CloudFront distributions before attackers hijack them.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Seed Domain & Entity Input",
    body: "Provide your primary domain or organization name. MyRecon maps associated Autonomous System Numbers (ASNs), registered CIDR blocks, and legal corporate identifiers.",
  },
  {
    step: "02",
    title: "Passive OSINT Aggregation",
    body: "The engine queries Certificate Transparency logs, historical DNS registries, WHOIS records, and breach databases without emitting suspicious port traffic.",
  },
  {
    step: "03",
    title: "Service Resolution & Fingerprinting",
    body: "Resolves active hosts, captures HTTP response headers, identifies web server software, and checks for vulnerable dangling CNAME records.",
  },
  {
    step: "04",
    title: "Vulnerability Handoff to MyPentest",
    body: "Export identified web applications directly into MyPentest for continuous DAST scanning, authenticated access-control testing, and CVSS reporting.",
  },
];

export default function MyReconPage() {
  return (
    <SiteShell>
      <JsonLd data={softwareJsonLd} />
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHeader
        crumbs={[
          { name: "Products", path: "/products" },
          { name: "MyRecon", path: "/myrecon" },
        ]}
        eyebrow="Reconnaissance & OSINT Engine"
        title="MyRecon: OSINT & Attack Surface Intelligence Platform"
        lead="Discover forgotten subdomains, leaked credentials, shadow cloud infrastructure, and attack surface drift before adversaries exploit them. The intelligence layer of the BugSnaps security suite."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={MYRECON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Launch MyRecon App
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Run MyPentest on Discovered Assets
          </a>
          <Link
            href="/reconnaissance"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Expert Recon Services
          </Link>
        </div>
      </PageHeader>

      <Section labelledBy="capabilities-title">
        <SectionTitle
          id="capabilities-title"
          eyebrow="Platform Capabilities"
          title="See your complete external attack surface through an attacker's lens."
          lead="Modern organizations lose track of 30% of their internet-facing assets within 6 months of cloud deployment. MyRecon continuously indexes your digital footprint."
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.title} className="spot flex flex-col rounded-2xl border border-white/[0.07] bg-surface p-6">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{c.description}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section labelledBy="workflow-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="workflow-title"
          eyebrow="Methodology"
          title="From root domain to actionable exploit inventory."
          lead="A structured four-phase reconnaissance pipeline combining open-source intelligence with active validation."
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflow.map((item) => (
            <li key={item.step} className="spot rounded-2xl border border-white/[0.07] bg-surface p-6">
              <span className="font-mono text-xs font-semibold text-accent">{item.step}</span>
              <h3 className="mt-3 text-base font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="integration-title" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle
              id="integration-title"
              eyebrow="Ecosystem Synergy"
              title="Reconnaissance meets automated penetration testing."
              lead="Knowing your attack surface is only step one. BugSnaps bridges reconnaissance and exploit verification in a unified offensive pipeline."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                Generic asset discovery tools leave you with a spreadsheet of subdomains and no clarity on which ones are actually vulnerable. MyRecon connects directly to BugSnaps MyPentest.
              </p>
              <p>
                When MyRecon identifies an active API gateway or web portal, you can immediately initiate a deterministic DAST scan with 56 active-safe checks, authenticating with test credentials and testing for BOLA, injection, and broken access controls.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/mypentest" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                Explore MyPentest automated testing <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/reconnaissance" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
                Manual OSINT services <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7">
            <h3 className="text-lg font-semibold tracking-tight">The BugSnaps Offensive Cycle</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Discover:</strong> MyRecon finds all subdomains, open ports, and leaked credentials.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Verify:</strong> Cryptographic DNS TXT validation ensures ethical, authorized scanning.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Test:</strong> MyPentest executes 56 proof-of-exploit DAST checks with zero false positives.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Fortify:</strong> Export CVSS reports, reproduction curl commands, and patch guidance.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Frequently asked questions about MyRecon." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <h3>{faq.question}</h3>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Map your external attack surface today."
        lead="Access MyRecon at myrecon.xyz or launch an automated penetration test across your verified domains."
        secondary={{ label: "View all security products", href: "/products" }}
      />
    </SiteShell>
  );
}

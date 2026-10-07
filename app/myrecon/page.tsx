import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Database, Globe, Key, Search, ShieldAlert } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { MYRECON_URL, ORG_ID, SITE_URL, faqJsonLd, pageMetadata } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = pageMetadata({
  title: "MyRecon: Username Search, Digital Footprint and OSINT",
  description:
    "Explore MyRecon for public username search, email breach exposure, domain, DNS and IP research. Use OSINT context to plan a separately authorized security assessment.",
  path: "/myrecon",
});

const faqs = [
  {
    question: "What is MyRecon and how does it fit into the BugSnaps ecosystem?",
    answer:
      "MyRecon is a separate open-source intelligence platform at myrecon.xyz for public username searches, breach exposure checks and domain, DNS and IP research. MyPentest assesses a web application after you verify domain control. Reconnaissance results are context, not proof of a vulnerability or authorization to test a target.",
  },
  {
    question: "Does an OSINT result prove an account or asset belongs to someone?",
    answer:
      "No. A matching username or public record is a lead that needs context and verification. Provider failures and inconclusive responses do not prove presence, absence or ownership. Review the result's evidence and limitations before attributing it.",
  },
  {
    question: "How can I assess a web application after reconnaissance?",
    answer:
      "Open MyPentest separately, enter a web application you own or are authorized to test, and complete its account-bound DNS verification. Configure the permitted scope and suitable test accounts. MyRecon results do not automatically import targets or bypass ownership verification.",
  },
  {
    question: "Where can I check the current MyRecon features?",
    answer:
      "Visit myrecon.xyz for its current username, breach, domain, DNS and IP research tools and access limits. Availability depends on the selected tool and its providers; a result is not a complete inventory of every account or internet-facing asset.",
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
    "Open-source intelligence research for public usernames, breach exposure, domains, DNS and IPs.",
  publisher: { "@id": ORG_ID },
};

const capabilities = [
  {
    icon: Globe,
    title: "Domain and DNS Research",
    description: "Review domain registration and DNS context. Public infrastructure records help inform research; they are not a complete asset inventory.",
  },
  {
    icon: Key,
    title: "Breach Exposure Checks",
    description: "Review supported breach exposure signals for an email address, subject to provider coverage and access limits. A signal does not establish account ownership.",
  },
  {
    icon: Database,
    title: "Public Username Search",
    description: "Find public profile leads associated with a username. Review evidence and context before attributing a profile to a person.",
  },
  {
    icon: ShieldAlert,
    title: "IP Investigation",
    description: "Research public IP and network context. Use relevant information to plan an assessment only after authorization and scope are agreed.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Choose a Research Question",
    body: "Select the supported username, email exposure, domain, DNS or IP tool that fits your question.",
  },
  {
    step: "02",
    title: "Review Public Signals",
    body: "Inspect the results returned by the selected tool and note provider failures, unknown states and coverage limits.",
  },
  {
    step: "03",
    title: "Verify the Context",
    body: "Check attribution and relevance before acting. Similar names and shared infrastructure do not prove a relationship.",
  },
  {
    step: "04",
    title: "Start an Authorized Assessment",
    body: "For a web application you can verify, open MyPentest separately and configure a new assessment. Automated importing and continuous monitoring are not established by this workflow.",
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
        title="MyRecon: digital footprint and OSINT research."
        lead="Explore public username leads, breach exposure and domain, DNS and IP context. Review the evidence before drawing a conclusion or planning an authorized assessment."
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
            Start a separate MyPentest assessment
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
          title="Research public signals with clear limits."
          lead="Use the current tools at myrecon.xyz to answer a specific question. Results depend on provider coverage and do not establish a complete digital footprint."
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
          title="From a research question to a reviewed result."
          lead="Choose a tool, inspect its evidence and verify the context before taking the next step."
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
              lead="Public research can inform your assessment plan. Testing still requires a verified target, written permission where applicable and an agreed scope."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                OSINT research and web application testing answer different questions. Use MyRecon for supported public research, then open MyPentest separately when you have a web application you are authorized to assess.
              </p>
              <p>
                MyPentest requires account-bound DNS verification before testing. Its defined checks cover supported reachable surfaces, and supplied test accounts enable supported signed-in checks. Review the resulting evidence and coverage limits.
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
                <span><strong>Research:</strong> Review relevant public username, breach, domain, DNS or IP signals.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Verify:</strong> Prove domain control through MyPentest DNS TXT verification and confirm you are authorized to test.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Test:</strong> MyPentest runs defined web security checks and reports observed evidence, confidence and remediation.</span>
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

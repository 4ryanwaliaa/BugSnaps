import type { Metadata } from "next";
import Link from "@/components/site/content-link";
import { PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security Playbooks for Websites, APIs, Endpoints and Phishing",
  description: "Choose a practical security workflow for web applications, APIs, Windows endpoints, public exposure and suspicious links, with guides and BugSnaps tools.",
  path: "/security-playbooks",
});

const playbooks = [
  {
    title: "Assess a website or API",
    question: "You own an application and need to understand its exposed routes and security boundaries.",
    steps: ["Agree on hosts, accounts, data and testing limits before starting.", "Inventory application journeys and APIs, including authenticated functions.", "Investigate findings with known test accounts and record evidence; retest fixes."],
    links: [{ label: "Scope an authorized test", href: "/guides/pentest-scope-authorization" }, { label: "Map the attack surface", href: "/guides/attack-surface-inventory" }, { label: "Test object authorization", href: "/guides/bola-testing" }, { label: "Explore MyPentest", href: "/mypentest" }, { label: "API testing services", href: "/api-security-testing" }],
  },
  {
    title: "Review a Windows endpoint",
    question: "You need a point-in-time view of one machine's security posture.",
    steps: ["Record the device owner, permissions and assessment time.", "Review protection, updates and exposed services against the device's intended role.", "Prioritize with the owner, apply approved changes and verify the affected controls."],
    links: [{ label: "Windows endpoint guides", href: "/guides#endpoint-security" }, { label: "EndpointRadar", href: "/endpointradar" }, { label: "Discuss an assessment", href: "/contact" }],
  },
  {
    title: "Investigate a digital footprint",
    question: "You need to understand public information associated with an organization or an account.",
    steps: ["Define the organization, identifiers and permitted research scope.", "Treat public-source matches as leads and corroborate ownership before drawing conclusions.", "Document the source and date, and avoid collecting unrelated personal data."],
    links: [{ label: "Explore MyRecon", href: "/myrecon" }, { label: "Reconnaissance services", href: "/reconnaissance" }, { label: "Attack surface inventory guide", href: "/guides/attack-surface-inventory" }],
  },
  {
    title: "Examine a suspicious link",
    question: "You received a link and want to decide what to do without trusting its appearance.",
    steps: ["Avoid entering credentials or opening unexpected attachments while you verify the request.", "Examine the complete address and independently contact the organization using a known channel.", "Escalate suspected phishing through your organization's reporting process."],
    links: [{ label: "Use PhishLens", href: "/phishing-detector" }, { label: "Browse security resources", href: "/resources" }],
  },
  {
    title: "Plan a broader assessment",
    question: "You need human-led review across applications, networks or cloud environments.",
    steps: ["List systems, owners and the outcome you need, including exclusions and deadlines.", "Discuss test methods, access, evidence and reporting before agreeing the scope.", "Assign remediation owners and arrange a focused retest for important findings."],
    links: [{ label: "Security services", href: "/services" }, { label: "Web application testing", href: "/web-application-pentesting" }, { label: "Cloud testing", href: "/cloud-penetration-testing" }, { label: "Network testing", href: "/network-pentesting" }, { label: "Remediation and retesting", href: "/guides/remediation-retesting" }],
  },
];

export default function SecurityPlaybooks() {
  return (
    <SiteShell>
      <PageHeader crumbs={[{ name: "Resources", path: "/resources" }, { name: "Security playbooks", path: "/security-playbooks" }]} eyebrow="Security playbooks" title="Start with the security question you need to answer." lead="Choose a workflow for your application, endpoint, public footprint or suspicious link. Each path connects practical guidance with the relevant BugSnaps tools and services." />
      <Section labelledBy="playbooks-title">
        <h2 id="playbooks-title" className="text-2xl font-semibold tracking-tight">Choose a starting point</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {playbooks.map((playbook) => <article key={playbook.title} className="rounded-2xl border border-white/10 bg-surface/30 p-6 sm:p-8">
            <h3 className="text-xl font-semibold">{playbook.title}</h3>
            <p className="mt-3 leading-relaxed text-muted">{playbook.question}</p>
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">{playbook.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3">{playbook.links.map((link) => <li key={link.href}><Link className="text-sm text-accent hover:underline" href={link.href}>{link.label}</Link></li>)}</ul>
          </article>)}
        </div>
      </Section>
      <Section labelledBy="limits-title" className="border-t border-white/[0.06]">
        <h2 id="limits-title" className="text-2xl font-semibold">Use results in context</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">Only assess systems and data you own or are authorized to investigate. A tool result or a single assessment is a point-in-time view, not proof that every risk has been found. Check its coverage and limitations, validate important findings and involve a qualified reviewer when the decision requires it.</p>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">Use the example workbook to record scope, owners, observations, exceptions and retest conditions. Replace the sample rows with your own records and store the completed file in an approved location.</p>
        <a href="/downloads/security-assessment-workbook.csv" download className="mt-5 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-medium hover:bg-white/5">Download the assessment workbook (CSV)</a>
      </Section>
    </SiteShell>
  );
}

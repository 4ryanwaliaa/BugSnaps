import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Check, Layers, ShieldCheck, Terminal } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { ORG_ID, SITE_URL, faqJsonLd, pageMetadata } from "@/lib/site";
import { ENGINE_FACTS, newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = pageMetadata({
  title: "AI Penetration Testing: Automated Web Security with Evidence",
  description: "Compare AI penetration testing by evidence, scope and coverage. MyPentest runs 56 defined web security checks with confidence, CVSS scores and remediation.",
  path: "/ai-penetration-testing",
});

const faqs = [
  {
    question: "What should I look for in an AI penetration testing tool?",
    answer: "Look for a defined target scope, observed request and response evidence, authenticated testing, confidence labels and clear limits. MyPentest runs defined automated checks against a verified web application. Severity describes potential impact; confidence describes the strength of the observation.",
  },
  {
    question: "Does MyPentest guarantee zero false positives?",
    answer: "No. Reports distinguish confirmed, likely and informational observations so you can review the evidence. Automated tests can miss vulnerabilities or need human validation. An empty report is not proof that an application is secure.",
  },
  {
    question: "Does an automated assessment certify SOC 2, ISO 27001 or PCI DSS compliance?",
    answer: "No. MyPentest provides technical findings and remediation guidance, not a compliance certification or auditor acceptance guarantee. Confirm the required scope, testing method and documentation with your reviewer. Expert-led engagements are separately scoped with BugSnaps.",
  },
  {
    question: "When should I choose expert-led penetration testing?",
    answer: "Use automated testing for repeatable checks within the application's discovered surface. Discuss expert-led testing when you need payment workflow analysis, complex role and tenant boundaries, business logic review or a specifically agreed report and retest process.",
  },
];

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyPentest by BugSnaps",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  url: SITE_URL + "/ai-penetration-testing",
  description: "Automated web application security assessment with defined checks, observed evidence, severity, confidence and remediation guidance.",
  publisher: { "@id": ORG_ID },
};

const approaches = [
  { title: "AI security assistance", label: "Understand and explain", body: "Useful for exploring a security question or reviewing supplied material. Evaluate what was actually tested before treating an answer as a confirmed vulnerability." },
  { title: "Automated assessment", label: "Repeat defined checks", body: "MyPentest discovers a verified application's surface, runs passive or safe-active checks, and reports observations with evidence and confidence." },
  { title: "Interactive security tools", label: "Investigate with an operator", body: "A skilled tester can choose requests, inspect state and explore hypotheses. The result depends on the target, scope, configuration and operator." },
  { title: "Expert-led pentesting", label: "Review complex workflows", body: "A separately scoped BugSnaps engagement can focus on business logic and context that repeatable automated checks cannot fully assess." },
];

const pillars = [
  { icon: BrainCircuit, title: "Attack-surface discovery", body: "Maps pages, forms, APIs, JavaScript-referenced endpoints and login surfaces within the scope you configure." },
  { icon: ShieldCheck, title: "Defined security checks", body: ENGINE_FACTS.checks + " checks: " + ENGINE_FACTS.passiveChecks + " passive checks and " + ENGINE_FACTS.activeSafeChecks + " safe-active checks. Coverage depends on discovered routes, configuration and access." },
  { icon: Layers, title: "Supplied test accounts", body: "Tests signed-in behavior with accounts you supply, including whether one user can read another test user's records (IDOR / BOLA)." },
  { icon: Terminal, title: "Evidence and remediation", body: "Review the finding's severity, confidence, supporting observations and fix guidance. Paid plans add report downloads and saved history." },
];

export default function AiPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={softwareJsonLd} />
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[{ name: "Products", path: "/products" }, { name: "AI Penetration Testing", path: "/ai-penetration-testing" }]}
        eyebrow="AI pentesting and automated security"
        title="AI penetration testing: choose evidence you can review."
        lead="Assess your web application with MyPentest by BugSnaps. Get defined automated checks, observed evidence, confidence labels and a practical fix list for a target you own or are authorized to test."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={newAssessmentUrl()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent">
            Start a free assessment <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link href="/mypentest/example-report" className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20">Review an example report</Link>
        </div>
      </PageHeader>

      <Section labelledBy="architecture-title">
        <SectionTitle id="architecture-title" eyebrow="What MyPentest does" title="From a verified domain to actionable observations." lead="Judge automated penetration testing by what it checks, what it observes and how clearly it explains its limits." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="spot flex flex-col rounded-2xl border border-white/[0.07] bg-surface p-6">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section labelledBy="approaches-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle id="approaches-title" eyebrow="Choose the right approach" title="Different security workflows answer different questions." lead="Compare the scope and output you need before selecting an AI security tool, vulnerability scanner or manual pentest." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {approaches.map((item) => (
            <div key={item.title} className="spot rounded-2xl border border-white/[0.07] bg-surface p-6">
              <span className="font-mono text-xs text-accent">{item.label}</span>
              <h3 className="mt-2 text-base font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section labelledBy="comparison-title" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle id="comparison-title" eyebrow="Review the evidence" title="A useful comparison starts with the same target and scope." lead="Detection accuracy, speed and coverage need reproducible measurements. We do not publish an accuracy percentage or superiority claim without a supporting run." />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>Our benchmark page explains how to record fixture versions, target routes, test accounts, findings, missed cases and inconclusive results. An example report demonstrates the report format; it is not a general accuracy benchmark.</p>
              <p>Try the free assessment to review the workflow on your own authorized application. Check the pricing page for current report visibility and scan limits.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/benchmarks" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">Benchmark methodology <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">Compare testing approaches <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7">
            <h3 className="text-lg font-semibold tracking-tight">Questions to ask before a pentest</h3>
            <ul className="mt-5 space-y-3">
              {["Which targets and roles are in scope?", "Which checks ran, were skipped or stayed inconclusive?", "What evidence supports each finding?", "Does the required report need expert-led testing?"].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted"><Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Questions about AI penetration testing." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium"><h3>{faq.question}</h3><span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>
      <CtaBand title="See what an assessment tells you about your application." lead="Start free, verify your domain and review evidence with clear confidence labels." secondary={{ label: "Compare testing tools", href: "/us-vs-competitors" }} />
    </SiteShell>
  );
}

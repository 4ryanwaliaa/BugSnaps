import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Lock, Shield, ShieldAlert, ShieldCheck, Sparkles, Terminal, Zap } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { ORG_ID, SITE_URL, faqJsonLd, pageMetadata } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = pageMetadata({
  title: "World-Ready Security & Trust: How BugSnaps Keeps You Safe",
  description:
    "Launch with confidence. Learn how BugSnaps keeps you out of trouble, secures your attack surface, prevents catastrophic breaches, and gets you ready for the world.",
  path: "/security-readiness",
});

const faqs = [
  {
    question: "How does BugSnaps prevent our application from getting into legal or compliance trouble?",
    answer:
      "BugSnaps mandates cryptographic DNS TXT ownership verification before sending active probes, ensuring you are 100% authorized under computer fraud laws. Furthermore, our reports map findings directly to SOC 2 CC7.1, ISO 27001 Control A.12.6.1, and PCI DSS 4.0 requirements to satisfy auditor and vendor risk questionnaires.",
  },
  {
    question: "Can BugSnaps testing accidentally crash our live production database or corrupt user data?",
    answer:
      "No. BugSnaps utilizes safe-active, non-destructive payloads. We never execute volumetric Denial-of-Service (DoS) attacks, destructive SQL commands (such as DROP or DELETE), or state-destroying API requests. Testing is throttled and safe for production and staging environments alike.",
  },
  {
    question: "What levels of vulnerabilities does BugSnaps detect?",
    answer:
      "We classify findings into four explicit severity levels: Critical (RCE, mass BOLA/IDOR data leakage, unauthenticated SQLi), High (privilege escalation, stored XSS, session takeover, payment tampering), Medium (CSRF, secondary object exposure, blind injection), and Low/Hygiene (missing CSP/HSTS headers, weak TLS ciphers, and dangling DNS records).",
  },
  {
    question: "How does BugSnaps help us prove security readiness to enterprise customers and investors?",
    answer:
      "Upon remediating findings, you can generate a signed Executive Attestation Letter and verified retest report demonstrating that your external web applications and APIs have been independently assessed and fortified against modern attack vectors.",
  },
];

const trustPillars = [
  {
    icon: ShieldCheck,
    title: "Never Get Blindsided by a Breach",
    description: "Launch on Product Hunt, close funding rounds, or onboard enterprise customers knowing that your critical authorization and injection boundaries have already been tested by offensive security engines.",
  },
  {
    icon: Lock,
    title: "Zero Legal or Regulatory Exposure",
    description: "Avoid crippling GDPR fines and compliance audit delays. Cryptographic DNS TXT verification ensures all testing is legally authorized and fully documented.",
  },
  {
    icon: Zap,
    title: "100% Safe-Active Testing Guarantee",
    description: "Engineered specifically for live environments. Safe payloads, rate-limited traffic pacing, and non-destructive checks ensure zero downtime and zero database corruption.",
  },
  {
    icon: Sparkles,
    title: "Audit & Procurement Ready",
    description: "Equip your sales team with auditor-accepted penetration testing documentation, CVSS 3.1 severity scores, and verified remediation letters to close deals faster.",
  },
];

const severityLevels = [
  {
    level: "Level 1: Critical",
    badge: "Catastrophic Business Impact",
    color: "text-red-400 border-red-500/20 bg-red-500/[0.05]",
    description: "Vulnerabilities that allow an attacker to bypass authentication entirely, take over servers, or exfiltrate the complete customer database.",
    examples: [
      "Remote Code Execution (RCE) via command injection or template execution",
      "Broken Object Level Authorization (BOLA/IDOR) exposing multi-tenant records",
      "Unauthenticated SQL Injection yielding full database extraction",
      "Server-Side Request Forgery (SSRF) targeting cloud metadata (AWS IMDSv1)",
    ],
  },
  {
    level: "Level 2: High",
    badge: "Privilege Escalation & Account Takeover",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/[0.05]",
    description: "Flaws that allow regular users to gain administrative control, hijack active user sessions, or manipulate commercial financial operations.",
    examples: [
      "Stored Cross-Site Scripting (XSS) executing in authenticated administrative portals",
      "Session fixation, weak token entropy, and missing token revocation on logout",
      "Price tampering and currency exchange manipulation in checkout flows",
      "Webhook HMAC signature bypasses allowing fake event forgery",
    ],
  },
  {
    level: "Level 3: Medium",
    badge: "Workflow Abuse & Data Exposure",
    color: "text-blue-400 border-blue-500/20 bg-blue-500/[0.05]",
    description: "Issues that disclose non-public information, bypass user workflow constraints, or enable client-side redirection attacks.",
    examples: [
      "Cross-Site Request Forgery (CSRF) on state-changing user actions",
      "Blind injection and boolean timing anomalies without direct data output",
      "Overly permissive CORS configurations reflecting origins with credentials",
      "Internal server IP address and backend infrastructure stack disclosure",
    ],
  },
  {
    level: "Level 4: Low & Hygiene",
    badge: "Defense-in-Depth & Attack Surface",
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.05]",
    description: "Configuration and header weaknesses that lower defense barriers or leave perimeter traces for reconnaissance.",
    examples: [
      "Missing Content-Security-Policy (CSP) and HTTP Strict-Transport-Security (HSTS)",
      "Subdomain takeover risk from dangling DNS pointers to third-party services",
      "Verbose application error pages exposing framework stack traces",
      "Legacy TLS cipher support and missing cookie security flags (HttpOnly/Secure)",
    ],
  },
];

export default function SecurityReadinessPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHeader
        crumbs={[
          { name: "Resources", path: "/resources" },
          { name: "Security Readiness & Trust", path: "/security-readiness" },
        ]}
        eyebrow="World-Ready Security & Trust"
        title="World-Ready Security & Trust: How BugSnaps Keeps You Safe"
        lead="You don't need to be insecure about the world: We've got your back. Launch your product, pass enterprise audits, and ship software knowing BugSnaps protects your application and keeps you out of trouble."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Start Free Security Assessment
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href="/benchmarks"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            View Accuracy Benchmarks
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Book Scoping Call
          </Link>
        </div>
      </PageHeader>

      <Section labelledBy="trust-pillars-title">
        <SectionTitle
          id="trust-pillars-title"
          eyebrow="Total Peace of Mind"
          title="How BugSnaps keeps you safe and out of trouble."
          lead="Every founder and engineering lead worries about getting hacked or failing a customer security audit. We turn unknown risks into verified, closed defenses."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="spot flex flex-col rounded-2xl border border-white/[0.07] bg-surface p-6">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section labelledBy="levels-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="levels-title"
          eyebrow="Vulnerability Coverage"
          title="The four levels of vulnerabilities we find."
          lead="We don't just check for generic version banners. BugSnaps probes deep runtime application logic across four structured severity tiers."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {severityLevels.map((s) => (
            <div key={s.level} className={`rounded-2xl border p-7 ${s.color}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{s.level}</h3>
                <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs font-medium text-foreground/80">
                  {s.badge}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
              <ul className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-4">
                {s.examples.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section labelledBy="world-ready-attestation-title" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle
              id="world-ready-attestation-title"
              eyebrow="Enterprise Readiness"
              title="Pass vendor risk reviews and close enterprise contracts."
              lead="When enterprise procurement teams ask for your SOC 2 attestation or third-party penetration testing report, BugSnaps delivers the proof they accept."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                Security reviews are often the single biggest hurdle between a startup and a signed six-figure enterprise contract. BugSnaps provides structured executive summaries, CVSS 3.1 vulnerability breakdowns, and verified retest sign-offs.
              </p>
              <p>
                Our testing adheres strictly to the OWASP Web Security Testing Guide (WSTG) and the Penetration Testing Execution Standard (PTES), giving CISOs and compliance auditors the exact documentation they look for.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/solutions/soc2-penetration-testing" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                Explore SOC 2 compliance testing <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/solutions/startup-penetration-testing" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
                Startup penetration testing solutions <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7">
            <h3 className="text-lg font-semibold tracking-tight">The World-Ready Security Shield</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Cryptographic DNS Verification:</strong> Zero risk of unauthorized scans or legal ambiguity.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Safe-Active Payload Guard:</strong> Never impacts production databases or user sessions.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Reproducible curl Evidence:</strong> 100% verifiable findings with zero false positive alarms.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Verified Retest Letters:</strong> Confirmation in writing that every vulnerability is closed.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Frequently asked questions about security readiness." />
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
        title="Get ready for the world with BugSnaps."
        lead="Stop worrying about unknown vulnerabilities. Run an automated assessment and fortify your application today."
        secondary={{ label: "Explore all comparisons", href: "/compare" }}
      />
    </SiteShell>
  );
}

import {
  Globe,
  Braces,
  Network,
  Cloud,
  SearchCode,
  Wrench,
  Database,
  Sparkles,
  Unplug,
  UserX,
  Search,
  FileText,
  type LucideIcon,
} from "lucide-react";

/* ————————————————————————————————
   Services
—————————————————————————————— */

export interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  deliverables: string[];
}

export const services: Service[] = [
  {
    icon: Globe,
    title: "Web Application Pentest",
    description:
      "Manual, in-depth testing of your web application against OWASP Top 10 and business-logic flaws that scanners never find.",
    deliverables: ["Full technical report", "Executive summary", "Free retest of fixes"],
  },
  {
    icon: Braces,
    title: "API Security Testing",
    description:
      "REST and GraphQL testing focused on authorization, object-level access, rate limiting, and data exposure across every endpoint.",
    deliverables: ["Endpoint coverage map", "Auth matrix analysis", "Reproduction scripts"],
  },
  {
    icon: Network,
    title: "Network Security Assessment",
    description:
      "External and internal network assessments that map your real attack surface and validate what an intruder could actually reach.",
    deliverables: ["Attack surface inventory", "Exploitable path analysis", "Hardening checklist"],
  },
  {
    icon: Cloud,
    title: "Cloud Security Review",
    description:
      "Configuration and identity review across AWS, GCP, and Azure — IAM, storage exposure, network boundaries, and secrets handling.",
    deliverables: ["Misconfiguration report", "IAM privilege review", "Remediation runbook"],
  },
  {
    icon: SearchCode,
    title: "Source Code Review",
    description:
      "Security-focused review of critical code paths — authentication, payments, file handling — pairing static analysis with manual reading.",
    deliverables: ["Annotated findings", "Vulnerable pattern report", "Secure-coding guidance"],
  },
  {
    icon: Wrench,
    title: "We Fix It Too",
    description:
      "Don't have a security engineer? We don't just report issues — we can help patch them, working alongside your developers until everything is closed.",
    deliverables: ["Hands-on fix support", "Engineering office hours", "Verified-fixed sign-off"],
  },
];

/* ————————————————————————————————
   Why it matters — plain-words risks
—————————————————————————————— */

export interface Risk {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const risks: Risk[] = [
  {
    icon: Database,
    title: "Data leaks",
    description:
      "Your app holds names, emails, passwords, payments. One small coding mistake can spill your entire customer list onto the internet — and trust doesn't come back easily.",
  },
  {
    icon: Sparkles,
    title: "Vibe-coded & AI-built apps",
    description:
      "Built fast with AI, or shipped on a deadline? Speed is great — but it leaves gaps. Attackers specifically hunt for apps that grew faster than their security did.",
  },
  {
    icon: Unplug,
    title: "Leaky APIs",
    description:
      "APIs quietly power everything your app does. A leaky one will politely hand out data it was never supposed to share — often without anyone noticing for months.",
  },
  {
    icon: UserX,
    title: "Broken logins",
    description:
      "Weak sign-in and password-reset flows let strangers walk into your app as if they were your users. It's one of the most common ways companies get breached.",
  },
];

export interface PromiseStep {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
}

export const promiseSteps: PromiseStep[] = [
  {
    icon: Search,
    step: "01",
    title: "We find it",
    description:
      "We poke at your app the way a real attacker would — carefully, manually, and before a real one does.",
  },
  {
    icon: FileText,
    step: "02",
    title: "We report it",
    description:
      "You get a clear list: what's broken, how bad it is, and exactly how to fix it. Plain words for you, technical detail for your developers.",
  },
  {
    icon: Wrench,
    step: "03",
    title: "We fix it — if you want",
    description:
      "No security engineer on the team? We'll help patch every issue and retest until it's truly closed. Optional, but it's what we love doing.",
  },
];

/* ————————————————————————————————
   How it works
—————————————————————————————— */

export interface ProcessStep {
  label: string;
  title: string;
  description: string;
}

export const process: ProcessStep[] = [
  {
    label: "Step 1",
    title: "Scope it together",
    description:
      "A free 30-minute call. You tell us what you've built; we agree on what to test and give you a fixed quote in writing.",
  },
  {
    label: "Step 2",
    title: "We test",
    description:
      "Manual testing across the agreed scope, mapped to OWASP WSTG. Anything critical, we call you the same day we confirm it.",
  },
  {
    label: "Step 3",
    title: "You get the report",
    description:
      "Every issue explained twice — plain language for decisions, reproduction steps and fixes for your developers. Plus a walkthrough call.",
  },
  {
    label: "Step 4",
    title: "Fix & retest",
    description:
      "Fix it with your team, or let us help patch it. Either way we retest for free and confirm in writing that every issue is closed.",
  },
];

/* ————————————————————————————————
   Report preview — sample findings
—————————————————————————————— */

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  cvss: number;
  status: "Open" | "Fixed" | "Verified";
}

export const reportFindings: Finding[] = [
  {
    id: "BSNP-001",
    title: "SQL injection in order search endpoint",
    severity: "Critical",
    cvss: 9.8,
    status: "Verified",
  },
  {
    id: "BSNP-002",
    title: "Broken object-level authorization on /api/invoices",
    severity: "Critical",
    cvss: 9.1,
    status: "Verified",
  },
  {
    id: "BSNP-003",
    title: "Session fixation during OAuth callback",
    severity: "High",
    cvss: 8.2,
    status: "Fixed",
  },
  {
    id: "BSNP-004",
    title: "Stored XSS in customer notes field",
    severity: "High",
    cvss: 7.6,
    status: "Fixed",
  },
  {
    id: "BSNP-005",
    title: "Rate limiting absent on password reset",
    severity: "Medium",
    cvss: 5.3,
    status: "Verified",
  },
];

export const riskDistribution = [
  { label: "Critical", count: 2, color: "var(--color-critical)" },
  { label: "High", count: 5, color: "var(--color-high)" },
  { label: "Medium", count: 7, color: "var(--color-medium)" },
  { label: "Low", count: 4, color: "var(--color-low)" },
  { label: "Info", count: 6, color: "var(--color-info)" },
];

/* ————————————————————————————————
   FAQ
—————————————————————————————— */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "How long does a penetration test take?",
    answer:
      "Most engagements run 5–12 testing days depending on scope, with the report delivered within 5 business days of testing completion. From first call to final report, plan for roughly three weeks. We confirm exact dates in the scoping document before you commit.",
  },
  {
    question: "Will testing affect our production environment?",
    answer:
      "We agree rules of engagement before any testing starts. We recommend testing against a staging environment; when production testing is required, we use non-destructive techniques, throttle our traffic, and coordinate testing windows with your team. Denial-of-service testing is never performed without explicit written agreement.",
  },
  {
    question: "How is this different from an automated scan?",
    answer:
      "Scanners find known patterns; they cannot chain issues, abuse business logic, or understand what data actually matters to your company. Our testing is manual-led — tools assist with coverage, but every finding is discovered, verified, and rated by a human tester. You will not receive a re-badged scanner export.",
  },
  {
    question: "You're a new company. Why should we trust you?",
    answer:
      "Because we won't pretend otherwise. You'll know exactly who is testing your app, you can talk to us directly at every step, and we put our methodology, sample report, and rules of engagement in writing before you pay anything. We'd rather earn trust slowly than fake it quickly.",
  },
  {
    question: "Can you also fix the issues you find?",
    answer:
      "Yes. If you don't have a security engineer, we can help patch the issues ourselves, working alongside your developers — and then retest to confirm everything is closed. If you'd rather fix things in-house, we stay available for questions and still retest for free.",
  },
  {
    question: "Can the report be shared with our customers and auditors?",
    answer:
      "Yes. Alongside the full technical report you receive an executive summary suitable for customer security reviews, SOC 2 and ISO 27001 audits, and vendor questionnaires. It's built to be shown to the people who ask 'has this been tested?'",
  },
];

/*
 * Pricing and plans — the ONE place they are defined.
 *
 * /pricing, the MyPentest page and the homepage all render from this file, so
 * changing an offer is an edit here, not a hunt through pages. No page states
 * a price or a limit of its own.
 *
 * The Free limits below describe what the MyPentest API enforces. Enforcement
 * lives in the engine (services/scanner `HostedConfig`, env `SCAN_FREE_*`);
 * if you change a limit there, change it here too. The signed-in app shows the
 * engine's live values, so a mismatch can only affect this marketing copy.
 *
 * Paid tiers are deliberately unpriced: `price` is null until pricing is
 * decided. A paid plan becomes real by adding it to the engine's plan table
 * and recording it on the account as a Firebase custom claim (`plan`).
 */

export type PlanStatus = "available" | "coming-soon" | "contact";

export interface Plan {
  id: "free" | "advanced" | "business";
  name: string;
  status: PlanStatus;
  /** A display price, or null when not decided — never invent one. */
  price: string | null;
  priceNote: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
}

/** What the free launch offer allows. Mirrors the engine's defaults. */
export const FREE_LIMITS = {
  scansPerDay: 10,
  concurrentScans: 1,
  targetsPerScan: 200,
  crawlPages: 500,
  scanHours: 1,
};

export const LAUNCH_OFFER = {
  headline: "Free during launch",
  detail: "MyPentest is free while we launch. No credit card, no trial clock.",
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    status: "available",
    price: "Free",
    priceNote: "During launch · no credit card",
    description: "Real automated pentests of the web apps you own — not a sample report.",
    features: [
      "Attack-surface discovery, then testing",
      "All 56 checks, passive and safe-active",
      "Authenticated testing with your test accounts",
      `Up to ${FREE_LIMITS.scansPerDay} scans a day, one at a time`,
      `Up to ${FREE_LIMITS.targetsPerScan} URLs and ${FREE_LIMITS.crawlPages} discovered pages per scan`,
      "Evidence, CVSS, remediation · PDF, SARIF, Markdown, JSON exports",
      "Private scan history in your account",
    ],
    cta: { label: "Start free pentest", href: "/mypentest/app/new" },
    highlight: true,
  },
  {
    id: "advanced",
    name: "Advanced",
    status: "coming-soon",
    price: null,
    priceNote: "Pricing not yet announced",
    description: "For teams who test every release: higher limits and scheduled retests.",
    features: [
      "Higher scan and target limits",
      "Scheduled and on-demand retests",
      "Team access to shared assessments",
      "Priority engine capacity",
    ],
    cta: { label: "Tell me when it's ready", href: "/contact?topic=mypentest-advanced" },
  },
  {
    id: "business",
    name: "Business / Enterprise",
    status: "contact",
    price: null,
    priceNote: "Scoped with you",
    description: "Automation plus expert-led testing, reporting your auditors accept.",
    features: [
      "Manual penetration testing by BugSnaps testers",
      "Business-logic and chained-attack testing",
      "Retesting until every fix holds",
      "Reports for customers, SOC 2 and ISO 27001",
    ],
    cta: { label: "Talk to us", href: "/contact?topic=enterprise" },
  },
];

/** Consultancy engagements are quoted per scope, never listed as a price. */
export const SERVICE_PRICING = {
  headline: "Quoted per scope",
  detail:
    "Every engagement is scoped on a free call and quoted in writing before anything starts. Retesting of fixes is included.",
  included: [
    "Free 30-minute scoping call",
    "Fixed quote in writing before you commit",
    "Retest of every fix included",
    "No surprise fees",
  ],
};

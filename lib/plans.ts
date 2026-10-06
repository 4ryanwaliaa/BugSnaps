/*
 * Pricing and plans - the ONE place the site gets them.
 *
 * The live catalog is in the Firebase Realtime Database at plans/{id}: public
 * to read, writable only from the Firebase console or CLI. It is loaded from
 * plans.json in the scanner repository:
 *
 *   firebase database:set /plans plans.json
 *
 * The MyPentest engine reads the same records to enforce each plan's limits
 * and to price Razorpay orders, so changing a price or a limit is one edit in
 * the database - not a deploy of either the site or the engine.
 *
 * `getPlans()` reads the catalog on the server (cached for five minutes).
 * FALLBACK_PLANS mirror plans.json and are used only when the database can't be
 * read, so a pricing page is never empty. No page states a price or a limit of
 * its own; they all render from here.
 */
import { firebaseConfig } from "@/lib/firebase-auth";
import type { PlanLimits as EnginePlan, Severity } from "@/lib/mypentest/types";
import { SEVERITIES } from "@/lib/mypentest/types";

export type ExportFormat = "json" | "md" | "html" | "sarif" | "pdf";
export const EXPORT_FORMATS: ExportFormat[] = ["json", "md", "html", "sarif", "pdf"];
export type Cycle = "monthly" | "yearly";

export interface Plan {
  id: string;
  order: number;
  title: string;
  description: string;
  /** Price per period in the currency's smallest unit (paise). 0 is free. */
  price: number;
  /** Price for a year, paid at once (paise); 0 when not sold yearly. */
  yearlyPrice: number;
  currency: string;
  periodDays: number;
  /** Scans per rolling `scanWindowDays`; null is unlimited. */
  scans: number | null;
  scanWindowDays: number;
  concurrentScans: number;
  /** The finding severities reports show in full. The rest are counted only. */
  severities: Severity[];
  targetsPerScan: number;
  crawlPages: number;
  scanHours: number;
  manualTesting: boolean;
  /** Finished scans are saved to the account's history. */
  history: boolean;
  /** Download formats; "pdf" is the report page's print-to-PDF. */
  exports: ExportFormat[];
  perks: string[];
  highlight: boolean;
  public: boolean;
  lifetimeScans: boolean;
  scanPack: boolean;
}

/**
 * The engine's own ceilings (MAX_SCAN_TARGETS, MAX_CRAWL_PAGES in the
 * scanner's web/app.py). A plan set to one has no plan cap on that count;
 * only the scan's time limit bounds it.
 */
export const ENGINE_MAX_TARGETS = 10_000;
export const ENGINE_MAX_PAGES = 50_000;

/** Mirrors plans.json. Used only when the database can't be read. */
export const FALLBACK_PLANS: Plan[] = [
  {
    "id": "free",
    "order": 0,
    "title": "Free",
    "description": "One free automated pentest of a site you own, with limited URL testing and discovery.",
    "price": 0,
    "currency": "INR",
    "periodDays": 30,
    "scans": 1,
    "scanWindowDays": 30,
    "concurrentScans": 1,
    "severities": [
      "medium",
      "low"
    ],
    "targetsPerScan": 200,
    "crawlPages": 500,
    "scanHours": 1,
    "manualTesting": false,
    "history": false,
    "perks": [
      "Passive and safe-active testing",
      "Evidence, CVSS and remediation for every finding shown",
      "Optional email summary on completion"
    ],
    "yearlyPrice": 0,
    "exports": [],
    "highlight": false,
    "public": true,
    "lifetimeScans": true,
    "scanPack": false
  },
  {
    "id": "starter",
    "order": 1,
    "title": "Strike",
    "description": "One full pentest with nothing held back: every check, every finding including critical, and a PDF report. Pay once, no monthly plan.",
    "price": 39900,
    "currency": "INR",
    "periodDays": 30,
    "scans": 1,
    "scanWindowDays": 30,
    "concurrentScans": 1,
    "severities": [
      "critical",
      "high",
      "medium",
      "low",
      "info"
    ],
    "targetsPerScan": 300,
    "crawlPages": 50000,
    "scanHours": 1,
    "manualTesting": false,
    "history": true,
    "perks": [
      "Everything Operator shows, for one scan",
      "Full attack-chain analysis, critical findings included",
      "PDF, HTML, Markdown, JSON and SARIF downloads"
    ],
    "yearlyPrice": 0,
    "exports": [
      "json",
      "md",
      "html",
      "sarif",
      "pdf"
    ],
    "highlight": false,
    "public": false,
    "lifetimeScans": false,
    "scanPack": false
  },
  {
    "id": "plus",
    "order": 2,
    "title": "Plus",
    "description": "Two detailed automated pentests for one payment. Your scans stay available until used. Buy another pack whenever you need it.",
    "price": 49900,
    "currency": "INR",
    "periodDays": 30,
    "scans": 2,
    "scanWindowDays": 30,
    "concurrentScans": 2,
    "severities": [
      "critical",
      "high",
      "medium",
      "low",
      "info"
    ],
    "targetsPerScan": 10000,
    "crawlPages": 50000,
    "scanHours": 1,
    "manualTesting": false,
    "history": true,
    "perks": [
      "Unused scans carry over when you buy another pack",
      "No monthly subscription or automatic charge",
      "Optional email report on completion"
    ],
    "yearlyPrice": 0,
    "exports": [
      "json",
      "md",
      "html",
      "sarif",
      "pdf"
    ],
    "highlight": true,
    "public": true,
    "lifetimeScans": true,
    "scanPack": true
  },
  {
    "id": "pro",
    "order": 3,
    "title": "Operator",
    "description": "Every finding at every severity, including critical, with PDF reports you can hand to clients.",
    "price": 199900,
    "currency": "INR",
    "periodDays": 30,
    "scans": 15,
    "scanWindowDays": 30,
    "concurrentScans": 2,
    "severities": [
      "critical",
      "high",
      "medium",
      "low",
      "info"
    ],
    "targetsPerScan": 10000,
    "crawlPages": 50000,
    "scanHours": 1,
    "manualTesting": false,
    "history": true,
    "perks": [
      "Everything in Hunter",
      "Full attack-chain analysis, critical findings included",
      "Priority premium support"
    ],
    "yearlyPrice": 0,
    "exports": [
      "json",
      "md",
      "html",
      "sarif",
      "pdf"
    ],
    "highlight": false,
    "public": false,
    "lifetimeScans": false,
    "scanPack": false
  }
];

/* ── Reading the catalog ─────────────────────────────────────── */

const num = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
const str = (value: unknown, fallback: string) => (typeof value === "string" && value.trim() ? value.trim() : fallback);
const list = (value: unknown): unknown[] | null =>
  Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value) : null;

/** One plans/{id} record over its fallback (or a blank base), defensively. */
function planFrom(id: string, raw: Record<string, unknown>, base?: Plan): Plan {
  const fallback: Plan = base ?? {
    ...FALLBACK_PLANS[0],
    id,
    title: id.charAt(0).toUpperCase() + id.slice(1),
    description: "",
    perks: [],
    highlight: false,
  };
  const severities = list(raw.severities)?.filter((s): s is Severity => SEVERITIES.includes(s as Severity));
  const exports =
    raw.exports === "none"
      ? []
      : list(raw.exports)?.filter((f): f is ExportFormat => EXPORT_FORMATS.includes(f as ExportFormat));
  const perks = list(raw.perks)?.filter((p): p is string => typeof p === "string" && p.trim().length > 0);
  return {
    id,
    public: typeof raw.public === "boolean" ? raw.public : fallback.public,
    lifetimeScans: raw.lifetimeScans === true,
    scanPack: raw.scanPack === true,
    order: num(raw.order, fallback.order),
    title: str(raw.title, fallback.title),
    description: str(raw.description, fallback.description),
    price: Math.round(num(raw.price, fallback.price)),
    yearlyPrice: Math.round(num(raw.yearlyPrice, fallback.yearlyPrice)),
    currency: str(raw.currency, fallback.currency),
    periodDays: num(raw.periodDays, fallback.periodDays),
    scans: raw.scans === "unlimited" ? null : "scans" in raw ? num(raw.scans, 1) : fallback.scans,
    scanWindowDays: num(raw.scanWindowDays, fallback.scanWindowDays),
    concurrentScans: num(raw.concurrentScans, fallback.concurrentScans),
    severities: severities?.length ? SEVERITIES.filter((s) => severities.includes(s)) : fallback.severities,
    targetsPerScan: num(raw.targetsPerScan, fallback.targetsPerScan),
    crawlPages: num(raw.crawlPages, fallback.crawlPages),
    scanHours: num(raw.scanHours, fallback.scanHours),
    manualTesting: typeof raw.manualTesting === "boolean" ? raw.manualTesting : fallback.manualTesting,
    history: typeof raw.history === "boolean" ? raw.history : fallback.history,
    exports: exports ? EXPORT_FORMATS.filter((f) => exports.includes(f)) : fallback.exports,
    perks: perks ?? fallback.perks,
    highlight: typeof raw.highlight === "boolean" ? raw.highlight : fallback.highlight,
  };
}

/** The catalog from the database, or the fallback. Server-side; cached 5 minutes. */
export async function getPlans(): Promise<Plan[]> {
  try {
    const response = await fetch(`${firebaseConfig.databaseURL}/plans.json`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const raw = (await response.json()) as Record<string, unknown> | null;
      if (raw && typeof raw === "object" && Object.keys(raw).length) {
        const plans = Object.entries(raw)
          .filter(([id, value]) => /^[a-z0-9-]{1,32}$/.test(id) && value && typeof value === "object")
          .map(([id, value]) =>
            planFrom(id, value as Record<string, unknown>, FALLBACK_PLANS.find((p) => p.id === id)),
          );
        if (plans.some((p) => p.id === "free")) return plans.filter((p) => p.public).sort((a, b) => a.order - b.order);
      }
    }
  } catch {
    // The fallback below is the answer; a pricing page never renders empty.
  }
  return FALLBACK_PLANS.filter((p) => p.public);
}

/**
 * A catalog plan with the engine's numbers over it. The engine enforces the
 * limits and prices the orders, so where the two differ (a catalog cached a
 * few minutes longer than the engine's) the engine is what is true.
 */
export function withEngine(plan: Plan, engine?: EnginePlan): Plan {
  if (!engine) return plan;
  return {
    ...plan,
    title: engine.title || plan.title,
    price: engine.price,
    yearlyPrice: engine.yearly_price,
    currency: engine.currency,
    periodDays: engine.period_days,
    scans: engine.max_scans,
    lifetimeScans: engine.lifetime_scans,
    scanPack: engine.scan_pack,
    targetsPerScan: engine.max_targets_per_scan,
    crawlPages: engine.max_crawl_pages,
    scanHours: engine.scan_deadline_seconds / 3600,
    scanWindowDays: engine.scan_window_days,
    concurrentScans: engine.max_concurrent_scans,
    severities: SEVERITIES.filter((s) => engine.severities.includes(s)),
    history: engine.history,
    exports: EXPORT_FORMATS.filter((f) => engine.exports.includes(f)),
  };
}

export function freePlan(plans: Plan[]): Plan {
  return plans.find((p) => p.price === 0) ?? FALLBACK_PLANS[0];
}

/* ── Describing a plan ───────────────────────────────────────── */

export function formatPrice(price: number, currency = "INR"): string {
  if (price === 0) return "Free";
  const amount = price / 100;
  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: amount % 1 ? 2 : 0 })}`;
  }
  return `${currency} ${amount.toLocaleString("en", { maximumFractionDigits: 2 })}`;
}

export function periodLabel(days: number): string {
  return days === 30 ? "month" : days === 365 ? "year" : `${days} days`;
}

/**
 * A plan that is one scan, paid once (Strike): its price is per scan, not per
 * month, and it is described that way everywhere.
 */
export function isSingleScan(plan: Pick<Plan, "price" | "scans" | "scanWindowDays" | "periodDays">): boolean {
  return plan.price > 0 && plan.scans === 1 && plan.scanWindowDays >= plan.periodDays;
}

/**
 * The engine rounds INR discounts down to rupees and USD discounts to the
 * nearest cent, with a USD 1 minimum. Orders determine the actual charge.
 */
export function discountedPrice(price: number, percent: number, currency = "INR"): number {
  if (!percent) return price;
  if (currency === "USD") return Math.max(100, Math.floor((price * (100 - percent) + 50) / 100));
  return Math.max(100, Math.floor((price * (100 - percent)) / 10_000) * 100);
}

const FORMAT_LABEL: Record<ExportFormat, string> = {
  json: "JSON",
  md: "Markdown",
  html: "HTML",
  sarif: "SARIF",
  pdf: "PDF",
};

/** "Download reports as JSON, Markdown, HTML and SARIF" - or what the plan lacks. */
export function exportsLabel(exports: ExportFormat[]): string {
  if (!exports.length) return "Read reports in the app (downloads on paid plans)";
  const files = exports.filter((f) => f !== "pdf").map((f) => FORMAT_LABEL[f]);
  if (exports.includes("pdf")) {
    return files.length ? `PDF reports, plus ${joinWords(files)} downloads` : "PDF reports";
  }
  return `Download reports as ${joinWords(files)}`;
}

export function historyLabel(history: boolean): string {
  return history ? "Scan history saved to your account" : "Results kept for 24 hours, not saved to history";
}

const LABEL: Record<Severity, string> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "informational",
};

function joinWords(words: string[]): string {
  return words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "the month" for a 30-day window, "the day" for 1, else "7 days". */
export function windowLabel(days: number): string {
  return days === 30 ? "month" : days === 1 ? "day" : days === 7 ? "week" : `${days} days`;
}

export function scansLabel(plan: { scans: number | null; scanWindowDays: number; price?: number; periodDays?: number; lifetimeScans?: boolean; scanPack?: boolean }): string {
  if (plan.scanPack) return `${plan.scans} detailed scans per pack, no expiry`;
  if (plan.lifetimeScans) return "1 free scan per account, once only";
  if (plan.scans === null) return "Unlimited scans";
  if (plan.price && plan.periodDays && isSingleScan({ ...plan, price: plan.price, periodDays: plan.periodDays })) {
    return `One full scan, to use within ${plan.periodDays} days`;
  }
  const per = plan.scanWindowDays === 30 || plan.scanWindowDays === 1 || plan.scanWindowDays === 7 ? "a" : "per";
  return `${plan.scans} scan${plan.scans === 1 ? "" : "s"} ${per} ${windowLabel(plan.scanWindowDays)}`;
}

/** "Medium and low findings in full" / "Every finding in full, critical included". */
export function reachLabel(severities: Severity[]): string {
  if (SEVERITIES.every((s) => severities.includes(s))) return "Every finding in full, critical included";
  return `${capitalise(joinWords(SEVERITIES.filter((s) => severities.includes(s)).map((s) => LABEL[s])))} findings in full`;
}

/** What a plan counts but doesn't detail, or null when it shows everything that matters. */
export function hiddenLabel(severities: Severity[]): string | null {
  const hidden = SEVERITIES.filter((s) => !severities.includes(s) && s !== "info");
  if (!hidden.length) return null;
  return `${capitalise(joinWords(hidden.map((s) => LABEL[s])))} findings counted, detailed on a higher plan`;
}

function sizeLabel(plan: Plan): string {
  const urls = plan.targetsPerScan >= ENGINE_MAX_TARGETS;
  const pages = plan.crawlPages >= ENGINE_MAX_PAGES;
  if (urls && pages) return "No plan cap on URLs or discovered pages";
  if (pages) return `Up to ${plan.targetsPerScan} URLs per scan, no cap on discovered pages`;
  if (urls) return `No cap on URLs, up to ${plan.crawlPages} discovered pages per scan`;
  return `Up to ${plan.targetsPerScan} URLs and ${plan.crawlPages} discovered pages per scan`;
}

/** Every line a plan card lists, derived from the numbers so copy can't drift. */
export function planFeatures(plan: Plan): string[] {
  const hidden = hiddenLabel(plan.severities);
  return Array.from(new Set([
    plan.scanPack || plan.lifetimeScans || isSingleScan(plan)
      ? scansLabel(plan)
      : `${scansLabel(plan)}, ${plan.concurrentScans > 1 ? `${plan.concurrentScans} at a time` : "one at a time"}`,
    reachLabel(plan.severities),
    ...(hidden ? [hidden] : []),
    historyLabel(plan.history),
    exportsLabel(plan.exports),
    sizeLabel(plan),
    ...(plan.scanPack ? ["Scans follow the service time and safety limits"] : []),
    ...(plan.manualTesting ? ["A custom manual penetration test by BugSnaps testers"] : []),
    ...plan.perks,
  ]));
}

/** The cheapest paid plan that shows `severity` in full, or null. */
export function cheapestShowing(plans: Plan[], severity: Severity): Plan | null {
  return (
    plans
      .filter((p) => p.price > 0 && p.severities.includes(severity))
      .sort((a, b) => a.price - b.price || a.order - b.order)[0] ?? null
  );
}

export const LAUNCH_OFFER = {
  headline: "Free plan",
  detail:
    "Start on the free plan - no credit card. Upgrade when you need more scans, or critical and high findings in full.",
};

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

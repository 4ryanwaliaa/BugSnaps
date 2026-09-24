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
}

const LIMITS = {
  targetsPerScan: 200,
  crawlPages: 500,
  scanHours: 1,
  currency: "INR",
  periodDays: 30,
  scanWindowDays: 30,
};

/** Mirrors plans.json. Used only when the database can't be read. */
export const FALLBACK_PLANS: Plan[] = [
  {
    id: "free",
    order: 0,
    title: "Free",
    description: "Real automated pentests of a site you own, with medium and low findings in full.",
    price: 0,
    yearlyPrice: 0,
    scans: 1,
    concurrentScans: 1,
    severities: ["medium", "low"],
    manualTesting: false,
    history: false,
    exports: [],
    perks: [
      "All 56 checks, passive and safe-active",
      "Evidence, CVSS and remediation for every finding shown",
      "An email with the summary when a scan finishes",
    ],
    highlight: false,
    ...LIMITS,
  },
  {
    id: "starter",
    order: 1,
    title: "Strike",
    description:
      "One full pentest with high-severity findings, saved history and a PDF report. Pay once, no monthly plan.",
    price: 39_900,
    yearlyPrice: 0,
    scans: 1,
    concurrentScans: 1,
    severities: ["high", "medium", "low", "info"],
    manualTesting: false,
    history: true,
    exports: [...EXPORT_FORMATS],
    perks: ["Everything in Free", "Early access to new checks and features", "Premium support"],
    highlight: false,
    ...LIMITS,
  },
  {
    id: "plus",
    order: 2,
    title: "Hunter",
    description: "More scans, saved history and high-severity findings in full, for teams shipping regularly.",
    price: 99_900,
    yearlyPrice: 959_000,
    scans: 5,
    concurrentScans: 2,
    severities: ["high", "medium", "low", "info"],
    manualTesting: false,
    history: true,
    exports: ["json", "md", "html", "sarif"],
    perks: ["Everything in Free", "Early access to new checks and features", "Premium support"],
    highlight: false,
    ...LIMITS,
  },
  {
    id: "pro",
    order: 3,
    title: "Operator",
    description: "Every finding at every severity, including critical, with PDF reports you can hand to clients.",
    price: 199_900,
    yearlyPrice: 1_919_000,
    scans: 15,
    concurrentScans: 2,
    severities: [...SEVERITIES],
    manualTesting: false,
    history: true,
    exports: [...EXPORT_FORMATS],
    perks: [
      "Everything in Hunter",
      "Full attack-chain analysis, critical findings included",
      "Priority premium support",
    ],
    highlight: true,
    ...LIMITS,
  },
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
        if (plans.some((p) => p.price === 0)) return plans.sort((a, b) => a.order - b.order);
      }
    }
  } catch {
    // The fallback below is the answer; a pricing page never renders empty.
  }
  return FALLBACK_PLANS;
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

/** What one payment costs on a cycle, or null when the plan isn't sold that way. */
export function cyclePrice(plan: Pick<Plan, "price" | "yearlyPrice">, cycle: Cycle): number | null {
  if (plan.price === 0) return null;
  if (cycle === "monthly") return plan.price;
  return plan.yearlyPrice > 0 ? plan.yearlyPrice : null;
}

/**
 * A plan that is one scan, paid once (Strike): its price is per scan, not per
 * month, and it is described that way everywhere.
 */
export function isSingleScan(plan: Pick<Plan, "price" | "scans" | "scanWindowDays" | "periodDays">): boolean {
  return plan.price > 0 && plan.scans === 1 && plan.scanWindowDays >= plan.periodDays;
}

/**
 * A price less an offer's percent, rounded down to the rupee - the same sum
 * the engine does (hosted.discounted). The engine's order is what is charged;
 * this is only for showing it.
 */
export function discountedPrice(price: number, percent: number): number {
  if (!percent) return price;
  return Math.max(100, Math.floor((price * (100 - percent)) / 10_000) * 100);
}

/** A yearly price as a month, rounded down to the rupee: "₹799". */
export function perMonth(yearlyPrice: number, currency = "INR"): string {
  return formatPrice(Math.floor(yearlyPrice / 12 / 100) * 100, currency);
}

/** How much a year saves against twelve monthly payments, as a whole percent. */
export function yearlySaving(plan: Pick<Plan, "price" | "yearlyPrice">): number {
  if (!plan.price || !plan.yearlyPrice) return 0;
  return Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100);
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

export function scansLabel(plan: { scans: number | null; scanWindowDays: number; price?: number; periodDays?: number }): string {
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

/** Every line a plan card lists, derived from the numbers so copy can't drift. */
export function planFeatures(plan: Plan): string[] {
  const hidden = hiddenLabel(plan.severities);
  return [
    isSingleScan(plan)
      ? scansLabel(plan)
      : `${scansLabel(plan)}, ${plan.concurrentScans > 1 ? `${plan.concurrentScans} at a time` : "one at a time"}`,
    reachLabel(plan.severities),
    ...(hidden ? [hidden] : []),
    historyLabel(plan.history),
    exportsLabel(plan.exports),
    `Up to ${plan.targetsPerScan} URLs and ${plan.crawlPages} discovered pages per scan`,
    ...(plan.manualTesting ? ["A custom manual penetration test by BugSnaps testers"] : []),
    ...plan.perks,
  ];
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

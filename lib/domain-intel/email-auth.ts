/**
 * Email authentication analysis: SPF, DMARC, DKIM, MTA-STS, TLS-RPT, BIMI.
 *
 * The point of this module is that "has an SPF record" is not the question
 * worth answering. A record that ends in "+all", or one that quietly exceeds
 * the RFC 7208 ten-lookup ceiling, is present and useless — in the second case
 * receivers get a permerror and the domain is no better protected than if it
 * had published nothing. So we parse and evaluate rather than just detect.
 */

import { type Availability, parseTxt, resolve } from "./dns";

/* --- SPF ---------------------------------------------------------------- */

/**
 * RFC 7208 section 4.6.4: the "include", "a", "mx", "ptr" and "exists"
 * mechanisms and the "redirect" modifier each cost one DNS lookup, and an
 * evaluation MUST NOT exceed ten of them. "ip4", "ip6" and "all" are free.
 */
const SPF_LOOKUP_LIMIT = 10;

// Our own runaway guard, independent of the RFC limit: a hostile or badly
// broken SPF graph must not be able to make us issue unbounded queries.
const SPF_QUERY_CAP = 30;
const SPF_MAX_DEPTH = 10;

const LOOKUP_MECHANISMS = new Set(["include", "a", "mx", "ptr", "exists"]);

export type SpfQualifier = "+" | "-" | "~" | "?";

export type SpfAnalysis = {
  status: Availability;
  record: string | null;
  /** More than one SPF record is a permerror: receivers reject the lot. */
  multipleRecords: boolean;
  lookupCount: number;
  lookupLimit: number;
  /** The qualifier on the terminating "all", which decides the default verdict. */
  allQualifier: SpfQualifier | null;
  usesPtr: boolean;
  includes: string[];
  /** We stopped walking early, so lookupCount is a floor, not a total. */
  truncated: boolean;
};

type SpfWalkState = {
  lookups: number;
  queries: number;
  visited: Set<string>;
  usesPtr: boolean;
  includes: string[];
  truncated: boolean;
};

function spfTerms(record: string): string[] {
  return record.trim().split(/\s+/).slice(1); // drop the leading "v=spf1"
}

async function spfRecordsFor(domain: string) {
  const txt = await resolve(domain, "TXT");
  const records = txt.records
    .map(parseTxt)
    .filter((value) => /^v=spf1(\s|$)/i.test(value.trim()));
  return { status: txt.status, records };
}

/**
 * Walk the SPF graph depth-first, counting lookup-causing terms the way a
 * receiving mail server would.
 */
async function walkSpf(record: string, state: SpfWalkState, depth: number): Promise<void> {
  if (depth > SPF_MAX_DEPTH || state.queries >= SPF_QUERY_CAP) {
    state.truncated = true;
    return;
  }

  for (const term of spfTerms(record)) {
    if (state.queries >= SPF_QUERY_CAP) {
      state.truncated = true;
      return;
    }

    const redirect = term.match(/^redirect=(.+)$/i);
    if (redirect) {
      state.lookups += 1;
      const target = redirect[1].toLowerCase();
      if (state.visited.has(target)) continue; // loop guard
      state.visited.add(target);
      state.queries += 1;
      const nested = await spfRecordsFor(target);
      if (nested.records.length === 1) await walkSpf(nested.records[0], state, depth + 1);
      continue;
    }

    // Strip the qualifier, then read the mechanism name before any ":" or "/".
    const mechanism = term.replace(/^[+\-~?]/, "").split(/[:/]/)[0].toLowerCase();
    if (!LOOKUP_MECHANISMS.has(mechanism)) continue;

    state.lookups += 1;
    if (mechanism === "ptr") state.usesPtr = true;

    if (mechanism === "include") {
      const target = term.replace(/^[+\-~?]/, "").slice("include:".length).toLowerCase();
      if (!target) continue;
      if (depth === 0) state.includes.push(target);
      if (state.visited.has(target)) continue;
      state.visited.add(target);
      state.queries += 1;
      const nested = await spfRecordsFor(target);
      if (nested.records.length === 1) await walkSpf(nested.records[0], state, depth + 1);
    }
  }
}

export async function analyzeSpf(domain: string): Promise<SpfAnalysis> {
  const root = await spfRecordsFor(domain);

  const empty: SpfAnalysis = {
    status: root.status,
    record: null,
    multipleRecords: false,
    lookupCount: 0,
    lookupLimit: SPF_LOOKUP_LIMIT,
    allQualifier: null,
    usesPtr: false,
    includes: [],
    truncated: false,
  };

  if (!root.records.length) return empty;
  if (root.records.length > 1) {
    return { ...empty, record: root.records[0], multipleRecords: true, status: "ok" };
  }

  const record = root.records[0];
  const state: SpfWalkState = {
    lookups: 0,
    queries: 1,
    visited: new Set([domain]),
    usesPtr: false,
    includes: [],
    truncated: false,
  };
  await walkSpf(record, state, 0);

  // An unqualified "all" means "+all" per RFC 7208 section 4.6.2.
  const allTerm = spfTerms(record).find((term) => /^[+\-~?]?all$/i.test(term));
  const allQualifier = allTerm
    ? ((/^[+\-~?]/.test(allTerm) ? allTerm[0] : "+") as SpfQualifier)
    : null;

  return {
    status: "ok",
    record,
    multipleRecords: false,
    lookupCount: state.lookups,
    lookupLimit: SPF_LOOKUP_LIMIT,
    allQualifier,
    usesPtr: state.usesPtr,
    includes: state.includes,
    truncated: state.truncated,
  };
}

/* --- DMARC -------------------------------------------------------------- */

export type DmarcAnalysis = {
  status: Availability;
  record: string | null;
  policy: string | null;
  subdomainPolicy: string | null;
  percent: number;
  aggregateReporting: boolean;
  forensicReporting: boolean;
  alignmentDkim: string;
  alignmentSpf: string;
};

export async function analyzeDmarc(domain: string): Promise<DmarcAnalysis> {
  const txt = await resolve(`_dmarc.${domain}`, "TXT");
  const record =
    txt.records.map(parseTxt).find((value) => /^v=dmarc1\s*;/i.test(value.trim())) ?? null;

  const empty: DmarcAnalysis = {
    status: txt.status,
    record: null,
    policy: null,
    subdomainPolicy: null,
    percent: 100,
    aggregateReporting: false,
    forensicReporting: false,
    alignmentDkim: "r",
    alignmentSpf: "r",
  };
  if (!record) return empty;

  const tags = new Map<string, string>();
  for (const part of record.split(";")) {
    const [name, ...rest] = part.split("=");
    if (!name || !rest.length) continue;
    tags.set(name.trim().toLowerCase(), rest.join("=").trim());
  }

  const percent = Number(tags.get("pct") ?? "100");

  return {
    status: "ok",
    record,
    policy: (tags.get("p") ?? "").toLowerCase() || null,
    subdomainPolicy: (tags.get("sp") ?? "").toLowerCase() || null,
    percent: Number.isFinite(percent) ? percent : 100,
    aggregateReporting: Boolean(tags.get("rua")),
    forensicReporting: Boolean(tags.get("ruf")),
    // Both default to relaxed when unspecified (RFC 7489 section 6.3).
    alignmentDkim: (tags.get("adkim") ?? "r").toLowerCase(),
    alignmentSpf: (tags.get("aspf") ?? "r").toLowerCase(),
  };
}

/* --- DKIM --------------------------------------------------------------- */

/**
 * DKIM cannot be enumerated: the selector is arbitrary and is only revealed in
 * the header of a message we will never see. Probing the selectors the major
 * platforms use is the best a passive check can do, so a miss here means
 * "not found at a common selector", never "no DKIM".
 */
const COMMON_DKIM_SELECTORS = [
  "google", // Google Workspace
  "selector1", // Microsoft 365
  "selector2",
  "k1", // Mailchimp / Mandrill
  "k2",
  "s1", // Amazon SES and others
  "s2",
  "dkim",
  "default",
  "mail",
  "zoho",
  "mandrill",
  "sendgrid",
  "smtp",
  "protonmail",
  "mimecast20190606",
];

export type DkimAnalysis = { selectorsFound: string[]; selectorsTried: number };

export async function analyzeDkim(domain: string): Promise<DkimAnalysis> {
  const results = await Promise.all(
    COMMON_DKIM_SELECTORS.map(async (selector) => {
      const txt = await resolve(`${selector}._domainkey.${domain}`, "TXT");
      const present = txt.records
        .map(parseTxt)
        .some((value) => /v=dkim1/i.test(value) || /p=[A-Za-z0-9+/]/.test(value));
      return present ? selector : null;
    }),
  );

  return {
    selectorsFound: results.filter((value): value is string => value !== null),
    selectorsTried: COMMON_DKIM_SELECTORS.length,
  };
}

/* --- transport and brand policies --------------------------------------- */

export type MailPolicies = {
  mtaSts: Availability;
  tlsRpt: Availability;
  bimi: Availability;
};

/**
 * Note on MTA-STS: a complete check also fetches
 * https://mta-sts.<domain>/.well-known/mta-sts.txt, but that is an HTTP
 * connection to the inspected domain's infrastructure. This tool is passive by
 * design, so we report only the TXT record that advertises the policy.
 */
export async function analyzeMailPolicies(domain: string): Promise<MailPolicies> {
  const [mtaSts, tlsRpt, bimi] = await Promise.all([
    resolve(`_mta-sts.${domain}`, "TXT"),
    resolve(`_smtp._tls.${domain}`, "TXT"),
    resolve(`default._bimi.${domain}`, "TXT"),
  ]);

  const state = (lookup: { status: Availability; records: string[] }, marker: RegExp): Availability => {
    if (lookup.status === "unavailable") return "unavailable";
    return lookup.records.map(parseTxt).some((value) => marker.test(value)) ? "ok" : "absent";
  };

  return {
    mtaSts: state(mtaSts, /v=STSv1/i),
    tlsRpt: state(tlsRpt, /v=TLSRPTv1/i),
    bimi: state(bimi, /v=BIMI1/i),
  };
}

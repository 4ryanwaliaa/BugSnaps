/**
 * Gathers every passive signal for one domain into a single profile.
 *
 * Ordering matters here: the zone apex has to be resolved before anything else
 * runs, because NS, MX, CAA, SPF and DMARC only exist at the apex. Everything
 * after that fans out in parallel.
 */

import {
  type Availability,
  type CaaRecord,
  type MailExchanger,
  findZoneApex,
  hostname,
  isPublicAddress,
  parseCaa,
  parseMx,
  resolve,
} from "./dns";
import {
  type DkimAnalysis,
  type DmarcAnalysis,
  type MailPolicies,
  type SpfAnalysis,
  analyzeDkim,
  analyzeDmarc,
  analyzeMailPolicies,
  analyzeSpf,
} from "./email-auth";
import { type CertificateIntel, inspectCertificates } from "./ct";

export type DomainProfile = {
  /** What the visitor asked about, normalised. */
  domain: string;
  /** The zone that actually holds the policy records. */
  apex: string;
  isSubdomain: boolean;
  analyzedAt: string;
  addresses: {
    status: Availability;
    ipv4: string[];
    ipv6: string[];
    withheldPrivate: number;
  };
  nameservers: { status: Availability; value: string[]; providers: string[] };
  mail: {
    status: Availability;
    exchangers: MailExchanger[];
    nullMx: boolean;
    provider: string | null;
  };
  caa: { status: Availability; records: CaaRecord[] };
  dnssec: { status: Availability; signed: boolean; validated: boolean };
  spf: SpfAnalysis;
  dmarc: DmarcAnalysis;
  dkim: DkimAnalysis;
  policies: MailPolicies;
  wildcard: { status: Availability; detected: boolean };
  certificates: CertificateIntel;
};

/**
 * Recognisable operators, matched on the hostname of the MX or NS record.
 * This is pattern matching on a public record, not fingerprinting — we report
 * only what the record itself already says out loud.
 */
const MAIL_PROVIDERS: [RegExp, string][] = [
  [/aspmx.*google|googlemail|google\.com$/i, "Google Workspace"],
  [/outlook\.com$|protection\.outlook|microsoft/i, "Microsoft 365"],
  [/secureserver\.net$/i, "GoDaddy"],
  [/zoho/i, "Zoho Mail"],
  [/protonmail|proton\.me/i, "Proton Mail"],
  [/mimecast/i, "Mimecast"],
  [/pphosted|proofpoint/i, "Proofpoint"],
  [/messagelabs|symantec/i, "Symantec"],
  [/fastmail|messagingengine/i, "Fastmail"],
  [/amazonaws|awsapps/i, "Amazon WorkMail"],
  [/yandex/i, "Yandex"],
  [/titan\.email|hostinger/i, "Titan"],
  [/improvmx/i, "ImprovMX"],
  [/zendesk|freshdesk|helpscout/i, "Helpdesk mail"],
];

function detectProvider(host: string): string | null {
  for (const [pattern, name] of MAIL_PROVIDERS) if (pattern.test(host)) return name;
  return null;
}

/** The registrable part of a nameserver hostname, used to spot concentration. */
function nameserverOperator(host: string): string {
  return host.split(".").slice(-2).join(".");
}

/** A label that will not exist unless the zone answers for everything. */
function wildcardProbeLabel(): string {
  return `bugsnaps-wildcard-probe-${Math.random().toString(36).slice(2, 10)}`;
}

export async function collectProfile(input: string): Promise<DomainProfile> {
  const apex = await findZoneApex(input);
  const isSubdomain = input !== apex;

  const [
    ipv4Lookup,
    ipv6Lookup,
    nsLookup,
    mxLookup,
    caaLookup,
    dsLookup,
    dnskeyLookup,
    wildcardLookup,
    spf,
    dmarc,
    dkim,
    policies,
    certificates,
  ] = await Promise.all([
    // Addresses describe the exact name asked about; everything else is a
    // property of the zone, so it is queried at the apex.
    resolve(input, "A"),
    resolve(input, "AAAA"),
    resolve(apex, "NS"),
    resolve(apex, "MX"),
    resolve(apex, "CAA"),
    resolve(apex, "DS"),
    resolve(apex, "DNSKEY"),
    resolve(`${wildcardProbeLabel()}.${apex}`, "A"),
    analyzeSpf(apex),
    analyzeDmarc(apex),
    analyzeDkim(apex),
    analyzeMailPolicies(apex),
    inspectCertificates(apex),
  ]);

  const publicIpv4 = ipv4Lookup.records.filter(isPublicAddress);
  const publicIpv6 = ipv6Lookup.records.filter(isPublicAddress);
  const withheldPrivate =
    ipv4Lookup.records.length - publicIpv4.length + (ipv6Lookup.records.length - publicIpv6.length);

  const nameservers = nsLookup.records.map(hostname).sort();
  const exchangers = mxLookup.records
    .map(parseMx)
    .filter((record): record is MailExchanger => record !== null)
    .sort((a, b) => a.priority - b.priority);

  // RFC 7505: a single MX of "." declares that the domain receives no mail.
  const nullMx = exchangers.length === 1 && exchangers[0].exchange === ".";

  const addressStatus: Availability =
    ipv4Lookup.status === "ok" || ipv6Lookup.status === "ok"
      ? "ok"
      : ipv4Lookup.status === "unavailable" && ipv6Lookup.status === "unavailable"
        ? "unavailable"
        : "absent";

  const dnssecStatus: Availability =
    dsLookup.status === "unavailable" && dnskeyLookup.status === "unavailable"
      ? "unavailable"
      : "ok";

  return {
    domain: input,
    apex,
    isSubdomain,
    analyzedAt: new Date().toISOString(),
    addresses: {
      status: addressStatus,
      ipv4: publicIpv4,
      ipv6: publicIpv6,
      withheldPrivate,
    },
    nameservers: {
      status: nsLookup.status,
      value: nameservers,
      providers: [...new Set(nameservers.map(nameserverOperator))],
    },
    mail: {
      status: mxLookup.status,
      exchangers,
      nullMx,
      provider: exchangers.length ? detectProvider(exchangers[0].exchange) : null,
    },
    caa: {
      status: caaLookup.status,
      records: caaLookup.records
        .map(parseCaa)
        .filter((record): record is CaaRecord => record !== null),
    },
    dnssec: {
      status: dnssecStatus,
      // A DS record in the parent zone is what actually puts the zone into the
      // chain of trust; DNSKEY alone proves nothing.
      signed: dsLookup.status === "ok" && dsLookup.records.length > 0,
      validated: dsLookup.authenticated,
    },
    spf,
    dmarc,
    dkim,
    policies,
    wildcard: {
      status: wildcardLookup.status,
      detected: wildcardLookup.status === "ok" && wildcardLookup.records.length > 0,
    },
    certificates,
  };
}

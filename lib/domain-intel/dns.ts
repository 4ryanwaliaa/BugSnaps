/**
 * DNS access for the domain-intelligence tool.
 *
 * We query over DNS-over-HTTPS rather than node:dns for two reasons:
 *
 *  1. node:dns cannot ask for DS or DNSKEY at all, so DNSSEC — one of the
 *     more meaningful signals we report — is unreachable through it.
 *  2. DoH hands back the resolver's AD (Authenticated Data) flag, which tells
 *     us whether the answer was actually DNSSEC-validated rather than merely
 *     signed.
 *
 * Everything here is a read of public DNS. Nothing in this module opens a
 * connection to the domain being inspected.
 */

export type Availability = "ok" | "absent" | "unavailable";

export type RawLookup = {
  status: Availability;
  records: string[];
  /** Resolver validated the answer against the DNSSEC chain of trust. */
  authenticated: boolean;
};

export const RECORD_TYPES = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  PTR: 12,
  MX: 15,
  TXT: 16,
  AAAA: 28,
  DS: 43,
  DNSKEY: 48,
  CAA: 257,
} as const;

export type RecordType = keyof typeof RECORD_TYPES;

type DohAnswer = { name: string; type: number; TTL: number; data: string };
type DohResponse = { Status: number; AD?: boolean; Answer?: DohAnswer[] };

// Two independent providers. If one is unreachable or returns SERVFAIL we ask
// the other before concluding anything, so a single resolver having a bad day
// never becomes a finding against the customer's domain.
const PROVIDERS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
];

const QUERY_TIMEOUT_MS = 3_500;

// DNS answers are identical for every visitor and change slowly, so a short
// shared cache cuts both our latency and the load we put on public resolvers.
// It also absorbs the repeated lookups SPF evaluation causes: half the internet
// includes _spf.google.com.
const CACHE_TTL_MS = 60_000;
const MAX_CACHE_ENTRIES = 2_000;
const cache = new Map<string, { expiresAt: number; value: RawLookup }>();

function readCache(key: string): RawLookup | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() >= hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function writeCache(key: string, value: RawLookup) {
  // Never cache "unavailable" — it describes our failure to look, not the
  // domain, and pinning it for a minute would make one blip look persistent.
  if (value.status === "unavailable") return;

  if (cache.size >= MAX_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [key_, entry] of cache) if (now >= entry.expiresAt) cache.delete(key_);
    // Still full of live entries: drop the oldest insertion to stay bounded.
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
  }
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

async function ask(provider: string, name: string, type: RecordType): Promise<DohResponse | null> {
  try {
    const url = `${provider}?name=${encodeURIComponent(name)}&type=${type}`;
    const response = await fetch(url, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as DohResponse;
  } catch {
    // Timeout, trouble reaching the provider, malformed JSON — all mean "we
    // did not get an answer", which the caller turns into "unavailable".
    return null;
  }
}

/**
 * Resolve one record type.
 *
 * The three outcomes must stay distinct:
 *   ok          — the record exists
 *   absent      — the resolver authoritatively says there is none (NODATA/NXDOMAIN)
 *   unavailable — we could not find out
 *
 * Collapsing "unavailable" into "absent" would let this tool tell a company
 * their SPF is missing when it is merely unreachable. A false "you are
 * unprotected" is worse than admitting we could not check.
 */
export async function resolve(name: string, type: RecordType): Promise<RawLookup> {
  const key = `${type}:${name}`;
  const cached = readCache(key);
  if (cached) return cached;

  for (const provider of PROVIDERS) {
    const response = await ask(provider, name, type);
    if (!response) continue;

    // NOERROR: an empty answer section is a genuine NODATA — the name exists
    // but carries no record of this type.
    if (response.Status === 0) {
      const records = (response.Answer ?? [])
        // A CNAME chain arrives in the same answer section; keep only the
        // records we actually asked for.
        .filter((answer) => answer.type === RECORD_TYPES[type])
        .map((answer) => answer.data);
      const value: RawLookup = {
        status: records.length ? "ok" : "absent",
        records,
        authenticated: response.AD === true,
      };
      writeCache(key, value);
      return value;
    }

    // NXDOMAIN: the name does not exist. Authoritative, so cacheable.
    if (response.Status === 3) {
      const value: RawLookup = {
        status: "absent",
        records: [],
        authenticated: response.AD === true,
      };
      writeCache(key, value);
      return value;
    }

    // SERVFAIL / REFUSED / anything else: ask the second provider before
    // giving up. A SERVFAIL from one resolver is often DNSSEC validation
    // failing there and nowhere else.
  }

  return { status: "unavailable", records: [], authenticated: false };
}

/* --- rdata parsers ------------------------------------------------------ */

/** Trailing-dot-free hostname, lowercased. */
export const hostname = (value: string) => value.trim().replace(/\.$/, "").toLowerCase();

/**
 * TXT rdata arrives quoted, and a record longer than 255 bytes arrives as
 * several quoted strings that must be concatenated with no separator — long
 * DKIM keys and SPF records rely on this.
 */
export function parseTxt(data: string): string {
  const chunks = data.match(/"(?:[^"\\]|\\.)*"/g);
  if (!chunks) return data.trim();
  return chunks.map((chunk) => chunk.slice(1, -1).replace(/\\(.)/g, "$1")).join("");
}

export type MailExchanger = { exchange: string; priority: number };

export function parseMx(data: string): MailExchanger | null {
  const match = data.trim().match(/^(\d+)\s+(\S+)$/);
  if (!match) return null;
  const exchange = hostname(match[2]);
  // "." is the RFC 7505 null MX: an explicit statement that the domain
  // receives no mail. That is meaningful, so it is kept rather than dropped.
  return { exchange: exchange || ".", priority: Number(match[1]) };
}

export type CaaRecord = { flags: number; tag: string; value: string };

export function parseCaa(data: string): CaaRecord | null {
  const match = data.trim().match(/^(\d+)\s+(\w+)\s+"?([^"]*)"?$/);
  if (!match) return null;
  return { flags: Number(match[1]), tag: match[2].toLowerCase(), value: match[3].trim() };
}

export type DsRecord = { keyTag: number; algorithm: number; digestType: number };

export function parseDs(data: string): DsRecord | null {
  const parts = data.trim().split(/\s+/);
  if (parts.length < 4) return null;
  return {
    keyTag: Number(parts[0]),
    algorithm: Number(parts[1]),
    digestType: Number(parts[2]),
  };
}

/* --- zone apex ---------------------------------------------------------- */

/**
 * Find the zone apex for a name.
 *
 * NS, MX, CAA, SPF and DMARC all live at the apex. Someone who types
 * "www.company.com" has a zone apex of "company.com", and reporting "no SPF,
 * no DMARC, no nameservers" against the www name would be a false accusation
 * aimed at a company that is in fact configured correctly.
 *
 * We find the apex by walking up the labels and stopping at the first name
 * that answers SOA in the answer section — a zone has exactly one SOA, at its
 * apex, by definition. That uses DNS itself as the authority and needs no
 * bundled public-suffix list, so multi-label suffixes like "co.uk" and
 * "com.au" come out right for free.
 */
const MAX_APEX_WALK = 4;

export async function findZoneApex(domain: string): Promise<string> {
  const labels = domain.split(".");
  const steps = Math.min(MAX_APEX_WALK, Math.max(0, labels.length - 2));

  for (let index = 0; index <= steps; index += 1) {
    const candidate = labels.slice(index).join(".");
    const soa = await resolve(candidate, "SOA");
    if (soa.status === "ok") return candidate;
  }

  // Nothing answered SOA (resolver trouble, or a name that does not exist).
  // Fall back to the registrable-looking last two labels.
  return labels.slice(-2).join(".");
}

/* --- address hygiene ---------------------------------------------------- */

/**
 * This tool reports a *public* attack surface, so private and reserved
 * addresses are withheld. Returning them would turn the endpoint into an
 * internal-network recon primitive: anyone could confirm that
 * "vpn.internal.example.com" exists and learn its 10.x address, or probe
 * cloud metadata ranges, using our server as the resolver.
 */
export function isPublicAddress(address: string): boolean {
  const value = address.trim().toLowerCase();

  if (value.includes(":")) {
    // IPv4-mapped IPv6 (::ffff:10.0.0.1) must be judged on the IPv4 part.
    const mapped = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) return isPublicAddress(mapped[1]);
    if (value === "::" || value === "::1") return false;
    if (/^f[cd][0-9a-f]{0,2}:/.test(value)) return false; // fc00::/7 unique-local
    if (/^fe[89ab][0-9a-f]?:/.test(value)) return false; // fe80::/10 link-local
    return true;
  }

  const octets = value.split(".").map(Number);
  if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
    return false;
  }
  const [a, b] = octets;

  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 169 && b === 254) return false; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0) return false; // IETF protocol assignments
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
  if (a >= 224) return false; // multicast + reserved
  return true;
}

/** Validate and canonicalise what the visitor typed. */
export function normalizeDomain(input: string | null): string | null {
  let value = (input ?? "").trim().toLowerCase();

  // Be forgiving about paste: people paste URLs and email addresses, not
  // bare hostnames.
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").split("/")[0].split("?")[0];
  value = value.split("@").pop() ?? value;
  value = value.replace(/:\d+$/, "").replace(/\.$/, "");

  const labels = value.split(".");
  const valid =
    value.length <= 253 &&
    labels.length >= 2 &&
    labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));

  return valid ? value : null;
}

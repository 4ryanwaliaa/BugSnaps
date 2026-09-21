/**
 * Certificate Transparency lookup.
 *
 * Every publicly trusted certificate issued since 2018 is logged to append-only
 * CT logs, so reading them reveals hostnames a company never advertised —
 * staging, admin panels, internal tools that were given a certificate. This is
 * the single richest passive source available, and it is a read of a public log
 * rather than any contact with the domain being inspected.
 */

export type CertificateIntel = {
  status: "ok" | "unavailable";
  source: "crt.sh" | "certspotter" | null;
  hostnames: string[];
  issuers: string[];
  wildcard: boolean;
  certificateCount: number;
};

const UNAVAILABLE: CertificateIntel = {
  status: "unavailable",
  source: null,
  hostnames: [],
  issuers: [],
  wildcard: false,
  certificateCount: 0,
};

// CT queries are the slowest thing we do, and they are enrichment rather than
// the core result, so they get a tight budget and simply drop out if they miss it.
const CT_TIMEOUT_MS = 6_000;

// Enough to show the shape of an estate without turning the panel into a wall
// of hostnames.
const MAX_HOSTNAMES = 40;

/** Normalise an issuer DN down to the organisation name. */
function issuerName(raw: string): string {
  const organisation = raw.match(/(?:^|,\s*)O=("[^"]+"|[^,]+)/i);
  const value = organisation ? organisation[1].replace(/^"|"$/g, "") : raw;
  return value.trim().slice(0, 60);
}

function summarise(
  source: "crt.sh" | "certspotter",
  names: string[],
  issuers: string[],
  certificateCount: number,
  domain: string,
): CertificateIntel {
  const suffix = `.${domain}`;
  const hostnames = new Set<string>();
  let wildcard = false;

  for (const raw of names) {
    const name = raw.trim().toLowerCase().replace(/\.$/, "");
    if (!name) continue;
    // CT logs return names for whatever was in the certificate, which can
    // include unrelated SANs on a shared certificate. Keep only this estate.
    if (name !== domain && !name.endsWith(suffix)) continue;
    if (name.startsWith("*.")) {
      wildcard = true;
      continue;
    }
    hostnames.add(name);
  }

  return {
    status: "ok",
    source,
    hostnames: [...hostnames].sort().slice(0, MAX_HOSTNAMES),
    issuers: [...new Set(issuers.map(issuerName))].filter(Boolean).sort(),
    wildcard,
    certificateCount,
  };
}

type CrtShRow = { issuer_name?: string; name_value?: string };

async function fromCrtSh(domain: string): Promise<CertificateIntel | null> {
  try {
    const response = await fetch(
      `https://crt.sh/?q=${encodeURIComponent(`%.${domain}`)}&output=json`,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(CT_TIMEOUT_MS),
        cache: "no-store",
      },
    );
    if (!response.ok) return null;

    const rows = (await response.json()) as CrtShRow[];
    if (!Array.isArray(rows)) return null;

    const names = rows.flatMap((row) => (row.name_value ?? "").split("\n"));
    const issuers = rows.map((row) => row.issuer_name ?? "");
    return summarise("crt.sh", names, issuers, rows.length, domain);
  } catch {
    return null;
  }
}

type CertSpotterRow = { dns_names?: string[]; issuer?: { name?: string } };

async function fromCertSpotter(domain: string): Promise<CertificateIntel | null> {
  try {
    const url = new URL("https://api.certspotter.com/v1/issuances");
    url.searchParams.set("domain", domain);
    url.searchParams.set("include_subdomains", "true");
    url.searchParams.append("expand", "dns_names");
    url.searchParams.append("expand", "issuer");

    const headers: Record<string, string> = { accept: "application/json" };
    // Unauthenticated CertSpotter allows only a handful of queries per hour per
    // source address, which public traffic burns through immediately. A free
    // token raises that; without one this stays a best-effort fallback.
    const token = process.env.CERTSPOTTER_TOKEN;
    if (token) headers.authorization = `Bearer ${token}`;

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(CT_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) return null;

    const rows = (await response.json()) as CertSpotterRow[];
    if (!Array.isArray(rows)) return null;

    const names = rows.flatMap((row) => row.dns_names ?? []);
    const issuers = rows.map((row) => row.issuer?.name ?? "");
    return summarise("certspotter", names, issuers, rows.length, domain);
  } catch {
    return null;
  }
}

/**
 * crt.sh has the better dataset and no rate limit, but it returns 502 often
 * enough that it cannot be the only source. CertSpotter is reliable but
 * tightly rate-limited without a token. Trying them in that order gives the
 * good answer most of the time and a usable one the rest of the time.
 */
export async function inspectCertificates(domain: string): Promise<CertificateIntel> {
  return (await fromCrtSh(domain)) ?? (await fromCertSpotter(domain)) ?? UNAVAILABLE;
}

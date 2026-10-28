/** Optional browser-to-Cloudflare DNS filtering check. Call only after user consent. */
export type DnsCheckResult = {
  status: "filtered" | "unlisted" | "inconclusive" | "unavailable";
  message: string;
};

type DnsResponse = { status: "ok"; addresses: string[] } | { status: "inconclusive" | "unavailable" };
const FILTER_RESOLVER = "https://security.cloudflare-dns.com/dns-query";
const CONTROL_RESOLVER = "https://cloudflare-dns.com/dns-query";
const REQUEST_TIMEOUT_MS = 4000;

/** Accept only public-looking DNS hostnames; never send IPs, URLs or local names. */
function validPublicHostname(input: string): string | null {
  const hostname = input.toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname.length > 253 || hostname !== hostname.trim() || !/^[a-z0-9.-]+$/.test(hostname)) return null;
  const labels = hostname.split(".");
  if (labels.length < 2 || labels.some(label => label.length < 1 || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) return null;
  if (/^[\d.]+$/.test(hostname)) return null;
  const suffix = labels[labels.length - 1];
  if (["localhost", "local", "localdomain", "internal", "intranet", "lan", "home", "private", "test", "invalid", "onion", "arpa"].includes(suffix)) return null;
  return hostname;
}

function validIpv4(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 4 && parts.every(part => /^(?:0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255);
}

async function resolveA(endpoint: string, hostname: string): Promise<DnsResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const requestUrl = new URL(endpoint);
    requestUrl.searchParams.set("name", hostname);
    requestUrl.searchParams.set("type", "A");
    const response = await fetch(requestUrl.toString(), {
      method: "GET", headers: { Accept: "application/dns-json" },
      credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store",
      redirect: "error", signal: controller.signal,
    });
    if (!response.ok) return { status: "unavailable" };
    const raw: unknown = await response.json();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { status: "inconclusive" };
    const data = raw as Record<string, unknown>;
    if (typeof data.Status !== "number" || !Number.isInteger(data.Status) || data.TC !== false || !Array.isArray(data.Question) || data.Question.length !== 1) return { status: "inconclusive" };
    const question = data.Question[0] as Record<string, unknown> | null;
    if (!question || typeof question.name !== "string" || question.name.toLowerCase().replace(/\.$/, "") !== hostname || question.type !== 1) return { status: "inconclusive" };
    // NXDOMAIN, SERVFAIL, REFUSED and malformed replies are not evidence of a clean domain.
    if (data.Status !== 0 || !Array.isArray(data.Answer) || data.Answer.length > 256) return { status: "inconclusive" };
    const addresses: string[] = [];
    for (const answer of data.Answer) {
      if (!answer || typeof answer !== "object" || Array.isArray(answer)) return { status: "inconclusive" };
      const record = answer as Record<string, unknown>;
      if (record.type === 1) {
        if (typeof record.data !== "string" || !validIpv4(record.data)) return { status: "inconclusive" };
        addresses.push(record.data);
      }
    }
    return addresses.length ? { status: "ok", addresses } : { status: "inconclusive" };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}

/** Check only a hostname, directly from the user's browser. This never visits the submitted site. */
export async function checkCloudflareDns(hostname: string): Promise<DnsCheckResult> {
  const host = validPublicHostname(hostname);
  if (!host) return { status: "inconclusive", message: "This hostname cannot be checked by the public DNS resolver." };
  const filtered = await resolveA(FILTER_RESOLVER, host);
  if (filtered.status === "unavailable") return { status: "unavailable", message: "Cloudflare DNS could not be reached. Try again later." };
  if (filtered.status !== "ok") return { status: "inconclusive", message: "Cloudflare DNS did not return a usable IPv4 answer, so this check cannot determine its filtering status." };
  const hasZero = filtered.addresses.includes("0.0.0.0");
  if (!hasZero) return { status: "unlisted", message: "Cloudflare's malware-filtering DNS returned an address for this hostname. That does not mean the link is safe." };
  if (filtered.addresses.some(address => address !== "0.0.0.0")) return { status: "inconclusive", message: "Cloudflare returned mixed DNS answers, so its filtering status is unclear." };
  // A hostname may itself have an all-zero address. Compare the normal resolver.
  const control = await resolveA(CONTROL_RESOLVER, host);
  if (control.status !== "ok" || control.addresses.includes("0.0.0.0")) return { status: "inconclusive", message: "Cloudflare returned an all-zero address, but its normal DNS answer could not confirm filtering." };
  return { status: "filtered", message: "Cloudflare's malware-filtering DNS returned a blocked address while its standard DNS returned a different address. This can indicate malware or phishing; it does not establish the type of threat." };
}

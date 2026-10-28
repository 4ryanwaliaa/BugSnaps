/** A local, lexical URL review. This never connects to the submitted address. */
export type Finding = {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "moderate" | "info";
};

export type AnalysisResult =
  | { ok: false; error: string }
  | {
      ok: true;
      hostname: string;
      normalizedUrl: string;
      verdict: "high-risk" | "review" | "no-obvious-signals";
      findings: Finding[];
    };

const shorteners = new Set([
  "bit.ly", "bitly.com", "tinyurl.com", "t.co", "ow.ly", "is.gd",
  "cutt.ly", "rebrand.ly", "shorturl.at", "lnkd.in", "buff.ly", "t.ly",
]);

/**
 * Review visible URL features, not the destination, reputation, or page content.
 * The result is not a determination that a URL is safe or malicious.
 */
export function analyzePhishingUrl(input: string): AnalysisResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter a URL or domain to review." };
  if (raw.length > 4096) return { ok: false, error: "Enter a URL shorter than 4,096 characters." };
  if (/\s|[\u0000-\u001f\u007f\\]/u.test(raw)) {
    return { ok: false, error: "Remove spaces, control characters, and backslashes from the URL." };
  }

  const scheme = raw.match(/^([a-z][a-z\d+.-]*):/i);
  const looksLikeHostPort = scheme && /^\d+(?:[/?#]|$)/.test(raw.slice(scheme[0].length));
  if (scheme && !/^https?:\/\//i.test(raw) && (/^https?$/i.test(scheme[1]) || !looksLikeHostPort)) {
    return { ok: false, error: "Only HTTP and HTTPS URLs can be reviewed." };
  }

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  if (/^https?:\/\/[/?#]/i.test(withScheme)) {
    return { ok: false, error: "Enter a valid HTTP or HTTPS URL with a hostname." };
  }
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, error: "That URL could not be parsed. Check the address and try again." };
  }
  if (!url.hostname || !["http:", "https:"].includes(url.protocol)) {
    return { ok: false, error: "Enter a valid HTTP or HTTPS URL with a hostname." };
  }

  const hostname = url.hostname.toLowerCase();
  const authority = withScheme.slice(withScheme.indexOf("//") + 2).split(/[/?#]/, 1)[0];
  const hostPart = authority.slice(authority.lastIndexOf("@") + 1);
  const findings: Finding[] = [];
  let risk = 0;
  const add = (id: string, title: string, detail: string, severity: Finding["severity"], weight: number) => {
    findings.push({ id, title, detail, severity });
    risk += weight;
  };

  if (url.username || url.password || authority.includes("@")) {
    add("userinfo", "Address contains user information", "Text before @ can disguise the actual destination. Check the hostname shown above carefully.", "high", 3);
  }
  if (/^\[.*\]$/.test(hostname) || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    add("ip-address", "Destination uses an IP address", "A numeric address can make the destination harder to recognize. It can also have legitimate uses.", "moderate", 1);
  }
  if (hostname.split(".").some((label) => label.startsWith("xn--"))) {
    add("internationalized-domain", "Internationalized hostname", "This domain uses international characters. Some characters can resemble letters in another script; verify the spelling independently.", "moderate", 1);
  }
  if (/%[\da-f]{2}/i.test(hostPart)) {
    add("encoded-host", "Encoded hostname", "The address contains encoded characters in its hostname, which can make it harder to read.", "moderate", 1);
  }
  if (hostname.length > 50) {
    add("long-host", "Long hostname", "A long hostname can obscure the actual destination. Read the domain carefully.", "moderate", 1);
  }
  const labels = hostname.replace(/\.$/, "").split(".");
  if (labels.length >= 5 && !hostname.startsWith("[")) {
    add("many-labels", "Several hostname levels", "Multiple subdomains can make an address harder to interpret. Check the destination independently.", "moderate", 1);
  }
  if (shorteners.has(hostname.replace(/\.$/, ""))) {
    add("shortener", "Shortened link", "A short link hides its final destination. This review does not follow redirects.", "moderate", 1);
  }
  if (/(?:^|[.-])(login|signin|verify|verification|secure|account|password)(?:[.-]|$)/i.test(hostname)) {
    add("account-terms", "Account-related words in hostname", "Words such as login or verify can appear in both legitimate and deceptive domains. Confirm the organization through a trusted source.", "moderate", 1);
  }
  if (url.protocol === "http:") {
    add("http", "Connection is not HTTPS", "Information sent over HTTP is not encrypted in transit. HTTPS alone does not establish that a site is trustworthy.", "moderate", 1);
  }
  if (raw.length > 100) {
    add("long-url", "Long URL", "Long addresses can hide their destination or other details. Length alone does not indicate phishing.", "info", 0);
  }

  return {
    ok: true,
    hostname,
    normalizedUrl: url.href,
    verdict: risk >= 3 ? "high-risk" : risk > 0 ? "review" : "no-obvious-signals",
    findings,
  };
}

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
      /** Hostnames found in redirect-like parameters, not followed or verified. */
      embeddedHosts: string[];
      verdict: "high-risk" | "review" | "no-obvious-signals";
      findings: Finding[];
    };

const shorteners = new Set([
  "bit.ly", "bitly.com", "tinyurl.com", "t.co", "ow.ly", "is.gd",
  "cutt.ly", "rebrand.ly", "shorturl.at", "lnkd.in", "buff.ly", "t.ly",
]);

// This small, deliberately explicit list is a hint, not an ownership registry.
// A brand can use other domains, and a listed domain can itself be compromised.
const brands = [
  { name: "PayPal", token: "paypal", domains: ["paypal.com"] },
  { name: "Google", token: "google", domains: ["google.com", "google.co.in"] },
  { name: "Microsoft", token: "microsoft", domains: ["microsoft.com", "microsoftonline.com"] },
  { name: "Apple", token: "apple", domains: ["apple.com", "icloud.com"] },
  { name: "Amazon", token: "amazon", domains: ["amazon.com", "amazon.in"] },
  { name: "Facebook", token: "facebook", domains: ["facebook.com", "fb.com"] },
  { name: "Instagram", token: "instagram", domains: ["instagram.com"] },
  { name: "Netflix", token: "netflix", domains: ["netflix.com"] },
  { name: "WhatsApp", token: "whatsapp", domains: ["whatsapp.com"] },
] as const;

function looksLikeBrand(part: string, token: string): boolean {
  // Only compare a whole hostname component; no arbitrary substring matches.
  const substitutions: Record<string, string> = { "0": "o", "1": "l", "3": "e", "5": "s" };
  const normalized = part.toLowerCase().replace(/[0135]/g, (character) => substitutions[character]);
  if (normalized === token) return true;
  // A single substitution, insertion, deletion or adjacent transposition can
  // be a typo. Short brands require an exact or digit-substituted match.
  if (token.length < 6 || Math.abs(normalized.length - token.length) > 1) return false;
  if (normalized.length === token.length) {
    const differences: number[] = [];
    for (let index = 0; index < token.length; index++) if (normalized[index] !== token[index]) differences.push(index);
    return differences.length === 1 || (differences.length === 2 && differences[1] === differences[0] + 1 && normalized[differences[0]] === token[differences[1]] && normalized[differences[1]] === token[differences[0]]);
  }
  const shorter = normalized.length < token.length ? normalized : token;
  const longer = normalized.length < token.length ? token : normalized;
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) { i++; j++; }
    else if (!skipped) { skipped = true; j++; }
    else return false;
  }
  return true;
}

function mentionedBrands(hostname: string): string[] {
  const host = hostname.replace(/\.$/, "");
  const pieces = host.split(/[.-]/).filter(Boolean);
  return brands.filter((brand) => {
    const recognizedHost = brand.domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
    return !recognizedHost && pieces.some((piece) => looksLikeBrand(piece, brand.token));
  }).map((brand) => brand.name);
}

// Decode one bounded IDNA A-label for visual comparison. URL.hostname is ASCII
// and browsers do not expose the Unicode form. This implements RFC 3492's
// decoding algorithm without an external network call or Node-only module.
function decodePunycodeLabel(label: string): string | null {
  if (!label.startsWith("xn--") || label.length > 63) return null;
  const encoded = label.slice(4);
  if (!encoded) return null;
  const codepoints: number[] = [];
  const delimiter = encoded.lastIndexOf("-");
  let cursor = 0;
  if (delimiter >= 0) {
    for (const char of encoded.slice(0, delimiter)) {
      if (char.charCodeAt(0) >= 128) return null;
      codepoints.push(char.charCodeAt(0));
    }
    cursor = delimiter + 1;
  }
  let n = 128, i = 0, bias = 72;
  const adapt = (delta: number, length: number, first: boolean) => {
    delta = Math.floor(delta / (first ? 700 : 2));
    delta += Math.floor(delta / length);
    let k = 0;
    while (delta > 455) { delta = Math.floor(delta / 35); k += 36; }
    return k + Math.floor(36 * delta / (delta + 38));
  };
  while (cursor < encoded.length) {
    const old = i;
    let weight = 1;
    for (let k = 36; ; k += 36) {
      if (cursor >= encoded.length) return null;
      const char = encoded.charCodeAt(cursor++);
      const digit = char >= 48 && char <= 57 ? char - 22 : char >= 97 && char <= 122 ? char - 97 : -1;
      if (digit < 0 || digit > Math.floor((Number.MAX_SAFE_INTEGER - i) / weight)) return null;
      i += digit * weight;
      const t = k <= bias ? 1 : k >= bias + 26 ? 26 : k - bias;
      if (digit < t) break;
      if (weight > Math.floor(Number.MAX_SAFE_INTEGER / (36 - t))) return null;
      weight *= 36 - t;
    }
    const length = codepoints.length + 1;
    bias = adapt(i - old, length, old === 0);
    n += Math.floor(i / length);
    i %= length;
    if (n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) return null;
    codepoints.splice(i, 0, n);
    if (codepoints.length > 63) return null;
    i++;
  }
  try { return String.fromCodePoint(...codepoints); } catch { return null; }
}

// A deliberately small set of common cross-script lookalikes, applied only
// when the entire component maps to a curated brand. This is not a complete
// implementation of Unicode confusable matching or an ownership lookup.
const confusables: Record<string, string> = {
  "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "х": "x",
  "у": "y", "і": "i", "ј": "j", "ѕ": "s", "ӏ": "l", "ԁ": "d",
  "ɑ": "a", "ɡ": "g", "ο": "o", "ρ": "p", "α": "a", "ε": "e",
  "ι": "i", "κ": "k", "ν": "v", "τ": "t", "χ": "x", "υ": "y",
};

function unicodeBrandMatches(hostname: string): string[] {
  const host = hostname.replace(/\.$/, "");
  const labels = host.split(".").map(label => decodePunycodeLabel(label) ?? label);
  const pieces = labels.flatMap(label => label.split("-"));
  return brands.filter(brand => {
    if (brand.domains.some(domain => host === domain || host.endsWith(`.${domain}`))) return false;
    return pieces.some(piece => {
      let hasConfusable = false;
      const skeleton = Array.from(piece.toLowerCase()).map(char => {
        if (confusables[char]) { hasConfusable = true; return confusables[char]; }
        return char;
      }).join("");
      return hasConfusable && skeleton === brand.token;
    });
  }).map(brand => brand.name);
}

const redirectNames = new Set(["redirect", "redirect_uri", "redirect_url", "return", "returnurl", "return_url", "return_to", "continue", "next", "url", "dest", "destination"]);

/** Inspect a bounded set of URL-valued parameters; never visit any URL. */
function embeddedDestinations(start: URL): { hosts: string[]; layers: number; userinfo: boolean; truncated: boolean } {
  const queue: Array<{ url: URL; depth: number }> = [{ url: start, depth: 0 }];
  const hosts = new Set<string>();
  const seen = new Set<string>([start.href]);
  let examined = 0;
  let layers = 0;
  let userinfo = false;
  let truncated = false;
  while (queue.length && examined < 80) {
    const current = queue.shift()!;
    if (current.depth >= 3) {
      if (Array.from(current.url.searchParams.keys()).some(key => redirectNames.has(key.toLowerCase()))) truncated = true;
      continue;
    }
    for (const [key, value] of current.url.searchParams) {
      if (++examined > 80) { truncated = true; break; }
      if (!redirectNames.has(key.toLowerCase())) continue;
      let candidate = value;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const target = candidate.startsWith("//") ? new URL(`${current.url.protocol}${candidate}`) : new URL(candidate);
          if ((target.protocol === "http:" || target.protocol === "https:") && target.hostname) {
            const host = target.hostname.toLowerCase().replace(/\.$/, "");
            if (target.username || target.password) userinfo = true;
            if (host !== current.url.hostname.toLowerCase().replace(/\.$/, "")) hosts.add(host);
            layers = Math.max(layers, current.depth + 1);
            if (!seen.has(target.href)) {
              if (queue.length >= 8) truncated = true;
              else { seen.add(target.href); queue.push({ url: target, depth: current.depth + 1 }); }
            }
            break;
          }
        } catch { /* Try bounded decoding below. Relative paths are not destinations. */ }
        try {
          const decoded = decodeURIComponent(candidate);
          if (decoded === candidate) break;
          candidate = decoded;
        } catch { break; }
      }
    }
  }
  if (queue.length || hosts.size > 8) truncated = true;
  return { hosts: Array.from(hosts).slice(0, 8), layers, userinfo, truncated };
}

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

  if (!/^https?:\/\//i.test(raw)) {
    add("assumed-scheme", "HTTPS assumed for parsing", "No scheme was supplied, so HTTPS was assumed for this review. This does not verify whether the site supports HTTPS.", "info", 0);
  }
  if (url.username || url.password || authority.includes("@")) {
    add("userinfo", "Address contains user information", "Text before @ can disguise the actual destination. Check the hostname shown above carefully.", "high", 3);
  }
  if (/^\[.*\]$/.test(hostname) || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    add("ip-address", "Destination uses an IP address", "A numeric address can make the destination harder to recognize. It can also have legitimate uses.", "moderate", 1);
  }
  if (hostname.split(".").some((label) => label.startsWith("xn--"))) {
    add("internationalized-domain", "Internationalized hostname", "This domain uses international characters. Some characters can resemble letters in another script; verify the spelling independently.", "moderate", 1);
  }
  if (/[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/u.test(raw)) {
    add("invisible-characters", "Link includes invisible or directional characters", "Invisible or bidirectional characters can change how an address appears. Inspect the destination hostname carefully.", "moderate", 1);
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
  const mentioned = mentionedBrands(hostname);
  if (mentioned.length > 0) {
    add("brand-lookalike", "Hostname resembles a known brand", `The hostname contains text similar to ${mentioned.join(", ")}, but is outside the limited domains recognized for that brand. This alone does not establish impersonation or ownership. Confirm the address through a trusted source.`, "moderate", 2);
  }
  const unicodeBrands = unicodeBrandMatches(hostname);
  if (unicodeBrands.length) {
    add("unicode-brand-lookalike", "Internationalized hostname resembles a brand", `Characters in the hostname can visually resemble ${unicodeBrands.join(", ")}. This is a limited visual comparison, not proof of impersonation. Check the spelling through a trusted source.`, "moderate", 2);
  }
  const embedded = embeddedDestinations(url);
  if (embedded.hosts.length) {
    add("external-redirect-parameter", "Link contains another destination", "A redirect-like parameter contains a different hostname. This is common in legitimate sign-in and tracking links too; the site may not actually redirect there. No redirects were followed.", "moderate", 1);
  }
  if (embedded.layers >= 2 && embedded.hosts.length) {
    add("nested-destinations", "Multiple embedded URL layers", "A URL inside a redirect-like parameter contains another URL. Nested links can obscure the final destination; this check did not follow them.", "moderate", 1);
  }
  if (embedded.userinfo) {
    add("nested-url-userinfo", "Embedded URL contains user information", "A URL within a redirect-like parameter contains text before @. It may obscure that URL’s actual hostname. No destination was opened.", "high", 2);
  }
  if (embedded.truncated) {
    add("embedded-analysis-limit", "Some embedded links were not examined", "This review limits how many URL parameters and destinations it processes. It may not show every embedded destination.", "info", 0);
  }
  if (url.port) {
    add("nonstandard-port", "Unusual web port", "The address uses a port other than the standard web ports. This can be legitimate, especially for development or internal services.", "info", 0);
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
    embeddedHosts: embedded.hosts,
    verdict: risk >= 3 ? "high-risk" : risk > 0 ? "review" : "no-obvious-signals",
    findings,
  };
}

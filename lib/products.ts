/*
 * The BugSnaps product line. Navigation, the footer, /products and the
 * homepage all read this list, so adding a product is one entry here - not a
 * redesign. `href` is where the product lives: a path on this site, or its own
 * domain (`external: true`), which is how MyRecon stays independent.
 */

export type ProductStatus = "available" | "beta" | "coming-soon";

export interface Product {
  id: string;
  name: string;
  /** One line: what it is. */
  tagline: string;
  /** Two sentences at most: what it does for you. */
  summary: string;
  href: string;
  external: boolean;
  status: ProductStatus;
  cta: string;
  /** Short, factual capability list for the /products page. */
  capabilities: string[];
}

export const products: Product[] = [
  {
    id: "mypentest",
    name: "MyPentest",
    tagline: "Automated penetration testing",
    summary:
      "Maps your web app's attack surface, then tests it: exposed secrets, broken access control, injection, session flaws and known vulnerabilities, with evidence, CVSS scores and fixes.",
    href: "/mypentest",
    external: false,
    status: "beta",
    cta: "Start free",
    capabilities: [
      "Attack-surface discovery from your domain",
      "56 checks across web, API, auth and configuration",
      "Authenticated testing with your test accounts",
      "CVSS 3.1 severity, confidence and remediation for every finding",
      "Paid-plan exports: PDF, HTML, Markdown, JSON, SARIF",
    ],
  },
  {
    id: "myrecon",
    name: "MyRecon",
    tagline: "Reconnaissance and OSINT",
    summary:
      "Username, email and breach intelligence, password-exposure checks, WHOIS, DNS and IP investigation - the reconnaissance layer of the BugSnaps ecosystem.",
    href: "/myrecon",
    external: false,
    status: "available",
    cta: "Explore MyRecon",
    capabilities: [
      "Username search across platforms",
      "Email and breach intelligence",
      "Password-exposure checks",
      "WHOIS, DNS and IP investigation",
      "Public-source leads for authorized investigation",
    ],
  },
  {
    id: "free-ai-pentesting",
    name: "Free AI Pentesting",
    tagline: "Free automated web assessment",
    summary:
      "Start a defined automated assessment of your verified web application without a credit card. The free plan has scan limits and restricted report visibility.",
    href: "/free-ai-pentesting",
    external: false,
    status: "available",
    cta: "Start free pentest",
    capabilities: [
      "Free plan with no credit card required",
      "Account-bound DNS TXT domain verification",
      "56 checks: 32 passive and 24 safe-active",
      "Evidence, severity, confidence and remediation",
      "Report downloads available on paid plans",
    ],
  },
  {
    id: "website-pentesting-ai",
    name: "AI Website Pentesting",
    tagline: "Automated website and API assessment",
    summary:
      "Maps accessible pages, APIs and JavaScript-referenced endpoints. Tests supplied account access and reports defined security checks with evidence and confidence.",
    href: "/website-pentesting-ai",
    external: false,
    status: "available",
    cta: "Explore web pentest AI",
    capabilities: [
      "Page, form and login-surface discovery",
      "JavaScript-referenced endpoints and exposed secrets",
      "IDOR / BOLA read-access checks with your test accounts",
      "Injection, session and configuration checks",
      "Complex business logic scoped for expert review",
    ],
  },
  {
    id: "ai-penetration-testing",
    name: "AI Pentesting Guide",
    tagline: "Compare automation by scope and evidence",
    summary:
      "Learn what to evaluate in AI penetration testing and automated security tools. Explore MyPentest checks, confidence labels, limits and expert testing options.",
    href: "/ai-penetration-testing",
    external: false,
    status: "available",
    cta: "Explore AI pentesting",
    capabilities: [
      "Defined automated checks on verified targets",
      "Observed evidence and confidence labels",
      "Passive and non-destructive safe-active modes",
      "Technical findings to support security reviews",
      "Benchmark methodology and balanced comparisons",
    ],
  },
];

export function product(id: string): Product {
  const found = products.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown product ${id}`);
  return found;
}

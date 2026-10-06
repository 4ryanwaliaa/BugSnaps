import { MYRECON_URL } from "@/lib/site";

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
      "Exports: PDF, HTML, Markdown, JSON, SARIF",
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
      "Direct feed into MyPentest scanning engine",
    ],
  },
  {
    id: "free-ai-pentesting",
    name: "Free AI Pentesting",
    tagline: "Zero-cost automated web DAST",
    summary:
      "Run an autonomous penetration test on your web app with zero credit card required. 56 active-safe checks with deterministic proof of exploit.",
    href: "/free-ai-pentesting",
    external: false,
    status: "available",
    cta: "Start free pentest",
    capabilities: [
      "Zero dollar plan with no credit card required",
      "Cryptographic DNS TXT domain verification",
      "56 active-safe DAST vulnerability checks",
      "Deterministic proof-of-exploit validation",
      "Instant SARIF, PDF and JSON vulnerability report",
    ],
  },
  {
    id: "website-pentesting-ai",
    name: "AI Website Pentesting",
    tagline: "Autonomous SPA and API vulnerability testing",
    summary:
      "Headless browser crawling and intelligent payload mutation for modern web apps. Detects OWASP Top 10, BOLA, and business logic flaws without false positives.",
    href: "/website-pentesting-ai",
    external: false,
    status: "available",
    cta: "Explore web pentest AI",
    capabilities: [
      "Headless browser DOM crawling for modern SPAs",
      "Client-side JavaScript bundle and AST route parsing",
      "Dual-account authenticated BOLA and IDOR verification",
      "Automated blind SQLi, XSS, and SSRF detection",
      "Zero false positives through mathematical verification",
    ],
  },
  {
    id: "ai-penetration-testing",
    name: "AI Pentest Platform",
    tagline: "Autonomous offensive security engine",
    summary:
      "Combines autonomous attack surface discovery with deterministic proof-of-exploit verification. Eliminates hallucinations and protects production systems.",
    href: "/ai-penetration-testing",
    external: false,
    status: "available",
    cta: "View AI platform",
    capabilities: [
      "Adaptive attack surface discovery and route mapping",
      "Deterministic proof-of-exploit execution (zero LLM hallucinations)",
      "Safe-active testing that never damages production databases",
      "SOC 2, ISO 27001, and PCI DSS compliance mapping",
      "Automated CI/CD integration and developer triage",
    ],
  },
];

export function product(id: string): Product {
  const found = products.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown product ${id}`);
  return found;
}

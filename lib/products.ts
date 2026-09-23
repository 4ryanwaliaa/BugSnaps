import { MYRECON_URL } from "@/lib/site";

/*
 * The BugSnaps product line. Navigation, the footer, /products and the
 * homepage all read this list, so adding a product is one entry here — not a
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
      "Username, email and breach intelligence, password-exposure checks, WHOIS, DNS and IP investigation — the reconnaissance layer of the BugSnaps ecosystem.",
    href: MYRECON_URL,
    external: true,
    status: "available",
    cta: "Open MyRecon",
    capabilities: [
      "Username search across platforms",
      "Email and breach intelligence",
      "Password-exposure checks",
      "WHOIS, DNS and IP investigation",
    ],
  },
];

export function product(id: string): Product {
  const found = products.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown product ${id}`);
  return found;
}

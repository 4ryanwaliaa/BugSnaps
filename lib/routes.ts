import type { MetadataRoute } from "next";
import { competitors, versusPath } from "@/lib/competitors";

/*
 * Every indexable page on the site, in one list. The sitemap is generated from
 * it, so a new page appears in the sitemap by being added here - and a page
 * that isn't a real, indexable URL (the signed-in app, the API) is simply
 * never added. `priority` is relative importance, not a ranking promise.
 */

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export interface IndexableRoute {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

export const INDEXABLE_ROUTES: IndexableRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },

  // Product
  { path: "/mypentest", changeFrequency: "weekly", priority: 0.9 },
  { path: "/mypentest/example-report", changeFrequency: "monthly", priority: 0.6 },
  { path: "/products", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },

  // Services
  { path: "/services", changeFrequency: "monthly", priority: 0.7 },
  { path: "/penetration-testing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/web-application-pentesting", changeFrequency: "monthly", priority: 0.8 },
  { path: "/api-security-testing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/network-pentesting", changeFrequency: "monthly", priority: 0.7 },

  // Comparisons
  { path: "/compare", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/mypentest-vs-vulnerability-scanners", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/bugsnaps-vs-traditional-pentest", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/automated-vs-manual-penetration-testing", changeFrequency: "monthly", priority: 0.6 },
  ...competitors.map((c) => ({ path: versusPath(c.slug), changeFrequency: "monthly" as const, priority: 0.7 })),

  // Content
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },

  // Company
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.4 },
  { path: "/personal", changeFrequency: "monthly", priority: 0.6 },

  // Legal
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/responsible-disclosure", changeFrequency: "yearly", priority: 0.2 },
];

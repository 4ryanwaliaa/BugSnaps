import type { MetadataRoute } from "next";
import { competitors, versusPath } from "@/lib/competitors";
import { SECURITY_GUIDES, guidePath } from "@/lib/security-guides";
import { SECURITY_USE_CASES, useCasePath } from "@/lib/security-use-cases";
import { ALTERNATIVE_PAGES, alternativePath } from "@/lib/alternatives";

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
  /** Date of a substantive content change, not the date of each build. */
  lastModified?: string;
}

export const INDEXABLE_ROUTES: IndexableRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0, lastModified: "2026-10-02" },

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
  { path: "/compare", changeFrequency: "monthly", priority: 0.6, lastModified: "2026-10-02" },
  { path: "/compare/mypentest-vs-vulnerability-scanners", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/bugsnaps-vs-traditional-pentest", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare/automated-vs-manual-penetration-testing", changeFrequency: "monthly", priority: 0.6 },
  ...competitors.map((c) => ({ path: versusPath(c.slug), changeFrequency: "monthly" as const, priority: 0.7,
    lastModified: c.checkedOn })),

  // Content
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/resources", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-10-02" },
  { path: "/guides", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-10-02" },
  ...SECURITY_GUIDES.map((g) => ({ path: guidePath(g.slug), changeFrequency: "monthly" as const,
    priority: 0.6, lastModified: g.updated })),
  { path: "/use-cases", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-10-02" },
  ...SECURITY_USE_CASES.map((u) => ({ path: useCasePath(u.slug), changeFrequency: "monthly" as const,
    priority: 0.6, lastModified: u.updated })),
  { path: "/alternatives", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-10-02" },
  ...ALTERNATIVE_PAGES.map((a) => ({ path: alternativePath(a.slug), changeFrequency: "monthly" as const,
    priority: 0.6, lastModified: a.updated })),
  { path: "/site-map", changeFrequency: "monthly", priority: 0.3, lastModified: "2026-10-02" },

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

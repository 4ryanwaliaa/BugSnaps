import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { INDEXABLE_ROUTES } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...INDEXABLE_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      ...(route.lastModified ? { lastModified: new Date(`${route.lastModified}T00:00:00Z`) } : {}),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: new Date(`${p.updated ?? p.published}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}

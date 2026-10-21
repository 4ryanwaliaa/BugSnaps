import type { MetadataRoute } from "next";
import { SITEMAP_PAGES } from "@/lib/sitemap-pages";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_PAGES.map((route) => ({
    url: absoluteUrl(route.path),
    ...(route.lastModified ? { lastModified: route.lastModified } : {}),
  }));
}

import { posts } from "@/lib/blog";
import { INDEXABLE_ROUTES } from "@/lib/routes";

// Share the exact public inventory between the XML and human-readable maps.
// Dates represent content changes, never a build time or a crawl request.
const articleDates = posts.map((post) => post.updated ?? post.published).sort();
export const SITEMAP_PAGES = [
  ...INDEXABLE_ROUTES.map((route) => ({
    path: route.path,
    lastModified: route.path === "/blog" ? articleDates.at(-1) : route.lastModified,
  })),
  ...posts.map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: post.updated ?? post.published,
  })),
];

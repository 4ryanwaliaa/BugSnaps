import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The signed-in application and its API are not content to index.
        disallow: ["/mypentest/app", "/mypentest/api"],
      },
      {
        userAgent: [
          "Googlebot",
          "Google-Extended",
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Applebot",
          "Applebot-Extended",
          "Amazonbot",
          "cohere-ai",
          "Bytespider",
          "CCBot",
          "Diffbot",
          "FacebookBot",
          "Omgilibot",
        ],
        allow: "/",
        disallow: ["/mypentest/app", "/mypentest/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

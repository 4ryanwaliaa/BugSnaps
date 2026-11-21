"use client";

import { useId, useState } from "react";
import Link from "@/components/site/content-link";
import { ArrowRight } from "lucide-react";

export type BlogHubId =
  | "advisories"
  | "products"
  | "vulnerabilities"
  | "architecture"
  | "mypentest"
  | "strategy";

export interface BlogHubSummary {
  slug: string;
  title: string;
  description: string;
  published: string;
  readingMinutes: number;
  hubId: BlogHubId;
}

export interface BlogHubMeta {
  id: BlogHubId;
  title: string;
  description: string;
  links: { label: string; href: string }[];
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function BlogHub({
  hubs,
  articles,
}: {
  hubs: BlogHubMeta[];
  articles: BlogHubSummary[];
}) {
  const [selectedHub, setSelectedHub] = useState<BlogHubId | "all">("all");
  const [query, setQuery] = useState("");
  const searchId = useId();
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const filtered = articles.filter((article) => {
    if (selectedHub !== "all" && article.hubId !== selectedHub) return false;
    if (!terms.length) return true;
    const text = `${article.title} ${article.description}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });

  const visibleHubs = hubs.filter(
    (hub) =>
      (selectedHub === "all" || hub.id === selectedHub) &&
      filtered.some((article) => article.hubId === hub.id),
  );

  return (
    <div className="space-y-12">
      <div className="rounded-2xl border border-white/[0.08] bg-surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md flex-1">
            <label htmlFor={searchId} className="block text-sm font-medium text-foreground">
              Search {articles.length} security articles
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by CVE, OWASP, SOC 2, WinRM..."
                className="min-h-11 w-full rounded-xl border border-white/15 bg-background px-4 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="min-h-11 shrink-0 rounded-xl border border-white/15 px-3 text-sm text-muted hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted" aria-live="polite">
            Showing {filtered.length} of {articles.length} articles
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter articles by topic hub">
          <button
            type="button"
            onClick={() => setSelectedHub("all")}
            aria-pressed={selectedHub === "all"}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              selectedHub === "all"
                ? "border-accent bg-primary text-white"
                : "border-white/15 bg-background text-muted hover:text-foreground"
            }`}
          >
            All topics ({articles.length})
          </button>
          {hubs.map((hub) => {
            const count = articles.filter((a) => a.hubId === hub.id).length;
            const active = selectedHub === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => setSelectedHub(hub.id)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-accent bg-primary text-white"
                    : "border-white/15 bg-background text-muted hover:text-foreground"
                }`}
              >
                {hub.title} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {visibleHubs.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-surface p-8 text-center">
          <p className="text-muted">No articles match &ldquo;{query}&rdquo; in this topic.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedHub("all");
              setQuery("");
            }}
            className="mt-4 inline-flex items-center rounded-full border border-white/15 px-5 py-2 text-sm text-accent hover:border-accent"
          >
            Show all {articles.length} articles
          </button>
        </div>
      ) : (
        visibleHubs.map((hub) => {
          const hubArticles = filtered.filter((a) => a.hubId === hub.id);
          return (
            <section
              key={hub.id}
              id={`hub-${hub.id}`}
              aria-labelledby={`hub-${hub.id}-title`}
              className="scroll-mt-24 border-t border-white/[0.06] pt-10 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                    {hubArticles.length} {hubArticles.length === 1 ? "article" : "articles"}
                  </p>
                  <h2 id={`hub-${hub.id}-title`} className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {hub.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{hub.description}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {hub.links.map((link) => (
                    <Link key={link.href} href={link.href} className="inline-flex items-center gap-1 text-accent hover:underline">
                      {link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
              <ul className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {hubArticles.map((article) => (
                  <li
                    key={article.slug}
                    className="rounded-2xl border border-white/[0.08] bg-surface p-6 transition-colors hover:border-accent/40"
                  >
                    <article className="flex h-full flex-col">
                      <p className="font-mono text-[12px] text-muted-2">
                        <time dateTime={article.published}>{formatDate(article.published)}</time> · {article.readingMinutes} min read
                      </p>
                      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">
                        <Link href={`/blog/${article.slug}`} className="transition-colors hover:text-accent">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{article.description}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

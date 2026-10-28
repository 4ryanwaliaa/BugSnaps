"use client";

import { useId, useState } from "react";
import Link from "@/components/site/content-link";
import { Section } from "@/components/site/page-parts";
import type { SecurityGuideCategory } from "@/lib/security-guides";

type GuideCard = {
  slug: string;
  title: string;
  description: string;
  category: SecurityGuideCategory;
  updated: string;
};

const categoryId = (category: string) => category.toLowerCase().replaceAll(" ", "-");

export function GuideDirectory({ guides, categories }: { guides: GuideCard[]; categories: SecurityGuideCategory[] }) {
  const [query, setQuery] = useState("");
  const fieldId = useId();
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = (guide: GuideCard) => {
    const text = `${guide.title} ${guide.description} ${guide.category}`.toLowerCase();
    return words.every((word) => text.includes(word));
  };
  const visible = guides.filter(matches);

  return (
    <>
      <Section labelledBy="find-guide-title" className="!pb-0">
        <div className="max-w-2xl">
          <h2 id="find-guide-title" className="text-xl font-semibold">Find a guide</h2>
          <label htmlFor={fieldId} className="mt-3 block text-sm text-muted">Search by topic or control, such as firewall, API or phishing.</label>
          <div className="mt-3 flex flex-wrap gap-3">
            <input id={fieldId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search security guides" className="min-h-12 w-full rounded-xl border border-white/20 bg-background px-4 text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-accent sm:max-w-md" />
            {query && <button type="button" onClick={() => setQuery("")} className="min-h-12 rounded-xl border border-white/20 px-4 text-sm hover:bg-white/5">Clear search</button>}
          </div>
          <p className="mt-3 text-sm text-muted" aria-live="polite">{query.trim() ? `${visible.length} ${visible.length === 1 ? "guide matches" : "guides match"} your search.` : `${guides.length} guides across ${categories.length} topics.`}</p>
          {query.trim() && visible.length === 0 && <p className="mt-2 text-sm text-muted">Try a broader term, or clear the search to browse every topic.</p>}
        </div>
      </Section>
      {categories.map((category) => {
        const categoryGuides = visible.filter((guide) => guide.category === category);
        if (!categoryGuides.length) return null;
        return (
          <Section key={category} id={categoryId(category)} labelledBy={`${categoryId(category)}-title`}>
            <h2 id={`${categoryId(category)}-title`} className="text-2xl font-semibold tracking-tight">{category}</h2>
            <ul className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categoryGuides.map((guide) => (
                <li key={guide.slug} className="rounded-2xl border border-white/[0.08] bg-surface/30 p-6">
                  <article>
                    <p className="font-mono text-[11px] text-muted-2">Updated <time dateTime={guide.updated}>{new Date(`${guide.updated}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time></p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug"><Link href={`/guides/${guide.slug}`} className="hover:text-accent">{guide.title}</Link></h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{guide.description}</p>
                  </article>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </>
  );
}

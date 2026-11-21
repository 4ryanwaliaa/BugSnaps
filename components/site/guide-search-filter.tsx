"use client";

import { useEffect, useId, useState } from "react";
import { Section } from "@/components/site/page-parts";

export function GuideSearchFilter({
  totalGuides,
  totalCategories,
}: {
  totalGuides: number;
  totalCategories: number;
}) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(totalGuides);
  const fieldId = useId();

  useEffect(() => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const sections = document.querySelectorAll<HTMLElement>(".guide-category-section");
    let matchedTotal = 0;

    sections.forEach((section) => {
      const categoryHeading = section.querySelector("h2")?.textContent?.toLowerCase() ?? "";
      const cards = section.querySelectorAll<HTMLElement>("[data-guide-card]");
      let sectionMatches = 0;

      cards.forEach((card) => {
        if (words.length === 0) {
          card.hidden = false;
          sectionMatches++;
          return;
        }
        const hay = `${categoryHeading} ${card.textContent ?? ""}`.toLowerCase();
        const isMatch = words.every((w) => hay.includes(w));
        card.hidden = !isMatch;
        if (isMatch) sectionMatches++;
      });

      section.hidden = words.length > 0 && sectionMatches === 0;
      matchedTotal += sectionMatches;
    });

    setVisibleCount(words.length === 0 ? totalGuides : matchedTotal);
  }, [query, totalGuides]);

  const trimmed = query.trim();

  return (
    <Section labelledBy="find-guide-title" className="!pb-0">
      <div className="max-w-2xl">
        <h2 id="find-guide-title" className="text-xl font-semibold">Find a guide</h2>
        <label htmlFor={fieldId} className="mt-3 block text-sm text-muted">
          Search by topic or control, such as firewall, API or phishing.
        </label>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            id={fieldId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search security guides"
            className="min-h-12 w-full rounded-xl border border-white/20 bg-background px-4 text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-accent sm:max-w-md"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="min-h-12 rounded-xl border border-white/20 px-4 text-sm hover:bg-white/5"
            >
              Clear search
            </button>
          )}
        </div>
        <p className="mt-3 text-sm text-muted" aria-live="polite">
          {trimmed
            ? `${visibleCount} ${visibleCount === 1 ? "guide matches" : "guides match"} your search.`
            : `${totalGuides} guides across ${totalCategories} topics.`}
        </p>
        {trimmed && visibleCount === 0 && (
          <p className="mt-2 text-sm text-muted">
            Try a broader term, or clear the search to browse every topic.
          </p>
        )}
      </div>
    </Section>
  );
}

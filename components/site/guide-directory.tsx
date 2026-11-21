import Link from "@/components/site/content-link";
import { Section } from "@/components/site/page-parts";
import { GuideSearchFilter } from "@/components/site/guide-search-filter";
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
  return (
    <>
      <GuideSearchFilter totalGuides={guides.length} totalCategories={categories.length} />
      {categories.map((category) => {
        const categoryGuides = guides.filter((guide) => guide.category === category);
        if (!categoryGuides.length) return null;
        return (
          <Section
            key={category}
            id={categoryId(category)}
            labelledBy={`${categoryId(category)}-title`}
            className="guide-category-section"
          >
            <h2 id={`${categoryId(category)}-title`} className="text-2xl font-semibold tracking-tight">{category}</h2>
            <ul className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categoryGuides.map((guide) => (
                <li key={guide.slug} data-guide-card className="rounded-2xl border border-white/[0.08] bg-surface/30 p-6">
                  <article>
                    <p className="font-mono text-[11px] text-muted-2">
                      Updated{" "}
                      <time dateTime={guide.updated}>
                        {new Date(`${guide.updated}T00:00:00Z`).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </time>
                    </p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">
                      <Link href={`/guides/${guide.slug}`} className="hover:text-accent">{guide.title}</Link>
                    </h3>
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

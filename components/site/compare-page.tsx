import Link from "next/link";
import { CtaBand, PageHeader, Prose, Section, SiteShell } from "@/components/site/page-parts";
import { COLUMNS, ROWS, comparePages, type ComparePage } from "@/lib/compare";

export function CompareTable({ columns }: { columns: ComparePage["columns"] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
        <caption className="sr-only">Comparison of {columns.map((c) => COLUMNS[c].name).join(" and ")}</caption>
        <thead>
          <tr className="border-b border-white/[0.08] bg-surface">
            <th scope="col" className="w-[22%] px-4 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">
              Dimension
            </th>
            {columns.map((id) => (
              <th key={id} scope="col" className="px-4 py-4 align-bottom">
                <span className="block text-[15px] font-semibold">{COLUMNS[id].name}</span>
                <span className="block font-mono text-[11px] font-normal text-muted-2">{COLUMNS[id].note}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.dimension} className="border-b border-white/[0.06] last:border-0">
              <th scope="row" className="px-4 py-3.5 align-top text-[13.5px] font-medium">
                {row.dimension}
              </th>
              {columns.map((id) => (
                <td key={id} className="px-4 py-3.5 align-top leading-relaxed text-muted">
                  {row.values[id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComparePageView({ page }: { page: ComparePage }) {
  const others = comparePages.filter((p) => p.slug !== page.slug);
  return (
    <SiteShell>
      <PageHeader
        crumbs={[
          { name: "Compare", path: "/compare" },
          { name: page.metaTitle, path: page.path },
        ]}
        eyebrow="Compare"
        title={page.h1}
        lead={page.lead}
      />

      <Section labelledBy="table-title">
        <h2 id="table-title" className="mb-6 text-2xl font-semibold tracking-tight">
          Side by side
        </h2>
        <CompareTable columns={page.columns} />
        <p className="mt-3 text-[12.5px] text-muted-2">
          Columns describing categories reflect typical tools and engagements; individual products differ. MyPentest and
          BugSnaps columns describe what we actually ship.
        </p>
      </Section>

      <Section labelledBy="detail-title" className="border-t border-white/[0.05]">
        <h2 id="detail-title" className="sr-only">
          In detail
        </h2>
        <Prose>
          {page.sections.map((section) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          ))}
          <h2>The short version</h2>
          <ul>
            {page.verdict.map((v) => (
              <li key={v.title}>
                <strong>{v.title}</strong> {v.body}
              </li>
            ))}
          </ul>
        </Prose>

        <div className="mt-12 max-w-3xl border-t border-white/[0.06] pt-8">
          <h2 className="text-sm font-semibold">More comparisons</h2>
          <ul className="mt-3 space-y-2">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={p.path} className="text-sm text-accent hover:underline">
                  {p.metaTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}

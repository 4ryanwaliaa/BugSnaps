import { Section, SectionTitle } from "@/components/site/page-parts";
import { DISCLOSURES, type Severity } from "@/lib/research";

const SEVERITY_TONE: Record<Severity, string> = {
  Critical: "border-red-500/30 bg-red-500/10 text-red-300",
  High: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  Medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  Low: "border-white/10 bg-white/[0.04] text-muted",
};

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function HomeResearch() {
  if (DISCLOSURES.length === 0) return null;

  const entries = [...DISCLOSURES].sort((a, b) => b.published.localeCompare(a.published));

  return (
    <Section labelledBy="research-title" className="border-t border-white/[0.05]">
      <SectionTitle
        id="research-title"
        eyebrow="Security research"
        title="Zero-day vulnerabilities disclosed by BugSnaps."
      />
      <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.id} className="bg-background">
            <a
              href={entry.advisory}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full flex-col p-6 transition-colors hover:bg-white/[0.02] sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-accent">{entry.id}</span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEVERITY_TONE[entry.severity]}`}
                >
                  {entry.severity}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{entry.kind}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">
                {entry.product} · {entry.vendor}
              </p>
              <p className="mt-auto pt-4 text-xs text-muted">Published {formatMonth(entry.published)}</p>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

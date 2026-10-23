import { ArrowUpRight, Star } from "lucide-react";
import { SITE_URL } from "@/lib/site";

// Google's documented deep link works without third-party scripts or cookies
// on our pages. The reader confirms their selection on Google.
const preferredSourceUrl = `https://www.google.com/preferences/source?q=${encodeURIComponent(new URL(SITE_URL).hostname)}`;

export function PreferredSource({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mt-5" : "mt-6"}>
      <a
        href={preferredSourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Star className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <span>Add BugSnaps as a preferred source on Google</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      {!compact && (
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
          Want more of our security guides? Select BugSnaps and confirm your choice on Google.
        </p>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium tracking-wide text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

const severityStyles: Record<string, string> = {
  Critical: "bg-critical/10 text-critical border-critical/25",
  High: "bg-high/10 text-high border-high/25",
  Medium: "bg-medium/10 text-medium border-medium/25",
  Low: "bg-low/10 text-low border-low/25",
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium",
        severityStyles[severity] ?? "border-white/10 bg-white/5 text-muted",
      )}
    >
      {severity}
    </span>
  );
}

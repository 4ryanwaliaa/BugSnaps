import { cn } from "@/lib/utils";

/**
 * BugSnaps mark: a target dot caught between two brackets —
 * a bug, snapped. No locks, no shields.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-7 w-7", className)}
    >
      <rect width="32" height="32" rx="9" fill="#2563EB" />
      <path
        d="M12.5 9.5H10a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 10 22.5h2.5"
        stroke="#FAFAFA"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19.5 9.5H22a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-2.5"
        stroke="#FAFAFA"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.75" fill="#FAFAFA" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        BugSnaps
      </span>
    </span>
  );
}

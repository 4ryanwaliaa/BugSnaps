import { cn } from "@/lib/utils";

const stroke = "M6 22C65 10 174 11 292 18";

/** The pen tip and ink follow exactly the same curve and timing. */
export function SketchUnderline({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 300 36" className={cn("ink-drawing text-coral", className)} fill="none">
      <path className="ink-stroke" pathLength="1" d={stroke} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <g className="ink-pen">
        <animateMotion path={stroke} begin="0.5s" dur="2.6s" calcMode="paced" fill="freeze" />
        <g transform="rotate(32)">
          <path d="M0 0L-4-9V-30Q0-35 4-30V-9Z" fill="#151821" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M-4-25H4M-4-10H4M0-22V-12" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0 0L-2-5H2Z" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}

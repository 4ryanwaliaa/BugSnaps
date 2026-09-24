"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * "How a scan runs", told as you scroll: the steps move past on the left while
 * a sticky console on the right switches to the matching phase. On small
 * screens each step carries its own console instead of a sticky one.
 */

export type ConsoleTone = "cmd" | "muted" | "ok" | "critical" | "high" | "medium";

export interface StoryStep {
  phase: string;
  title: string;
  body: string;
  lines: { tone: ConsoleTone; text: string }[];
}

const TONE: Record<ConsoleTone, string> = {
  cmd: "text-accent",
  muted: "text-muted",
  ok: "text-success",
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
};

const MARK: Record<ConsoleTone, string> = {
  cmd: "──",
  muted: "›",
  ok: "✓",
  critical: "!",
  high: "!",
  medium: "!",
};

function Console({ step, index, total, label }: { step: StoryStep; index: number; total: number; label: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b0e] shadow-[0_30px_90px_-40px_rgba(37,99,235,0.45)]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
        <span className="ml-2 font-mono text-[11px] text-muted-2">
          phase {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {step.phase.toLowerCase()}
        </span>
      </div>
      <div className="relative min-h-[272px] px-5 py-5 font-mono text-[12.5px] leading-[1.9]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step.phase}
            initial={reduce ? false : "hidden"}
            animate="shown"
            exit={reduce ? undefined : { opacity: 0, y: -8, transition: { duration: 0.18 } }}
            variants={{ shown: { transition: { staggerChildren: 0.11 } } }}
          >
            {step.lines.map((line, i) => (
              <motion.p
                key={`${step.phase}-${i}`}
                className={cn("truncate", TONE[line.tone])}
                variants={{
                  hidden: { opacity: 0, x: -10, filter: "blur(4px)" },
                  shown: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.35 } },
                }}
              >
                <span className="text-muted-2">{MARK[line.tone]} </span>
                {["critical", "high", "medium"].includes(line.tone) && (
                  <span className="uppercase">[{line.tone}] </span>
                )}
                {line.text}
                {i === step.lines.length - 1 && <span className="caret text-accent/80" />}
              </motion.p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex gap-1 border-t border-white/[0.06] px-4 py-3" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.span
              className="block h-full origin-left rounded-full bg-accent"
              initial={false}
              animate={{ scaleX: i <= index ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: [0.65, 0, 0.35, 1] }}
            />
          </span>
        ))}
      </div>
      <p className="border-t border-white/[0.06] px-4 py-2.5 font-mono text-[10.5px] text-muted-2">{label}</p>
    </div>
  );
}

function StepBlock({
  step,
  index,
  onActive,
  active,
  children,
}: {
  step: StoryStep;
  index: number;
  onActive: (i: number) => void;
  active: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li ref={ref} className="flex flex-col justify-center py-10 lg:min-h-[62vh] lg:py-0">
      <p
        className={cn(
          "font-mono text-[12px] uppercase tracking-[0.18em] transition-colors duration-500",
          active ? "text-accent" : "text-muted-2",
        )}
      >
        {String(index + 1).padStart(2, "0")} · {step.phase}
      </p>
      <h3
        className={cn(
          "mt-3 text-2xl font-semibold tracking-tight transition-colors duration-500 sm:text-3xl",
          active ? "text-foreground" : "text-foreground/45",
        )}
      >
        {step.title}
      </h3>
      <p
        className={cn(
          "mt-3 max-w-md text-[16px] leading-relaxed transition-colors duration-500",
          active ? "text-muted" : "text-muted/50",
        )}
      >
        {step.body}
      </p>
      <div className="mt-6 lg:hidden">{children}</div>
    </li>
  );
}

export function ScanStory({ steps, label }: { steps: StoryStep[]; label: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <ol className="min-w-0">
        {steps.map((step, i) => (
          <StepBlock key={step.phase} step={step} index={i} active={i === active} onActive={setActive}>
            <Console step={step} index={i} total={steps.length} label={label} />
          </StepBlock>
        ))}
      </ol>
      <div className="hidden min-w-0 lg:block">
        <div className="sticky top-[calc(50vh-190px)]">
          <Console step={steps[active]} index={active} total={steps.length} label={label} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Mobile-only hero accent — the brand tagline, big and confident, with each
 * word illuminating in sequence over one quiet breathing glow. Deliberately
 * minimal: the headline is the hero; this is a calm, premium punctuation.
 * Rendered only below `lg`; desktop never mounts it.
 */

const WORDS = ["Find.", "Fix.", "Fortify."];

export function HeroTaglineMobile() {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center gap-2.5 py-4">
      {/* one quiet glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-28 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl"
        animate={reduce ? undefined : { opacity: [0.5, 0.85, 0.5], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {WORDS.map((word, i) => (
        <motion.span
          key={word}
          className="text-[1.6rem] font-semibold tracking-tight"
          initial={false}
          animate={
            reduce
              ? { color: "#fafafa" }
              : { color: ["#71717a", "#3b82f6", "#71717a"] }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: 3,
                  times: [0, 0.28, 1],
                  repeat: Infinity,
                  delay: i * 0.45,
                  ease: "easeInOut",
                }
          }
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

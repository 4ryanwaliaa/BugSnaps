"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";
import { HeroTaglineMobile } from "@/components/sections/hero-tagline-mobile";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const heroFindings = [
  { id: "BSNP-001", title: "SQL injection · order search", severity: "Critical" },
  { id: "BSNP-003", title: "Session fixation · OAuth callback", severity: "High" },
  { id: "BSNP-005", title: "Missing rate limit · password reset", severity: "Medium" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Light mouse parallax — normalized cursor position, spring-smoothed.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const panelX = useTransform(sx, [-1, 1], [-8, 8]);
  const panelY = useTransform(sy, [-1, 1], [-6, 6]);
  const graphX = useTransform(sx, [-1, 1], [6, -6]);
  const graphY = useTransform(sy, [-1, 1], [4, -4]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  return (
    <div ref={containerRef} onMouseMove={onMouseMove} className="relative overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="dot-grid absolute inset-0" />
        <div className="animate-glow-drift absolute -top-40 left-1/2 h-[540px] w-[840px] -translate-x-1/2 rounded-full bg-primary/[0.13] blur-[140px]" />
        <div className="absolute top-1/3 right-[-10%] h-[380px] w-[380px] rounded-full bg-accent/[0.07] blur-[120px]" />
      </div>

      <section className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 pt-28 pb-14 sm:gap-16 sm:pt-44 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8">
        {/* ——— Copy ——— */}
        <div>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="text-[2.7rem] font-semibold leading-[1.06] tracking-tight text-balance sm:text-6xl sm:leading-[1] lg:text-[4.25rem]"
          >
            Find vulnerabilities before attackers do.
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty"
          >
            BugSnaps helps growing businesses identify and eliminate security
            vulnerabilities through professional penetration testing and
            actionable remediation.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3 max-lg:flex-col max-lg:items-stretch"
          >
            <Button href="#contact" size="lg" className="max-lg:w-full">
              Book free consultation
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#services" size="lg" variant="secondary" className="max-lg:w-full">
              View services
            </Button>
          </motion.div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 font-mono text-[12px] tracking-wide text-muted-2"
          >
            OWASP WSTG · PTES · Retesting included in every engagement
          </motion.p>
        </div>

        {/* ——— Mobile-only tagline accent ——— */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.36, ease: EASE }}
          className="-mt-2 lg:hidden"
        >
          <HeroTaglineMobile />
        </motion.div>

        {/* ——— Visualization (desktop) ——— */}
        <div className="relative hidden min-h-[480px] lg:block" aria-hidden="true">
          {/* Attack-surface graph, behind the panel */}
          <motion.div
            style={reduceMotion ? undefined : { x: graphX, y: graphY }}
            className="absolute inset-0"
          >
            <AttackSurfaceGraph />
          </motion.div>

          {/* Engagement panel */}
          <motion.div
            style={reduceMotion ? undefined : { x: panelX, y: panelY }}
            initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            className="glass absolute top-1/2 left-1/2 w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 shadow-[0_24px_80px_-24px_rgb(0_0_0/0.8)]"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-2 font-mono text-[11px] tracking-wide text-muted-2">
                bugsnaps · sample engagement
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-2">
                  Findings verified
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">14 / 14</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-success/25 bg-success/10 px-2 py-1 font-mono text-[11px] font-medium text-success">
                <CheckCircle2 className="h-3 w-3" />
                Retest passed
              </span>
            </div>

            {/* Severity distribution */}
            <div className="mt-4 flex h-1.5 gap-1 overflow-hidden rounded-full">
              <div className="w-[14%] rounded-full bg-critical/80" />
              <div className="w-[28%] rounded-full bg-high/80" />
              <div className="w-[36%] rounded-full bg-medium/70" />
              <div className="w-[22%] rounded-full bg-low/70" />
            </div>

            <ul className="mt-5 space-y-2.5">
              {heroFindings.map((finding, index) => (
                <motion.li
                  key={finding.id}
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.15, ease: EASE }}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground/90">
                      {finding.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-2">{finding.id}</p>
                  </div>
                  <SeverityBadge severity={finding.severity} />
                </motion.li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <span className="font-mono text-[11px] text-muted-2">Report · v2.1 · 24 pages</span>
              <span className="font-mono text-[11px] text-accent">View report →</span>
            </div>
          </motion.div>

          {/* Floating chip */}
          <motion.div
            style={reduceMotion ? undefined : { x: panelX, y: panelY }}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2, ease: EASE }}
            className="absolute top-[6%] right-0 z-10 rounded-xl border border-white/10 bg-[#15151a] px-5 py-3.5 shadow-[0_16px_48px_-16px_rgb(0_0_0/0.9)]"
          >
            <p className="font-mono text-[11px] font-medium tracking-wide whitespace-nowrap text-muted">
              Critical open
            </p>
            <p className="mt-1 text-2xl font-semibold leading-none text-success">0</p>
          </motion.div>

          <motion.div
            style={reduceMotion ? undefined : { x: graphX, y: graphY }}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.35, ease: EASE }}
            className="absolute bottom-[6%] left-0 z-10 rounded-xl border border-white/10 bg-[#15151a] px-5 py-3.5 shadow-[0_16px_48px_-16px_rgb(0_0_0/0.9)]"
          >
            <p className="font-mono text-[11px] font-medium tracking-wide whitespace-nowrap text-muted">
              Time to first finding
            </p>
            <p className="mt-1 text-2xl font-semibold leading-none">31h</p>
          </motion.div>
        </div>
      </section>

      {/* ——— Honest-start strip ——— */}
      <div className="relative border-t border-white/[0.06]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto w-full max-w-6xl px-6 py-8 text-center sm:py-12 lg:px-8"
        >
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted sm:text-2xl">
            We&apos;re a new company — and we won&apos;t pretend otherwise.{" "}
            <span className="text-foreground">
              No inflated numbers, no fake logos. Everyone starts somewhere.
            </span>{" "}
            Let our start be securing you.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* Abstract network of nodes and edges — the "attack surface". */
function AttackSurfaceGraph() {
  const nodes = [
    { cx: 60, cy: 80, r: 3 },
    { cx: 180, cy: 40, r: 4 },
    { cx: 320, cy: 70, r: 3 },
    { cx: 430, cy: 130, r: 4 },
    { cx: 40, cy: 240, r: 4 },
    { cx: 150, cy: 320, r: 3 },
    { cx: 330, cy: 380, r: 4 },
    { cx: 440, cy: 330, r: 3 },
    { cx: 250, cy: 440, r: 3 },
    { cx: 80, cy: 420, r: 3 },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 4],
    [4, 5],
    [5, 8],
    [8, 6],
    [6, 7],
    [3, 7],
    [5, 9],
    [1, 5],
    [2, 6],
  ];

  return (
    <svg viewBox="0 0 480 480" className="h-full w-full opacity-70">
      <g stroke="rgb(59 130 246 / 0.18)" strokeWidth="1">
        {edges.map(([a, b], index) => (
          <line
            key={index}
            x1={nodes[a].cx}
            y1={nodes[a].cy}
            x2={nodes[b].cx}
            y2={nodes[b].cy}
          />
        ))}
      </g>
      <g stroke="rgb(59 130 246 / 0.55)" strokeWidth="1.5" strokeLinecap="round">
        {edges
          .filter((_, index) => index % 3 === 0)
          .map(([a, b], index) => (
            <line
              key={index}
              className="edge-flow"
              style={{ animationDelay: `${index * 1.4}s` }}
              x1={nodes[a].cx}
              y1={nodes[a].cy}
              x2={nodes[b].cx}
              y2={nodes[b].cy}
            />
          ))}
      </g>
      {nodes.map((node, index) => (
        <circle
          key={index}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="rgb(59 130 246 / 0.8)"
          style={{
            animation: `node-pulse ${3 + (index % 3)}s ease-in-out infinite`,
            animationDelay: `${index * 0.4}s`,
          }}
        />
      ))}
    </svg>
  );
}

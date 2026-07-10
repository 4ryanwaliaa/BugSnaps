"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Radar, TriangleAlert, ScanSearch, Lock, ShieldCheck } from "lucide-react";

/**
 * Mobile-only hero visualization. Tells the BugSnaps story as a looping,
 * GPU-composited animation: an attacker probes the system, an AI scan
 * activates, threats are detected, the attack is blocked, the system is
 * verified secure. Transforms/opacity only — no layout thrash.
 *
 * Rendered exclusively below the `lg` breakpoint; desktop keeps its own
 * visualization and never mounts this component.
 */

type Tone = "blue" | "red" | "green";

const TONE: Record<Tone, string> = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
};

const PHASES = [
  { key: "monitor", label: "Monitoring traffic", tone: "blue" as Tone, icon: Radar,
    lines: ["listening on :443", "traffic nominal"] },
  { key: "attack", label: "Intrusion attempt", tone: "red" as Tone, icon: TriangleAlert,
    lines: ["inbound · 203.0.113.9", "payload: ' OR 1=1 --"] },
  { key: "scan", label: "AI scan running", tone: "blue" as Tone, icon: ScanSearch,
    lines: ["scanning endpoints…", "42 routes analysed"] },
  { key: "detect", label: "3 threats detected", tone: "red" as Tone, icon: TriangleAlert,
    lines: ["SQLi · /orders", "XSS · /notes", "auth bypass · /api"] },
  { key: "block", label: "Neutralizing threats", tone: "blue" as Tone, icon: Lock,
    lines: ["blocking source", "patching · verifying"] },
  { key: "secure", label: "System secure", tone: "green" as Tone, icon: ShieldCheck,
    lines: ["0 threats open", "all findings verified"] },
];

const DURATIONS = [1800, 2100, 2300, 2500, 2100, 2900];

/* SVG scene geometry (viewBox 0 0 300 300) */
const CENTER = 150;
const RADIUS = 104;
const NODES = Array.from({ length: 6 }, (_, i) => {
  const a = ((-90 + i * 60) * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(a), y: CENTER + RADIUS * Math.sin(a) };
});
const ATTACK_FROM = NODES[0];
const THREAT_IDX = [1, 3, 5];

export function HeroStoryMobile() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setPhase(5);
      return;
    }
    const t = setTimeout(() => setPhase((p) => (p + 1) % PHASES.length), DURATIONS[phase]);
    return () => clearTimeout(t);
  }, [phase, reduceMotion]);

  const current = PHASES[phase];
  const tone = TONE[current.tone];

  const isAttack = phase === 1;
  const isScan = phase === 2;
  const isDetect = phase === 3;
  const isBlock = phase === 4;
  const isSecure = phase === 5;
  const showThreats = isDetect || isBlock;
  const showShield = isBlock || isSecure;

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      {/* ambient glow that tints with the current phase */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[40px] blur-3xl"
        animate={{ backgroundColor: `${tone}1f` }}
        transition={{ duration: 0.8 }}
      />

      <div className="glass relative overflow-hidden rounded-[28px] p-4 shadow-[0_28px_80px_-30px_rgba(0,0,0,0.85)]">
        {/* premium gradient sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/[0.05] to-transparent"
        />

        {/* header: live status + story progress */}
        <div className="relative flex items-center justify-between gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5"
              style={{ borderColor: `${tone}59`, backgroundColor: `${tone}14` }}
            >
              <current.icon className="h-3.5 w-3.5" style={{ color: tone }} strokeWidth={2} />
              <span className="text-[12px] font-medium" style={{ color: tone }}>
                {current.label}
              </span>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => {
              const done = i <= phase - 1;
              return (
                <motion.span
                  key={i}
                  className="h-1.5 rounded-full"
                  animate={{
                    width: done ? 14 : 6,
                    backgroundColor: done ? (isSecure ? TONE.green : tone) : "rgba(255,255,255,0.14)",
                  }}
                  transition={{ duration: 0.35 }}
                />
              );
            })}
          </div>
        </div>

        {/* scene */}
        <div className="relative mt-3">
          <svg viewBox="0 0 300 300" className="h-auto w-full">
            <defs>
              <radialGradient id="scanBeam" cx="0%" cy="50%" r="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={tone} stopOpacity="0.4" />
                <stop offset="100%" stopColor={tone} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* connection lines */}
            <g>
              {NODES.map((n, i) => (
                <motion.line
                  key={i}
                  x1={CENTER}
                  y1={CENTER}
                  x2={n.x}
                  y2={n.y}
                  stroke={tone}
                  strokeWidth="1"
                  animate={{ opacity: isScan ? 0.5 : 0.18 }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </g>

            {/* flowing scan pulses along the lines */}
            {isScan &&
              !reduceMotion &&
              NODES.map((n, i) => (
                <motion.circle
                  key={`flow-${i}`}
                  r="2.5"
                  fill="#60a5fa"
                  initial={{ cx: CENTER, cy: CENTER, opacity: 0 }}
                  animate={{ cx: n.x, cy: n.y, opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.16, ease: "easeOut" }}
                />
              ))}

            {/* radar scan sweep */}
            {isScan && !reduceMotion && (
              <motion.g
                style={{ transformOrigin: "150px 150px" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
              >
                <polygon points="150,150 150,34 214,52" fill="url(#scanBeam)" />
              </motion.g>
            )}

            {/* expanding radar rings during scan */}
            {isScan &&
              !reduceMotion &&
              [0, 1].map((i) => (
                <motion.circle
                  key={`ring-${i}`}
                  cx={CENTER}
                  cy={CENTER}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1"
                  initial={{ r: 24, opacity: 0.5 }}
                  animate={{ r: 120, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.9, ease: "easeOut" }}
                />
              ))}

            {/* attacker projectile travelling toward the core */}
            {isAttack && !reduceMotion && (
              <>
                <motion.line
                  x1={ATTACK_FROM.x}
                  y1={ATTACK_FROM.y}
                  x2={CENTER}
                  y2={CENTER}
                  stroke={TONE.red}
                  strokeWidth="1.5"
                  strokeDasharray="4 5"
                  animate={{ opacity: [0.2, 0.7, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.circle
                  r="5"
                  fill={TONE.red}
                  initial={{ cx: ATTACK_FROM.x, cy: ATTACK_FROM.y, opacity: 0 }}
                  animate={{
                    cx: [ATTACK_FROM.x, CENTER],
                    cy: [ATTACK_FROM.y, CENTER],
                    opacity: [0, 1, 1, 0.4],
                  }}
                  transition={{ duration: 1.05, repeat: Infinity, ease: "easeIn" }}
                />
              </>
            )}

            {/* outer nodes */}
            {NODES.map((n, i) => {
              const threat = showThreats && THREAT_IDX.includes(i);
              const nodeColor = isSecure ? TONE.green : threat ? TONE.red : tone;
              return (
                <g key={`node-${i}`}>
                  {threat && !reduceMotion && (
                    <motion.circle
                      cx={n.x}
                      cy={n.y}
                      fill="none"
                      stroke={isBlock ? TONE.blue : TONE.red}
                      strokeWidth="1.5"
                      initial={{ r: 5, opacity: 0.8 }}
                      animate={{ r: 13, opacity: 0 }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    animate={{ r: threat ? 4.5 : 3, fill: nodeColor }}
                    transition={{ duration: 0.4 }}
                  />
                </g>
              );
            })}

            {/* protective shield ring */}
            {showShield && (
              <>
                <motion.circle
                  cx={CENTER}
                  cy={CENTER}
                  r="60"
                  fill="none"
                  stroke={isSecure ? TONE.green : TONE.blue}
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  transition={{ duration: 0.6, ease: "backOut" }}
                  style={{ transformOrigin: "150px 150px" }}
                />
                {isBlock && !reduceMotion && (
                  <motion.circle
                    cx={CENTER}
                    cy={CENTER}
                    fill="none"
                    stroke={TONE.blue}
                    strokeWidth="1.5"
                    initial={{ r: 60, opacity: 0.6 }}
                    animate={{ r: 100, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </>
            )}

            {/* core system node */}
            <circle cx={CENTER} cy={CENTER} r="34" fill="url(#coreGlow)" />
            <motion.rect
              x="126"
              y="126"
              width="48"
              height="48"
              rx="14"
              fill="#111113"
              animate={{ stroke: tone }}
              strokeWidth="2"
              transition={{ duration: 0.4 }}
            />
            {/* bracket + dot brand motif inside the core */}
            <path
              d="M141 138 h-3 a5 5 0 0 0-5 5 v14 a5 5 0 0 0 5 5 h3"
              fill="none"
              stroke="#fafafa"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M159 138 h3 a5 5 0 0 1 5 5 v14 a5 5 0 0 1-5 5 h-3"
              fill="none"
              stroke="#fafafa"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <AnimatePresence mode="wait">
              {isSecure ? (
                <motion.path
                  key="check"
                  d="M143 150 l5 5 l9-10"
                  fill="none"
                  stroke={TONE.green}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              ) : (
                <motion.circle
                  key="dot"
                  cx={CENTER}
                  cy={CENTER}
                  r="4"
                  animate={{ fill: tone, scale: reduceMotion ? 1 : [1, 1.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ transformOrigin: "150px 150px" }}
                />
              )}
            </AnimatePresence>
          </svg>
        </div>

        {/* terminal strip */}
        <div className="relative mt-2 rounded-2xl border border-white/[0.06] bg-black/40 p-3">
          <div className="flex items-center gap-1.5 pb-2">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="ml-1.5 font-mono text-[10px] tracking-wide text-muted-2">
              bugsnaps · live
            </span>
          </div>
          <div className="min-h-[52px] font-mono text-[11px] leading-relaxed">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-1"
              >
                {current.lines.map((line, i) => (
                  <motion.div
                    key={line}
                    initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.14, duration: 0.3 }}
                    className="flex items-center gap-1.5"
                  >
                    <span style={{ color: tone }}>›</span>
                    <span className="text-muted">{line}</span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

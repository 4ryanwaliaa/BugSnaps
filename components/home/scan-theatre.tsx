"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Severity } from "@/lib/mypentest/types";
import type { TheatreData } from "@/lib/mypentest/theatre";
import { cn } from "@/lib/utils";

/*
 * The homepage's scan replay: the example report's attack surface, drawn the
 * way MyPentest works through it - ownership verified, surface mapped under a
 * radar sweep, probes sent down each branch, findings lighting up by
 * severity, then the report. It replays a real scan of our own test app and
 * says so on its face.
 *
 * Performance: one canvas, one rAF loop, no React state per frame (the HUD's
 * counters and phase bar are written straight to the DOM). The loop stops
 * when the panel is off screen or the tab is hidden, and reduced-motion
 * visitors get the finished frame.
 */

const PHASES = ["Verify", "Map", "Test", "Report"] as const;

// Timeline, in milliseconds.
const T_VERIFY = 0;
const T_MAP = 1600;
const T_TEST = 6000;
const T_REPORT = 11600;
const T_FADE = 15400;
const T_END = 16200;
const PHASE_STARTS = [T_VERIFY, T_MAP, T_TEST, T_REPORT, T_FADE];
const TRAVEL = 620;

const SEV_COLOR: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
  info: "#71717a",
};
const LOUD: Severity[] = ["critical", "high", "medium"];

interface LaidNode {
  path: string;
  severity: Severity | null;
  angle: number;
  radius: number; // as a fraction of R
  hub: { angle: number; radius: number } | null;
  appearAt: number;
  testAt: number;
  labelled: boolean;
}

interface LogLine {
  at: number;
  text: string;
  tone: "muted" | "ok" | Severity;
}

function ease(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/** Deterministic shuffle, so the replay is the same on every visit. */
function scramble<T>(items: T[]): T[] {
  const out = [...items];
  let seed = 7;
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function layout(data: TheatreData): { center: Severity | null; nodes: LaidNode[] } {
  const root = data.nodes.find((n) => n.path === "/");
  const leaves = data.nodes.filter((n) => n.path !== "/");
  const branches = [...new Set(leaves.map((n) => n.branch))];
  const total = leaves.length || 1;

  const nodes: LaidNode[] = [];
  let cursor = -Math.PI / 2;
  for (const branch of branches) {
    const members = leaves.filter((n) => n.branch === branch);
    const span = (members.length / total) * Math.PI * 2;
    const mid = cursor + span / 2;
    const hub = members.length > 1 ? { angle: mid, radius: 0.46 } : null;
    members.forEach((node, i) => {
      const angle = cursor + (span * (i + 0.5)) / members.length;
      const radius = members.length > 1 ? (i % 2 ? 0.8 : 0.95) : 0.72;
      const sweep = (angle + Math.PI / 2) / (Math.PI * 2);
      nodes.push({
        path: node.path,
        severity: node.severity,
        angle,
        radius,
        hub,
        appearAt: T_MAP + sweep * (T_TEST - T_MAP - 400),
        testAt: 0,
        labelled: node.severity === "critical" || node.severity === "high",
      });
    });
    cursor += span;
  }

  const order = scramble(nodes);
  const testSpan = T_REPORT - T_TEST - TRAVEL - 300;
  order.forEach((node, i) => {
    node.testAt = T_TEST + (testSpan * i) / Math.max(1, order.length - 1);
  });
  return { center: root?.severity ?? null, nodes };
}

function script(data: TheatreData, nodes: LaidNode[], identities: number): LogLine[] {
  const lines: LogLine[] = [
    { at: 250, text: `target ${data.asset}`, tone: "muted" },
    { at: 900, text: "DNS TXT record found · ownership verified", tone: "ok" },
    { at: T_MAP + 150, text: "mapping pages, forms, scripts and APIs…", tone: "muted" },
  ];
  const discovered = [...nodes].sort((a, b) => a.appearAt - b.appearAt);
  const picks = [0.2, 0.5, 0.8].map((f) => discovered[Math.floor(f * (discovered.length - 1))]).filter(Boolean);
  for (const node of picks) lines.push({ at: node.appearAt, text: `found ${node.path}`, tone: "muted" });
  lines.push({ at: T_TEST + 100, text: `signed in as ${identities} test accounts`, tone: "ok" });

  const flashed = [...nodes].sort((a, b) => a.testAt - b.testAt);
  const used = new Set<string>();
  for (const headline of data.headlines) {
    if (used.size >= 4) break;
    const node = flashed.find((n) => n.path === headline.path);
    if (!node || used.has(headline.title)) continue;
    used.add(headline.title);
    lines.push({ at: node.testAt + TRAVEL, text: headline.title, tone: headline.severity });
  }
  lines.push({
    at: T_REPORT + 300,
    text: `report · ${data.findings} findings · ${data.urgent} critical or high`,
    tone: "ok",
  });
  return lines.sort((a, b) => a.at - b.at);
}

export function ScanTheatre({ data, identities, className }: { data: TheatreData; identities: number; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chipRefs = useRef<(HTMLLIElement | null)[]>([]);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const { center, nodes } = useMemo(() => layout(data), [data]);
  const lines = useMemo(() => script(data, nodes, identities), [data, nodes, identities]);
  const [shown, setShown] = useState(lines.length);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mono = getComputedStyle(canvas).fontFamily || "monospace";
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const box = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (!running) draw(elapsed);
    });
    observer.observe(wrap);

    // Pointer parallax: the outer ring drifts further than the centre.
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = wrap.getBoundingClientRect();
      tx = ((event.clientX - box.left) / box.width - 0.5) * 2;
      ty = ((event.clientY - box.top) / box.height - 0.5) * 2;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    wrap.addEventListener("pointermove", onPointer, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);

    let lastShown = -1;
    let lastPhase = -1;

    const hud = (t: number) => {
      const phase = PHASE_STARTS.findIndex((start, i) => t >= start && t < (PHASE_STARTS[i + 1] ?? Infinity));
      const active = Math.min(3, Math.max(0, phase));
      if (active !== lastPhase) {
        lastPhase = active;
        chipRefs.current.forEach((chip, i) => chip?.setAttribute("data-state", i < active ? "done" : i === active ? "active" : "idle"));
      }
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const start = PHASE_STARTS[i];
        const end = PHASE_STARTS[i + 1];
        const p = t >= end ? 1 : t <= start ? 0 : (t - start) / (end - start);
        bar.style.transform = `scaleX(${p})`;
      });
      const mapped = nodes.filter((n) => t >= n.appearAt).length + (t >= T_MAP ? 1 : 0);
      const requests = Math.round(data.requests * ease((t - T_TEST) / (T_REPORT - T_TEST)));
      const flashed = nodes.filter((n) => t >= n.testAt + TRAVEL).length;
      const findings = t >= T_REPORT ? data.findings : Math.round((data.findings * flashed) / Math.max(1, nodes.length));
      const values = [mapped, requests, findings];
      statRefs.current.forEach((el, i) => {
        if (el) el.textContent = values[i].toLocaleString("en-IN");
      });
      const count = lines.filter((line) => line.at <= t).length;
      if (count !== lastShown) {
        lastShown = count;
        setShown(count);
      }
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.42;
      const at = (angle: number, radius: number) => {
        const depth = radius * 12;
        return {
          x: cx + Math.cos(angle) * radius * R + px * depth,
          y: cy + Math.sin(angle) * radius * R + py * depth,
        };
      };

      const fadeIn = Math.min(1, t / 450);
      const fadeOut = t > T_FADE ? 1 - (t - T_FADE) / (T_END - T_FADE) : 1;
      ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));

      // Scope rings and crosshair.
      ctx.lineWidth = 1;
      for (const f of [0.33, 0.66, 1]) {
        ctx.strokeStyle = `rgba(255,255,255,${f === 1 ? 0.07 : 0.045})`;
        ctx.beginPath();
        ctx.arc(cx + px * f * 6, cy + py * f * 6, R * f * 1.02, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.08, cy);
      ctx.lineTo(cx + R * 1.08, cy);
      ctx.moveTo(cx, cy - R * 1.08);
      ctx.lineTo(cx, cy + R * 1.08);
      ctx.stroke();

      // Radar sweep: bright while mapping, a slow ghost afterwards.
      const mapping = t >= T_MAP && t < T_TEST;
      const sweepAngle = mapping
        ? -Math.PI / 2 + ((t - T_MAP) / (T_TEST - T_MAP - 400)) * Math.PI * 2
        : -Math.PI / 2 + (t / 5200) * Math.PI * 2;
      const strength = mapping ? 1 : t < T_MAP ? 0 : 0.28;
      if (strength > 0) {
        const slices = 16;
        const trail = 0.7;
        for (let i = 0; i < slices; i++) {
          const a0 = sweepAngle - (trail * (i + 1)) / slices;
          const a1 = sweepAngle - (trail * i) / slices;
          ctx.fillStyle = `rgba(59,130,246,${0.16 * strength * (1 - i / slices)})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R * 1.02, a0, a1);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(147,197,253,${0.75 * strength})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * R * 1.02, cy + Math.sin(sweepAngle) * R * 1.02);
        ctx.stroke();
      }

      const reporting = t >= T_REPORT;

      // Edges, grown as each node is discovered.
      for (const node of nodes) {
        if (t < node.appearAt) continue;
        const grow = ease((t - node.appearAt) / 420);
        const tested = t >= node.testAt + TRAVEL;
        const p = at(node.angle, node.radius);
        const from = node.hub ? at(node.hub.angle, node.hub.radius) : { x: cx, y: cy };
        const loud = node.severity && LOUD.includes(node.severity);
        const alpha = reporting && !node.labelled ? 0.1 : tested && loud ? 0.38 : 0.16;
        ctx.strokeStyle = tested && node.severity ? hexA(SEV_COLOR[node.severity], alpha) : `rgba(148,163,184,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (node.hub) {
          const hub = from;
          const g1 = Math.min(1, grow * 2);
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + (hub.x - cx) * g1, cy + (hub.y - cy) * g1);
          if (grow > 0.5) {
            const g2 = (grow - 0.5) * 2;
            ctx.moveTo(hub.x, hub.y);
            ctx.lineTo(hub.x + (p.x - hub.x) * g2, hub.y + (p.y - hub.y) * g2);
          }
        } else {
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + (p.x - cx) * grow, cy + (p.y - cy) * grow);
        }
        ctx.stroke();
      }

      // Branch hubs.
      const hubsDrawn = new Set<number>();
      for (const node of nodes) {
        if (!node.hub || t < node.appearAt || hubsDrawn.has(node.hub.angle)) continue;
        hubsDrawn.add(node.hub.angle);
        const h = at(node.hub.angle, node.hub.radius);
        ctx.fillStyle = reporting ? "rgba(148,163,184,0.35)" : "rgba(148,163,184,0.7)";
        ctx.fillRect(h.x - 2, h.y - 2, 4, 4);
      }

      // Probe packets: three per node, the first one is the one that lands.
      if (t >= T_TEST && t < T_REPORT + TRAVEL) {
        for (const node of nodes) {
          for (let k = 0; k < 3; k++) {
            const start = node.testAt + k * 1300;
            if (t < start || t > start + TRAVEL || start > T_REPORT) continue;
            const q = ease((t - start) / TRAVEL);
            const p = at(node.angle, node.radius);
            let x: number;
            let y: number;
            if (node.hub) {
              const h = at(node.hub.angle, node.hub.radius);
              if (q < 0.5) {
                x = cx + (h.x - cx) * q * 2;
                y = cy + (h.y - cy) * q * 2;
              } else {
                x = h.x + (p.x - h.x) * (q - 0.5) * 2;
                y = h.y + (p.y - h.y) * (q - 0.5) * 2;
              }
            } else {
              x = cx + (p.x - cx) * q;
              y = cy + (p.y - cy) * q;
            }
            ctx.fillStyle = k === 0 ? "rgba(191,219,254,0.95)" : "rgba(147,197,253,0.45)";
            ctx.beginPath();
            ctx.arc(x, y, k === 0 ? 2 : 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Nodes, their flash rings, and report labels.
      ctx.font = `10px ${mono}`;
      ctx.textBaseline = "middle";
      for (const node of nodes) {
        if (t < node.appearAt) continue;
        const pop = ease((t - node.appearAt) / 300);
        const p = at(node.angle, node.radius);
        const hit = node.testAt + TRAVEL;
        const tested = t >= hit;
        const color = tested && node.severity ? SEV_COLOR[node.severity] : "#94a3b8";
        const dim = reporting && !node.labelled ? 0.35 : 1;
        const loud = node.severity && LOUD.includes(node.severity);

        if (tested && loud) {
          ctx.fillStyle = hexA(color, 0.16 * dim);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
          ctx.fill();
          const ring = (t - hit) / 900;
          if (ring < 1) {
            ctx.strokeStyle = hexA(color, (1 - ring) * 0.8);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 + ring * 26, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.fillStyle = hexA(color, dim);
        ctx.beginPath();
        ctx.arc(p.x, p.y, (tested && loud ? 3.8 : 2.8) * pop, 0, Math.PI * 2);
        ctx.fill();

        if (reporting && node.labelled) {
          const show = ease((t - T_REPORT - 200) / 500);
          const right = Math.cos(node.angle) >= 0;
          const lx = p.x + (right ? 12 : -12);
          ctx.globalAlpha = Math.max(0, Math.min(fadeOut, show));
          ctx.fillStyle = "rgba(9,9,11,0.8)";
          const text = node.path.length > 20 ? `${node.path.slice(0, 19)}…` : node.path;
          const w = ctx.measureText(text).width + 10;
          ctx.fillRect(right ? lx - 3 : lx - w + 3, p.y - 8, w, 16);
          ctx.fillStyle = color;
          ctx.textAlign = right ? "left" : "right";
          ctx.fillText(text, lx + (right ? 2 : -2), p.y + 0.5);
          ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));
        }
      }

      // The target at the centre.
      const beat = (Math.sin(t / 260) + 1) / 2;
      const verified = t >= 900;
      const centreColor = reporting && center ? SEV_COLOR[center] : verified ? "#3b82f6" : "#94a3b8";
      ctx.strokeStyle = hexA(centreColor, 0.25 + beat * 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 13 + beat * 3, 0, Math.PI * 2);
      ctx.stroke();
      if (t < T_MAP) {
        const lock = ease(t / 900);
        ctx.strokeStyle = `rgba(147,197,253,${0.8 * (1 - lock) + 0.2})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 60 - lock * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = centreColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    };

    let elapsed = reduce ? T_REPORT + 1400 : 0;
    let running = false;
    let visible = true;
    let onScreen = true;
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min(50, now - last) : 16;
      last = now;
      elapsed += dt;
      if (elapsed >= T_END) elapsed = 0;
      draw(elapsed);
      hud(elapsed);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const should = !reduce && visible && onScreen;
      if (should && !running) {
        running = true;
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(wrap);
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    draw(elapsed);
    hud(elapsed);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      wrap.removeEventListener("pointermove", onPointer);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [center, data, lines, nodes]);

  const visibleLines = lines.slice(0, shown).slice(-5);

  return (
    <figure
      className={cn(
        "relative min-w-0 overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0b0b0e]/80 shadow-[0_40px_120px_-40px_rgba(37,99,235,0.35),0_28px_90px_-30px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="truncate font-mono text-[11px] tracking-wide text-muted">mypentest · {data.asset}</span>
        <span className="ml-auto shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-2">
          Replay
        </span>
      </div>

      <ol className="grid grid-cols-4 gap-1.5 px-4 pt-3" aria-label="Scan phases">
        {PHASES.map((phase, i) => (
          <li
            key={phase}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            data-state="done"
            className="group relative overflow-hidden rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-2 transition-colors duration-300 data-[state=active]:border-accent/40 data-[state=active]:text-foreground data-[state=done]:text-muted"
          >
            {phase}
            <span
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent"
              style={{ transform: "scaleX(1)" }}
            />
          </li>
        ))}
      </ol>

      <div ref={wrapRef} className="relative aspect-[1.15] w-full sm:aspect-[1.3]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 font-mono"
          role="img"
          aria-label={`Replay of an example MyPentest scan of ${data.asset}: ${data.nodes.length} paths mapped, ${data.findings} findings, ${data.urgent} critical or high.`}
        />
      </div>

      <dl className="grid grid-cols-3 border-y border-white/[0.06] font-mono">
        {[
          { label: "Paths mapped", value: data.nodes.length },
          { label: "Requests", value: data.requests },
          { label: "Findings", value: data.findings },
        ].map((stat, i) => (
          <div key={stat.label} className={cn("px-4 py-2.5", i > 0 && "border-l border-white/[0.06]")}>
            <dt className="text-[9.5px] uppercase tracking-[0.14em] text-muted-2">{stat.label}</dt>
            <dd className="mt-0.5 text-[15px] font-medium tabular-nums text-foreground">
              <span
                ref={(el) => {
                  statRefs.current[i] = el;
                }}
              >
                {stat.value.toLocaleString("en-IN")}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="h-[118px] overflow-hidden px-4 py-3 font-mono text-[11px] leading-[1.75]" aria-hidden="true">
        {visibleLines.map((line, i) => (
          <p
            key={`${line.at}-${line.text}`}
            className={cn(
              "truncate transition-opacity duration-500",
              i === visibleLines.length - 1 ? "opacity-100" : "opacity-60",
              TONE[line.tone],
            )}
          >
            <span className="text-muted-2">{line.tone === "muted" || line.tone === "ok" ? "›" : "!"} </span>
            {line.tone !== "muted" && line.tone !== "ok" && <span className="uppercase">[{line.tone}] </span>}
            {line.text}
            {i === visibleLines.length - 1 && <span className="caret text-accent" />}
          </p>
        ))}
      </div>

      <figcaption className="border-t border-white/[0.06] px-4 py-2.5 font-mono text-[10.5px] text-muted-2">
        Replay of a real MyPentest scan of our deliberately vulnerable test app.
      </figcaption>
    </figure>
  );
}

const TONE: Record<LogLine["tone"], string> = {
  muted: "text-muted",
  ok: "text-success",
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
  info: "text-muted",
};

function hexA(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, alpha))})`;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eraser, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number };
type InkPoint = Point & { w: number };
/** `user` ink is drawn by the visitor in draw mode; it stays `pinned` until they finish. */
type Stroke = { points: InkPoint[]; born: number; marker: boolean; user?: boolean; pinned?: boolean };
type PenControl = { setDrawing: (on: boolean) => void; clear: () => void };
type Mark = "underline" | "double" | "circle" | "marker";
type Move =
  | { kind: "air"; to: Point; duration: number }
  | { kind: "ink"; path: Point[]; duration: number; marker: boolean; weight: number };
type Phrase = { text: string; rects: DOMRect[]; level: "heading" | "title" | "body"; el: Element };

/*
 * The ideas the homepage wants a reader to notice. The pen only marks these,
 * so every stroke points at something that matters instead of a random word.
 */
const KEY_PHRASES = [
  "penetration", "evidence and suggested fixes", "suggested fixes", "retest after remediation", "start free",
  "free scan", "ownership checked first", "non-destructive", "no credit card", "fix list", "four phases",
  "ownership is proved", "nothing on it is changed", "prove you own it", "tied to your account",
  "attack surface", "within your scope only", "like an attacker", "stop at any time", "harmless probes",
  "evidence and fixes", "not break it", "never ones that change things", "never shared",
  "hand straight to engineering", "CVSS 3.1", "the exact fix", "prove it's yours", "clarity",
  "what needs attention", "what a scan covers", "act on", "56 checks", "the specific fix",
  "business logic", "non-destructive by design", "clear next step", "free plan",
];
const PHRASE_PATTERN = new RegExp(
  `\\b(${[...KEY_PHRASES].sort((a, b) => b.length - a.length)
    .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]")).join("|")})\\b`,
  "gi",
);
const TEXT = ".home-reading-pen :is(h1, h2, h3, p, li)";
const SKIP = "a, button, label, summary, input, [role='button'], [contenteditable], [aria-hidden='true'], .font-mono, code, pre, [data-pen-skip]";
const CONTROLS = "a, button, input, textarea, select, summary, iframe, video, [role='button'], [contenteditable], :focus";
const INK_LIFE = 12000, INK_FADE = 2200;
// How long a visitor's drawing stays after they press Done, before it fades.
const USER_INK_LINGER = 6000;
// Where the nib sits relative to the cursor, so the pen body never covers the word being read.
const FOLLOW_OFFSET = { x: 16, y: 34 };

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function pathLength(path: Point[]) {
  const lengths = [0];
  for (let i = 1; i < path.length; i++) lengths.push(lengths[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
  return lengths;
}

function pointAlong(path: Point[], lengths: number[], distance: number): Point {
  let i = 1;
  while (i < lengths.length - 1 && lengths[i] < distance) i++;
  const span = lengths[i] - lengths[i - 1] || 1;
  const t = clamp((distance - lengths[i - 1]) / span, 0, 1);
  return { x: path[i - 1].x + (path[i].x - path[i - 1].x) * t, y: path[i - 1].y + (path[i].y - path[i - 1].y) * t };
}

/** Hand-drawn gestures for one line of text, in document coordinates. */
function gesture(mark: Mark, r: { left: number; right: number; top: number; bottom: number }, jitter: () => number): Point[][] {
  const width = r.right - r.left, height = r.bottom - r.top;
  const line = (y: number, from: number, to: number, sag: number) => {
    const points: Point[] = [];
    const steps = Math.max(8, Math.round(Math.abs(to - from) / 6));
    const wobble = jitter() * 6;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({ x: from + (to - from) * t, y: y + Math.sin(t * Math.PI) * sag + Math.sin(t * Math.PI * 2 + wobble) * 0.9 + t * jitter() * 2 });
    }
    return points;
  };
  if (mark === "circle") {
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const rx = width / 2 + 9, ry = height / 2 + 5;
    const start = Math.PI * (1.1 + jitter() * 0.1), turn = Math.PI * 2.12;
    const points: Point[] = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48, a = start + turn * t;
      const grow = 1 + t * 0.06;
      points.push({ x: cx + Math.cos(a) * rx * grow, y: cy + Math.sin(a) * ry * grow - t * 2 });
    }
    return [points];
  }
  if (mark === "marker") {
    const y = r.top + height * 0.58;
    return [line(y, r.left - 2, r.right + 3, -1.2)];
  }
  const under = r.bottom + Math.max(2, height * 0.06);
  const first = line(under, r.left - 3, r.right + 4, 1.6 + jitter());
  if (mark === "underline") return [first];
  return [first, line(under + 6, r.left + width * 0.12, r.right - 2, 1.2)];
}

/** One continuous pen that marks the homepage's key phrases; ink lives in document coordinates. */
export function ReadingPen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<PenControl | null>(null);
  const [drawing, setDrawing] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0, width = 0, height = 0, previous = 0;
    let lastScroll = -2000, nextMark = performance.now() + 1400;
    let lastSafetyCheck = 0, lastHoverCheck = 0, lastPointer = -1e9;
    let controlsDirty = true;
    let controls: DOMRect[] = [];
    let pointer: Point | null = null;
    let hoverKey = "";
    let lastMark: Mark | null = null;
    let lastElement: Element | null = null;
    const recent: string[] = [];
    let pen: Point = { x: innerWidth - 80 + scrollX, y: innerHeight * 0.35 + scrollY };
    let tilt = 0.5, lift = 1, velocityX = 0;
    let queue: Move[] = [];
    let move: Move | null = null;
    let moveFrom: Point = pen, moveProgress = 0, moveLengths: number[] = [];
    let strokes: Stroke[] = [];
    let active: Stroke | null = null;
    let interactive = false, overControl = false;
    let drawMode = false, userStroke: Stroke | null = null, lastUserTime = 0;

    controlRef.current = {
      setDrawing: (on) => {
        if (on === drawMode) return;
        drawMode = on; queue = []; move = null; active = null; userStroke = null;
        if (!on) {
          const now = performance.now();
          for (const s of strokes) if (s.pinned) { s.pinned = false; s.born = now - INK_LIFE + USER_INK_LINGER; }
          nextMark = now + 2500;
        }
      },
      clear: () => { strokes = strokes.filter(s => !s.user); userStroke = null; },
    };

    const addUserPoint = (event: PointerEvent) => {
      if (!userStroke) return;
      const pts = userStroke.points, last = pts[pts.length - 1];
      const p = { x: event.clientX + scrollX, y: event.clientY + scrollY };
      const distance = last ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
      if (last && distance < 0.8) return;
      const speed = distance / Math.max(event.timeStamp - lastUserTime, 1);
      lastUserTime = event.timeStamp;
      // A stylus reports real pressure; for a mouse, slower movement lays down more ink.
      const base = event.pointerType === "pen" && event.pressure > 0
        ? 1 + event.pressure * 3.2
        : 2.6 * clamp(1.25 - speed * 0.45, 0.45, 1.15);
      const w = last ? last.w * 0.6 + base * Math.min(1, (pts.length + 1) / 6) * 0.4 : base * 0.5;
      pts.push({ ...p, w });
    };
    const userDown = (event: PointerEvent) => {
      if (!drawMode || event.button !== 0) return;
      event.preventDefault();
      try { canvas.setPointerCapture(event.pointerId); } catch { /* the stroke still works without capture */ }
      pointer = { x: event.clientX, y: event.clientY }; lastPointer = performance.now();
      userStroke = { points: [], born: performance.now(), marker: false, user: true, pinned: true };
      strokes.push(userStroke);
      lastUserTime = event.timeStamp;
      addUserPoint(event);
    };
    const userMove = (event: PointerEvent) => {
      if (!drawMode) return;
      pointer = { x: event.clientX, y: event.clientY }; lastPointer = performance.now();
      if (userStroke) for (const e of event.getCoalescedEvents?.() ?? [event]) addUserPoint(e);
    };
    const userUp = () => {
      // Taper the tail as the nib lifts off.
      const pts = userStroke?.points ?? [];
      for (let i = 1; i <= Math.min(5, pts.length - 1); i++) pts[pts.length - i].w *= 0.35 + (i - 1) * 0.13;
      userStroke = null;
    };

    const resize = () => {
      if (reduced.matches || !finePointer.matches) {
        width = 0; height = 0;
        canvas.width = 0; canvas.height = 0;
        queue = []; move = null; active = null;
        return;
      }
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      controlsDirty = true;
      queue = []; move = null; active = null;
    };
    const scroll = () => { lastScroll = performance.now(); controlsDirty = true; };
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !finePointer.matches) return;
      pointer = { x: event.clientX, y: event.clientY }; lastPointer = performance.now();
    };
    const pointerLeave = (event: MouseEvent) => { if (!event.relatedTarget) pointer = null; };

    const skipped = (node: Node) => !!node.parentElement?.closest(SKIP);
    /** Key phrases inside one element, each with its line boxes in viewport coordinates. */
    const phrasesIn = (el: Element): Phrase[] => {
      const found: Phrase[] = [];
      const level = /^H[12]$/.test(el.tagName) ? "heading" : el.tagName === "H3" ? "title" : "body";
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (skipped(node)) continue;
        for (const match of (node.textContent || "").matchAll(PHRASE_PATTERN)) {
          const range = document.createRange();
          range.setStart(node, match.index!); range.setEnd(node, match.index! + match[0].length);
          const rects = Array.from(range.getClientRects()).filter(r => r.width > 3 && r.height > 3);
          if (rects.length) found.push({ text: match[0].toLowerCase(), rects, level, el });
        }
      }
      return found;
    };
    const clearOfControls = (r: DOMRect) =>
      !controls.some(c => r.right + 24 > c.left && r.left - 12 < c.right && r.bottom + 14 > c.top && r.top - 48 < c.bottom);
    const onScreen = (r: DOMRect) => r.top > 96 && r.bottom < height - 56 && r.left > 12 && r.right < width - (width < 640 ? 14 : 40);

    const choosePhrase = (): Phrase | null => {
      const candidates: { phrase: Phrase; weight: number }[] = [];
      document.querySelectorAll(TEXT).forEach(el => {
        const box = el.getBoundingClientRect();
        if (box.bottom < 96 || box.top > height - 56 || !el.checkVisibility()) return;
        for (const phrase of phrasesIn(el)) {
          if (recent.includes(phrase.text) || !phrase.rects.every(r => onScreen(r) && clearOfControls(r))) continue;
          const mid = (phrase.rects[0].top + phrase.rects[0].bottom) / 2;
          // Favour what the reader is probably looking at: the middle of the screen, and headings.
          const weight = (phrase.level === "heading" ? 2.2 : phrase.level === "title" ? 1.5 : 1) / (1 + Math.abs(mid - height * 0.45) / 220)
            // Move on to a different line of thought rather than marking the same sentence twice.
            * (phrase.el === lastElement ? 0.08 : 1);
          candidates.push({ phrase, weight });
        }
      });
      if (!candidates.length) {
        if (recent.length) recent.shift();
        return null;
      }
      let pick = Math.random() * candidates.reduce((sum, c) => sum + c.weight, 0);
      for (const c of candidates) if ((pick -= c.weight) <= 0) return c.phrase;
      return candidates[candidates.length - 1].phrase;
    };

    const plan = (phrase: Phrase) => {
      recent.push(phrase.text); lastElement = phrase.el;
      if (recent.length > 10) recent.shift();
      const multiLine = phrase.rects.length > 1;
      const options: Mark[] = multiLine ? ["marker"]
        : phrase.level === "heading" ? ["underline", "double", "underline"]
        : phrase.level === "title" ? ["underline", "circle"]
        : phrase.text.length <= 16 ? ["circle", "marker", "underline"] : ["marker", "underline"];
      const choices = options.filter(m => m !== lastMark);
      const mark = (choices.length ? choices : options)[Math.floor(Math.random() * (choices.length || options.length))];
      lastMark = mark;
      const jitter = () => Math.random() - 0.5;
      const marker = mark === "marker";
      queue = [];
      for (const rect of phrase.rects) {
        const r = { left: rect.left + scrollX, right: rect.right + scrollX, top: rect.top + scrollY, bottom: rect.bottom + scrollY };
        for (const path of gesture(mark, r, jitter)) {
          const length = pathLength(path).pop()!;
          queue.push({ kind: "air", to: path[0], duration: 0 });
          queue.push({
            kind: "ink", path, marker,
            weight: marker ? clamp(rect.height * 0.62, 9, 26) : phrase.level === "heading" ? 2.6 : 2,
            duration: clamp(length * (marker ? 4.2 : mark === "circle" ? 5.2 : 3.6), 260, 1500),
          });
        }
      }
    };

    const startMove = (now: number) => {
      move = queue.shift() ?? null;
      if (!move) return;
      moveFrom = { ...pen }; moveProgress = 0;
      if (move.kind === "air") {
        const distance = Math.hypot(move.to.x - pen.x, move.to.y - pen.y);
        move.duration = clamp(220 + distance * 0.55, 160, 900);
      } else {
        moveLengths = pathLength(move.path);
        active = { points: [], born: now, marker: move.marker };
        strokes.push(active);
      }
    };

    /** Advance the current move; returns the lift (0 on the paper, 1 in the air) it wants. */
    const advance = (dt: number) => {
      if (!move) return 0.35;
      if (move.kind === "air") {
        moveProgress = Math.min(1, moveProgress + dt / move.duration);
        const t = ease(moveProgress);
        const distance = Math.hypot(move.to.x - moveFrom.x, move.to.y - moveFrom.y);
        pen = {
          x: moveFrom.x + (move.to.x - moveFrom.x) * t,
          y: moveFrom.y + (move.to.y - moveFrom.y) * t - Math.sin(t * Math.PI) * Math.min(34, distance * 0.18),
        };
        if (moveProgress === 1) move = null;
        return moveProgress > 0.85 ? 0.4 : 1;
      }
      // A hand speeds up mid-stroke and hesitates very slightly near the end.
      const pace = 0.75 + Math.sin(moveProgress * Math.PI) * 0.55 - (moveProgress > 0.82 && moveProgress < 0.88 ? 0.35 : 0);
      moveProgress = Math.min(1, moveProgress + (dt / move.duration) * pace);
      const total = moveLengths[moveLengths.length - 1];
      const before = pen;
      pen = pointAlong(move.path, moveLengths, ease(moveProgress) * total);
      const speed = Math.hypot(pen.x - before.x, pen.y - before.y) / Math.max(dt, 1);
      // Faster strokes lay down thinner ink; the ends taper as the nib touches down and lifts.
      const taper = Math.min(1, moveProgress * 7, (1 - moveProgress) * 5 + 0.15);
      const w = move.marker ? move.weight : move.weight * clamp(1.25 - speed * 0.55, 0.5, 1.2) * (0.35 + 0.65 * taper);
      const last = active?.points[active.points.length - 1];
      if (active && (!last || Math.hypot(last.x - pen.x, last.y - pen.y) > 0.7)) active.points.push({ x: pen.x, y: pen.y, w });
      if (moveProgress === 1) { move = null; active = null; }
      return 0;
    };

    const hoveredPhrase = (): Phrase | null => {
      if (!pointer) return null;
      const el = document.elementFromPoint(pointer.x, pointer.y)?.closest(TEXT);
      if (!el) return null;
      return phrasesIn(el).find(p => p.rects.some(r =>
        pointer!.x > r.left - 4 && pointer!.x < r.right + 4 && pointer!.y > r.top - 4 && pointer!.y < r.bottom + 4)) ?? null;
    };

    const drawInk = (now: number, user: boolean) => {
      for (const stroke of strokes) {
        if (!!stroke.user !== user) continue;
        const pts = stroke.points;
        if (pts.length < 2) continue;
        const fade = stroke.pinned ? 1 : clamp((INK_LIFE + INK_FADE - (now - stroke.born)) / INK_FADE, 0, 1);
        if (stroke.marker) {
          ctx.beginPath();
          pts.forEach((p, i) => i ? ctx.lineTo(p.x - scrollX, p.y - scrollY) : ctx.moveTo(p.x - scrollX, p.y - scrollY));
          ctx.strokeStyle = `rgba(248,78,91,${0.2 * fade})`;
          ctx.lineWidth = pts[0].w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
          continue;
        }
        // A filled outline gives each stroke its own changing width without darker overlaps at the joins.
        const left: Point[] = [], right: Point[] = [];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
          const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          const nx = -(b.y - a.y) / length, ny = (b.x - a.x) / length, half = pts[i].w / 2;
          left.push({ x: pts[i].x + nx * half - scrollX, y: pts[i].y + ny * half - scrollY });
          right.push({ x: pts[i].x - nx * half - scrollX, y: pts[i].y - ny * half - scrollY });
        }
        ctx.beginPath();
        left.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
        ctx.closePath();
        ctx.fillStyle = `rgba(248,78,91,${0.9 * fade})`;
        ctx.fill();
      }
    };

    const drawPen = (now: number) => {
      const x = pen.x - scrollX, y = pen.y - scrollY - lift * 5;
      if (x < -60 || x > width + 60 || y < -60 || y > height + 60) return;
      ctx.save(); ctx.translate(x, y); ctx.rotate(tilt + Math.sin(now / 420) * 0.03 * lift); ctx.scale(1 + lift * 0.05, 1 + lift * 0.05);
      // While trailing the cursor, the pen fades right back over a button or field so it never hides one.
      ctx.globalAlpha = drawMode || !interactive || move ? 1 : overControl ? 0.2 : 0.85;
      ctx.shadowColor = "#000a"; ctx.shadowBlur = 4 + lift * 9; ctx.shadowOffsetX = 1 + lift * 3; ctx.shadowOffsetY = 2 + lift * 7;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-4, -10); ctx.lineTo(-4, -39); ctx.quadraticCurveTo(0, -44, 4, -39); ctx.lineTo(4, -10); ctx.closePath();
      ctx.fillStyle = "#3b1820"; ctx.fill(); ctx.strokeStyle = "#f84e5b"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.beginPath(); ctx.moveTo(-4, -12); ctx.lineTo(4, -12); ctx.moveTo(-4, -34); ctx.lineTo(4, -34); ctx.moveTo(1, -31); ctx.lineTo(1, -20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-1.8, -4.5); ctx.lineTo(1.8, -4.5); ctx.closePath(); ctx.fillStyle = "#f84e5b"; ctx.fill();
      ctx.restore();
    };

    const draw = (now: number) => {
      const dt = Math.min(40, now - (previous || now)); previous = now;
      if (controlsDirty && (!lastSafetyCheck || now - lastSafetyCheck > 250)) {
        controls = Array.from(document.querySelectorAll<HTMLElement>(CONTROLS))
          .map(el => el.getBoundingClientRect()).filter(r => r.width && r.height && r.bottom > 0 && r.top < height);
        lastSafetyCheck = now;
        controlsDirty = false;
      }
      interactive = !!pointer && finePointer.matches && now - lastPointer < 2600;
      overControl = interactive && controls.some(c =>
        pointer!.x > c.left - 8 && pointer!.x < c.right + 8 && pointer!.y > c.top - 8 && pointer!.y < c.bottom + 48);
      const scrolling = now - lastScroll < 250;

      // Hovering a key phrase sends the pen straight to it, interrupting whatever it was doing.
      if (!drawMode && interactive && !scrolling && now - lastHoverCheck > 120) {
        lastHoverCheck = now;
        const phrase = hoveredPhrase();
        const key = phrase ? `${phrase.text}@${Math.round(phrase.rects[0].top + scrollY)}` : "";
        if (phrase && key !== hoverKey) {
          hoverKey = key; active = null; move = null;
          if (recent.includes(phrase.text)) recent.splice(recent.indexOf(phrase.text), 1);
          plan(phrase);
        } else if (!phrase && !move && !queue.length) hoverKey = "";
      }

      const before = pen;
      let wantLift: number;
      if (drawMode) {
        // In draw mode the pen is the cursor: its nib sits exactly on the pointer.
        if (pointer) pen = { x: pointer.x + scrollX, y: pointer.y + scrollY };
        wantLift = userStroke ? 0 : 0.6;
      } else if (move || queue.length) {
        if (!move) startMove(now);
        wantLift = advance(dt);
        if (!move && !queue.length) nextMark = now + 3600 + Math.random() * 2400;
      } else if (interactive) {
        // Lifted, the pen trails the cursor without leaving ink.
        const target = { x: pointer!.x + FOLLOW_OFFSET.x + scrollX, y: pointer!.y + FOLLOW_OFFSET.y + scrollY };
        const k = 1 - Math.exp(-dt / 90);
        pen = { x: pen.x + (target.x - pen.x) * k, y: pen.y + (target.y - pen.y) * k };
        wantLift = 1;
        nextMark = Math.max(nextMark, now + 1600);
      } else {
        wantLift = 0.35;
        const viewX = pen.x - scrollX, viewY = pen.y - scrollY;
        if (!scrolling && now - lastScroll > 300 && (viewX < 0 || viewX > width || viewY < 70 || viewY > height)) {
          // The page carried the pen out of view: bring it back to rest in the margin, so it is always on hand.
          queue = [{ kind: "air", to: { x: width - (width < 640 ? 30 : 70) + scrollX, y: height * 0.42 + scrollY }, duration: 0 }];
        } else if (!scrolling && now > nextMark && now - lastScroll > 700) {
          const phrase = choosePhrase();
          if (phrase) plan(phrase);
          else nextMark = now + 1200;
        }
      }

      velocityX += ((pen.x - before.x) / Math.max(dt, 1) - velocityX) * 0.2;
      tilt += (0.5 + clamp(velocityX * 0.18, -0.22, 0.22) - tilt) * Math.min(1, dt / 120);
      lift += (wantLift - lift) * Math.min(1, dt / 90);

      const alive = strokes.filter(s => s.pinned || s === active || s === userStroke || now - s.born < INK_LIFE + INK_FADE);
      strokes = [...alive.filter(s => !s.user).slice(-40), ...alive.filter(s => s.user).slice(-400)];
      ctx.clearRect(0, 0, width, height);
      drawInk(now, false);
      // The pen's own ink stays clear of buttons, links and fields as the document moves underneath them.
      for (const c of controls) ctx.clearRect(c.left - 5, c.top - 5, c.width + 10, c.height + 10);
      // A visitor's drawing goes exactly where they put it.
      drawInk(now, true);
      drawPen(now);
      frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      cancelAnimationFrame(frame); previous = 0;
      if (!reduced.matches && finePointer.matches && !document.hidden) {
        if (!width || !height) resize();
        else ctx.clearRect(0, 0, width, height);
        frame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    resize(); sync();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    document.addEventListener("mouseout", pointerLeave);
    canvas.addEventListener("pointerdown", userDown);
    canvas.addEventListener("pointermove", userMove);
    canvas.addEventListener("pointerup", userUp);
    canvas.addEventListener("pointercancel", userUp);
    reduced.addEventListener("change", sync);
    finePointer.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      controlRef.current = null;
      window.removeEventListener("scroll", scroll); window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointerMove); document.removeEventListener("mouseout", pointerLeave);
      canvas.removeEventListener("pointerdown", userDown); canvas.removeEventListener("pointermove", userMove);
      canvas.removeEventListener("pointerup", userUp); canvas.removeEventListener("pointercancel", userUp);
      reduced.removeEventListener("change", sync);
      finePointer.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    controlRef.current?.setDrawing(drawing);
    if (!drawing) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawing(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawing]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "reading-pen fixed inset-0 z-40 h-full w-full",
          drawing ? "pointer-events-auto cursor-none touch-none" : "pointer-events-none",
        )}
      />
      <div className="reading-pen pen-toolbar fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full border border-white/10 bg-surface/90 p-1 shadow-lg shadow-black/40 backdrop-blur">
        {drawing && (
          <>
            <span role="status" className="px-3 text-xs text-muted">Drag to draw · Esc to finish</span>
            <button
              type="button"
              onClick={() => controlRef.current?.clear()}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </>
        )}
        <button
          type="button"
          aria-pressed={drawing}
          aria-label={drawing ? "Finish drawing" : "Draw on the page"}
          onClick={() => setDrawing((on) => !on)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            drawing ? "bg-primary text-white hover:bg-accent" : "text-coral hover:bg-white/[0.06]",
          )}
        >
          {drawing ? <Check className="h-4 w-4" aria-hidden="true" /> : <PenLine className="h-4 w-4" aria-hidden="true" />}
          {drawing ? "Done" : "Draw"}
        </button>
      </div>
    </>
  );
}

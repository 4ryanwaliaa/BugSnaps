"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };
type Stroke = { points: Point[]; born: number; shading: boolean };

/** One continuous pen; ink lives in document coordinates so it stays on the paper. */
export function ReadingPen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, width = 0, height = 0, lastScroll = -2000, previous = 0;
    let nextWord = 0, progress = 0;
    let shadingStyle = -1, doodleStyle = -1, doodleStarted = 0;
    let duration = 1900, tilt = .5, lastTarget = "";
    const pickDifferent = (previous: number, count: number) => (previous + 1 + Math.floor(Math.random() * (count - 1))) % count;
    let pen: Point = { x: 28, y: 180 };
    let start = pen;
    let target: DOMRect | null = null;
    let phase: "rest" | "travel" | "shade" = "rest";
    let strokes: Stroke[] = [];
    let active: Stroke | null = null;
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      target = null; phase = "rest"; active = null;
    };
    const scroll = () => {
      const now = performance.now();
      if (now - lastScroll > 350) {
        doodleStyle = pickDifferent(doodleStyle, 4); doodleStarted = now; active = null;
      }
      lastScroll = now; target = null; phase = "rest";
    };
    const chooseWord = () => {
      const candidates: DOMRect[] = [];
      document.querySelectorAll(".home-reading-pen h1, .home-reading-pen h2, .home-reading-pen h3, .home-reading-pen p").forEach(el => {
        const box = el.getBoundingClientRect();
        if (box.bottom < 110 || box.top > height - 80 || !el.checkVisibility()) return;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (node.parentElement?.closest("a, button, [aria-hidden='true']")) continue;
          for (const match of (node.textContent || "").matchAll(/[A-Za-z]{5,}/g)) {
            const range = document.createRange();
            range.setStart(node, match.index!); range.setEnd(node, match.index! + match[0].length);
            const rect = range.getBoundingClientRect();
            const key = `${Math.round(rect.left + scrollX)}:${Math.round(rect.top + scrollY)}`;
            if (key !== lastTarget && rect.top > 110 && rect.bottom < height - 60 && rect.left > 12 && rect.right < width - 30 && rect.width > 20) candidates.push(rect);
          }
        }
      });
      return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
    };
    const addInk = (now: number, shading: boolean) => {
      if (!active || active.shading !== shading || active.points.length > 240) {
        active = { points: [], born: now, shading }; strokes.push(active);
      }
      active.points.push({ x: pen.x + scrollX, y: pen.y + scrollY });
    };
    const draw = (now: number) => {
      const dt = Math.min(40, now - (previous || now)); previous = now;
      const scrolling = now - lastScroll < 220;
      if (scrolling) {
        if (now - doodleStarted > 1800) {
          doodleStyle = pickDifferent(doodleStyle, 4); doodleStarted = now; active = null;
        }
        const t = (now - doodleStarted) / 300;
        const spread = Math.min(35, width * .055);
        // Loops, a lazy wave, little dashes, or a meandering line.
        const offsets = [
          { x: Math.sin(t * 2) * spread, y: Math.cos(t * 2) * 24 },
          { x: Math.sin(t) * spread, y: Math.sin(t * 2) * 13 },
          { x: Math.sin(t * 1.4) * spread, y: Math.sin(t * 1.4) * 16 },
          { x: Math.sin(t) * spread + Math.sin(t * 2.7) * 8, y: Math.cos(t * .7) * 31 },
        ][Math.max(0, doodleStyle)];
        const x = 36 + spread + offsets.x;
        const y = height * .52 + offsets.y;
        const ease = 1 - Math.exp(-dt / 130);
        pen = { x: pen.x + (x - pen.x) * ease, y: pen.y + (y - pen.y) * ease };
        if (doodleStyle !== 2 || Math.sin(t * 5) > -.15) addInk(now, false);
        else active = null;
        nextWord = now + 650;
      } else if (phase === "rest" && now > nextWord) {
        active = null; target = chooseWord(); start = { ...pen }; progress = 0;
        shadingStyle = pickDifferent(shadingStyle, 3);
        duration = 1500 + Math.random() * 1100; tilt = .35 + Math.random() * .35;
        if (target) lastTarget = `${Math.round(target.left + scrollX)}:${Math.round(target.top + scrollY)}`;
        phase = target ? "travel" : "rest"; nextWord = now + 2500;
      } else if (phase === "travel" && target) {
        active = null; progress = Math.min(1, progress + dt / 700);
        const t = progress * progress * (3 - 2 * progress);
        const fromRight = shadingStyle === 1;
        const entryX = fromRight ? target.right : target.left;
        const entryY = target.top + target.height * (shadingStyle === 2 ? .77 : .53);
        pen = { x: start.x + (entryX - start.x) * t, y: start.y + (entryY - start.y) * t - Math.sin(t * Math.PI) * 30 };
        if (progress === 1) { phase = "shade"; progress = 0; }
      } else if (phase === "shade" && target) {
        progress = Math.min(1, progress + dt / duration);
        const waves = Math.max(7, Math.round(target.width / 5));
        const oscillation = progress * waves * Math.PI * 2;
        if (shadingStyle === 2) {
          // Three broad passes, with a slight wobble and slant on each return.
          const pass = progress * 3;
          const sweep = (1 - Math.cos(pass * Math.PI)) / 2;
          pen = { x: target.left + target.width * sweep,
            y: target.top + target.height * (.77 - progress * .44) + Math.sin(progress * 65) * 1.1 };
        } else {
          const direction = shadingStyle === 1 ? 1 - progress : progress;
          pen = { x: target.left + target.width * direction + Math.sin(oscillation) * (shadingStyle === 1 ? 4 : 2),
            y: target.top + target.height * .53 + Math.sin(oscillation) * target.height * (shadingStyle === 1 ? .22 : .29) + Math.sin(progress * 51) * 1.4 };
        }
        addInk(now, true);
        if (progress === 1) { phase = "rest"; active = null; nextWord = now + 3200 + Math.random() * 2000; }
      } else { active = null; }
      ctx.clearRect(0, 0, width, height);
      strokes = strokes.filter(s => now - s.born < 14000).slice(-32);
      for (const stroke of strokes) {
        ctx.beginPath();
        stroke.points.forEach((p, i) => i ? ctx.lineTo(p.x - scrollX, p.y - scrollY) : ctx.moveTo(p.x - scrollX, p.y - scrollY));
        ctx.strokeStyle = `rgba(255,173,145,${(stroke.shading ? .24 : .5) * Math.min(1, (14000 - now + stroke.born) / 1800)})`;
        ctx.lineWidth = stroke.shading ? 4 : 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
      }
      // The nib is the local origin, keeping it exactly attached to the newest ink.
      ctx.save(); ctx.translate(pen.x, pen.y); ctx.rotate(tilt + Math.sin(now / 320) * .055);
      ctx.shadowColor = "#0008"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-4, -10); ctx.lineTo(-4, -39); ctx.quadraticCurveTo(0, -44, 4, -39); ctx.lineTo(4, -10); ctx.closePath();
      ctx.fillStyle = "#202530"; ctx.fill(); ctx.strokeStyle = "#ffad91"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.shadowColor = "transparent"; ctx.beginPath(); ctx.moveTo(-4, -12); ctx.lineTo(4, -12); ctx.moveTo(-4, -34); ctx.lineTo(4, -34); ctx.moveTo(1, -31); ctx.lineTo(1, -20); ctx.stroke(); ctx.restore();
      frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      cancelAnimationFrame(frame); previous = 0;
      ctx.clearRect(0, 0, width, height);
      if (!reduced.matches && !document.hidden) frame = requestAnimationFrame(draw);
    };
    resize(); sync();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    reduced.addEventListener("change", sync); document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", resize);
      reduced.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" className="reading-pen pointer-events-none fixed inset-0 z-40 h-full w-full" />;
}

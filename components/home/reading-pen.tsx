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
    let duration = 1900, tilt = .5;
    let approachingMargin = false, lastSafetyCheck = 0;
    let controls: DOMRect[] = [];
    const recentTargets: string[] = [];
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
        doodleStyle = pickDifferent(doodleStyle, 5); doodleStarted = now; active = null;
        approachingMargin = true;
      }
      lastScroll = now; target = null; phase = "rest"; lastSafetyCheck = 0;
    };
    const chooseWord = () => {
      const candidates: DOMRect[] = [];
      document.querySelectorAll(".home-reading-pen h1, .home-reading-pen h2, .home-reading-pen h3, .home-reading-pen p").forEach(el => {
        const box = el.getBoundingClientRect();
        if (box.bottom < 110 || box.top > height - 80 || !el.checkVisibility()) return;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (node.parentElement?.closest("a, button, label, summary, [role='button'], [contenteditable], [aria-hidden='true']")) continue;
          for (const match of (node.textContent || "").matchAll(/[A-Za-z]{5,}/g)) {
            const range = document.createRange();
            range.setStart(node, match.index!); range.setEnd(node, match.index! + match[0].length);
            const rect = range.getBoundingClientRect();
            const key = `${Math.round(rect.left + scrollX)}:${Math.round(rect.top + scrollY)}`;
            const nearControl = controls.some(c => rect.right + 22 > c.left && rect.left - 12 < c.right && rect.bottom + 12 > c.top && rect.top - 50 < c.bottom);
            if (!recentTargets.includes(key) && !nearControl && rect.top > 110 && rect.bottom < height - 60 && rect.left > 12 && rect.right < width - 30 && rect.width > 20) candidates.push(rect);
          }
        }
      });
      return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
    };
    const addInk = (now: number, shading: boolean) => {
      // Include the pen body in the exclusion area, not just the nib.
      if (controls.some(c => pen.x + 24 > c.left && pen.x - 10 < c.right && pen.y + 8 > c.top && pen.y - 48 < c.bottom)) {
        active = null; return;
      }
      if (!active || active.shading !== shading || active.points.length > 240) {
        active = { points: [], born: now, shading }; strokes.push(active);
      }
      active.points.push({ x: pen.x + scrollX, y: pen.y + scrollY });
    };
    const draw = (now: number) => {
      const dt = Math.min(40, now - (previous || now)); previous = now;
      if (!lastSafetyCheck || now - lastSafetyCheck > 250) {
        controls = Array.from(document.querySelectorAll<HTMLElement>("a, button, input, textarea, select, summary, iframe, video, [role='button'], [contenteditable], :focus"))
          .map(el => el.getBoundingClientRect()).filter(r => r.width && r.height && r.bottom > 0 && r.top < height);
        lastSafetyCheck = now;
      }
      const scrolling = now - lastScroll < 220;
      if (scrolling) {
        if (now - doodleStarted > 1800) {
          doodleStyle = pickDifferent(doodleStyle, 5); doodleStarted = now; active = null;
          approachingMargin = true;
        }
        const t = (now - doodleStarted) / 300;
        const spread = Math.min(35, width * .055);
        const arrow = [
          { x: -spread, y: 10 }, { x: spread, y: -12 },
          { x: spread - 13, y: -16 }, { x: spread, y: -12 }, { x: spread - 5, y: 1 },
        ];
        // rAF's frame time can precede the scroll event's performance.now(), so t may dip below 0.
        const arrowProgress = Math.max(0, Math.min(3.999, t / 6 * 4));
        const arrowIndex = Math.floor(arrowProgress);
        const arrowFraction = arrowProgress - arrowIndex;
        // Loops, a lazy wave, little dashes, or a meandering line.
        const offsets = [
          { x: Math.sin(t * 2) * spread, y: Math.cos(t * 2) * 24 },
          { x: Math.sin(t) * spread, y: Math.sin(t * 2) * 13 },
          { x: Math.sin(t * 1.4) * spread, y: Math.sin(t * 1.4) * 16 },
          { x: Math.sin(t) * spread + Math.sin(t * 2.7) * 8, y: Math.cos(t * .7) * 31 },
          { x: arrow[arrowIndex].x + (arrow[arrowIndex + 1].x - arrow[arrowIndex].x) * arrowFraction,
            y: arrow[arrowIndex].y + (arrow[arrowIndex + 1].y - arrow[arrowIndex].y) * arrowFraction },
        ][Math.max(0, doodleStyle)];
        const x = 36 + spread + offsets.x;
        const y = height * .52 + offsets.y;
        const ease = 1 - Math.exp(-dt / 130);
        pen = { x: pen.x + (x - pen.x) * ease, y: pen.y + (y - pen.y) * ease };
        if (approachingMargin && Math.hypot(x - pen.x, y - pen.y) < 5) {
          approachingMargin = false; doodleStarted = now; active = null;
        }
        if (!approachingMargin && (doodleStyle !== 2 || Math.sin(t * 5) > -.15)) addInk(now, false);
        else active = null;
        nextWord = now + 650;
      } else if (phase === "rest" && now > nextWord) {
        active = null; target = chooseWord(); start = { ...pen }; progress = 0;
        shadingStyle = pickDifferent(shadingStyle, 6);
        duration = 1500 + Math.random() * 1100; tilt = .35 + Math.random() * .35;
        if (target) {
          recentTargets.push(`${Math.round(target.left + scrollX)}:${Math.round(target.top + scrollY)}`);
          if (recentTargets.length > 30) recentTargets.shift();
        }
        phase = target ? "travel" : "rest"; nextWord = now + 2500;
      } else if (phase === "travel" && target) {
        active = null; progress = Math.min(1, progress + dt / 700);
        const t = progress * progress * (3 - 2 * progress);
        const fromRight = shadingStyle === 1;
        const entryX = shadingStyle === 3 ? target.right + 7 : fromRight ? target.right : target.left;
        const entryY = target.top + target.height * (shadingStyle >= 4 ? 1 : shadingStyle === 2 ? .77 : .53) + (shadingStyle >= 4 ? 4 : 0);
        pen = { x: start.x + (entryX - start.x) * t, y: start.y + (entryY - start.y) * t - Math.sin(t * Math.PI) * 30 };
        if (progress === 1) { phase = "shade"; progress = 0; }
      } else if (phase === "shade" && target) {
        // A brief hesitation mid-stroke and a little speed variation feel hand drawn.
        const pace = progress > .47 && progress < .50 ? .35 : 1 + Math.sin(progress * 19) * .23;
        progress = Math.min(1, progress + dt / duration * pace);
        const waves = Math.max(7, Math.round(target.width / 5));
        const oscillation = progress * waves * Math.PI * 2;
        if (shadingStyle === 2) {
          // Three broad passes, with a slight wobble and slant on each return.
          const pass = progress * 3;
          const sweep = (1 - Math.cos(pass * Math.PI)) / 2;
          pen = { x: target.left + target.width * sweep,
            y: target.top + target.height * (.77 - progress * .44) + Math.sin(progress * 65) * 1.1 };
        } else if (shadingStyle === 3) {
          const angle = progress * Math.PI * 2.08;
          const wobble = Math.sin(angle * 5) * 1.2;
          pen = { x: target.left + target.width / 2 + Math.cos(angle) * (target.width / 2 + 7 + wobble),
            y: target.top + target.height * .53 + Math.sin(angle) * (target.height * .56 + 3) + wobble };
        } else if (shadingStyle >= 4) {
          // Lift between the two underline passes instead of drawing a connector.
          const second = shadingStyle === 5 && progress > .55;
          const p = shadingStyle === 5 ? (second ? (progress - .55) / .45 : Math.min(1, progress / .45)) : progress;
          pen = { x: target.left + target.width * (second ? 1 - p : p),
            y: target.bottom + (second ? 8 : 4) + Math.sin(p * Math.PI * 2.4) * 1.6 - Math.sin(p * Math.PI) * 2 };
        } else {
          const direction = shadingStyle === 1 ? 1 - progress : progress;
          pen = { x: target.left + target.width * direction + Math.sin(oscillation) * (shadingStyle === 1 ? 4 : 2),
            y: target.top + target.height * .53 + Math.sin(oscillation) * target.height * (shadingStyle === 1 ? .22 : .29) + Math.sin(progress * 51) * 1.4 };
        }
        if (shadingStyle === 5 && progress > .45 && progress < .55) active = null;
        else addInk(now, shadingStyle < 3);
        if (progress === 1) { phase = "rest"; active = null; nextWord = now + 3200 + Math.random() * 2000; }
      } else { active = null; }
      ctx.clearRect(0, 0, width, height);
      strokes = strokes.filter(s => now - s.born < 14000).slice(-32);
      for (const stroke of strokes) {
        ctx.beginPath();
        stroke.points.forEach((p, i) => i ? ctx.lineTo(p.x - scrollX, p.y - scrollY) : ctx.moveTo(p.x - scrollX, p.y - scrollY));
        ctx.strokeStyle = `rgba(248,78,91,${(stroke.shading ? .22 : .82) * Math.min(1, (14000 - now + stroke.born) / 1800)})`;
        ctx.lineWidth = stroke.shading ? 4 : 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
      }
      // Existing ink also stays clear of sticky controls as the document moves.
      for (const control of controls) ctx.clearRect(control.left - 5, control.top - 5, control.width + 10, control.height + 10);
      // The nib is the local origin, keeping it exactly attached to the newest ink.
      ctx.save(); ctx.translate(pen.x, pen.y); ctx.rotate(tilt + Math.sin(now / 320) * .055);
      ctx.shadowColor = "#0008"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-4, -10); ctx.lineTo(-4, -39); ctx.quadraticCurveTo(0, -44, 4, -39); ctx.lineTo(4, -10); ctx.closePath();
      ctx.fillStyle = "#3b1820"; ctx.fill(); ctx.strokeStyle = "#f84e5b"; ctx.lineWidth = 1.5; ctx.stroke();
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

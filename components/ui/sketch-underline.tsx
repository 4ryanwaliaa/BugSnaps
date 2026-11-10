"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

const gestures = [
  ["M6 24C65 12 174 13 292 20", "M278 32C207 24 101 25 25 36"],
  ["M8 27Q42 9 78 23T148 23T218 23T292 19", "M238 35Q267 27 289 32"],
  ["M9 28C78 22 154 10 288 18", "M250 8L290 18L270 31"],
  ["M12 25C63 31 97 13 140 22S214 29 249 19", "M268 22L289 19"],
  ["M10 30C73 17 181 15 288 23", "M37 37C98 27 174 26 227 30"],
];

/** Draw on entering the reading area, with one clock for the ink and pen tip. */
export function SketchUnderline({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();
  const seed = Array.from(id).reduce((sum, char) => sum * 31 + char.charCodeAt(0) >>> 0, 0);
  const gesture = gestures[seed % gestures.length];
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".ink-stroke"));
    const pen = svg.querySelector<SVGGElement>(".ink-pen");
    if (!pen) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let started = false;
    let observer: IntersectionObserver | undefined;
    const finish = () => {
      cancelAnimationFrame(frame);
      paths.forEach(path => { path.style.strokeDashoffset = "0"; });
      pen.style.opacity = "0";
      svg.dataset.drawing = "complete";
    };
    const begin = () => {
      if (started || reduced.matches) return;
      started = true;
      observer?.disconnect();
      svg.dataset.drawing = "active";
      const lengths = paths.map(path => path.getTotalLength());
      const start = performance.now();
      const draw = (now: number) => {
        // Different shapes have their own rhythm; the shorter finishing flick is quicker.
        const elapsed = now - start;
        const duration = 440 + seed % 240;
        const lift = 70 + seed % 90;
        const secondDuration = Math.max(140, duration * lengths[1] / lengths[0]);
        const secondStart = duration + lift;
        const end = secondStart + secondDuration;
        const first = Math.min(1, elapsed / duration);
        const second = Math.max(0, Math.min(1, (elapsed - secondStart) / secondDuration));
        paths[0].style.strokeDashoffset = String(1 - first);
        paths[1].style.strokeDashoffset = String(1 - second);
        const index = elapsed < secondStart ? 0 : 1;
        const point = paths[index].getPointAtLength(lengths[index] * (index ? second : first));
        pen.setAttribute("transform", `translate(${point.x} ${point.y})`);
        pen.style.opacity = elapsed >= duration && elapsed < secondStart ? "0" : String(Math.max(0, Math.min(1, (end - elapsed) / 80)));
        if (elapsed < end) frame = requestAnimationFrame(draw);
        else finish();
      };
      frame = requestAnimationFrame(draw);
    };
    const onPreference = () => {
      if (reduced.matches) { observer?.disconnect(); finish(); }
    };
    if (!reduced.matches && "IntersectionObserver" in window) {
      paths.forEach(path => { path.style.strokeDashoffset = "1"; });
      svg.dataset.drawing = "waiting";
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) begin();
      }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
      observer.observe(svg);
    }
    reduced.addEventListener("change", onPreference);
    return () => { observer?.disconnect(); cancelAnimationFrame(frame); reduced.removeEventListener("change", onPreference); };
  }, [seed]);

  return (
    <svg ref={ref} aria-hidden="true" focusable="false" viewBox="0 0 300 44" className={cn("ink-drawing text-coral", className)} fill="none">
      <path className="ink-stroke" pathLength="1" d={gesture[0]} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path className="ink-stroke" pathLength="1" d={gesture[1]} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <g className="ink-pen">
        <g transform="rotate(32) scale(1.25)">
          <path d="M0 0L-4-9V-30Q0-35 4-30V-9Z" fill="#151821" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M-4-25H4M-4-10H4M0-22V-12" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0 0L-2-5H2Z" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}

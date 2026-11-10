"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Draw on entering the reading area, with one clock for the ink and pen tip. */
export function SketchUnderline({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
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
        // Two fast strokes with a short pen lift between them: 1.1 seconds total.
        const elapsed = now - start;
        const first = Math.min(1, elapsed / 480);
        const second = Math.max(0, Math.min(1, (elapsed - 580) / 480));
        paths[0].style.strokeDashoffset = String(1 - first);
        paths[1].style.strokeDashoffset = String(1 - second);
        const index = elapsed < 580 ? 0 : 1;
        const point = paths[index].getPointAtLength(lengths[index] * (index ? second : first));
        pen.setAttribute("transform", `translate(${point.x} ${point.y})`);
        pen.style.opacity = elapsed >= 480 && elapsed < 580 ? "0" : String(Math.min(1, (1100 - elapsed) / 80));
        if (elapsed < 1100) frame = requestAnimationFrame(draw);
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
  }, []);

  return (
    <svg ref={ref} aria-hidden="true" focusable="false" viewBox="0 0 300 44" className={cn("ink-drawing text-coral", className)} fill="none">
      <path className="ink-stroke" pathLength="1" d="M6 24C65 12 174 13 292 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path className="ink-stroke" pathLength="1" d="M278 32C207 24 101 25 25 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
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

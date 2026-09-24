"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/*
 * Small motion primitives the marketing pages share. Each one degrades to a
 * still, fully readable element under prefers-reduced-motion.
 */

/**
 * One document-level listener that feeds the `.spot` cards their cursor
 * position (--mx / --my). Cheaper than a listener per card, and new cards get
 * the effect by adding the class.
 */
export function SpotlightTracker() {
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      const event = last;
      if (!event) return;
      const card = (event.target as Element | null)?.closest?.(".spot") as HTMLElement | null;
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    };
    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}

/** Pulls its child a little toward the cursor, and springs back. */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  if (reduce) return <span className="inline-flex">{children}</span>;

  return (
    <motion.span
      ref={ref}
      className="inline-flex"
      style={{ x, y }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        const box = ref.current.getBoundingClientRect();
        x.set((event.clientX - (box.left + box.width / 2)) * strength);
        y.set((event.clientY - (box.top + box.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/** A number that counts up the first time it scrolls into view. */
export function CountUp({ to, duration = 1.6, className }: { to: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(to);
  const started = useRef(false);

  useEffect(() => {
    if (reduce || !inView || started.current) return;
    started.current = true;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  // Server render and no-JS show the real value; the count starts from 0 only
  // once the element is on screen with motion allowed.
  useEffect(() => {
    if (!reduce && !started.current) setValue(0);
  }, [reduce]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-IN")}
    </span>
  );
}

/** Tilts its child in 3D toward the cursor, with a glare that follows it. */
export function Tilt({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 150, damping: 18 });
  const ry = useSpring(0, { stiffness: 150, damping: 18 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glare = useTransform([glareX, glareY], ([x, y]) =>
    `radial-gradient(600px circle at ${x}% ${y}%, rgba(147,197,253,0.10), transparent 45%)`,
  );

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div className={className} style={{ perspective: 1200 }}>
      <motion.div
        className="relative"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse") return;
          const box = event.currentTarget.getBoundingClientRect();
          const px = (event.clientX - box.left) / box.width;
          const py = (event.clientY - box.top) / box.height;
          ry.set((px - 0.5) * max * 2);
          rx.set(-(py - 0.5) * max * 2);
          glareX.set(px * 100);
          glareY.set(py * 100);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        {children}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[22px]" style={{ background: glare }} />
      </motion.div>
    </div>
  );
}

/** The thin beam under the navbar that fills as the page is read. */
export function ScrollBeam() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-gradient-to-r from-primary/0 via-accent to-sky-300 shadow-[0_0_12px_rgb(59_130_246/0.8)]"
    />
  );
}

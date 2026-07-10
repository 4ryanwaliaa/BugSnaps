import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import type { ReactNode } from "react";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-32", className)}>
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <Reveal className={cn("max-w-2xl", centered && "mx-auto text-center")}>
      <p className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg leading-relaxed text-muted text-pretty">{description}</p>
      )}
    </Reveal>
  );
}

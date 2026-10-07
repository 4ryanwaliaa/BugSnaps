import Image from "next/image";

/** Editorial visual only; never represented as a customer or product screenshot. */
export function SecurityReviewFigure({ className = "" }: { className?: string }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
        <Image
          src="/images/website-security-review.webp"
          width={1600}
          height={900}
          sizes="(max-width: 768px) 100vw, 1100px"
          alt="Illustration of a security analyst reviewing web application findings and a remediation checklist."
          className="h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted-2">
        Review evidence, assign a fix and retest the affected path. AI-generated illustration; not a product screenshot or customer assessment.
      </figcaption>
    </figure>
  );
}

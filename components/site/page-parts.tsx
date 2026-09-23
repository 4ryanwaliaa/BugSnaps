import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { breadcrumbJsonLd } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";
import { cn } from "@/lib/utils";

/** Structured data, with "<" escaped so a value can never close the tag. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Navbar, main landmark, footer. Every public page uses it. */
export function SiteShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <>
      <Navbar />
      <main id="main" className={className}>
        {children}
      </main>
      <Footer />
    </>
  );
}

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className="font-mono text-[12px] text-muted-2">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.path} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              {index === items.length - 1 ? (
                <span aria-current="page" className="text-muted">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition-colors hover:text-foreground">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** The top of an inner page: breadcrumbs, one H1, a short lead. */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-white/[0.05]">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-70" />
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-28 pb-14 sm:pt-36 sm:pb-20 lg:px-8">
        <Breadcrumbs items={crumbs} />
        {eyebrow && (
          <p className="mt-8 font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        )}
        <h1
          className={cn(
            "max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl",
            eyebrow ? "mt-4" : "mt-8",
          )}
        >
          {title}
        </h1>
        {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 lg:px-8", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-16 sm:py-24", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionTitle({
  id,
  eyebrow,
  title,
  lead,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      )}
      <h2 id={id} className={cn("text-3xl font-semibold tracking-tight text-balance sm:text-4xl", eyebrow && "mt-3")}>
        {title}
      </h2>
      {lead && <p className="mt-4 text-[17px] leading-relaxed text-muted text-pretty">{lead}</p>}
    </div>
  );
}

/** Readable long-form text with consistent spacing for headings and lists. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-[16px] leading-[1.75] text-muted",
        "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground",
        "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_strong]:font-medium [&_strong]:text-foreground [&_a]:text-accent [&_a:hover]:underline",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The closing call to action most pages end on. */
export function CtaBand({
  title = "Run a real pentest on your app — free.",
  lead = "Sign in, prove you own the domain, and MyPentest maps and tests it. No credit card.",
  secondary = { label: "Book a security consultation", href: "/contact" },
}: {
  title?: string;
  lead?: string;
  secondary?: { label: string; href: string } | null;
}) {
  return (
    <section aria-labelledby="cta-title" className="py-16 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-surface px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.16] blur-[110px]"
          />
          <div className="relative">
            <h2 id="cta-title" className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">{lead}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={newAssessmentUrl()}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_rgb(37_99_235/0.5)] transition-colors hover:bg-accent"
              >
                Start your free pentest
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              {secondary && (
                <Link
                  href={secondary.href}
                  className="inline-flex h-12 items-center rounded-full px-5 text-[15px] text-muted transition-colors hover:text-foreground"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

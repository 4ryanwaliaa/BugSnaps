import type { Metadata } from "next";
import Link from "@/components/site/content-link";
import { Logo } from "@/components/site/logo";
import { newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/mypentest", label: "MyPentest" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-8 lg:px-8">
        <Link href="/" aria-label="BugSnaps - home" className="inline-flex">
          <Logo />
        </Link>
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-6 pt-24 pb-24 lg:px-8">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">That page doesn&apos;t exist.</h1>
        <p className="mt-4 text-lg text-muted">
          It may have moved when the site was reorganised. One of these is probably what you were after.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex h-10 items-center rounded-full border border-white/10 px-4 text-sm text-muted hover:border-white/20 hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-muted">
          Or{" "}
          <a href={newAssessmentUrl()} className="text-accent hover:underline">
            run a free pentest
          </a>{" "}
          while you&apos;re here.
        </p>
      </main>
      <footer className="mx-auto w-full max-w-3xl border-t border-white/[0.06] px-6 py-8 text-sm text-muted lg:px-8">
        <Link href="/site-map" className="hover:text-foreground">Site map</Link>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ScrollBeam } from "@/components/ui/motion";
import { MYRECON_URL } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; external?: boolean };

const links: NavLink[] = [
  { href: "/mypentest", label: "MyPentest" },
  { href: MYRECON_URL, label: "MyRecon", external: true },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-white/[0.06] bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6 lg:px-8">
        <Link href="/" aria-label="BugSnaps - home" className="shrink-0">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-sm text-muted transition-colors hover:text-foreground xl:px-3"
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-2" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-full px-2.5 py-2 text-sm transition-colors hover:text-foreground xl:px-3",
                    isActive(link.href) ? "text-foreground" : "text-muted",
                  )}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/contact" className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm text-muted transition-colors hover:text-foreground">
            Contact
          </Link>
          <a
            href={newAssessmentUrl()}
            className="shine inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Run MyPentest free
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl text-foreground lg:hidden"
        >
          {open ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
        </button>
      </nav>
      <ScrollBeam />

      <div
        id="mobile-menu"
        hidden={!open}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.06] bg-background/95 backdrop-blur-2xl lg:hidden"
      >
        <ul className="px-5 pt-3 pb-2">
          {[...links, { href: "/contact", label: "Contact" }].map((link) => (
            <li key={link.href}>
              {"external" in link && link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[16px] font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 text-muted-2" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="flex items-center rounded-xl px-4 py-3.5 text-[16px] font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground aria-[current=page]:text-foreground"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="px-5 pb-6">
          <a
            href={newAssessmentUrl()}
            onClick={() => setOpen(false)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-medium text-white"
          >
            Run MyPentest free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/site/content-link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { newAssessmentUrl } from "@/lib/mypentest";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; external?: boolean };

const links: NavLink[] = [
  { href: "/products", label: "Products" },
  { href: "/mypentest", label: "MyPentest" },
  { href: "/myrecon", label: "MyRecon" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/resources", label: "Resources" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollBeam = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const beam = scrollBeam.current;
    const root = document.documentElement;
    let frame = 0;

    function updateScroll() {
      frame = 0;
      const scrollY = window.scrollY;
      setScrolled(scrollY > 12);
      const scrollRange = root.scrollHeight - root.clientHeight;
      const progress = scrollRange > 0 ? Math.min(1, Math.max(0, scrollY / scrollRange)) : 0;
      if (beam) beam.style.transform = `scaleX(${progress})`;
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(updateScroll);
    }

    updateScroll();
    const pageSize = new ResizeObserver(scheduleUpdate);
    pageSize.observe(document.body);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      pageSize.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
    };
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
        scrolled || open || pathname === "/blog/binance-crypto-hack-october-2026-explained"
          ? "border-b border-white/[0.06] bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link href="/" aria-label="BugSnaps - home" className="shrink-0">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-0.5 xl:flex">
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

        <div className="hidden items-center gap-2 xl:flex">
          <Link href="/contact" className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm text-muted transition-colors hover:text-foreground">
            Contact
          </Link>
          <a
            href={newAssessmentUrl()}
            className="site-button site-button-primary min-h-11 shrink-0 px-4 text-sm"
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
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl text-foreground xl:hidden"
        >
          {open ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
        </button>
      </nav>
      <div
        ref={scrollBeam}
        aria-hidden="true"
        style={{ transform: "scaleX(0)" }}
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-left bg-gradient-to-r from-primary/0 via-accent to-sky-300 shadow-[0_0_12px_rgb(59_130_246/0.8)]"
      />

      <div
        id="mobile-menu"
        hidden={!open}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.06] bg-background/95 backdrop-blur-2xl xl:hidden"
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
            className="site-button site-button-primary min-h-12 w-full px-5 text-[15px]"
          >
            Run MyPentest free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}

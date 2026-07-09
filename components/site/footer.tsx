import Link from "next/link";
import { Linkedin, Github, Twitter } from "lucide-react";
import { Logo } from "@/components/site/logo";

const columns = [
  {
    heading: "Services",
    links: [
      { label: "Web Application Pentest", href: "/#services" },
      { label: "API Security Testing", href: "/#services" },
      { label: "Cloud Security Review", href: "/#services" },
      { label: "Source Code Review", href: "/#services" },
      { label: "We Fix It Too", href: "/#services" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Sample report", href: "/#report" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Responsible Disclosure", href: "/responsible-disclosure" },
    ],
  },
];

const socials = [
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "X (Twitter)", href: "https://x.com", icon: Twitter },
  { label: "GitHub", href: "https://github.com", icon: Github },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Offensive security for growing businesses. Find. Fix. Fortify.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-lg border border-white/[0.08] p-2.5 text-muted transition-colors hover:border-white/20 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-sm font-semibold text-foreground">{column.heading}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="text-[13px] text-muted-2">
            © {new Date().getFullYear()} BugSnaps Security Ltd. All rights reserved.
          </p>
          <p className="font-mono text-[12px] tracking-wide text-muted-2">
            Find. Fix. Fortify.
          </p>
        </div>
      </div>
    </footer>
  );
}

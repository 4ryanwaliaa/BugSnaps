import Link from "next/link";
import { Linkedin } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { CookieSettingsButton } from "@/components/site/cookie-consent";
import { CONTACT_EMAIL, LINKEDIN_URL, MYRECON_URL } from "@/lib/site";

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Products",
    links: [
      { label: "MyPentest - automated pentesting", href: "/mypentest" },
      { label: "MyRecon - reconnaissance", href: MYRECON_URL, external: true },
      { label: "Example MyPentest report", href: "/mypentest/example-report" },
      { label: "All products", href: "/products" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Penetration testing", href: "/penetration-testing" },
      { label: "Web application pentesting", href: "/web-application-pentesting" },
      { label: "API security testing", href: "/api-security-testing" },
      { label: "Network pentesting", href: "/network-pentesting" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Comparisons", href: "/compare" },
      { label: "MyPentest vs vulnerability scanners", href: "/compare/mypentest-vs-vulnerability-scanners" },
      { label: "BugSnaps vs traditional pentests", href: "/compare/bugsnaps-vs-traditional-pentest" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "BugSnaps Personal", href: "/personal" },
      { label: "Responsible disclosure", href: "/responsible-disclosure" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Penetration testing, automated and expert-led. Home of MyPentest and{" "}
              <a href={MYRECON_URL} className="text-foreground/90 underline-offset-4 hover:underline">
                MyRecon
              </a>
              .
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BugSnaps on LinkedIn"
                className="rounded-lg border border-white/[0.08] p-2.5 text-muted transition-colors hover:border-white/20 hover:text-foreground"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-muted transition-colors hover:text-foreground">
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-sm font-semibold text-foreground">{column.heading}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="text-[13px] text-muted-2">
            © {new Date().getFullYear()} BugSnaps Security Ltd. MyPentest and MyRecon are BugSnaps products.
          </p>
          <div className="flex items-center gap-4">
            <CookieSettingsButton className="text-[12px] text-muted-2 transition-colors hover:text-foreground" />
            <p className="font-mono text-[12px] tracking-wide text-muted-2">Find. Fix. Fortify.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

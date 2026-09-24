import Link from "next/link";
import { ArrowUpRight, Linkedin, Mail } from "lucide-react";
import { Logo, LogoMark } from "@/components/site/logo";
import { CookieSettingsButton } from "@/components/site/cookie-consent";
import { CONTACT_EMAIL, LINKEDIN_URL, MYRECON_URL, ORG } from "@/lib/site";
import { routes } from "@/lib/mypentest";

/*
 * The site footer, in two brands: BugSnaps (every public page) and MyPentest
 * (the MyPentest pages and the signed-in app). Same layout, different first
 * column and product links. Every href here must be a real page.
 */

type FooterLink = { label: string; href: string; external?: boolean };
type Column = { heading: string; links: FooterLink[] };
export type FooterBrand = "bugsnaps" | "mypentest";

const COMPARE: Column = {
  heading: "Compare",
  links: [
    { label: "MyPentest vs Strix", href: "/compare/mypentest-vs-strix" },
    { label: "MyPentest vs Astra", href: "/compare/mypentest-vs-astra-security" },
    { label: "MyPentest vs Burp Suite", href: "/compare/mypentest-vs-burp-suite" },
    { label: "Vulnerability scanners", href: "/compare/mypentest-vs-vulnerability-scanners" },
    { label: "Automated vs manual", href: "/compare/automated-vs-manual-penetration-testing" },
    { label: "All comparisons", href: "/compare" },
  ],
};

const COLUMNS: Record<FooterBrand, Column[]> = {
  bugsnaps: [
    {
      heading: "Products",
      links: [
        { label: "MyPentest", href: routes.product },
        { label: "MyRecon", href: MYRECON_URL, external: true },
        { label: "Example report", href: routes.exampleReport },
        { label: "All products", href: "/products" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      heading: "Services",
      links: [
        { label: "Penetration testing", href: "/penetration-testing" },
        { label: "Web app pentesting", href: "/web-application-pentesting" },
        { label: "API security testing", href: "/api-security-testing" },
        { label: "Network pentesting", href: "/network-pentesting" },
        { label: "All services", href: "/services" },
      ],
    },
    COMPARE,
    {
      heading: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "BugSnaps Personal", href: "/personal" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy policy", href: "/privacy" },
        { label: "Terms of service", href: "/terms" },
        { label: "Responsible disclosure", href: "/responsible-disclosure" },
      ],
    },
  ],
  mypentest: [
    {
      heading: "Product",
      links: [
        { label: "Overview", href: routes.product },
        { label: "Start a free scan", href: routes.newAssessment },
        { label: "Example report", href: routes.exampleReport },
        { label: "Plans and pricing", href: "/pricing" },
        { label: "Your assessments", href: routes.app },
      ],
    },
    {
      heading: "BugSnaps",
      links: [
        { label: "About BugSnaps", href: "/about" },
        { label: "Manual pentesting", href: "/penetration-testing" },
        { label: "MyRecon", href: MYRECON_URL, external: true },
        { label: "All products", href: "/products" },
        { label: "Blog", href: "/blog" },
      ],
    },
    COMPARE,
    {
      heading: "Support",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Talk to a tester", href: routes.consultation },
        { label: "Report a vulnerability", href: "/responsible-disclosure" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy policy", href: "/privacy" },
        { label: "Terms of service", href: "/terms" },
      ],
    },
  ],
};

const linkClass = "text-[15px] text-foreground/75 transition-colors hover:text-foreground";

/*
 * CSP is a document policy (next.config.ts): a page in the signed-in app must
 * be entered with a full navigation, so app links are plain anchors. Inside
 * the app (`hardLinks`) every link is, so leaving it loads the public policy.
 */
function FooterAnchor({ link, hardLinks }: { link: FooterLink; hardLinks: boolean }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener" className={`${linkClass} inline-flex items-center gap-1`}>
        {link.label}
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-2" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  if (hardLinks || link.href.startsWith(routes.app)) {
    return (
      <a href={link.href} className={linkClass}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={linkClass}>
      {link.label}
    </Link>
  );
}

function Brand({ brand, hardLinks }: { brand: FooterBrand; hardLinks: boolean }) {
  if (brand === "bugsnaps") {
    return (
      <>
        <Link href="/" aria-label="BugSnaps - home" className="inline-flex">
          <Logo />
        </Link>
        <p className="mt-4 max-w-[15rem] text-sm leading-relaxed text-muted">
          Penetration testing, automated and expert-led.
        </p>
      </>
    );
  }
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-semibold tracking-tight text-foreground">MyPentest</span>
        <span className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-2">by BugSnaps</span>
      </span>
    </span>
  );
  return (
    <>
      {hardLinks ? (
        <a href={routes.product} aria-label="MyPentest - overview" className="inline-flex">
          {mark}
        </a>
      ) : (
        <Link href={routes.product} aria-label="MyPentest - overview" className="inline-flex">
          {mark}
        </Link>
      )}
      <p className="mt-4 max-w-[15rem] text-sm leading-relaxed text-muted">
        Automated penetration testing. Only test systems you own or have written permission to test.
      </p>
    </>
  );
}

export function Footer({ brand = "bugsnaps", hardLinks = false }: { brand?: FooterBrand; hardLinks?: boolean }) {
  return (
    <footer className="px-4 pb-6 pt-10 sm:px-6 sm:pb-8">
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-white/[0.06] bg-[#0c0c0e] px-6 py-12 sm:px-10 sm:py-14 xl:px-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-[minmax(10rem,1fr)_repeat(5,max-content)] xl:gap-x-0 xl:gap-y-0">
          <div className="col-span-2 flex flex-col justify-between gap-8 sm:col-span-3 xl:col-span-1 xl:pr-8">
            <div>
              <Brand brand={brand} hardLinks={hardLinks} />
            </div>
            <address className="text-sm not-italic leading-relaxed text-muted">
              {ORG.legalName}
              <br />
              <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-foreground">
                {CONTACT_EMAIL}
              </a>
            </address>
          </div>

          {COLUMNS[brand].map((column) => (
            <nav
              key={column.heading}
              aria-label={`${column.heading} links`}
              className="border-l border-white/[0.08] pl-5 xl:px-6"
            >
              <h2 className="font-mono text-[12.5px] font-medium uppercase tracking-[0.14em] text-muted-2">
                {column.heading}
              </h2>
              <ul className="mt-6 space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterAnchor link={link} hardLinks={hardLinks} />
                  </li>
                ))}
                {column.heading === "Legal" && (
                  <li>
                    <CookieSettingsButton className={`${linkClass} text-left`} />
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="text-[14px] text-muted">
            Copyright © {new Date().getFullYear()} {ORG.legalName}. All rights reserved.
            {brand === "mypentest" ? " MyPentest is a BugSnaps product." : ""}
          </p>
          <div className="flex items-center gap-3">
            <span className="mr-2 hidden font-mono text-[12px] tracking-wide text-muted-2 md:inline">{ORG.slogan}</span>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BugSnaps on LinkedIn"
              className="rounded-lg border border-white/[0.08] p-2.5 text-muted transition-colors hover:border-white/20 hover:text-foreground"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label={`Email ${CONTACT_EMAIL}`}
              className="rounded-lg border border-white/[0.08] p-2.5 text-muted transition-colors hover:border-white/20 hover:text-foreground"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

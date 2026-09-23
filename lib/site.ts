import type { Metadata } from "next";

/*
 * One place for what the whole site says about itself: the canonical origin,
 * the organisation, and a metadata builder every page uses so titles,
 * descriptions, canonicals and social cards can't drift apart page to page.
 */

/** The canonical origin. www.bugsnaps.in redirects here (next.config.ts). */
export const SITE_URL = "https://bugsnaps.in";

/** MyRecon's canonical origin — its own site, linked, never proxied. */
export const MYRECON_URL = "https://www.myrecon.xyz/";

export const CONTACT_EMAIL = "aryan@bugsnaps.in";
export const LINKEDIN_URL = "https://www.linkedin.com/company/bugsnaps";

export const ORG = {
  name: "BugSnaps",
  legalName: "BugSnaps Security Ltd",
  slogan: "Find. Fix. Fortify.",
  description:
    "BugSnaps is a cybersecurity company focused on penetration testing: MyPentest for automated testing, MyRecon for reconnaissance, and expert-led engagements.",
};

/** The social card every page shares (app/opengraph-image.png). */
export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 627,
  alt: "BugSnaps — Find. Fix. Fortify. Penetration testing and offensive security.",
};

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE_URL}${clean.startsWith("/") || clean === "" ? clean : `/${clean}`}`;
}

/**
 * Page metadata with a canonical URL and matching Open Graph / Twitter cards.
 * `title` is the page's own title; the layout template appends " — BugSnaps".
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noindex = false,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const socialTitle = absoluteTitle ? title : `${title} — BugSnaps`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: "BugSnaps",
      title: socialTitle,
      description,
      locale: "en_US",
      // Set explicitly: a page that defines its own openGraph replaces the
      // parent's, and would otherwise lose the file-based image.
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [OG_IMAGE.url] },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

/* ── Structured data ───────────────────────────────────────── */

export const ORG_ID = `${SITE_URL}/#organization`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: ORG.name,
        legalName: ORG.legalName,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        slogan: ORG.slogan,
        description: ORG.description,
        email: CONTACT_EMAIL,
        sameAs: [LINKEDIN_URL, MYRECON_URL],
        knowsAbout: [
          "Penetration testing",
          "Automated penetration testing",
          "Web application security",
          "API security testing",
          "Network penetration testing",
          "Reconnaissance",
          "Attack surface management",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: ORG.name,
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function serviceJsonLd({ name, description, path }: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(path),
    serviceType: name,
    areaServed: "Worldwide",
    provider: { "@id": ORG_ID, "@type": "Organization", name: ORG.name, url: SITE_URL },
  };
}

import type { Metadata } from "next";

/*
 * One place for what the whole site says about itself: the canonical origin,
 * the organisation, and a metadata builder every page uses so titles,
 * descriptions, canonicals and social cards can't drift apart page to page.
 */

/** The canonical origin. www.bugsnaps.in redirects here (next.config.ts). */
export const SITE_URL = "https://bugsnaps.in";

/** MyRecon's canonical origin - its own site, linked, never proxied. */
export const MYRECON_URL = "https://www.myrecon.xyz/";
export const MYRECON_ANDROID_URL = "https://play.google.com/store/apps/details?id=com.Myrecon.osint";

export const CONTACT_EMAIL = "aryan@bugsnaps.in";
export const LINKEDIN_URL = "https://www.linkedin.com/company/bugsnaps";

export const ORG = {
  name: "BugSnaps",
  legalName: "BugSnaps",
  slogan: "Find. Fix. Fortify.",
  description:
    "BugSnaps provides cybersecurity tools and services, including MyPentest, MyRecon, PhishLens, EndpointRadar and expert-led security assessments.",
};

/** The social card every page shares (app/opengraph-image.png). */
export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 627,
  alt: "BugSnaps - Find. Fix. Fortify. Penetration testing and offensive security.",
};

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE_URL}${clean.startsWith("/") || clean === "" ? clean : `/${clean}`}`;
}

const TITLE_SUFFIX = " - BugSnaps";
const MAX_TITLE_LENGTH = 58;

/**
 * Page metadata with a canonical URL and matching Open Graph / Twitter cards.
 * `title` is the page's own title; the layout template appends " - BugSnaps".
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noindex = false,
  type = "website",
  published,
  modified,
  publishedTime,
  modifiedTime,
  image,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  noindex?: boolean;
  type?: "website" | "article";
  published?: string;
  modified?: string;
  publishedTime?: string;
  modifiedTime?: string;
  image?: OgImage;
}): Metadata {
  const url = absoluteUrl(path);
  // Search results truncate titles at roughly 60 characters. When the brand
  // suffix would push the query-bearing words out of view, drop the suffix
  // instead of the words people actually searched for.
  if (!absoluteTitle && title.length + TITLE_SUFFIX.length > MAX_TITLE_LENGTH) absoluteTitle = true;
  const socialTitle = absoluteTitle ? title : `${title}${TITLE_SUFFIX}`;
  const ogImage = image ? { ...image, url: absoluteUrl(image.url) } : OG_IMAGE;
  const pub = publishedTime ?? published;
  const mod = modifiedTime ?? modified;
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
      ...(type === "article" ? { publishedTime: pub, modifiedTime: mod } : {}),
      // Set explicitly: a page that defines its own openGraph replaces the
      // parent's, and would otherwise lose the file-based image.
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [ogImage.url] },
    robots: noindex ? { index: false, follow: false } : {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
  };
}

/* ── Structured data ───────────────────────────────────────── */

export const ORG_ID = `${SITE_URL}/#organization`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;

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
        logo: `${SITE_URL}/apple-icon.png`,
        slogan: ORG.slogan,
        description: ORG.description,
        email: CONTACT_EMAIL,
        founder: {
          "@type": "Person",
          "@id": FOUNDER_ID,
          name: "Aryan Walia",
          jobTitle: "Founder & Penetration Tester",
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            name: "Certified Ethical Hacker (CEH)",
          },
          worksFor: { "@id": ORG_ID },
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Gurugram",
          addressRegion: "Haryana",
          addressCountry: "IN",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT_EMAIL,
          url: `${SITE_URL}/contact`,
          availableLanguage: ["en"],
        },
        sameAs: [LINKEDIN_URL],
        knowsAbout: [
          "Penetration testing",
          "Automated penetration testing",
          "Web application security",
          "API security testing",
          "Network penetration testing",
          "Reconnaissance",
          "Attack surface management",
          "Cloud security assessments",
          "OWASP Top 10 vulnerabilities",
          "Broken Object Level Authorization (BOLA)",
          "Server-Side Request Forgery (SSRF)",
          "Vulnerability remediation and retesting",
          "Penetration testing benchmark methodology",
          "Authenticated web application testing",
          "Security assessment evidence and confidence",
          "Vulnerability disclosure management",
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

export function imageObjectJsonLd({
  id,
  contentUrl,
  caption,
  width,
  height,
  creditText = "BugSnaps",
}: {
  id: string;
  contentUrl: string;
  caption: string;
  width: number;
  height: number;
  creditText?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": absoluteUrl(id),
    contentUrl: absoluteUrl(contentUrl),
    url: absoluteUrl(contentUrl),
    caption,
    width,
    height,
    creator: { "@id": ORG_ID },
    creditText,
    copyrightNotice: "© 2026 BugSnaps",
    license: absoluteUrl("/terms"),
    acquireLicensePage: absoluteUrl("/terms"),
  };
}

export function videoObjectJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
  clips,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  clips?: { name: string; startOffset: number; endOffset?: number; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl: absoluteUrl(thumbnailUrl),
    uploadDate,
    ...(duration ? { duration } : {}),
    ...(contentUrl ? { contentUrl: absoluteUrl(contentUrl) } : {}),
    ...(embedUrl ? { embedUrl } : {}),
    publisher: { "@id": ORG_ID },
    ...(clips?.length
      ? {
          hasPart: clips.map((clip) => ({
            "@type": "Clip",
            name: clip.name,
            startOffset: clip.startOffset,
            ...(clip.endOffset !== undefined ? { endOffset: clip.endOffset } : {}),
            url: absoluteUrl(clip.url),
          })),
        }
      : {}),
  };
}

export function howToJsonLd({
  name,
  description,
  path,
  totalTime,
  steps,
}: {
  name: string;
  description: string;
  path: string;
  totalTime?: string;
  steps: { name: string; text: string; url?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(totalTime ? { totalTime } : {}),
    url: absoluteUrl(path),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url ? { url: absoluteUrl(step.url) } : {}),
    })),
  };
}

export function techArticleJsonLd({
  headline,
  description,
  path,
  datePublished,
  dateModified,
  about,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  about?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    datePublished,
    ...(dateModified ? { dateModified } : {}),
    author: { "@id": ORG_ID, "@type": "Organization", name: ORG.name, url: SITE_URL },
    publisher: { "@id": ORG_ID },
    ...(about?.length ? { about } : {}),
  };
}

export function creativeWorkJsonLd({
  name,
  description,
  path,
  about,
}: {
  name: string;
  description: string;
  path: string;
  about?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    creator: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    ...(about ? { about } : {}),
  };
}

export function aboutPageJsonLd({
  name,
  description,
  path = "/about",
}: {
  name: string;
  description: string;
  path?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: { "@id": ORG_ID },
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: "Aryan Walia",
    jobTitle: "Founder & Penetration Tester",
    email: CONTACT_EMAIL,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: "Certified Ethical Hacker (CEH)",
    },
    worksFor: { "@id": ORG_ID },
    url: absoluteUrl("/about"),
  };
}

export function blogJsonLd({
  name,
  description,
  path = "/blog",
  items,
}: {
  name: string;
  description: string;
  path?: string;
  items?: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name,
    description,
    url: absoluteUrl(path),
    publisher: { "@id": ORG_ID },
    ...(items?.length
      ? {
          blogPost: items.map((item) => ({
            "@type": "BlogPosting",
            headline: item.name,
            url: absoluteUrl(item.path),
          })),
        }
      : {}),
  };
}

export function collectionPageJsonLd({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      name,
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/site/page-parts";
import { CookieConsent } from "@/components/site/cookie-consent";
import { GoogleAnalytics } from "@/components/site/google-analytics";
import { SpotlightTracker } from "@/components/ui/motion";
import { SITE_URL, organizationJsonLd } from "@/lib/site";
import { INDEXABLE_ROUTES } from "@/lib/routes";
import { posts } from "@/lib/blog";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "G-GQWKB7QXXY";
// Only this small public-page map enters the client bundle, not article bodies
// or private app routes. Titles come from site data, never user input.
const analyticsPages = Object.fromEntries([
  ...INDEXABLE_ROUTES.map(({ path }) => [path, path === "/" ? "Home - BugSnaps" : `${path} - BugSnaps`]),
  ...posts.map(({ slug, title }) => [`/blog/${slug}`, `${title} - BugSnaps`]),
]);

/*
 * Site-wide defaults. Every indexable page overrides title, description and
 * canonical through `pageMetadata` (lib/site.ts); these only fill gaps.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BugSnaps - Penetration Testing, Automated and Expert-Led",
    template: "%s - BugSnaps",
  },
  description:
    "BugSnaps is a penetration-testing company. Run MyPentest, our automated pentest, free to start - or bring in our testers for a manual engagement.",
  applicationName: "BugSnaps",
  authors: [{ name: "BugSnaps" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "BugSnaps",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen font-sans">
        <JsonLd data={organizationJsonLd()} />
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[60] focus-visible:rounded-full focus-visible:bg-primary focus-visible:px-5 focus-visible:py-2.5 focus-visible:text-sm focus-visible:font-medium focus-visible:text-white"
        >
          Skip to content
        </a>
        {children}
        <CookieConsent />
        {/^G-[A-Z0-9]+$/.test(gaMeasurementId) && (
          <GoogleAnalytics measurementId={gaMeasurementId} pages={analyticsPages} origin={SITE_URL} />
        )}
        <SpotlightTracker />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/site/page-parts";
import { SITE_URL, organizationJsonLd } from "@/lib/site";
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

/*
 * Site-wide defaults. Every indexable page overrides title, description and
 * canonical through `pageMetadata` (lib/site.ts); these only fill gaps.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BugSnaps — Penetration Testing, Automated and Expert-Led",
    template: "%s — BugSnaps",
  },
  description:
    "BugSnaps is a penetration-testing company. Run MyPentest, our automated pentest, free to start — or bring in our testers for a manual engagement.",
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
      </body>
    </html>
  );
}

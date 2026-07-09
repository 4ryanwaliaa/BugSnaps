import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
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

const siteUrl = "https://bugsnaps.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BugSnaps — Penetration Testing & Offensive Security",
    template: "%s — BugSnaps",
  },
  description:
    "BugSnaps helps growing businesses find and fix security vulnerabilities through professional penetration testing, API security testing, and actionable remediation. Find. Fix. Fortify.",
  keywords: [
    "penetration testing",
    "pentest",
    "API security testing",
    "web application security",
    "vulnerability assessment",
    "security audit",
    "OWASP",
    "cybersecurity consultancy",
  ],
  authors: [{ name: "BugSnaps Security" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "BugSnaps",
    title: "BugSnaps — Penetration Testing & Offensive Security",
    description:
      "Find vulnerabilities before attackers do. Manual-led penetration testing with retesting included, for startups, SaaS, and e-commerce.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BugSnaps — Penetration Testing & Offensive Security",
    description:
      "Find vulnerabilities before attackers do. Manual-led penetration testing with retesting included.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "BugSnaps",
  slogan: "Find. Fix. Fortify.",
  url: siteUrl,
  email: "aryan@bugsnaps.in",
  description:
    "Offensive security consultancy specializing in web application penetration testing, API security testing, vulnerability assessment, and remediation support.",
  areaServed: "Worldwide",
  knowsAbout: [
    "Web Application Penetration Testing",
    "API Security Testing",
    "Vulnerability Assessment",
    "Cloud Security Review",
    "Source Code Review",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

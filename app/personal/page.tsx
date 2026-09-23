import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { PersonalLanding } from "@/components/sections/personal";
import { OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Delete Old Accounts & Clean Your Digital Footprint",
  description:
    "BugSnaps Personal finds the accounts and listings tied to your identity across 100+ platforms, then helps you delete them — consent-first, official flows only.",
  openGraph: {
    title: "BugSnaps Personal — Clean Your Digital Footprint",
    description:
      "Find the accounts you forgot you had, and delete them before someone else uses them. Consent-first, done for you. Free scan.",
    url: "https://bugsnaps.in/personal",
    siteName: "BugSnaps",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
  alternates: { canonical: "https://bugsnaps.in/personal" },
};

export default function PersonalPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <PersonalLanding />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { Container, JsonLd, PageHeader, SiteShell } from "@/components/site/page-parts";
import { ContactForm } from "@/components/sections/contact";
import { LocationMap } from "@/components/site/location-map";
import { absoluteUrl, ORG_ID, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact BugSnaps - Gurugram & Remote Penetration Testing",
  absoluteTitle: true,
  description:
    "Contact BugSnaps in Gurugram, India for remote website penetration testing, API security assessments and scoped expert engagements. View our city-level map.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <SiteShell>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact BugSnaps",
        url: absoluteUrl("/contact"),
        about: { "@id": ORG_ID },
        spatialCoverage: { "@type": "Place", name: "Gurugram, India" },
      }} />
      <PageHeader
        crumbs={[{ name: "Contact", path: "/contact" }]}
        eyebrow="Contact"
        title="Tell us what you're building."
        lead="We reply within one business day with honest advice - even if that advice is that you don't need us yet, or that MyPentest's free tier will do."
      />
      <Container className="py-14 sm:py-20">
        <ContactForm />
        <LocationMap />
      </Container>
    </SiteShell>
  );
}

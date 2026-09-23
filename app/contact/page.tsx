import type { Metadata } from "next";
import { Container, PageHeader, SiteShell } from "@/components/site/page-parts";
import { ContactForm } from "@/components/sections/contact";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact BugSnaps",
  absoluteTitle: true,
  description:
    "Talk to BugSnaps about a penetration test, API or cloud review, or MyPentest for your team. A tester replies within one business day.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Contact", path: "/contact" }]}
        eyebrow="Contact"
        title="Tell us what you're building."
        lead="We reply within one business day with honest advice — even if that advice is that you don't need us yet, or that MyPentest's free tier will do."
      />
      <Container className="py-14 sm:py-20">
        <ContactForm />
      </Container>
    </SiteShell>
  );
}

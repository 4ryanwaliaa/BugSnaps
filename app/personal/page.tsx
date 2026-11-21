import type { Metadata } from "next";
import { Breadcrumbs, JsonLd, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { PersonalLanding } from "@/components/sections/personal";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Delete Old Accounts & Clean Digital Footprints",
  description:
    "BugSnaps Personal finds old accounts and data-broker listings across 100+ platforms and helps you remove them under DPDP Act 2023—consent-first.",
  path: "/personal",
});

const faqs = [
  {
    question: "How does BugSnaps Personal find old accounts and data-broker listings?",
    answer:
      "You share the usernames, emails, and names you have used, and we search 100+ public platforms and data-broker sources to compile a plain-language report.",
  },
  {
    question: "Do you delete accounts without my permission?",
    answer:
      "No. Everything is consent-first under India's DPDP Act 2023. You review the report first and approve every deletion or official recovery flow.",
  },
  {
    question: "What does the free discovery scan include?",
    answer:
      "The free discovery scan checks your confirmed identities across 100+ platforms, checks email breach exposure, and gives you a fixed cleanup quote only if you want it.",
  },
];

export default function PersonalPage() {
  return (
    <SiteShell>
      <JsonLd
        data={serviceJsonLd({
          name: "BugSnaps Personal Digital Footprint Cleanup",
          description:
            "Consent-first personal digital footprint discovery, data-broker opt-out, and official account deletion handled under India's DPDP Act 2023.",
          path: "/personal",
        })}
      />
      <JsonLd data={faqJsonLd(faqs)} />
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 lg:px-8">
        <Breadcrumbs items={[{ name: "BugSnaps Personal", path: "/personal" }]} />
      </div>
      <PersonalLanding />
      <Section labelledBy="personal-faq-title" className="border-t border-white/[0.05]">
        <SectionTitle id="personal-faq-title" eyebrow="FAQ" title="Questions about BugSnaps Personal." />
        <div className="mt-8 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <h3>{faq.question}</h3>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}

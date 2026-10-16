import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Database, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { CONTACT_EMAIL, faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security & Trust: Encryption, Access and Infrastructure",
  description:
    "How BugSnaps protects MyPentest accounts and assessment data: HTTPS, Firebase encryption, account isolation, infrastructure providers and security reporting.",
  path: "/security",
});

const protections = [
  {
    icon: LockKeyhole,
    title: "Encrypted connections",
    description:
      "The BugSnaps website and hosted MyPentest API use HTTPS. Connections to Firebase also use HTTPS/TLS to protect data in transit.",
  },
  {
    icon: Database,
    title: "Encryption at rest",
    description:
      "Firebase provides encryption at rest for Firebase Authentication and Realtime Database, where account information and saved assessment reports are stored.",
  },
  {
    icon: KeyRound,
    title: "Account isolation",
    description:
      "Saved reports and scan progress are organized by account. Firebase database rules restrict customer access to the matching signed-in user, and the API verifies Firebase identity tokens.",
  },
];

const providers = [
  {
    name: "Vercel",
    role: "Website hosting and API proxy",
    assurance: "SOC 2 Type II attestation",
    href: "https://vercel.com/security",
  },
  {
    name: "Render",
    role: "Hosted MyPentest assessment engine",
    assurance: "SOC 2 Type II report",
    href: "https://render.com/security",
  },
  {
    name: "Google Firebase",
    role: "Authentication and saved assessment data",
    assurance: "SOC 2 evaluation; provider-managed encryption",
    href: "https://firebase.google.com/support/privacy",
  },
];

const faqs = [
  {
    question: "Is BugSnaps SOC 2 certified?",
    answer:
      "BugSnaps has not completed its own independent SOC 2 examination. Vercel and Render publish SOC 2 Type II assurance information, and Firebase documents SOC 2 evaluations for its services. Those provider reports cover their services and controls; they do not certify BugSnaps or the MyPentest application.",
  },
  {
    question: "Can another customer read my assessment reports?",
    answer:
      "Customer access to saved reports, exports and progress is restricted by Firebase rules to the matching authenticated account. The hosted API also checks the verified account identity when accessing assessments. This is logical access isolation on shared infrastructure, rather than a separate database for every customer.",
  },
  {
    question: "Is my assessment data end-to-end encrypted?",
    answer:
      "MyPentest uses encrypted transport and provider-managed encryption at rest. It is not an end-to-end encrypted service: the assessment engine processes assessment data, and authorized administrative or infrastructure access is a separate privileged access path.",
  },
  {
    question: "Does BugSnaps have a CSA STAR listing?",
    answer:
      "BugSnaps does not currently claim a CSA STAR listing or certification. STAR Level 1 is a published self-assessment, rather than an independent audit. We will link to an accepted registry entry if one becomes available.",
  },
];

export default function SecurityPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[{ name: "Security & trust", path: "/security" }]}
        eyebrow="Security & trust"
        title="How we protect your assessment data."
        lead="A clear view of the safeguards behind BugSnaps and MyPentest, the infrastructure we use, and the scope of our security assurances."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=BugSnaps%20security%20question`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Ask a security question <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="font-mono text-xs text-muted-2">Last reviewed: October 16, 2026</p>
        </div>
      </PageHeader>

      <Section labelledBy="data-protection-title">
        <SectionTitle id="data-protection-title" eyebrow="Data protection" title="Protection at each step." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {protections.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-white/[0.08] bg-surface p-7">
              <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
          Encryption at rest is managed by our providers. MyPentest processes assessment data to run tests and
          generate reports; authorized administrative access remains possible. See{" "}
          <a href="https://firebase.google.com/support/privacy#data_encryption" className="text-accent hover:underline">
            Firebase&apos;s encryption documentation
          </a>{" "}
          for the provider&apos;s scope.
        </p>
      </Section>

      <Section labelledBy="infrastructure-title" id="infrastructure" className="border-y border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="infrastructure-title"
          eyebrow="Infrastructure assurance"
          title="Built on established cloud providers."
          lead="Our core hosting and identity providers publish their own security and compliance information. Follow the source links to review their scope and report access requirements."
        />
        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[620px] text-left text-sm">
            <caption className="sr-only">Core hosting and identity providers and their published security assurances</caption>
            <thead className="bg-white/[0.03] text-foreground">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Provider</th>
                <th scope="col" className="px-6 py-4 font-medium">Used for</th>
                <th scope="col" className="px-6 py-4 font-medium">Provider assurance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] bg-surface">
              {providers.map((provider) => (
                <tr key={provider.name}>
                  <th scope="row" className="px-6 py-5 font-medium">
                    <a href={provider.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent hover:underline">
                      {provider.name} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">security information (opens in a new tab)</span>
                    </a>
                  </th>
                  <td className="px-6 py-5 leading-relaxed text-muted">{provider.role}</td>
                  <td className="px-6 py-5 leading-relaxed text-muted">{provider.assurance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex gap-3 rounded-xl border border-white/[0.08] px-5 py-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-accent" aria-hidden="true" />
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Provider assurance has a defined scope.</strong>{" "}
            BugSnaps has not completed its own SOC 2 examination. Infrastructure providers&apos; reports do not
            extend an independent audit opinion to our application, configuration or business operations.
          </p>
        </div>
      </Section>

      <Section labelledBy="account-controls-title">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle id="account-controls-title" eyebrow="Your account and reports" title="Access follows your account." />
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
              <p>
                Firebase Authentication handles sign-in. The hosted API verifies identity tokens and checks the
                assessment owner. Saved reports, exports and scan progress use account-scoped database paths
                protected by Firebase access rules.
              </p>
              <p>
                You can delete saved assessment reports from your dashboard. For account deletion or a wider
                data request, contact <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>.
                Provider logs and backups have their own retention; deleting a dashboard report does not promise
                immediate removal from every provider system.
              </p>
              <Link href="/privacy" className="inline-flex items-center gap-2 font-medium text-accent hover:underline">
                Read our privacy policy <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Authorized testing</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">Scope comes before a scan.</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              MyPentest requires account-bound DNS TXT domain verification. Test only systems you own or have
              written permission to assess, and use dedicated test accounts for authenticated testing.
            </p>
            <Link href="/security-readiness" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              Assessment safeguards and limits <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      <Section labelledBy="security-faq-title" className="border-t border-white/[0.05]">
        <SectionTitle id="security-faq-title" eyebrow="Assurance & transparency" title="Clear answers for your security review." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-surface">
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

      <Section labelledBy="security-contact-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="security-contact-title"
          eyebrow="Security contact"
          title="Found something we should investigate?"
          lead="Send a private vulnerability report with the affected URL, reproduction steps and the minimum evidence needed. Avoid including other customers' data or live credentials."
        />
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <a href={`mailto:${CONTACT_EMAIL}?subject=BugSnaps%20vulnerability%20report`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>
          <Link href="/responsible-disclosure" className="inline-flex items-center gap-2 text-accent hover:underline">
            Responsible disclosure policy <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Section>
    </SiteShell>
  );
}

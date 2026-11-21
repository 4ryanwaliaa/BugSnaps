import type { Metadata } from "next";
import Link from "@/components/site/content-link";
import { CtaBand, JsonLd, PageHeader, Prose, Section, SiteShell } from "@/components/site/page-parts";
import { MYRECON_URL, aboutPageJsonLd, pageMetadata, personJsonLd } from "@/lib/site";
import { SecurityReviewFigure } from "@/components/site/security-review-figure";

export const metadata: Metadata = pageMetadata({
  title: "About BugSnaps: Automated & Expert Pentesting",
  absoluteTitle: true,
  description:
    "BugSnaps builds MyPentest, PhishLens, EndpointRadar, and MyRecon, and runs CEH-led penetration tests grounded in verifiable evidence.",
  path: "/about",
});

const PRINCIPLES = [
  {
    title: "Test, don't guess",
    body: "A finding needs evidence. Anything we can't show, we call a lead - not a vulnerability.",
  },
  {
    title: "Evidence over hype",
    body: "Founded by CEH-certified tester Aryan Walia, we ship four live tools, publish security.txt, and maintain open-source EndpointRadar—with zero fabricated metrics or logos.",
  },
  {
    title: "Safe by default",
    body: "We test only what you've authorised, non-destructively, and say plainly what we didn't cover.",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <JsonLd
        data={aboutPageJsonLd({
          name: "About BugSnaps",
          description:
            "BugSnaps builds MyPentest, PhishLens, EndpointRadar, and MyRecon, and runs CEH-led penetration tests grounded in verifiable evidence.",
        })}
      />
      <JsonLd data={personJsonLd()} />
      <PageHeader
        crumbs={[{ name: "About", path: "/about" }]}
        eyebrow="About"
        title="A penetration-testing company that builds its own tools."
        lead="BugSnaps combines CEH-led offensive security engagements with four live tools built in-house: MyPentest for web & API pentesting, PhishLens for link inspection, open-source EndpointRadar for Windows posture, and MyRecon for OSINT."
      />

      <Section labelledBy="story-title">
        <Prose>
          <h2 id="story-title">What we do</h2>
          <p>
            Our focus is penetration testing - finding the vulnerabilities an attacker would use, proving they&apos;re
            real, and explaining how to close them. We do that two ways:
          </p>
          <ul>
            <li>
              <strong>Automated</strong>, with <Link href="/mypentest">MyPentest</Link>: it maps a web app&apos;s attack
              surface and tests it, on demand, for the teams that ship every week.
            </li>
            <li>
              <strong>Expert-led</strong>, with our <Link href="/services">security services</Link>: scoped, manual
              engagements for business logic, compliance, and anything with real money or data at stake.
            </li>
          </ul>
          <p>
            BugSnaps also builds <Link href="/phishing-detector">PhishLens</Link> for browser-first suspicious URL review,
            open-source <Link href="/endpointradar">EndpointRadar</Link> (Python 3.10+ Windows posture scanner), and{" "}
            <a href={MYRECON_URL}>MyRecon</a> at myrecon.xyz for OSINT research.
          </p>

          <h2>Who&apos;s behind it</h2>
          <p>
            BugSnaps was founded by Aryan Walia, a CEH-certified penetration tester. You&apos;ll work directly with the
            people who test your systems, not an account manager in between. Want to join us? See{" "}
            <Link href="/careers">careers</Link>.
          </p>

          <h2>How we work</h2>
        </Prose>
        <ul className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="spot rounded-2xl border border-white/[0.07] bg-surface p-5">
              <h3 className="text-[15px] font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
        <Prose>
          <p>
            Found a vulnerability in something of ours? Please tell us - see our{" "}
            <Link href="/responsible-disclosure">responsible disclosure policy</Link> or our{" "}
            <a href="/.well-known/security.txt">RFC 9116 security.txt</a>.
          </p>
        </Prose>
      </Section>

      <Section labelledBy="review-workflow-title" className="border-t border-white/5">
        <h2 id="review-workflow-title" className="text-2xl font-semibold">Security work that continues after the report.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Review the observed evidence, assign remediation to your team and retest the affected paths. Our <Link href="/improvements" className="text-accent hover:underline">security improvement checklist</Link> and <Link href="/why-bugsnaps" className="text-accent hover:underline">product fit guide</Link> explain how to evaluate that workflow.
        </p>
        <SecurityReviewFigure className="mt-7 max-w-4xl" />
      </Section>

      <CtaBand />
    </SiteShell>
  );
}

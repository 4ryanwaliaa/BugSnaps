import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHeader, Prose, Section, SiteShell } from "@/components/site/page-parts";
import { MYRECON_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About BugSnaps - Penetration Testing Company",
  absoluteTitle: true,
  description:
    "BugSnaps is a young cybersecurity company focused on penetration testing. We build MyPentest and MyRecon and run expert-led engagements, without inflated claims.",
  path: "/about",
});

const PRINCIPLES = [
  {
    title: "Test, don't guess",
    body: "A finding needs evidence. Anything we can't show, we call a lead - not a vulnerability.",
  },
  {
    title: "Honest about what we are",
    body: "We're a new company. No inflated metrics, no borrowed logos, no testimonials we can't back.",
  },
  {
    title: "Safe by default",
    body: "We test only what you've authorised, non-destructively, and say plainly what we didn't cover.",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "About", path: "/about" }]}
        eyebrow="About"
        title="A penetration-testing company that builds its own tools."
        lead="BugSnaps started as offensive security work for growing businesses. The tools we built to do that work well became products: MyPentest for automated testing, MyRecon for reconnaissance."
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
            Reconnaissance sits underneath both. <a href={MYRECON_URL}>MyRecon</a>, our OSINT platform at myrecon.xyz,
            is where that work is available on its own.
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
            <Link href="/responsible-disclosure">responsible disclosure policy</Link>.
          </p>
        </Prose>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}

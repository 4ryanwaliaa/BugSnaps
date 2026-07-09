import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Responsible Disclosure",
  description: "How to report a security vulnerability in BugSnaps's own systems.",
};

export default function ResponsibleDisclosurePage() {
  return (
    <LegalPage title="Responsible Disclosure" updated="July 2026">
      <section>
        <h2>We welcome reports</h2>
        <p className="mt-3">
          We hold ourselves to the standard we test others against. If you believe you have
          found a security vulnerability in a BugSnaps-owned system, we want to hear from you —
          and we will treat your report with the respect we&apos;d expect for our own.
        </p>
      </section>
      <section>
        <h2>How to report</h2>
        <p className="mt-3">
          Email{" "}
          <a href="mailto:aryan@bugsnaps.in" className="text-accent hover:underline">
            aryan@bugsnaps.in
          </a>{" "}
          with a description of the issue, steps to reproduce, and any relevant proof of
          concept. We acknowledge reports within 2 business days and aim to provide a
          resolution timeline within 5.
        </p>
      </section>
      <section>
        <h2>Ground rules</h2>
        <ul className="mt-3">
          <li>Do not access, modify, or exfiltrate data that isn&apos;t yours.</li>
          <li>Do not degrade service availability (no denial-of-service testing).</li>
          <li>Give us reasonable time to remediate before public disclosure.</li>
          <li>Only test systems owned and operated by BugSnaps.</li>
        </ul>
      </section>
      <section>
        <h2>Safe harbor</h2>
        <p className="mt-3">
          We will not pursue legal action against researchers who act in good faith, follow
          these guidelines, and report findings promptly and privately.
        </p>
      </section>
    </LegalPage>
  );
}

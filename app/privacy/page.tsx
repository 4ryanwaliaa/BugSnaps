import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BugSnaps collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 2026">
      <section>
        <h2>Overview</h2>
        <p className="mt-3">
          BugSnaps Security Ltd. (&ldquo;BugSnaps&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is
          committed to protecting the privacy of our clients and website visitors. This policy
          describes what information we collect, why we collect it, and how we handle it.
        </p>
      </section>
      <section>
        <h2>Information we collect</h2>
        <ul className="mt-3">
          <li>Contact details you submit through our forms (name, email, company).</li>
          <li>Engagement-related information you share with us during scoping and testing.</li>
          <li>Basic, privacy-respecting analytics about how our website is used.</li>
        </ul>
      </section>
      <section>
        <h2>How we use it</h2>
        <p className="mt-3">
          We use your information solely to respond to inquiries, deliver contracted services,
          and improve our website. We do not sell personal data, and we do not share it with
          third parties except as required to deliver our services or comply with law.
        </p>
      </section>
      <section>
        <h2>Client data during engagements</h2>
        <p className="mt-3">
          Data accessed during security testing is treated as strictly confidential, handled
          under the terms of our engagement agreement and NDA, stored encrypted, and securely
          destroyed after the retention period agreed in your contract.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p className="mt-3">
          Questions about this policy? Email{" "}
          <a href="mailto:aryan@bugsnaps.in" className="text-accent hover:underline">
            aryan@bugsnaps.in
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}

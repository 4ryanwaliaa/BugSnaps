import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of BugSnaps's website and services.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 2026">
      <section>
        <h2>Agreement</h2>
        <p className="mt-3">
          By using this website you agree to these terms. Security testing services are governed
          by a separate written engagement agreement, statement of work, and rules of engagement
          signed by both parties before any testing begins.
        </p>
      </section>
      <section>
        <h2>Services</h2>
        <p className="mt-3">
          BugSnaps provides offensive security services including penetration testing,
          vulnerability assessment, and remediation support. All testing is performed only
          against systems for which the client has provided documented authorization.
        </p>
      </section>
      <section>
        <h2>Confidentiality</h2>
        <p className="mt-3">
          Engagement findings, reports, and client data are confidential. We are happy to
          execute a mutual NDA before any scoping conversation.
        </p>
      </section>
      <section>
        <h2>Website content</h2>
        <p className="mt-3">
          Content on this site is provided for general information and does not constitute
          security advice for your specific situation. Case study details are anonymized and
          metrics may be aggregated.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p className="mt-3">
          Questions about these terms? Email{" "}
          <a href="mailto:aryan@bugsnaps.in" className="text-accent hover:underline">
            aryan@bugsnaps.in
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}

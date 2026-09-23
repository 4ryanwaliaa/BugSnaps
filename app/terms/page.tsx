import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms governing use of the BugSnaps website, MyPentest and BugSnaps security services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 2026">
      <section>
        <h2>Agreement</h2>
        <p className="mt-3">
          By using this website or MyPentest you agree to these terms. Expert-led security testing services are
          governed by a separate written engagement agreement, statement of work, and rules of engagement signed by
          both parties before any testing begins.
        </p>
      </section>
      <section>
        <h2>MyPentest: authorised targets only</h2>
        <p className="mt-3">
          You may use MyPentest only against systems you own or have written permission to test. Before any
          assessment, MyPentest requires you to prove control of the domain with a DNS record and to confirm your
          authorisation. You are responsible for that authorisation. Testing systems without permission is illegal
          in most countries; we will suspend accounts used that way and may report abuse.
        </p>
      </section>
      <section>
        <h2>MyPentest: the service</h2>
        <p className="mt-3">
          MyPentest is free during its launch period, within published usage limits that may change. Paid plans, when
          introduced, will be announced before they apply to you. MyPentest runs non-destructive checks, but no
          automated tool finds every vulnerability; results are provided as-is and do not replace a manual penetration
          test. Run assessments against staging environments where you can.
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
          Content on this site is provided for general information and does not constitute security advice for your
          specific situation. Example reports are clearly labelled and come from our own test applications.
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

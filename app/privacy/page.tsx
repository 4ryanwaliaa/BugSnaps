import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How BugSnaps collects, uses and protects your information, including MyPentest accounts and assessment data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 8, 2026">
      <section>
        <h2>Overview</h2>
        <p className="mt-3">
          BugSnaps Security Ltd. (&ldquo;BugSnaps&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is
          committed to protecting the privacy of our clients, MyPentest users and website visitors. This
          policy describes what information we collect, why we collect it, and how we handle it.
        </p>
      </section>
      <section>
        <h2>Information we collect</h2>
        <ul className="mt-3">
          <li>Contact details you submit through our forms (name, email, company).</li>
          <li>Engagement-related information you share with us during scoping and testing.</li>
          <li>MyPentest account details: your email address, display name and sign-in provider.</li>
          <li>MyPentest assessment data: the domains you verify, how you configure assessments, and their results.</li>
          <li>Standard request logs kept by our hosting providers (such as IP address and pages requested) for security and reliability.</li>
          <li>With your permission, Google Analytics collects public-page visits and basic browser, device and approximate location information.</li>
        </ul>
      </section>
      <section>
        <h2>MyPentest</h2>
        <ul className="mt-3">
          <li>
            Sign-in is provided by Firebase Authentication (Google). Your password, if you use one, is handled by
            Firebase and never stored by us.
          </li>
          <li>
            Test-account credentials you supply for signed-in testing are used only during that assessment, held
            in memory by the testing engine, and not included in reports.
          </li>
          <li>
            The testing engine keeps a running or finished assessment for up to 24 hours. Finished reports are saved
            to your private history in the Firebase Realtime Database, readable only by your account. You can delete
            any report from your dashboard at any time.
          </li>
          <li>We do not sell assessment results or share them with anyone else.</li>
        </ul>
      </section>
      <section>
        <h2>How we use it</h2>
        <p className="mt-3">
          We use your information solely to respond to inquiries, provide MyPentest, deliver contracted services,
          keep our services secure, and improve our website. We do not sell personal data, and we do not share it
          with third parties except the providers that run our services, or where the law requires it.
        </p>
      </section>
      <section>
        <h2>Browser storage and cookies</h2>
        <p className="mt-3">
          Essential browser storage supports MyPentest sign-in, payment verification after a page reload, and your
          cookie choice. It remains available when you choose “Essential only.” Google Analytics loads only after
          you choose “Allow analytics” and uses first-party analytics cookies to help us understand visits to our public pages.
          We do not use advertising tracking or Google Signals.
        </p>
        <p className="mt-3">
          Analytics excludes the private MyPentest app, assessment targets, account details, form contents, URL query
          strings and fragments. Google processes analytics data as our service provider. See{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s privacy policy</a>.
          You can withdraw permission at any time through Cookie settings in the footer by choosing “Essential only.”
          This stops analytics and removes its cookies from this site; it does not remove data already collected by Google.
        </p>
        <p className="mt-3">
          We no longer store a billing-period preference. Firebase Authentication, Razorpay and PayPal may use their own
          storage while you sign in or pay.
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
          Questions about this policy, or want your data deleted? Email{" "}
          <a href="mailto:aryan@bugsnaps.in" className="text-accent hover:underline">
            aryan@bugsnaps.in
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}

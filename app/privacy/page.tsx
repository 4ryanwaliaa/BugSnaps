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
    <LegalPage title="Privacy Policy" updated="September 2026">
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
          cookie choice. It remains available when you choose “Essential only.” We do not add advertising or analytics
          cookies to our pages.
        </p>
        <p className="mt-3">
          If you choose “Sounds good,” we also remember whether you prefer monthly or yearly prices on the public
          pricing page. “Essential only” removes that saved preference. You can change your choice at any time through
          Cookie settings in the footer. Firebase Authentication and Razorpay may use their own storage while you
          sign in or pay.
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

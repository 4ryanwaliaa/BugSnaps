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
    <LegalPage title="Privacy Policy" updated="October 28, 2026">
      <section>
        <h2>Overview</h2>
        <p className="mt-3">
          BugSnaps (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is
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
          <li>PhishLens team account and review data that you choose to submit, including links, senders, message text, decisions and notes.</li>
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
            Running assessments remain available while they are processed. Finished assessments become eligible
            for engine cleanup after the configured retention period (24 hours by default); cleanup runs on subsequent
            assessment activity, so this is not a guaranteed deletion deadline. Saved reports remain in your
            account-scoped Firebase Realtime Database history until deleted. Database rules restrict customer access
            to the matching authenticated account; privileged administrative and provider access is separate.
            You can delete saved reports from your dashboard.
          </li>
          <li>
            We do not sell assessment results or publish them. Our service providers process data to deliver the
            service. If you request an emailed report, Brevo processes your recipient address and the report PDF
            attachment. Downloaded or emailed copies are not removed when you delete a dashboard report.
          </li>
        </ul>
      </section>
      <section>
        <h2>PhishLens</h2>
        <p className="mt-3">
          PhishLens reviews the link you enter in your browser without sending it to BugSnaps or visiting the
          destination. If you choose the optional DNS filtering check, your browser sends the hostname and your
          IP address directly to Cloudflare’s DNS resolvers; the link’s path and query are not sent. DNS resolution
          can also involve the domain’s authoritative DNS provider. Cloudflare handles this data under its own{" "}
          <a href="https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/" className="text-accent hover:underline">DNS privacy policy</a>.
          If you choose a PhishDestroy threat intelligence lookup, your browser sends the hostname and your IP address
          directly to PhishDestroy’s API. It does not receive the link’s path or query. PhishDestroy processes requests
          under its own <a href="https://phishdestroy.io/privacy" className="text-accent hover:underline">privacy policy</a>.
          Browser and network providers may handle their own request logs.
          Optional batch lookups send only the eligible hostnames shown in your batch. A deeper investigation may
          cause PhishDestroy to query DNS and registry RDAP services. The local inspection inputs and results remain in page memory;
          the inspector does not automatically save them to your account or browser storage. Downloaded reports are saved to your device
          and include hostnames, findings and available provider evidence, while omitting complete URLs, credentials,
          paths, queries and fragments. Review exported evidence before sharing it.
        </p>
        <p className="mt-3">
          If you use the optional team inbox, Firebase Authentication handles sign-in and Firebase Realtime Database
          stores the information you submit: full links, sender details, message text, team membership, review decisions,
          action notes and timestamps. Every member of that team can read its submissions; administrators manage team
          membership and decisions. Provider and privileged administrative access is separate. Do not submit passwords,
          one-time codes or information your team is not authorized to store. Team records remain stored until removed;
          team administrators can delete individual reports, or you can contact BugSnaps to request removal. Copies already shared or downloaded are separate.
        </p>
      </section>
      <section>
        <h2>EndpointRadar</h2>
        <p className="mt-3">
          The local import workspace reads files in the current browser tab. The optional managed workspace
          uses Firebase sign-in and stores client workspace names, membership and invitation email addresses,
          device names, reporting schedules, security posture evidence, findings and timestamps. The Windows
          reporting helper sends this data to BugSnaps over HTTPS after an administrator enrolls the device.
          It omits the full installed-software inventory. Workspace administrators and invited viewers can read
          that workspace&apos;s results; administrators manage membership, enrollment and schedules. Privileged
          administrative and provider access is separate.
        </p>
        <p className="mt-3">
          The service retains up to ten accepted scans per device and bounded alert history. Workspace and
          device records otherwise remain stored until removed; contact BugSnaps to request deletion.
          Revoking a device prevents future reporting and does not erase its history. Downloaded PDF copies
          remain on the recipient&apos;s device. Review reports before sharing them. Device credentials are stored
          as digests on the service; the helper protects its local credential with Windows account encryption.
        </p>
      </section>
      <section>
        <h2>How we use it</h2>
        <p className="mt-3">
          We use your information solely to respond to inquiries, provide our products, deliver contracted services,
          keep our services secure, and improve our website. We do not sell personal data, and we do not share it
          with third parties except the providers that run our services, or where the law requires it.
        </p>
      </section>
      <section>
        <h2>Infrastructure and data protection</h2>
        <p className="mt-3">
          Vercel hosts the website and API proxy, Render runs the hosted assessment engine, and Google Firebase
          provides authentication and saved assessment storage. Connections to these services use HTTPS/TLS;
          Firebase Authentication and Realtime Database provide provider-managed encryption at rest. MyPentest
          processes assessment data and does not provide end-to-end encryption. Provider logs and backups follow
          their own retention policies. Read our <a href="/security" className="text-accent hover:underline">security page</a>{" "}
          for details and provider sources.
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

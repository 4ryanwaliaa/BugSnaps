import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { CONTACT_EMAIL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Refund and Cancellation Policy",
  description:
    "MyPentest payments are one-time with no subscription. If a paid scan can't complete or a report you paid to unlock is gone, you get the scan back or your money back.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund and Cancellation Policy" updated="November 2026">
      <section>
        <h2>The short version</h2>
        <p className="mt-3">
          You pay once. Nothing renews and nothing is charged again. If what you paid for doesn&apos;t work because of
          us, you get it again or you get your money back.
        </p>
      </section>
      <section>
        <h2>What you can buy</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Report unlock</strong>: shows the critical and high findings a free scan counted but didn&apos;t
            detail, in that same report.
          </li>
          <li>
            <strong>Scan packs</strong> (Plus, Operator): a number of full scans that never expire. A pack bought from
            a free report also unlocks that report.
          </li>
        </ul>
        <p className="mt-3">
          There is no subscription and no automatic renewal, so there is nothing to cancel. Unused scans stay on your
          account.
        </p>
      </section>
      <section>
        <h2>When you get a refund or your scan back</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>A paid scan can&apos;t complete</strong> because of a fault on our side (the engine fails, stops or
            restarts mid-scan): we return the scan to your account, or refund it if you prefer.
          </li>
          <li>
            <strong>A report you paid to unlock is no longer available</strong> when the payment is confirmed:
            MyPentest adds one full scan to your account automatically. If you&apos;d rather have the money back, ask
            and we refund it.
          </li>
          <li>
            <strong>You were charged twice</strong> for the same purchase: we refund the duplicate in full.
          </li>
        </ul>
        <p className="mt-3">
          Ask within 7 days of the payment by writing to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with
          your payment or order ID. We reply within 2 business days. Approved refunds go back to the original payment
          method; your bank or PayPal usually shows them within 5 to 7 business days.
        </p>
      </section>
      <section>
        <h2>When a refund doesn&apos;t apply</h2>
        <p className="mt-3">
          A scan that completed is not refunded because of what it found or didn&apos;t find: no automated tool finds
          every vulnerability, and results depend on what your site exposes to the scan. Scans that couldn&apos;t
          reach your site because of its own settings (it blocked our requests, went offline, or the DNS record was
          removed) are not a fault on our side, but write to us anyway and we&apos;ll look at what happened.
        </p>
      </section>
      <section>
        <h2>Manual penetration tests</h2>
        <p className="mt-3">
          Expert-led engagements are quoted in writing per scope. Their payment, cancellation and refund terms are in
          the engagement agreement you sign before testing starts.
        </p>
      </section>
    </LegalPage>
  );
}

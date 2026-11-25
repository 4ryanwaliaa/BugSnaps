import type { Metadata } from "next";
import { Download } from "lucide-react";
import Link from "@/components/site/content-link";
import { PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { pageMetadata } from "@/lib/site";

const path = "/website-security-checklist";

export const metadata: Metadata = pageMetadata({
  title: "Website Security Checklist Before Launch",
  description:
    "Use this pre-launch website security checklist for HTTPS, admin access, backups and alerts. Download a free CSV to record checks and sign off on a release.",
  path,
});

const smallBusinessGuide = {
  label: "NIST small-business cybersecurity guidance",
  href: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf",
};

const checks = [
  {
    title: "Domain, hosting and admin ownership",
    action: "List who owns the registrar, DNS, hosting, code repository and content management accounts. Confirm the organization controls recovery email addresses. Require multifactor authentication for administrators, remove former staff and give each person the access their role needs.",
    evidence: "A dated access review with named owners and recovery arrangements. Store recovery codes separately in a restricted vault.",
    source: smallBusinessGuide,
  },
  {
    title: "HTTPS and certificates",
    action: "Open each public hostname in a browser and confirm its HTTPS certificate is trusted. Check the hosting configuration or edge logs for the HTTP-to-HTTPS redirect because browsers can upgrade the connection themselves. On the final page, check that scripts, styles and images load over HTTPS. Assign a certificate renewal owner.",
    evidence: "The hostnames reviewed, redirect destinations, certificate expiration dates and any mixed-content errors.",
    source: {
      label: "MDN guide to TLS configuration",
      href: "https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/TLS",
    },
  },
  {
    title: "Browser security headers and session cookies",
    action: "In your browser’s developer tools, compare the homepage and representative signed-in pages with your intended header policy. Review Content Security Policy and framing rules for those pages. If the site uses sessions, sign in with a test account and confirm the session cookie has Secure, HttpOnly and a SameSite setting appropriate for the sign-in flow.",
    evidence: "The routes reviewed, header and cookie attribute names, and whether normal sign-in and sign-out worked. Redact cookie values.",
    source: {
      label: "MDN guide to secure cookie configuration",
      href: "https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies",
    },
  },
  {
    title: "Production settings and private data",
    action: "Review the production configuration and list of files intended for deployment. Keep secrets in server-side configuration, disable production debug output and confirm access controls on draft previews. Use a test account and synthetic data to review what a normal form submission displays and stores.",
    evidence: "A configuration review ticket naming the deployment and the controls reviewed. Keep credentials, tokens and customer data out of the release record.",
    source: {
      label: "OWASP Secrets Management Cheat Sheet",
      href: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
    },
  },
  {
    title: "Backups, recovery and rollback",
    action: "Identify the content, databases and settings needed to restore the site. Restore a recent backup into a separate recovery environment, then verify that key pages open and sample data is present. Document who can roll back the release and how long the recovery took.",
    evidence: "A dated restore record, recovery duration, deployment rollback reference and the name of the recovery owner.",
    source: smallBusinessGuide,
  },
  {
    title: "Monitoring and incident ownership",
    action: "Use your monitoring provider’s test notification to confirm the on-call person receives it. Check that the team can find authentication and admin-change logs and that access to those logs is restricted. Confirm the owner and backup contact for launch day.",
    evidence: "The test notification time, who acknowledged it and a link to the team’s response instructions. Leave credentials and customer records out of alert messages.",
    source: {
      label: "OWASP Logging Cheat Sheet",
      href: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html",
    },
  },
];

const decisions = [
  {
    title: "Ready to launch",
    description: "Required checks passed for this release, the recovery owner is available and the release approver has reviewed the evidence.",
  },
  {
    title: "Launch with a documented exception",
    description: "The release approver accepts a specific, low-impact gap. Record who accepted it, what limits the risk, who will fix it and when the team will review it again.",
  },
  {
    title: "Hold the release",
    description: "Pause for blockers such as broken HTTPS on a required hostname, exposed private data, an unowned privileged account or a failed recovery rehearsal for critical data. Assign a fix owner and repeat the affected checks before seeking approval.",
  },
];

const headerObservations = [
  { url: "http://bugsnaps.in/", status: 308, result: "Redirected to the HTTPS homepage." },
  { url: "https://bugsnaps.in/", status: 200, result: "Returned the common browser protection headers." },
  { url: "https://bugsnaps.in/contact", status: 200, result: "Returned the common headers with permission to load the contact page’s map." },
  { url: "https://bugsnaps.in/website-security-checklist", status: 200, result: "Returned the common browser protection headers." },
];

export default function WebsiteSecurityChecklistPage() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[
          { name: "Resources", path: "/resources" },
          { name: "Website security checklist", path },
        ]}
        title="Website Security Checklist Before Launch"
        lead="Before going live, confirm who controls your site, check HTTPS and browser protections, rehearse recovery and decide who can approve the release. Use the checklist on a site you manage and keep the evidence with the deployment record."
      >
        <a
          href="/templates/website-security-release-checklist.csv"
          download
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          <Download className="h-4 w-4" aria-hidden="true" /> Download the release checklist (CSV)
        </a>
      </PageHeader>

      <Section labelledBy="pre-launch-checks-title">
        <SectionTitle
          id="pre-launch-checks-title"
          title="Six checks to record before launch"
          lead="Start with the release ID, environment and public hostnames. Keep one row per check and asset, then give it an owner, an observed result and a reference to the evidence."
        />
        <ol className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {checks.map(({ title, action, evidence, source }, index) => (
            <li key={title} className="grid gap-4 py-7 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_minmax(0,1.45fr)] md:gap-8">
              <h3 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight">
                <span aria-hidden="true" className="font-mono text-sm text-accent">{index + 1}.</span>
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{action}</p>
              <div>
                <p className="text-sm leading-relaxed text-muted">
                  <strong className="block text-foreground">Evidence to keep</strong>
                  {evidence}
                </p>
                <a href={source.href} className="mt-2 inline-block text-sm text-accent underline underline-offset-4">
                  {source.label}
                </a>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
          For a broader application security review, use the requirements in the{" "}
          <a href="https://asvs.owasp.org/" className="text-accent underline underline-offset-4">
            OWASP Application Security Verification Standard
          </a>.
        </p>
      </Section>

      <Section id="http-security-headers-example" labelledBy="header-evidence-title" className="border-t border-white/[0.05]">
        <SectionTitle
          id="header-evidence-title"
          title="How to verify HTTP security headers after deployment"
          lead={<>On <time dateTime="2026-11-26">November 26, 2026</time>, BugSnaps made one anonymous GET request to each of these public production URLs and recorded the first response.</>}
        />
        <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {headerObservations.map(({ url, status, result }) => (
            <div key={url} className="grid gap-2 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6">
              <dt className="break-all text-sm font-medium"><code>{url}</code></dt>
              <dd className="text-sm leading-relaxed text-muted">
                <span className="mr-2 font-mono font-semibold text-foreground">{status}</span>
                {result}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Each HTTPS response included <code>Strict-Transport-Security</code>, an enforced <code>Content-Security-Policy</code>,{" "}
            <code>X-Content-Type-Options</code>, <code>Referrer-Policy</code> and <code>Permissions-Policy</code>.
            The contact page used <code>frame-src</code> to allow its map. All three used <code>frame-ancestors</code> to prevent other pages from embedding them. The two directives control opposite directions of framing.
          </p>
          <p>
            To check your own site, open a private browser window and use the Network panel in developer tools. Reload a public page, choose the main document request and inspect Response headers. Repeat for a page with an expected integration. Record the URL, status, date and whether the expected headers are present. Keep cookie values out of shared records. If the browser already upgrades HTTP, confirm the redirect in your hosting configuration or logs.
          </p>
          <p>
            These observations cover four initial requests. Sign-in, in-browser behavior and other routes require their own checks. For sign-in, use the{" "}
            <Link href="/guides/secure-cookie-attribute-review" className="text-accent underline underline-offset-4">session cookie checklist</Link>.
          </p>
          <p>
            See MDN’s references for{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-src" className="text-accent underline underline-offset-4"><code>frame-src</code></a>
            {" and "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors" className="text-accent underline underline-offset-4"><code>frame-ancestors</code></a>.
          </p>
        </div>
      </Section>

      <Section labelledBy="release-decision-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="release-decision-title"
          title="Decide whether to release"
          lead="Mark each check Pass, Fail, Deferred or Not applicable. Explain the reason for deferred or inapplicable checks, and link any release exception to its approval."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {decisions.map(({ title, description }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-surface p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
          After switching DNS or promoting a deployment, open the live site and verify the final hostname, HTTPS, key pages and normal sign-in if applicable. Record the post-launch observations against the same release ID.
        </p>
      </Section>
    </SiteShell>
  );
}

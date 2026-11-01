import { ProductReading } from "@/components/site/product-reading";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileJson, Laptop, LockKeyhole, Radar, ShieldCheck } from "lucide-react";
import { Breadcrumbs, JsonLd, Section, SiteShell } from "@/components/site/page-parts";
import { ORG_ID, SITE_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Free Windows Endpoint Security Scanner | EndpointRadar",
  description: "Check Windows security posture for free. Scan locally or remotely over WinRM, then review firewall, antivirus and update findings in your browser.",
  path: "/endpointradar",
});

const steps = [
  { n: "01", title: "Run a local scan", body: "Install the open-source Windows scanner and run it on a machine you are authorised to assess." },
  { n: "02", title: "Open the report", body: "Import the resulting JSON into the web workspace. Your report is read in your browser." },
  { n: "03", title: "Prioritise the work", body: "Review the risk level, filter findings and use the supplied remediation guidance to plan your next steps." },
];

export default function EndpointRadarPage() {
  const managedReady = process.env.ENDPOINTRADAR_DATABASE_LOCKED === "true";
  return (
    <SiteShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "EndpointRadar", applicationCategory: "SecurityApplication", operatingSystem: "Windows, Web", url: `${SITE_URL}/endpointradar`, description: "Free, open-source Windows endpoint security posture scanner with local and agentless WinRM options and a browser-based report viewer.", publisher: { "@id": ORG_ID } }} />
      <div className="relative overflow-hidden border-b border-white/[0.07]">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />
        <div aria-hidden="true" className="absolute -top-28 right-0 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pt-28 pb-20 sm:pt-36 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8">
          <div>
            <Breadcrumbs items={[{ name: "Products", path: "/products" }, { name: "EndpointRadar", path: "/endpointradar" }]} />
            <p className="mt-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[.2em] text-blue-400"><Radar className="h-4 w-4" /> EndpointRadar · by BugSnaps</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Free Windows endpoint security scanner.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">Check firewall, antivirus, updates and more with a read-only Windows posture scan. Review findings in the free browser workspace and plan your next steps.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/endpointradar/app" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-blue-500">Open free workspace <ArrowRight className="h-4 w-4" /></Link>
              {managedReady && <a href="/endpointradar/managed" className="inline-flex h-12 items-center gap-2 rounded-full border border-blue-400/30 px-6 text-sm font-semibold text-blue-200 hover:bg-blue-500/10">Manage clients <ArrowRight className="h-4 w-4" /></a>}
              <a href="https://github.com/4ryanwalia/EndpointRadar" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-medium hover:bg-white/5">Get the Windows scanner <ArrowUpRight className="h-4 w-4" /></a>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-2">Open-source scanner · Free browser workspace · No account needed</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#11151c] p-5 shadow-2xl shadow-black/30 sm:p-7" aria-label="Illustration of an EndpointRadar report">
            <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="font-mono text-[11px] uppercase tracking-[.18em] text-blue-400">Posture overview</p><p className="mt-2 text-lg font-semibold">Your endpoint, in focus</p></div><Radar className="h-9 w-9 text-blue-400" /></div>
            <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-blue-400/15 bg-blue-400/[.06] p-5"><ShieldCheck className="h-5 w-5 text-blue-400" /><p className="mt-5 text-sm font-medium">Security posture</p><p className="mt-1 text-xs leading-relaxed text-muted">Risk level and drivers</p></div><div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><FileJson className="h-5 w-5 text-emerald-400" /><p className="mt-5 text-sm font-medium">Actionable findings</p><p className="mt-1 text-xs leading-relaxed text-muted">Evidence and suggested fixes</p></div></div>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 px-4 py-4 text-sm text-muted"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Scan locally. Review the report in your browser.</div>
          </div>
        </div>
      </div>
      <Section labelledBy="how-it-works">
        <p className="font-mono text-xs uppercase tracking-[.2em] text-blue-400">How it works</p>
        <h2 id="how-it-works" className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">From a local scan to a clearer next step.</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">{steps.map((step) => <li key={step.n} className="rounded-2xl border border-white/[.08] bg-surface p-6"><span className="font-mono text-xs text-blue-400">{step.n}</span><h3 className="mt-5 text-lg font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p></li>)}</ol>
      </Section>
      <Section labelledBy="coverage" className="border-t border-white/[.07] bg-surface/40">
        <div className="grid gap-10 lg:grid-cols-2"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-blue-400">Windows posture</p><h2 id="coverage" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">The checks that make a difference.</h2><p className="mt-5 max-w-lg leading-relaxed text-muted">The local scanner examines antivirus, firewall profiles, patching, listening ports, services and installed software. Visibility depends on permissions and the machine being scanned.</p></div><div className="rounded-2xl border border-white/10 bg-background p-7"><Laptop className="h-6 w-6 text-blue-400" /><h3 className="mt-5 text-lg font-semibold">Built for a point-in-time view</h3><p className="mt-3 text-sm leading-relaxed text-muted">EndpointRadar is a read-only posture scanner, not an always-on monitoring or remediation service. The website displays an existing report; it cannot scan your device or network directly.</p><a href="https://github.com/4ryanwalia/EndpointRadar#readme" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:underline">Read scanner documentation <ArrowUpRight className="h-4 w-4" /></a></div></div>
      </Section>
      <Section labelledBy="agentless-edr" className="border-t border-white/[.07]">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.2em] text-blue-400">Agentless Windows scanning</p>
            <h2 id="agentless-edr" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Review an endpoint without a permanent agent.</h2>
            <p className="mt-5 leading-relaxed text-muted">For an authorized remote Windows host, EndpointRadar can stage a temporary scanner over WinRM and retrieve a point-in-time report without installing a persistent agent. Remote scanning requires configured WinRM, credentials, Python on the target, and the scanner&apos;s remote dependencies.</p>
            <a href="https://github.com/4ryanwalia/EndpointRadar#remote-scanning-over-winrm" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:underline">See remote scanning requirements <ArrowUpRight className="h-4 w-4" /></a>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface p-7">
            <h3 className="text-lg font-semibold">Looking for agentless EDR?</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">EndpointRadar is a posture scanner, not an endpoint detection and response (EDR) platform. It helps you review configuration and exposure at the time of a scan; it does not provide continuous threat detection, investigation or response. Use it alongside your existing security controls.</p>
            <Link href="/guides/free-agentless-edr-vs-windows-security-assessment" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:underline">Compare agentless assessments and EDR <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </Section>
      <Section labelledBy="free-workspace" className="border-t border-white/[.07]">
        <div className="flex flex-col gap-8 rounded-3xl border border-blue-400/20 bg-blue-500/[.06] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-[.2em] text-blue-400">Free workspace</p><h2 id="free-workspace" className="mt-4 text-3xl font-semibold tracking-tight">Review your devices together.</h2><p className="mt-4 text-sm leading-relaxed text-muted">Import up to 100 scan records, compare dated results and print a client report. Data stays in the current browser tab. Scheduled scans, alerts and client accounts are not available in this workspace.</p></div><Link href="/endpointradar/app" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold hover:bg-blue-500">Open free workspace <ArrowRight className="h-4 w-4" /></Link></div>
      </Section>
      {managedReady && <Section labelledBy="managed-workspace" className="border-t border-white/[.07] bg-surface/40">
        <div className="max-w-3xl"><p className="font-mono text-xs uppercase tracking-[.2em] text-blue-400">Managed workspace · beta</p><h2 id="managed-workspace" className="mt-4 text-3xl font-semibold tracking-tight">Keep client device reviews together.</h2><p className="mt-4 leading-relaxed text-muted">Enroll Windows devices, set scan schedules, review posture changes and missing-report alerts, confirm checks on retest, and download client PDFs with changes since the last completed review. Each client has separate membership and administrator controls.</p><p className="mt-3 text-sm leading-relaxed text-muted-2">Beta: automatic Windows task startup remains unresolved on the tested device. Scheduled scans and scheduled retests are not yet verified for production monitoring; use manual reviews until automatic reporting is confirmed on each device. Requires a verified account and an enrolled Windows helper, which runs while its installing user is signed in. Alerts appear in the dashboard.</p><a href="/endpointradar/managed" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold hover:bg-blue-500">Open managed dashboard <ArrowRight className="h-4 w-4" /></a></div>
      </Section>}
      <Section labelledBy="endpoint-guides" className="border-t border-white/[.07]">
        <h2 id="endpoint-guides" className="text-2xl font-semibold tracking-tight">Put endpoint findings in context.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">Learn how to review Windows security posture, understand exposure, prioritize findings and verify changes.</p>
        <Link href="/guides#endpoint-security" className="mt-5 inline-flex text-sm font-medium text-blue-400 hover:underline">Explore Windows endpoint guides <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Section>
      <ProductReading productId="endpointradar" />
    </SiteShell>
  );
}

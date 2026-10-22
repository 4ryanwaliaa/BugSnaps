import Link from "next/link";
import { ArrowUpRight, Globe, Smartphone } from "lucide-react";
import { Section, SectionTitle } from "@/components/site/page-parts";
import { MYRECON_ANDROID_URL, MYRECON_URL } from "@/lib/site";

export function MyReconLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      <a href={MYRECON_URL} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-accent">
        Visit MyRecon website <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
      <a href={MYRECON_ANDROID_URL} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-medium hover:border-white/30">
        Get the Android app <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}

export function MyReconPromo() {
  return (
    <Section labelledBy="myrecon-platforms" className="border-t border-white/[0.06] bg-surface/40">
      <SectionTitle id="myrecon-platforms" eyebrow="MyRecon by BugSnaps" title="Your digital footprint. In your browser or your pocket." lead="Discover public profile leads, check exposure and explore the information behind a domain. Choose MyRecon on the web or take its research tools with you on Android." />
      <div className="mt-9 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
          <Globe className="h-7 w-7 text-accent" aria-hidden="true" />
          <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent">MyRecon website</p>
          <h3 className="mt-2 text-2xl font-semibold">Start with a public username.</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">Search public profile leads and explore breach, domain, DNS and IP research tools at myrecon.xyz. Review the evidence and follow relevant sources from your browser.</p>
          <a href={MYRECON_URL} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">Try MyRecon on the web <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
        </article>
        <article className="rounded-2xl border border-accent/25 bg-surface p-6 sm:p-8">
          <Smartphone className="h-7 w-7 text-accent" aria-hidden="true" />
          <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent">MyRecon mobile app</p>
          <h3 className="mt-2 text-2xl font-semibold">Take a closer look, wherever you are.</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">Search usernames, check email breach exposure and investigate domains on Android. Review device security settings and inspect links or QR codes before opening them.</p>
          <a href={MYRECON_ANDROID_URL} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">Get MyRecon on Google Play <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          <p className="mt-2 text-xs text-muted-2">Android 11+ · Contains ads</p>
        </article>
      </div>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">Built for your own digital footprint and authorized research. A matching username is a lead, not proof of identity. Features and access limits vary by platform and provider.</p>
      <Link href="/myrecon" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">Explore the MyRecon product page →</Link>
    </Section>
  );
}

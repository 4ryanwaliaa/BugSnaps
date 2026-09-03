import { ArrowUpRight, Award, Building2, ShieldCheck } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

const credentials = [
  { icon: Award, title: "CEH-certified expertise", text: "Certified Ethical Hacker knowledge applied to real-world web, API, and network testing." },
  { icon: ShieldCheck, title: "Fortinet NSE 1–4", text: "Foundational through advanced network-security training across the Fortinet NSE pathway." },
  { icon: Building2, title: "Government VAPT experience", text: "Our practitioners have delivered vulnerability assessment and penetration testing work in government environments." },
];

const briefs = [
  { date: "ADVISORY WATCH", title: "Identity and access control remain a primary breach path", tag: "Identity security", href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
  { date: "THREAT BRIEF", title: "Internet-facing applications need continuous patch and exposure review", tag: "External attack surface", href: "https://www.cisa.gov/news-events/cybersecurity-advisories" },
  { date: "WEEKLY READ", title: "Newly exploited vulnerabilities: what teams should validate first", tag: "Vulnerability management", href: "https://www.cisa.gov/topics/cyber-threats-and-advisories" },
];

export function TrustAndBriefing() {
  return (
    <Section id="briefing">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <Reveal><p className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-accent">Why BugSnaps</p><h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">Security work backed by practitioner experience.</h2><p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">We pair recognised training with hands-on VAPT delivery. You work directly with the people who test your environment and explain every finding.</p></Reveal>
          <RevealGroup className="mt-9 grid gap-3">
            {credentials.map(({ icon: Icon, title, text }) => <RevealItem key={title}><article className="flex gap-4 rounded-2xl border border-white/[0.07] bg-surface p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent"><Icon className="h-5 w-5" /></span><div><h3 className="font-medium">{title}</h3><p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p></div></article></RevealItem>)}
          </RevealGroup>
          <p className="mt-5 text-xs leading-relaxed text-muted-2">Credentials and experience claims should be supported by current team certificates and permitted client references before publication.</p>
        </div>
        <Reveal delay={0.12} className="h-full">
          <aside className="h-full rounded-2xl border border-white/[0.09] bg-surface p-6 sm:p-7">
            <div className="flex items-start justify-between gap-5"><div><p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-critical">Threat briefing</p><h2 className="mt-3 text-2xl font-semibold tracking-tight">The security desk</h2><p className="mt-2 text-sm leading-relaxed text-muted">A concise reading list for your next security stand-up.</p></div><span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-critical shadow-[0_0_14px_rgba(239,68,68,0.9)]" /></div>
            <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {briefs.map((brief) => <a key={brief.title} href={brief.href} target="_blank" rel="noopener noreferrer" className="group block py-5 first:pt-4 last:pb-4"><div className="flex items-center justify-between gap-4"><span className="font-mono text-[10px] tracking-[0.14em] text-muted-2">{brief.date}</span><span className="rounded-full border border-white/[0.09] px-2 py-1 text-[10px] text-muted">{brief.tag}</span></div><p className="mt-2.5 text-[15px] font-medium leading-snug transition-colors group-hover:text-accent">{brief.title}</p><span className="mt-3 inline-flex items-center gap-1 text-xs text-muted transition-colors group-hover:text-foreground">Read source <ArrowUpRight className="h-3.5 w-3.5" /></span></a>)}
            </div>
            <a href="#contact" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-foreground">Get the monthly briefing <ArrowUpRight className="h-4 w-4" /></a>
          </aside>
        </Reveal>
      </div>
    </Section>
  );
}

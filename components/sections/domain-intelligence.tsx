"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Globe2, LoaderCircle, MailCheck, Server, ShieldCheck } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

type Intel = {
  domain: string;
  analyzedAt: string;
  records: {
    ipv4: string[];
    ipv6: string[];
    nameservers: string[];
    mail: { exchange: string; priority: number }[];
    caa: { critical: number; issue?: string; issuewild?: string; iodef?: string }[];
  };
  emailSecurity: { spf: boolean; dmarc: boolean; dmarcPolicy: string | null };
  summary: { dnsRecords: number; nameservers: number; mailExchangers: number; certificateAuthorities: number };
};

const statCards = [
  { key: "dnsRecords", label: "IP records", icon: Globe2 },
  { key: "nameservers", label: "Nameservers", icon: Server },
  { key: "mailExchangers", label: "Mail exchangers", icon: MailCheck },
  { key: "certificateAuthorities", label: "CAA policies", icon: ShieldCheck },
] as const;

export function DomainIntelligence() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<Intel | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function inspect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/domain-intel?domain=${encodeURIComponent(domain)}`);
      const payload = (await response.json()) as Intel & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "We could not look up that domain.");
      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The lookup could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section id="intel" className="border-y border-white/[0.06] bg-[#0c0c0f]">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
        <Reveal>
          <p className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-accent">Domain intelligence</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
            See your public attack surface in seconds.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Enter a domain to inspect public DNS, email-security, and certificate-authority signals. It&apos;s a quick first look before an authorized VAPT engagement.
          </p>
          <div className="mt-8 rounded-xl border border-accent/15 bg-accent/[0.06] p-4 text-sm leading-relaxed text-muted">
            <span className="font-medium text-foreground">Passive lookup only.</span> This tool reads public DNS data and does not probe your systems, enumerate services, or test vulnerabilities.
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-surface shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)]">
            <form onSubmit={inspect} className="border-b border-white/[0.07] p-4 sm:flex sm:gap-3 sm:p-5">
              <label className="sr-only" htmlFor="domain">Domain to inspect</label>
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/[0.1] bg-black/20 px-4 py-3 focus-within:border-accent/60">
                <Globe2 className="h-4 w-4 shrink-0 text-muted-2" />
                <input id="domain" value={domain} onChange={(event) => setDomain(event.target.value)} required maxLength={253} autoComplete="url" placeholder="yourcompany.com" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-2" />
              </div>
              <button type="submit" disabled={loading} className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-70 sm:mt-0 sm:w-auto">
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <>Inspect domain <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            {error && <p role="alert" className="m-5 rounded-xl border border-critical/25 bg-critical/10 px-4 py-3 text-sm text-critical">{error}</p>}

            {!result && !error && (
              <div className="grid min-h-[286px] place-items-center px-8 text-center">
                <div>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-accent"><ShieldCheck className="h-5 w-5" /></span>
                  <p className="mt-4 text-sm font-medium">Ready for a public-signal check</p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">We&apos;ll show the DNS and email controls visible to anyone on the internet.</p>
                </div>
              </div>
            )}

            {result && (
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">Public profile</p><p className="mt-1 text-lg font-semibold">{result.domain}</p></div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 font-mono text-[11px] text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Lookup complete</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {statCards.map(({ key, label, icon: Icon }) => <div key={key} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><Icon className="h-4 w-4 text-accent" /><p className="mt-3 text-xl font-semibold">{result.summary[key]}</p><p className="mt-0.5 text-[11px] text-muted-2">{label}</p></div>)}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SecurityState label="SPF email policy" active={result.emailSecurity.spf} />
                  <SecurityState label="DMARC policy" active={result.emailSecurity.dmarc} />
                </div>
                <div className="mt-5 grid gap-5 border-t border-white/[0.07] pt-5 sm:grid-cols-2">
                  <RecordList label="Nameservers" values={result.records.nameservers} empty="No NS records returned" />
                  <RecordList label="Mail routing" values={result.records.mail.map((record) => `${record.exchange} · priority ${record.priority}`)} empty="No MX records returned" />
                </div>
                <p className="mt-5 text-[11px] leading-relaxed text-muted-2">Results are point-in-time public DNS data. A full security posture requires authorized testing, application context, and human validation.</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function SecurityState({ label, active }: { label: string; active: boolean }) {
  return <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"><span className="text-sm text-muted">{label}</span><span className={active ? "text-xs font-medium text-success" : "text-xs font-medium text-high"}>{active ? "Detected" : "Not detected"}</span></div>;
}

function RecordList({ label, values, empty }: { label: string; values: string[]; empty: string }) {
  return <div><p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">{label}</p><ul className="mt-2 space-y-1.5">{values.length ? values.slice(0, 3).map((value) => <li key={value} className="truncate font-mono text-xs text-muted">{value}</li>) : <li className="text-xs text-muted-2">{empty}</li>}</ul></div>;
}

"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  EyeOff,
  Globe2,
  LoaderCircle,
  ScrollText,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Severity = "critical" | "high" | "medium" | "low" | "info";

type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  evidence?: string;
  remediation?: string;
};

type Pass = { id: string; title: string; detail: string };

type Response = {
  profile: {
    domain: string;
    apex: string;
    isSubdomain: boolean;
    addresses: { ipv4: string[]; ipv6: string[]; withheldPrivate: number };
    nameservers: { value: string[] };
    mail: { exchangers: { exchange: string; priority: number }[]; provider: string | null };
    caa: { records: { tag: string; value: string }[] };
    spf: { record: string | null; lookupCount: number; lookupLimit: number };
    dmarc: { record: string | null };
    certificates: { hostnames: string[]; issuers: string[]; certificateCount: number };
  };
  report: {
    findings: Finding[];
    passes: Pass[];
    unchecked: string[];
    counts: Record<Severity, number>;
  };
};

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "border-critical/25 bg-critical/10 text-critical",
  high: "border-high/25 bg-high/10 text-high",
  medium: "border-medium/25 bg-medium/10 text-medium",
  low: "border-low/25 bg-low/10 text-low",
  info: "border-white/10 bg-white/[0.04] text-muted-2",
};

// Findings past this point are folded away on small screens only; desktop
// always shows the full list.
const MOBILE_VISIBLE_FINDINGS = 4;

export function DomainIntelligence() {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function inspect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setData(null);
    setExpanded(false);
    setLoading(true);
    try {
      const response = await fetch(`/api/domain-intel?domain=${encodeURIComponent(domain)}`);
      const payload = (await response.json()) as Response & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "We could not look up that domain.");
      setData(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "The lookup could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const report = data?.report;
  const profile = data?.profile;
  const hiddenOnMobile = report ? Math.max(0, report.findings.length - MOBILE_VISIBLE_FINDINGS) : 0;

  return (
    <Section id="intel" className="border-y border-white/[0.06] bg-[#0c0c0f]">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
        <Reveal>
          <p className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
            Domain intelligence
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
            See your public attack surface in seconds.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            We read the DNS, email-authentication and certificate records anyone on the internet can
            already see, then tell you which of them a phisher or a domain hijacker would find
            useful. It&apos;s a first look before an authorized VAPT engagement.
          </p>
          <div className="mt-8 rounded-xl border border-accent/15 bg-accent/[0.06] p-4 text-sm leading-relaxed text-muted">
            <span className="font-medium text-foreground">Passive lookup only.</span> Every check
            here reads public DNS or a public Certificate Transparency log. Nothing connects to the
            domain you enter, so no request of ours ever reaches its servers.
          </div>
          <ul className="mt-6 space-y-2.5 text-sm text-muted-2">
            {[
              "SPF, DMARC, DKIM and the RFC lookup limit",
              "DNSSEC, CAA and nameserver concentration",
              "Hostnames exposed in Certificate Transparency logs",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-surface shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)]">
            <form onSubmit={inspect} className="border-b border-white/[0.07] p-4 sm:flex sm:gap-3 sm:p-5">
              <label className="sr-only" htmlFor="domain">
                Domain to inspect
              </label>
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/[0.1] bg-black/20 px-4 py-3 focus-within:border-accent/60">
                <Globe2 className="h-4 w-4 shrink-0 text-muted-2" />
                <input
                  id="domain"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  required
                  maxLength={253}
                  autoComplete="url"
                  placeholder="yourcompany.com"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-2"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-70 sm:mt-0 sm:w-auto"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Inspect domain <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <p
                role="alert"
                className="m-5 rounded-xl border border-critical/25 bg-critical/10 px-4 py-3 text-sm text-critical"
              >
                {error}
              </p>
            )}

            {loading && (
              <div className="grid min-h-[286px] place-items-center px-8 text-center">
                <div>
                  <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-accent" />
                  <p className="mt-4 text-sm font-medium">Reading public records</p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                    Around forty DNS queries plus a Certificate Transparency search. Usually five to
                    ten seconds.
                  </p>
                </div>
              </div>
            )}

            {!data && !error && !loading && (
              <div className="grid min-h-[286px] place-items-center px-8 text-center">
                <div>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-accent">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm font-medium">Ready for a public-signal check</p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                    We&apos;ll show the DNS, email and certificate controls visible to anyone on the
                    internet.
                  </p>
                </div>
              </div>
            )}

            {data && profile && report && (
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
                      Public profile
                    </p>
                    <p className="mt-1 text-lg font-semibold">{profile.domain}</p>
                  </div>
                  {report.unchecked.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-high/25 bg-high/10 px-3 py-1.5 font-mono text-[11px] text-high">
                      <TriangleAlert className="h-3.5 w-3.5" /> Partial results
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 font-mono text-[11px] text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Lookup complete
                    </span>
                  )}
                </div>

                {profile.isSubdomain && (
                  <p className="mt-4 rounded-xl border border-accent/15 bg-accent/[0.06] px-4 py-3 text-[13px] leading-relaxed text-muted">
                    <span className="font-medium text-foreground">Zone apex applied.</span> Email and
                    certificate policy lives on{" "}
                    <span className="font-mono text-foreground">{profile.apex}</span>, not on the
                    subdomain you entered, so those checks were run there.
                  </p>
                )}

                {/* Severity roll-up: only the levels that actually occurred. */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {SEVERITY_ORDER.filter((severity) => report.counts[severity] > 0).map((severity) => (
                    <span
                      key={severity}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em]",
                        SEVERITY_STYLES[severity],
                      )}
                    >
                      {report.counts[severity]} {severity}
                    </span>
                  ))}
                  {report.passes.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-success/25 bg-success/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-success">
                      {report.passes.length} passing
                    </span>
                  )}
                </div>

                {report.findings.length === 0 && (
                  <p className="mt-5 rounded-xl border border-success/20 bg-success/[0.07] px-4 py-3 text-sm text-muted">
                    No issues found in the public records we can read. That is a genuinely good
                    result — and it covers configuration only, not the application behind it.
                  </p>
                )}

                {report.findings.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {report.findings.map((finding, index) => (
                      <FindingRow
                        key={finding.id}
                        finding={finding}
                        className={cn(
                          !expanded && index >= MOBILE_VISIBLE_FINDINGS && "max-lg:hidden",
                        )}
                      />
                    ))}
                  </div>
                )}

                {hiddenOnMobile > 0 && !expanded && (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground lg:hidden"
                  >
                    Show {hiddenOnMobile} more finding{hiddenOnMobile === 1 ? "" : "s"}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}

                {report.passes.length > 0 && (
                  <div className="mt-6 border-t border-white/[0.07] pt-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                      Already configured well
                    </p>
                    <ul className="mt-3 space-y-2">
                      {report.passes.map((pass) => (
                        <li key={pass.id} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span>
                            <span className="text-foreground">{pass.title}</span>
                            <span className="text-muted-2"> — {pass.detail}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.unchecked.length > 0 && (
                  <div className="mt-6 border-t border-white/[0.07] pt-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                      Could not check
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {report.unchecked.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                          <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[12px] leading-relaxed text-muted-2">
                      These are listed rather than assumed clean. A lookup that failed tells us
                      nothing about the domain.
                    </p>
                  </div>
                )}

                <RawRecords profile={profile} />

                <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] leading-relaxed text-muted-2">
                    Point-in-time public records. Everything above is configuration — authentication,
                    application logic and infrastructure need authorized testing.
                  </p>
                  <a
                    href="#contact"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.12] px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent/60 hover:text-accent"
                  >
                    Discuss a full assessment <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function FindingRow({ finding, className }: { finding: Finding; className?: string }) {
  return (
    <details
      className={cn(
        "group rounded-xl border border-white/[0.07] bg-white/[0.025] transition-colors open:bg-white/[0.04]",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 p-3.5 [&::-webkit-details-marker]:hidden">
        <span
          className={cn(
            "mt-0.5 shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]",
            SEVERITY_STYLES[finding.severity],
          )}
        >
          {finding.severity}
        </span>
        <span className="min-w-0 flex-1 text-sm leading-snug">{finding.title}</span>
        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-2 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 border-t border-white/[0.06] px-3.5 pb-3.5 pt-3">
        <p className="text-[13px] leading-relaxed text-muted">{finding.detail}</p>
        {finding.evidence && (
          <p className="break-words rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-2">
            {finding.evidence}
          </p>
        )}
        {finding.remediation && (
          <p className="text-[13px] leading-relaxed">
            <span className="font-medium text-accent">Fix: </span>
            <span className="text-muted">{finding.remediation}</span>
          </p>
        )}
      </div>
    </details>
  );
}

function RawRecords({ profile }: { profile: NonNullable<Response["profile"]> }) {
  const groups: { label: string; values: string[] }[] = [
    { label: "Addresses", values: [...profile.addresses.ipv4, ...profile.addresses.ipv6] },
    { label: "Nameservers", values: profile.nameservers.value },
    {
      label: "Mail routing",
      values: profile.mail.exchangers.map(
        (record) => `${record.exchange} · priority ${record.priority}`,
      ),
    },
    {
      label: "Certificate authorities",
      values: profile.caa.records.map((record) => `${record.tag} ${record.value}`),
    },
    { label: "SPF", values: profile.spf.record ? [profile.spf.record] : [] },
    { label: "DMARC", values: profile.dmarc.record ? [profile.dmarc.record] : [] },
    { label: "Hostnames in CT logs", values: profile.certificates.hostnames },
    { label: "Certificate issuers", values: profile.certificates.issuers },
  ].filter((group) => group.values.length > 0);

  if (!groups.length) return null;

  return (
    <details className="group mt-6 border-t border-white/[0.07] pt-5">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-muted transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        <ScrollText className="h-4 w-4 text-muted-2" />
        Show the records these findings came from
        <ChevronDown className="h-4 w-4 text-muted-2 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
              {group.label}
            </p>
            <ul className="mt-2 space-y-1.5">
              {group.values.slice(0, 8).map((value) => (
                <li key={value} className="break-all font-mono text-xs text-muted">
                  {value}
                </li>
              ))}
              {group.values.length > 8 && (
                <li className="font-mono text-xs text-muted-2">
                  + {group.values.length - 8} more
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
      {profile.mail.provider && (
        <p className="mt-4 text-[12px] text-muted-2">
          Mail is handled by {profile.mail.provider}, according to the MX records.
        </p>
      )}
      {profile.addresses.withheldPrivate > 0 && (
        <p className="mt-2 text-[12px] leading-relaxed text-muted-2">
          {profile.addresses.withheldPrivate} record(s) pointing at private or reserved address
          space were withheld — this tool reports public exposure only.
        </p>
      )}
    </details>
  );
}

/**
 * Turns a collected profile into ranked findings.
 *
 * Two rules govern everything in this file:
 *
 *  1. A finding is only raised when the lookup behind it actually succeeded.
 *     If we could not check, it goes in "unchecked" — never into the findings
 *     list as an accusation and never into the passes list as reassurance.
 *  2. Every finding names the evidence it came from, so a reader can verify it
 *     against their own DNS rather than taking our word for it.
 */

import type { DomainProfile } from "./collect";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  evidence?: string;
  remediation?: string;
};

export type Pass = { id: string; title: string; detail: string };

export type FindingsReport = {
  findings: Finding[];
  passes: Pass[];
  /** Checks we could not complete, stated plainly rather than assumed clean. */
  unchecked: string[];
  counts: Record<Severity, number>;
};

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

export function buildFindings(profile: DomainProfile): FindingsReport {
  const findings: Finding[] = [];
  const passes: Pass[] = [];
  const unchecked: string[] = [];

  const { spf, dmarc, dkim, policies, mail, caa, dnssec, nameservers, wildcard, certificates } =
    profile;

  const receivesMail = mail.status === "ok" && mail.exchangers.length > 0 && !mail.nullMx;

  /* --- SPF -------------------------------------------------------------- */

  if (spf.status === "unavailable") {
    unchecked.push("SPF record (TXT lookup did not complete)");
  } else if (!spf.record) {
    findings.push({
      id: "spf-missing",
      severity: "high",
      title: "No SPF record — anyone can send mail as this domain",
      detail:
        "Without SPF, receiving mail servers have no list of who is allowed to send from this domain, so forged mail from an attacker looks as legitimate as real mail.",
      evidence: `No v=spf1 TXT record at ${profile.apex}`,
      remediation: receivesMail
        ? "Publish a TXT record listing your senders and ending in -all."
        : "This domain sends no mail, so publish the null policy: v=spf1 -all",
    });
  } else {
    if (spf.multipleRecords) {
      findings.push({
        id: "spf-duplicate",
        severity: "high",
        title: "More than one SPF record published",
        detail:
          "RFC 7208 requires exactly one. Receivers treat duplicates as a permanent error and fall back to ignoring SPF entirely, so the protection you configured is not being applied.",
        evidence: `Multiple v=spf1 TXT records at ${profile.apex}`,
        remediation: "Merge them into a single record.",
      });
    }

    if (spf.allQualifier === "+") {
      findings.push({
        id: "spf-pass-all",
        severity: "critical",
        title: "SPF authorises every sender on the internet",
        detail:
          "The record ends in +all, which tells receivers that any server may send mail as this domain. This is materially worse than having no SPF at all, because it converts a neutral result into an explicit pass.",
        evidence: spf.record,
        remediation: "Change the final mechanism to -all.",
      });
    } else if (spf.allQualifier === "?") {
      findings.push({
        id: "spf-neutral-all",
        severity: "medium",
        title: "SPF ends in ?all, which enforces nothing",
        detail:
          "A neutral result tells the receiver to treat unlisted senders exactly as it would with no SPF policy present.",
        evidence: spf.record,
        remediation: "Change ?all to -all once you have confirmed your sender list.",
      });
    } else if (spf.allQualifier === "~") {
      findings.push({
        id: "spf-softfail",
        severity: "low",
        title: "SPF ends in ~all (softfail) rather than -all",
        detail:
          "Softfail asks receivers to accept unlisted senders and mark them as suspicious. It is a reasonable place to pause while rolling out SPF, but it is not enforcement.",
        evidence: spf.record,
        remediation: "Move to -all once DMARC aggregate reports show no legitimate senders failing.",
      });
    } else if (spf.allQualifier === null) {
      findings.push({
        id: "spf-no-all",
        severity: "medium",
        title: "SPF record has no terminating all mechanism",
        detail:
          "Without a final all mechanism the result for an unlisted sender is neutral, so the record does not actually constrain anyone.",
        evidence: spf.record,
        remediation: "Append -all to the record.",
      });
    } else {
      passes.push({
        id: "spf-strict",
        title: "SPF enforcing",
        detail: "The record ends in -all, so receivers are told to reject unlisted senders.",
      });
    }

    if (spf.lookupCount > spf.lookupLimit) {
      findings.push({
        id: "spf-lookup-limit",
        severity: "high",
        title: `SPF exceeds the ${spf.lookupLimit}-lookup limit (${spf.lookupCount} required)`,
        detail:
          "RFC 7208 caps an SPF evaluation at ten DNS-querying terms. Past that, receivers return a permanent error and discard the policy — the record looks correct but protects nothing. This usually creeps in as vendors are added one include at a time.",
        evidence: `${spf.lookupCount} lookups across: ${spf.includes.join(", ") || "direct mechanisms"}`,
        remediation: "Flatten or drop unused includes to get back under ten.",
      });
    } else if (spf.lookupCount >= spf.lookupLimit - 2 && !spf.truncated) {
      findings.push({
        id: "spf-lookup-pressure",
        severity: "low",
        title: `SPF is close to the lookup limit (${spf.lookupCount} of ${spf.lookupLimit})`,
        detail:
          "Adding one more sending vendor will push this over the RFC limit and silently disable SPF. Worth knowing before it happens.",
        evidence: `${spf.lookupCount} of ${spf.lookupLimit} lookups used`,
      });
    }

    if (spf.usesPtr) {
      findings.push({
        id: "spf-ptr",
        severity: "low",
        title: "SPF uses the deprecated ptr mechanism",
        detail:
          "RFC 7208 advises against ptr: it is slow, imposes load on other operators, and several large receivers ignore it outright.",
        evidence: spf.record,
        remediation: "Replace ptr with explicit ip4/ip6 or include terms.",
      });
    }

    if (spf.truncated) {
      unchecked.push("Full SPF lookup count (the include graph was too deep to walk completely)");
    }
  }

  /* --- DMARC ------------------------------------------------------------ */

  if (dmarc.status === "unavailable") {
    unchecked.push("DMARC record (_dmarc TXT lookup did not complete)");
  } else if (!dmarc.record) {
    findings.push({
      id: "dmarc-missing",
      severity: "high",
      title: "No DMARC record — nothing enforces SPF or DKIM",
      detail:
        "DMARC is what tells receivers what to do when a message fails authentication, and it is what stops display-name and exact-domain spoofing in phishing. Without it, SPF and DKIM results are advisory only.",
      evidence: `No v=DMARC1 TXT record at _dmarc.${profile.apex}`,
      remediation: "Start with v=DMARC1; p=none; rua=mailto:you@domain to gather reports, then move to p=reject.",
    });
  } else {
    if (dmarc.policy === "none") {
      findings.push({
        id: "dmarc-monitoring",
        severity: "medium",
        title: "DMARC is in monitoring mode (p=none)",
        detail:
          "The record exists but instructs receivers to take no action on failures. This is the correct first step of a rollout, and it is also where most domains stop — spoofed mail is still delivered.",
        evidence: dmarc.record,
        remediation: "Once aggregate reports look clean, move to p=quarantine and then p=reject.",
      });
    } else if (dmarc.policy === "quarantine") {
      findings.push({
        id: "dmarc-quarantine",
        severity: "low",
        title: "DMARC set to quarantine rather than reject",
        detail:
          "Failing mail is delivered to spam rather than refused. Better than nothing, and one step short of full protection.",
        evidence: dmarc.record,
      });
    } else if (dmarc.policy === "reject") {
      passes.push({
        id: "dmarc-reject",
        title: "DMARC enforcing (p=reject)",
        detail: "Receivers are told to refuse mail that fails authentication.",
      });
    }

    if (dmarc.percent < 100) {
      findings.push({
        id: "dmarc-partial",
        severity: "medium",
        title: `DMARC policy applies to only ${dmarc.percent}% of mail`,
        detail:
          "The pct tag samples enforcement. The remaining share of failing mail is handled as though no policy existed.",
        evidence: dmarc.record,
        remediation: "Remove the pct tag, or set pct=100.",
      });
    }

    if (!dmarc.aggregateReporting) {
      findings.push({
        id: "dmarc-no-rua",
        severity: "low",
        title: "DMARC has no aggregate reporting address",
        detail:
          "Without a rua address you receive no reports, so you cannot see who is sending as your domain or tell whether tightening the policy would break legitimate mail.",
        evidence: dmarc.record,
        remediation: "Add rua=mailto:dmarc@yourdomain to the record.",
      });
    }

    if (dmarc.subdomainPolicy && dmarc.policy) {
      const strength: Record<string, number> = { none: 0, quarantine: 1, reject: 2 };
      const parent = strength[dmarc.policy] ?? 0;
      const sub = strength[dmarc.subdomainPolicy] ?? 0;
      if (sub < parent) {
        findings.push({
          id: "dmarc-weak-subdomain",
          severity: "medium",
          title: "Subdomain DMARC policy is weaker than the parent policy",
          detail:
            "Attackers prefer subdomains precisely because sp is often left permissive. A spoofed invoices.yourdomain.com inherits your brand without inheriting your protection.",
          evidence: dmarc.record,
          remediation: `Set sp=${dmarc.policy} to match the parent policy.`,
        });
      }
    }
  }

  /* --- mail transport --------------------------------------------------- */

  if (receivesMail) {
    if (dkim.selectorsFound.length === 0) {
      findings.push({
        id: "dkim-not-found",
        severity: "info",
        title: "No DKIM key found at any common selector",
        detail: `DKIM selectors cannot be enumerated — they are only revealed in the headers of a message we do not have. We checked ${dkim.selectorsTried} selectors used by the major platforms and found none, which may mean DKIM is absent or simply that you use a custom selector.`,
        remediation: "Check the DKIM-Signature header of a message you sent to confirm.",
      });
    } else {
      passes.push({
        id: "dkim-present",
        title: "DKIM signing key published",
        detail: `Found at selector: ${dkim.selectorsFound.join(", ")}`,
      });
    }

    if (policies.mtaSts === "absent") {
      findings.push({
        id: "mta-sts-missing",
        severity: "low",
        title: "No MTA-STS policy",
        detail:
          "SMTP still falls back to plaintext when TLS negotiation fails, which is what makes downgrade interception possible. MTA-STS tells senders to require TLS and refuse to deliver without it.",
        evidence: `No v=STSv1 record at _mta-sts.${profile.apex}`,
      });
    } else if (policies.mtaSts === "ok") {
      passes.push({
        id: "mta-sts-present",
        title: "MTA-STS published",
        detail: "Senders are instructed to require TLS for inbound mail.",
      });
    }

    if (policies.tlsRpt === "absent") {
      findings.push({
        id: "tls-rpt-missing",
        severity: "info",
        title: "No TLS reporting address",
        detail:
          "TLS-RPT is how you find out that mail to you is failing TLS negotiation. Without it, downgrade problems are invisible.",
        evidence: `No v=TLSRPTv1 record at _smtp._tls.${profile.apex}`,
      });
    }
  } else if (mail.status === "ok" && !mail.exchangers.length) {
    findings.push({
      id: "no-mx-no-null-mx",
      severity: "low",
      title: "Domain receives no mail but does not say so explicitly",
      detail:
        "There are no MX records, yet no null MX either. Publishing the null MX from RFC 7505 lets senders reject forged mail immediately instead of queueing and retrying it.",
      remediation: 'Publish an MX record of "." with priority 0.',
    });
  }

  if (mail.status === "unavailable") unchecked.push("MX records (lookup did not complete)");

  /* --- DNS integrity and hosting ---------------------------------------- */

  if (dnssec.status === "unavailable") {
    unchecked.push("DNSSEC (DS/DNSKEY lookup did not complete)");
  } else if (!dnssec.signed) {
    findings.push({
      id: "dnssec-unsigned",
      severity: "medium",
      title: "DNS is not signed with DNSSEC",
      detail:
        "Without DNSSEC there is no cryptographic guarantee that the answers resolvers get for this domain are the ones you published, which leaves cache poisoning and on-path DNS tampering on the table.",
      evidence: `No DS record for ${profile.apex} in the parent zone`,
      remediation: "Most managed DNS providers enable DNSSEC in one step; the DS record must then be added at your registrar.",
    });
  } else {
    passes.push({
      id: "dnssec-signed",
      title: "DNSSEC enabled",
      detail: "The zone is signed and anchored by a DS record in the parent zone.",
    });
  }

  if (nameservers.status === "unavailable") {
    unchecked.push("Nameservers (NS lookup did not complete)");
  } else {
    if (nameservers.value.length === 1) {
      findings.push({
        id: "single-nameserver",
        severity: "medium",
        title: "Only one nameserver is published",
        detail:
          "RFC 1034 calls for at least two. A single nameserver means every name under this domain goes dark if it does, which is a availability risk and an easy denial-of-service target.",
        evidence: nameservers.value.join(", "),
      });
    } else if (nameservers.providers.length === 1 && nameservers.value.length > 1) {
      findings.push({
        id: "single-dns-operator",
        severity: "low",
        title: "All nameservers belong to one operator",
        detail:
          "The nameservers are redundant within a single provider, so a provider-wide outage or account compromise still takes the whole domain with it. Large DNS outages have repeatedly worked exactly this way.",
        evidence: `${nameservers.value.length} nameservers, all on ${nameservers.providers[0]}`,
      });
    }
  }

  if (caa.status === "unavailable") {
    unchecked.push("CAA records (lookup did not complete)");
  } else if (!caa.records.length) {
    findings.push({
      id: "caa-missing",
      severity: "medium",
      title: "No CAA record — any certificate authority may issue for this domain",
      detail:
        "CAA is the only DNS control over who can issue certificates for your name. Without it, every publicly trusted CA is permitted to, which widens the blast radius of a mis-issuance or a domain-validation bypass.",
      evidence: `No CAA record at ${profile.apex}`,
      remediation: "Publish a CAA record naming only the CAs you actually use.",
    });
  } else {
    const issuers = caa.records.filter((record) => record.tag === "issue").map((r) => r.value);
    passes.push({
      id: "caa-present",
      title: "CAA restricts certificate issuance",
      detail: `Permitted issuers: ${issuers.join(", ") || "none listed"}`,
    });

    if (!caa.records.some((record) => record.tag === "iodef")) {
      findings.push({
        id: "caa-no-iodef",
        severity: "info",
        title: "CAA has no violation reporting address",
        detail:
          "An iodef tag asks CAs to notify you when someone attempts to obtain a certificate your policy forbids — an early signal of a domain takeover attempt.",
        remediation: "Add an iodef entry pointing at a monitored mailbox.",
      });
    }
  }

  if (wildcard.detected) {
    findings.push({
      id: "wildcard-dns",
      severity: "info",
      title: "Wildcard DNS is enabled",
      detail:
        "Every possible subdomain resolves, including ones that were never configured. That is normal on platforms like Vercel, but it does mean a dangling service behind any name will answer, and it makes accidental exposure harder to notice.",
      evidence: "A randomly generated subdomain returned an address record",
    });
  }

  if (profile.addresses.status === "ok" && !profile.addresses.ipv6.length) {
    findings.push({
      id: "no-ipv6",
      severity: "info",
      title: "No IPv6 address published",
      detail:
        "Not a security weakness in itself. Worth noting because IPv6-only clients cannot reach the service, and because controls applied to the v4 path sometimes do not exist on a v6 path added later.",
    });
  }

  if (profile.addresses.withheldPrivate > 0) {
    findings.push({
      id: "private-address-exposed",
      severity: "medium",
      title: "Public DNS exposes private address space",
      detail:
        "A public record points at an RFC 1918 or otherwise reserved address. That leaks internal network structure to anyone who asks, and the addresses themselves are of no use to legitimate external users.",
      evidence: `${profile.addresses.withheldPrivate} record(s) withheld from display by this tool`,
      remediation: "Move internal names to split-horizon or internal-only DNS.",
    });
  }

  /* --- certificate transparency ----------------------------------------- */

  if (certificates.status === "unavailable") {
    unchecked.push("Certificate Transparency logs (public log search was unreachable)");
  } else {
    if (certificates.hostnames.length > 0) {
      findings.push({
        id: "ct-exposed-hostnames",
        severity: "info",
        title: `${certificates.hostnames.length} hostname${certificates.hostnames.length === 1 ? "" : "s"} discoverable in Certificate Transparency logs`,
        detail:
          "Every publicly trusted certificate is published to append-only logs that anyone can read. Each name here is a host an attacker can find without touching your infrastructure, so each one needs to be a host you meant to expose.",
        evidence: certificates.hostnames.slice(0, 8).join(", "),
      });
    }

    if (certificates.wildcard) {
      findings.push({
        id: "ct-wildcard-certificate",
        severity: "low",
        title: "A wildcard certificate has been issued for this domain",
        detail:
          "One private key covers every subdomain, so a compromise anywhere it is deployed is a compromise everywhere. Wildcards are convenient and widely used; the trade-off is worth being deliberate about.",
        evidence: `*.${profile.apex} present in CT logs`,
      });
    }
  }

  /* --- ordering and totals ---------------------------------------------- */

  findings.sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  const counts = SEVERITY_ORDER.reduce(
    (accumulator, severity) => {
      accumulator[severity] = findings.filter((finding) => finding.severity === severity).length;
      return accumulator;
    },
    {} as Record<Severity, number>,
  );

  return { findings, passes, unchecked, counts };
}

import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Keep this directory selective. The XML sitemap provides the full URL inventory.
export function GET() {
  const body = [
    "# BugSnaps",
    "",
    "> BugSnaps publishes defensive security tools, practical checklists, and evaluation results for suspicious-link review, website releases, and Windows endpoint posture.",
    "",
    "## Defensive tools",
    `- [PhishLens phishing link checker](${absoluteUrl("/phishing-detector")}): Review URL structure and suspicious links locally without opening the destination. Optional external checks add domain context.`,
    `- [EndpointRadar Windows security posture](${absoluteUrl("/endpointradar")}): Review read-only checks for Windows firewall, antivirus, and update settings.`,
    "",
    "## Benchmarks and practical guides",
    `- [Phishing link checker benchmark](${absoluteUrl("/benchmarks/phishing-link-checker")}): Offline PhishLens verdict counts for threat-listed hostnames and registered U.S. .gov domains, with methods and limitations.`,
    `- [Phishing link checker comparison](${absoluteUrl("/compare/phishing-link-checkers")}): Compare local URL review, public reputation lookups, and what a submission shares.`,
    `- [Website security checklist](${absoluteUrl("/website-security-checklist")}): Pre-launch checks for applications, deployment settings, and incident readiness.`,
    `- [Website incident response checklist](${absoluteUrl("/blog/suspected-rce-website-incident-response-checklist")}): Preserve evidence and use a worked timeline to hand off a suspected incident.`,
    `- [How to read phishing link checker results](${absoluteUrl("/blog/phishing-link-checker-results-explained")}): Interpret local signals, external evidence, and unavailable checks.`,
    `- [What to do after clicking a phishing link](${absoluteUrl("/guides/phishing-click-incident-triage")}): Assess what you shared and review account activity, active sessions, and mail settings in personal Gmail or Outlook.com.`,
    `- [Report a phishing email](${absoluteUrl("/guides/phishing-email-evidence-preservation")}): Find the reporting controls in Gmail and Outlook.com and download a short note for your IT team.`,
    `- [Windows firewall profile review](${absoluteUrl("/guides/windows-firewall-profile-review")}): Review which firewall profiles are enabled and document exceptions.`,
    `- [Windows update posture review](${absoluteUrl("/guides/windows-update-posture-review")}): Review patch evidence and follow up on missing updates.`,
    `- [Windows Security Protection History](${absoluteUrl("/guides/windows-security-protection-history")}): Find recent Windows Security actions and record useful details for support.`,
    "",
    "## About BugSnaps",
    `- [About](${absoluteUrl("/about")}): Publisher, team, and contact information.`,
    `- [Privacy policy](${absoluteUrl("/privacy")}): How BugSnaps handles information across its website and tools.`,
    `- [Security and trust](${absoluteUrl("/security")}): Account, infrastructure, and data safeguards.`,
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

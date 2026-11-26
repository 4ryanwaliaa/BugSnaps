import { absoluteUrl, ORG } from "@/lib/site";
import { SITEMAP_PAGES } from "@/lib/sitemap-pages";

export const dynamic = "force-static";

const resources = [
  { path: "/guides/phishing-click-incident-triage", title: "What to do after clicking a phishing link", summary: "Choose an action based on what you shared. Review activity, sessions and mail settings in personal Gmail or Outlook.com." },
  { path: "/guides/phishing-email-evidence-preservation", title: "How to report phishing in Gmail or Outlook", summary: "Find the reporting controls and download a short, redacted report note for IT." },
  { path: "/guides/suspicious-qr-code-response", title: "What to do with a suspicious QR code", summary: "Verify the request through a trusted channel and choose a response if you opened the link or shared information." },
  { path: "/benchmarks/phishing-link-checker", title: "PhishLens offline benchmark", summary: "Compare aggregate hostname verdict counts for threat-listed hosts and registered U.S. .gov domains." },
  { path: "/compare/phishing-link-checkers", title: "Compare phishing link checkers", summary: "See what five tools check and what information each receives." },
  { path: "/website-security-checklist", title: "Website security checklist before launch", summary: "Review HTTPS, access, backups and alerts and record your checks in a downloadable worksheet." },
  { path: "/blog/suspected-rce-website-incident-response-checklist", title: "Website incident response checklist", summary: "Preserve evidence of a suspected incident and follow a worked timeline for handing it off." },
  { path: "/guides/windows-endpoint-evidence-handling", title: "Windows Event Viewer evidence worksheet", summary: "Record event times, identifiers and follow-up decisions using the CSV and worked file-share example." },
  { path: "/guides/windows-audit-policy-change-event-4719", title: "Windows Event ID 4719", summary: "Find the audit policy change in Event Viewer and compare its details with an approved change." },
  { path: "/guides/windows-software-inventory-review", title: "Windows software inventory", summary: "List installed apps with Windows Settings or WinGet and verify missing version information." },
  { path: "/guides/windows-security-protection-history", title: "Windows Security Protection History", summary: "Find recent Windows Security actions and record the details your support team needs." },
];

function xmlText(text: string) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function GET() {
  const dates = new Map(SITEMAP_PAGES.map(({ path, lastModified }) => [path, lastModified]));
  const entries = resources.map(({ path, title, summary }) => {
    const date = dates.get(path);
    if (!date) throw new Error(`Missing sitemap modification date for ${path}`);
    return { url: absoluteUrl(path), title, summary, updated: new Date(date).toISOString() };
  }).sort((a, b) => b.updated.localeCompare(a.updated) || a.url.localeCompare(b.url));
  const feedUrl = absoluteUrl("/resources/atom.xml");
  const body = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">',
    '  <title>BugSnaps Defensive Security Resources</title>',
    `  <id>${feedUrl}</id>`,
    `  <updated>${entries[0].updated}</updated>`,
    `  <author><name>${xmlText(ORG.name)}</name></author>`,
    `  <link rel="self" type="application/atom+xml" href="${feedUrl}"/>`,
    `  <link rel="alternate" type="text/html" href="${absoluteUrl("/resources")}"/>`,
    ...entries.map(({ url, title, updated, summary }) => [
      '  <entry>',
      `    <id>${xmlText(url)}</id>`,
      `    <title>${xmlText(title)}</title>`,
      `    <updated>${updated}</updated>`,
      `    <link rel="alternate" href="${xmlText(url)}"/>`,
      `    <summary>${xmlText(summary)}</summary>`,
      '  </entry>',
    ].join("\n")),
    '</feed>',
    '',
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}

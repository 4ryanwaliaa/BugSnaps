/*
 * Comparison pages. They compare categories of testing, not named competitors:
 * we can state facts about MyPentest and BugSnaps engagements, and describe
 * what the categories *typically* do, but we will not publish claims about a
 * specific third-party product we haven't verified. A competitor-specific
 * page gets added only with sourced, checkable facts.
 */

export type ColumnId = "scanner" | "mypentest" | "manual" | "bugsnaps";

export const COLUMNS: Record<ColumnId, { name: string; note: string }> = {
  scanner: { name: "Vulnerability scanner", note: "Typical; varies by tool" },
  mypentest: { name: "MyPentest", note: "BugSnaps' automated pentest" },
  manual: { name: "Traditional manual pentest", note: "Typical engagement" },
  bugsnaps: { name: "BugSnaps engagement", note: "Expert-led, with MyPentest between tests" },
};

export interface Row {
  dimension: string;
  values: Record<ColumnId, string>;
}

export const ROWS: Row[] = [
  {
    dimension: "Attack-surface discovery",
    values: {
      scanner: "Often limited to the URLs or hosts you list; some crawl.",
      mypentest: "Crawls the app, reads JavaScript for hidden endpoints, finds OpenAPI, GraphQL and login surfaces.",
      manual: "Manual mapping by the tester within the agreed scope.",
      bugsnaps: "Manual mapping plus reconnaissance, including forgotten subdomains and exposed services.",
    },
  },
  {
    dimension: "How findings are validated",
    values: {
      scanner: "Mostly signature and version matching; false positives are common.",
      mypentest: "Differential probes (baseline vs. probe vs. control), reproduce-before-report for access control, a confidence level on every finding.",
      manual: "Verified by a person.",
      bugsnaps: "Verified by a person, with reproduction steps for each finding.",
    },
  },
  {
    dimension: "Exploitation",
    values: {
      scanner: "Usually none.",
      mypentest: "None, by design: harmless canary inputs and read-only access checks. Nothing is changed or deleted.",
      manual: "Controlled exploitation within the rules of engagement.",
      bugsnaps: "Controlled, non-destructive exploitation agreed in writing.",
    },
  },
  {
    dimension: "Signed-in (authenticated) testing",
    values: {
      scanner: "Varies; often needs manual session setup.",
      mypentest: "Signs in as test accounts you supply and checks one user can't reach another's data.",
      manual: "Yes, across the roles in scope.",
      bugsnaps: "Yes, with an authorization matrix across every role.",
    },
  },
  {
    dimension: "API testing",
    values: {
      scanner: "Varies by tool.",
      mypentest: "Tests discovered REST and GraphQL endpoints, including object-level access with test accounts.",
      manual: "Usually in scope when requested.",
      bugsnaps: "Dedicated API testing mapped to the OWASP API Top 10.",
    },
  },
  {
    dimension: "Business-logic flaws",
    values: {
      scanner: "Not detected.",
      mypentest: "Flags tampering surfaces (e.g. client-controlled prices or roles) as leads — it can't judge intent.",
      manual: "Yes — this is where human testers earn their keep.",
      bugsnaps: "Yes, including chained attack paths.",
    },
  },
  {
    dimension: "Reporting",
    values: {
      scanner: "Long lists, often with generic advice.",
      mypentest: "Grouped findings with CVSS 3.1, confidence, evidence, fixes, attack paths and a remediation plan. PDF, HTML, Markdown, JSON, SARIF.",
      manual: "A written report, commonly delivered after testing ends.",
      bugsnaps: "Technical report plus executive summary for customers and auditors, and a walkthrough call.",
    },
  },
  {
    dimension: "Repeat testing",
    values: {
      scanner: "Easy to re-run.",
      mypentest: "Re-run any time; keep the DNS record and re-verification is instant.",
      manual: "Point in time; retests are often extra.",
      bugsnaps: "Retesting of fixes included; MyPentest covers the time between engagements.",
    },
  },
  {
    dimension: "Speed",
    values: {
      scanner: "Minutes to hours.",
      mypentest: "Minutes to an hour for a typical small app.",
      manual: "Days to weeks, plus scheduling.",
      bugsnaps: "Typically 5–12 testing days, scoped up front.",
    },
  },
  {
    dimension: "Cost model",
    values: {
      scanner: "Subscription or per-asset licence.",
      mypentest: "Free during launch; paid plans later.",
      manual: "Per engagement.",
      bugsnaps: "Fixed quote per scope, in writing before work starts.",
    },
  },
  {
    dimension: "What it can test",
    values: {
      scanner: "Depends on the product: web, network, containers, cloud.",
      mypentest: "Web applications and their APIs on domains you verify.",
      manual: "Whatever is in scope.",
      bugsnaps: "Web apps, APIs, networks, cloud configuration and code.",
    },
  },
  {
    dimension: "Developer workflow",
    values: {
      scanner: "Varies; many integrate with CI.",
      mypentest: "SARIF export for code-scanning tools, Markdown per finding for tickets, severity-based fix windows.",
      manual: "Report handed over at the end.",
      bugsnaps: "Critical issues raised the same day; fix support available.",
    },
  },
];

export interface ComparePage {
  slug: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  columns: ColumnId[];
  sections: { heading: string; paragraphs: string[] }[];
  verdict: { title: string; body: string }[];
}

export const comparePages: ComparePage[] = [
  {
    slug: "mypentest-vs-vulnerability-scanners",
    path: "/compare/mypentest-vs-vulnerability-scanners",
    metaTitle: "MyPentest vs Vulnerability Scanners",
    metaDescription:
      "How an automated penetration test differs from a vulnerability scanner: discovery, validation, signed-in access-control testing, reporting and false positives.",
    h1: "MyPentest vs vulnerability scanners.",
    lead:
      "Both are automated. The difference is what happens between sending a request and calling something a vulnerability.",
    columns: ["scanner", "mypentest"],
    sections: [
      {
        heading: "Scanners match; MyPentest tests",
        paragraphs: [
          "A typical vulnerability scanner compares what it sees — a version string, a header, a response pattern — against a database of known issues. That's fast and useful for known CVEs, and it's also where most false positives come from.",
          "MyPentest maps the application first and then tests the surface it found. Injection checks compare a baseline, a probe and a control response before reporting; access-control checks sign in as two of your test accounts and confirm one can read the other's record — twice — before calling it a finding.",
        ],
      },
      {
        heading: "Where a scanner is still the right tool",
        paragraphs: [
          "If you need to inventory patch levels across hundreds of hosts, containers or cloud resources, a dedicated vulnerability scanner does that and MyPentest does not: MyPentest tests web applications and their APIs on domains you verify.",
        ],
      },
    ],
    verdict: [
      { title: "Choose a scanner", body: "for broad, continuous inventory of known vulnerabilities across infrastructure." },
      { title: "Choose MyPentest", body: "to find and confirm exploitable weaknesses in a web app and its API — access control, injection, secrets, sessions — with evidence." },
    ],
  },
  {
    slug: "bugsnaps-vs-traditional-pentest",
    path: "/compare/bugsnaps-vs-traditional-pentest",
    metaTitle: "BugSnaps vs a Traditional Penetration Test",
    metaDescription:
      "BugSnaps vs a traditional point-in-time pentest: automated coverage between engagements, fixed quotes, included retesting and reports built for engineers.",
    h1: "BugSnaps vs a traditional penetration test.",
    lead:
      "A traditional pentest is a snapshot: accurate on the day, then out of date with your next release. We pair expert testing with automation that keeps running.",
    columns: ["manual", "bugsnaps"],
    sections: [
      {
        heading: "The gap between tests",
        paragraphs: [
          "Most organisations test once or twice a year, and ship many times in between. Every release in that gap is untested. MyPentest is free to run on every release, so the obvious regressions are caught between engagements and the manual test can focus on what only a person finds.",
        ],
      },
      {
        heading: "What stays the same",
        paragraphs: [
          "The core of a good penetration test doesn't change: a scoped, human-led attempt to break the system, with controlled exploitation, clear rules of engagement and a report you can act on. BugSnaps engagements are exactly that.",
        ],
      },
    ],
    verdict: [
      { title: "A traditional pentest", body: "gives you an expert snapshot, commonly once a year." },
      { title: "BugSnaps", body: "gives you the expert test, retesting of fixes, and automated coverage for the months in between." },
    ],
  },
  {
    slug: "automated-vs-manual-penetration-testing",
    path: "/compare/automated-vs-manual-penetration-testing",
    metaTitle: "Automated vs Manual Penetration Testing",
    metaDescription:
      "Automated vs manual penetration testing: what each finds, what each misses, how long each takes, and how to combine them — from a company that does both.",
    h1: "Automated vs manual penetration testing.",
    lead:
      "They're not competitors. Automation gives you coverage and frequency; people give you judgement. Here's where each one wins.",
    columns: ["mypentest", "bugsnaps"],
    sections: [
      {
        heading: "What automation does well",
        paragraphs: [
          "Automated testing is consistent, fast and cheap to repeat. It's very good at finding exposed secrets and files, misconfigurations, missing controls, known vulnerable components, many injection flaws, and — when it can sign in as test accounts — broken object-level access control.",
        ],
      },
      {
        heading: "What needs a person",
        paragraphs: [
          "Business logic: whether a discount can be applied twice, whether a refund can exceed the payment, whether a workflow step can be skipped. Chaining several low-severity issues into a serious one. Judging which data actually matters to your company. These need a tester who understands what the application is for.",
        ],
      },
      {
        heading: "How to combine them",
        paragraphs: [
          "Run automated testing on every release and fix what it finds. Schedule a manual test before major launches, for compliance, or when you handle payments or sensitive data — and let the testers spend their time on the parts automation can't reach.",
        ],
      },
    ],
    verdict: [
      { title: "Automated (MyPentest)", body: "every release, in minutes, free during launch." },
      { title: "Manual (BugSnaps engagement)", body: "before launches, for compliance, and for business logic." },
    ],
  },
];

export function comparePage(slug: string): ComparePage {
  const page = comparePages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown comparison ${slug}`);
  return page;
}

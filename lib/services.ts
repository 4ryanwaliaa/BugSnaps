/*
 * BugSnaps' expert-led services. /services lists them all; the four with
 * their own pages (penetration testing, web app, API, network) render from
 * `servicePages` below through one template, so every service page has the
 * same honest structure: what's tested, how, what you receive, and when the
 * automated product is enough instead.
 */

export interface ServiceSummary {
  title: string;
  description: string;
  href?: string;
  deliverables: string[];
}

export const serviceSummaries: ServiceSummary[] = [
  {
    title: "Penetration testing",
    description:
      "Manual, scoped testing of your application, API or network by BugSnaps testers, with retesting until fixes hold.",
    href: "/penetration-testing",
    deliverables: ["Technical report", "Executive summary", "Free retest of fixes"],
  },
  {
    title: "Web application pentesting",
    description:
      "In-depth testing against the OWASP Top 10 and the business-logic flaws scanners never find.",
    href: "/web-application-pentesting",
    deliverables: ["Reproduction steps", "Severity and fixes", "Retest"],
  },
  {
    title: "API security testing",
    description:
      "REST and GraphQL testing focused on authorization, object-level access, rate limiting and data exposure.",
    href: "/api-security-testing",
    deliverables: ["Endpoint coverage map", "Authorization matrix", "Reproduction scripts"],
  },
  {
    title: "Network pentesting",
    description:
      "External and internal assessments that map your real exposure and validate what an intruder could reach.",
    href: "/network-pentesting",
    deliverables: ["Attack-surface inventory", "Exploitable path analysis", "Hardening checklist"],
  },
  {
    title: "Cloud security review",
    description:
      "Configuration and identity review across AWS, GCP and Azure - IAM, storage exposure, network boundaries and secrets.",
    deliverables: ["Misconfiguration report", "IAM privilege review", "Remediation runbook"],
  },
  {
    title: "Source code review",
    description:
      "Security-focused review of the code paths that matter - authentication, payments, file handling.",
    deliverables: ["Annotated findings", "Vulnerable patterns", "Secure-coding guidance"],
  },
  {
    title: "Remediation support",
    description:
      "No security engineer on the team? We help your developers patch what we find, then verify it's closed.",
    deliverables: ["Hands-on fix support", "Engineering office hours", "Verified-fixed sign-off"],
  },
];

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServicePage {
  slug: string;
  path: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  tests: { title: string; body: string }[];
  approach: string[];
  deliverables: string[];
  automation: { fits: string; manual: string };
  faq: ServiceFaq[];
}

const ENGAGEMENT_FAQ: ServiceFaq[] = [
  {
    question: "How long does an engagement take?",
    answer:
      "Most engagements run 5–12 testing days depending on scope, with the report delivered within 5 business days of testing finishing. Exact dates are agreed in the scoping document before you commit.",
  },
  {
    question: "Will testing affect production?",
    answer:
      "Rules of engagement are agreed in writing before anything starts. We recommend a staging environment; when production testing is required we use non-destructive techniques, throttle traffic and agree testing windows. Denial-of-service testing is never performed without explicit written agreement.",
  },
  {
    question: "Is retesting included?",
    answer:
      "Yes. When you've fixed the issues, we retest them and confirm in writing which are closed.",
  },
];

export const servicePages: ServicePage[] = [
  {
    slug: "penetration-testing",
    path: "/penetration-testing",
    name: "Penetration testing",
    metaTitle: "Penetration Testing Services",
    metaDescription:
      "Expert-led penetration testing for web apps, APIs and networks. Scoped in writing, tested manually against OWASP and PTES, with retesting until every fix holds.",
    h1: "Penetration testing by people who explain what they found.",
    lead:
      "A BugSnaps penetration test is a scoped, manual attempt to break your application, API or network the way an attacker would - then a clear account of what worked, how bad it is, and how to fix it.",
    tests: [
      { title: "Web applications", body: "Authentication, authorization, input handling, sessions and business logic." },
      { title: "APIs", body: "Object- and function-level authorization, data exposure, rate limiting, GraphQL." },
      { title: "Networks", body: "External exposure, internal segmentation, services and configuration." },
      { title: "Cloud and code", body: "Configuration and identity review, and security-focused code review, on request." },
    ],
    approach: [
      "Scope it together - a free call, then a fixed quote and rules of engagement in writing.",
      "Reconnaissance and mapping, including the attack surface nobody remembered existed.",
      "Manual testing mapped to OWASP WSTG and PTES, with automation for coverage, not conclusions.",
      "Critical issues reported the same day we confirm them.",
      "Report and walkthrough: plain language for decisions, reproduction steps and fixes for engineers.",
      "Fix and retest until every issue is confirmed closed.",
    ],
    deliverables: [
      "Technical report with reproduction steps and CVSS severity",
      "Executive summary you can share with customers and auditors",
      "Walkthrough call with the testers",
      "Retest and written confirmation of fixes",
    ],
    automation: {
      fits: "MyPentest is a good fit for continuous coverage between engagements: every release, every new subdomain.",
      manual: "Bring in a manual test for business logic, chained attack paths, compliance evidence, or anything with real money or data at stake.",
    },
    faq: [
      ...ENGAGEMENT_FAQ,
      {
        question: "How is this different from an automated scan?",
        answer:
          "Scanners find known patterns. A tester chains issues, abuses business logic and judges what actually matters to your company. Tools assist with coverage, but every finding in a BugSnaps report is verified and rated by a person.",
      },
      {
        question: "Can the report be shared with customers and auditors?",
        answer:
          "Yes. Alongside the technical report you receive an executive summary suitable for customer security reviews, SOC 2 and ISO 27001 audits, and vendor questionnaires.",
      },
    ],
  },
  {
    slug: "web-application-pentesting",
    path: "/web-application-pentesting",
    name: "Web application pentesting",
    metaTitle: "Web Application Penetration Testing",
    metaDescription:
      "Manual web application penetration testing against the OWASP Top 10 and business logic: authentication, access control, injection, sessions - with fixes and retesting.",
    h1: "Web application penetration testing.",
    lead:
      "We test your web app the way an attacker would: every role, every workflow, every input - looking for the flaw that turns an ordinary account into access it should never have.",
    tests: [
      { title: "Authentication", body: "Login, password reset, MFA and account recovery flows." },
      { title: "Access control", body: "Horizontal and vertical privilege checks across every role (IDOR/BOLA)." },
      { title: "Injection and XSS", body: "SQL, command, template and client-side injection, verified by hand." },
      { title: "Sessions", body: "Token handling, fixation, expiry, logout and cookie security." },
      { title: "Business logic", body: "Price and quantity tampering, workflow bypasses, race conditions - agreed in scope." },
      { title: "Configuration", body: "Headers, CORS, TLS, exposed files and debug surfaces." },
    ],
    approach: [
      "Map the application: roles, workflows, APIs behind the UI.",
      "Test each role against each other role's data and actions.",
      "Probe inputs by hand, confirming every finding before it's reported.",
      "Chain lower-severity issues where they combine into something worse.",
    ],
    deliverables: [
      "Findings with reproduction steps, evidence and CVSS severity",
      "Specific fixes for your stack",
      "Executive summary",
      "Retest and written confirmation",
    ],
    automation: {
      fits: "MyPentest covers much of the configuration, injection and access-control surface automatically - including signed-in tests with your test accounts. Run it free on every release.",
      manual: "Choose a manual test for business logic, complex roles, payments, or when you need evidence for a customer or auditor.",
    },
    faq: ENGAGEMENT_FAQ,
  },
  {
    slug: "api-security-testing",
    path: "/api-security-testing",
    name: "API security testing",
    metaTitle: "API Security Testing and API Penetration Testing",
    metaDescription:
      "API penetration testing for REST and GraphQL: object- and function-level authorization, data exposure, rate limiting and auth, mapped to the OWASP API Top 10.",
    h1: "API security testing.",
    lead:
      "APIs quietly hand out data to whoever asks correctly. We test that every endpoint checks who is asking - for every object, every function and every field.",
    tests: [
      { title: "Object-level authorization", body: "Can user A read or change user B's records by changing an id? (BOLA)" },
      { title: "Function-level authorization", body: "Can a regular user call admin-only operations?" },
      { title: "Data exposure", body: "Fields returned that the client never shows - and never should have received." },
      { title: "Authentication", body: "Token issuance, validation, expiry and revocation." },
      { title: "Rate limiting", body: "Login, OTP and expensive endpoints that can be hammered." },
      { title: "GraphQL", body: "Introspection, query depth and batching abuse, resolver authorization." },
    ],
    approach: [
      "Build an endpoint inventory from docs, traffic and the client code.",
      "Create an authorization matrix: every role against every endpoint.",
      "Test each cell of the matrix, by hand, with real accounts.",
      "Map findings to the OWASP API Security Top 10.",
    ],
    deliverables: [
      "Endpoint coverage map",
      "Authorization matrix with results",
      "Reproduction scripts for each finding",
      "Retest and written confirmation",
    ],
    automation: {
      fits: "MyPentest discovers API endpoints referenced in your JavaScript, OpenAPI documents and GraphQL, and tests object-level access with your test accounts.",
      manual: "Choose a manual API test for complex permission models, multi-tenant data, or partner and payment APIs.",
    },
    faq: ENGAGEMENT_FAQ,
  },
  {
    slug: "network-pentesting",
    path: "/network-pentesting",
    name: "Network pentesting",
    metaTitle: "Network Penetration Testing - External and Internal",
    metaDescription:
      "External and internal network penetration testing: attack-surface discovery, service and configuration testing, segmentation checks, and a clear path to hardening.",
    h1: "Network penetration testing.",
    lead:
      "We map what your network exposes - to the internet and inside - and validate what an intruder could actually reach from each foothold.",
    tests: [
      { title: "External exposure", body: "Internet-facing hosts, services, forgotten subdomains and certificates." },
      { title: "Services", body: "Vulnerable and misconfigured services, default credentials, weak protocols." },
      { title: "Segmentation", body: "Whether internal zones are really separated from each other." },
      { title: "Remote access", body: "VPN, remote desktop and administrative interfaces." },
    ],
    approach: [
      "Discover and inventory the in-scope ranges and hosts.",
      "Identify services and versions; test them for known and configuration weaknesses.",
      "Validate reachable paths between zones, within the agreed rules of engagement.",
      "Report exploitable paths, not just open ports.",
    ],
    deliverables: [
      "Attack-surface inventory",
      "Exploitable path analysis",
      "Hardening checklist",
      "Retest and written confirmation",
    ],
    automation: {
      fits: "MyPentest tests web applications, not networks. For external reconnaissance of domains and identities, see MyRecon.",
      manual: "Network testing at BugSnaps is always an expert-led engagement.",
    },
    faq: ENGAGEMENT_FAQ,
  },
];

export function servicePage(slug: string): ServicePage {
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown service page ${slug}`);
  return page;
}

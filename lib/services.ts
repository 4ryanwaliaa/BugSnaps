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
      "Manual, scoped testing of your application, API or network by BugSnaps testers, with agreed remediation retesting.",
    href: "/penetration-testing",
    deliverables: ["Technical report", "Executive summary", "Free retest of fixes"],
  },
  {
    title: "Web application pentesting",
    description:
      "Manual testing of OWASP vulnerability classes and application-specific business logic, within an agreed scope.",
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
    href: "/cloud-penetration-testing",
    deliverables: ["Misconfiguration report", "IAM privilege review", "Remediation runbook"],
  },
  {
    title: "Reconnaissance & OSINT",
    description:
      "Scoped external asset discovery, public exposure review and investigation of potentially forgotten services.",
    href: "/reconnaissance",
    deliverables: ["Discovered asset inventory", "Public exposure evidence", "Prioritized follow-up actions"],
  },
  {
    title: "Continuous pentesting (PTaaS)",
    description:
      "Plan recurring assessments and separately scoped expert reviews around your release schedule. Start MyPentest assessments yourself; native CI triggers and scheduled retests are not currently available.",
    href: "/continuous-penetration-testing",
    deliverables: ["Agreed assessment cadence", "Coverage and findings review", "Scoped remediation retests"],
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
      "Testing and reporting dates depend on the target, access and agreed scope. The schedule is recorded in the engagement document before testing begins.",
  },
  {
    question: "Will testing affect production?",
    answer:
      "Rules of engagement are agreed in writing before anything starts. We recommend a staging environment; when production testing is required we use non-destructive techniques, throttle traffic and agree testing windows. Denial-of-service testing is never performed without explicit written agreement.",
  },
  {
    question: "Is retesting included?",
    answer:
      "Retesting is agreed in the engagement scope. After your team applies the fixes, we reassess the agreed findings and record whether each is fixed, still present or inconclusive.",
  },
];

export const servicePages: ServicePage[] = [
  {
    slug: "penetration-testing",
    path: "/penetration-testing",
    name: "Penetration testing",
    metaTitle: "Penetration Testing Services",
    metaDescription:
      "Expert-led penetration testing for web apps, APIs and networks. Agree the scope and rules in writing, review finding evidence and plan remediation retesting.",
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
      "Retest agreed fixes and document unresolved findings or inconclusive results.",
    ],
    deliverables: [
      "Technical report with reproduction steps and CVSS severity",
      "Executive summary you can share with customers and auditors",
      "Walkthrough call with the testers",
      "Retest and written confirmation of fixes",
    ],
    automation: {
      fits: "Use MyPentest for assessments you start on verified deployed web applications between engagements. Plan limits and scan credits apply; scheduled runs and native CI integration are not currently available.",
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
      fits: "MyPentest runs defined configuration, injection and access-control checks against discovered surfaces, with supported signed-in testing using your accounts. Review discovery, credentials and current plan limits; the free plan is a trial rather than free testing on every release.",
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
      fits: "MyPentest checks supported API surfaces discovered from reachable pages, JavaScript, OpenAPI documents and GraphQL introspection, with read-access checks using suitable test accounts. Importing an API definition is on the roadmap; discovery and credentials limit coverage.",
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
  {
    slug: "reconnaissance",
    path: "/reconnaissance",
    name: "Reconnaissance & OSINT",
    metaTitle: "Reconnaissance Services: External Attack Surface & OSINT Assessments",
    metaDescription:
      "Scoped external reconnaissance and OSINT assessments by BugSnaps. Review discovered domains, public exposure and potential shadow assets with evidence and limits.",
    h1: "Reconnaissance and external attack surface assessments.",
    lead:
      "Map the public exposure of your organization within agreed boundaries. We review discoverable domains, services and public information, record attribution uncertainty and prioritize assets for further investigation.",
    tests: [
      { title: "Subdomain & perimeter enumeration", body: "Passive DNS, certificate transparency logs, ASN mapping, and dormant infrastructure." },
      { title: "Public exposure review", body: "Review approved identifiers and relevant public sources for reported exposure. Record source, date and confidence; an association alone does not establish ownership." },
      { title: "Public code & secret leaks", body: "Unintended repository commits, public S3 buckets, exposed Jira instances, and leaked API tokens." },
      { title: "Cloud & shadow IT discovery", body: "Unregistered staging environments, forgotten test domains, and dangling DNS pointers vulnerable to subdomain takeover." },
    ],
    approach: [
      "Define scope and organizational boundaries in writing.",
      "Execute non-intrusive passive reconnaissance across open intelligence sources and certificate logs.",
      "Review approved public identifiers and exposure reports with their provenance and attribution limits.",
      "Validate active service banners, DNS records, and potential takeover candidates safely.",
      "Deliver a catalog of discovered in-scope assets, supporting evidence and recommended follow-up tests.",
    ],
    deliverables: [
      "Discovered external asset inventory with review dates and coverage limitations",
      "Public exposure evidence and attribution notes",
      "Subdomain takeover and dangling record remediation guide",
      "Executive risk briefing on corporate digital footprint",
    ],
    automation: {
      fits: "MyRecon supports public username lookups and a separate opt-in email breach lookup. These results do not prove identity or ownership. MyPentest can assess a discovered web application after you authorize and verify its domain.",
      manual: "Choose a separately scoped expert reconnaissance engagement for organizational asset mapping and investigation. Continuous employee, dark-web or perimeter monitoring is not part of these automated lookup products.",
    },
    faq: [
      ...ENGAGEMENT_FAQ,
      {
        question: "Is reconnaissance safe for our live systems?",
        answer:
          "The scope distinguishes passive source review from any direct service checks. We agree permitted methods and request limits before testing. Passive public-source findings still need attribution review; direct checks should follow the target owner's rules.",
      },
      {
        question: "How does reconnaissance connect to penetration testing?",
        answer:
          "Reconnaissance produces a discovered asset inventory with coverage and attribution limits. Confirm ownership and testing permission before selecting a web app for MyPentest domain verification or a separately scoped manual assessment.",
      },
    ],
  },
  {
    slug: "cloud-penetration-testing",
    path: "/cloud-penetration-testing",
    name: "Cloud penetration testing",
    metaTitle: "Cloud Penetration Testing Services: AWS, GCP & Azure Security",
    metaDescription:
      "Expert cloud penetration testing across AWS, GCP, Azure, and Kubernetes. Audit IAM boundaries, container isolation, cloud metadata endpoints, and serverless architectures.",
    h1: "Cloud penetration testing for modern infrastructure.",
    lead:
      "A misconfigured cloud role can turn a low-severity flaw into complete infrastructure takeover. We assess your AWS, GCP, and Azure environments for privilege escalation, exposed storage, and perimeter bypasses.",
    tests: [
      { title: "IAM privilege escalation", body: "Over-permissive role assumptions, policy wildcard abuse, and cross-account trust vulnerabilities." },
      { title: "Storage & database exposure", body: "Public S3 buckets, Azure Blobs, exposed RDS snapshots, and unauthenticated BigQuery datasets." },
      { title: "Container & Kubernetes security", body: "Pod security admissions, cluster RBAC, service account token theft, and container escape vectors." },
      { title: "Serverless & API gateways", body: "Lambda/CloudFunction event injection, unauthenticated API triggers, and secrets stored in environment variables." },
    ],
    approach: [
      "Establish written rules of engagement aligned with cloud provider penetration testing policies.",
      "Conduct authenticated configuration review and black-box perimeter assessment.",
      "Validate agreed identity and network boundaries using approved test accounts and controlled checks; record actions that were not permitted or could not be assessed.",
      "Verify IMDSv2 metadata protection and server-side request forgery defenses.",
      "Deliver tactical Terraform/CloudFormation fixes alongside executive risk summaries.",
    ],
    deliverables: [
      "Scoped cloud findings report with evidence, severity and coverage limitations",
      "IAM privilege escalation graph and blast-radius analysis",
      "Infrastructure-as-Code (IaC) hardening recommendations",
      "Retest confirmation after remediation is applied",
    ],
    automation: {
      fits: "MyPentest assesses verified deployed web applications and supported discovered API surfaces. It does not continuously monitor your cloud, audit IAM policies or review cloud configuration. Start additional assessments yourself, subject to plan limits.",
      manual: "Cloud penetration testing requires skilled offensive practitioners to chain complex IAM trust policies, VPC peering relationships, and multi-cloud identities.",
    },
    faq: [
      ...ENGAGEMENT_FAQ,
      {
        question: "Do we need cloud provider approval to run a cloud pentest?",
        answer:
          "Requirements differ by provider, service and proposed test action. Confirm ownership, check the provider's current testing policy and obtain any required approvals before the engagement. The agreed rules must cover third-party services and excluded actions as well as your own resources.",
      },
      {
        question: "Do you test Infrastructure-as-Code (IaC) configurations?",
        answer:
          "Terraform, CloudFormation and Kubernetes manifest review can be included in a separately scoped expert engagement. The review records observed configuration risks and remediation guidance; it does not guarantee that a later deployment enforces every security policy.",
      },
    ],
  },
];

export function servicePage(slug: string): ServicePage {
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown service page ${slug}`);
  return page;
}

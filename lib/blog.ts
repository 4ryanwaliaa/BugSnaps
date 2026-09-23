/*
 * Blog posts, as structured data so they render as semantic HTML without a
 * markdown dependency. Each post answers one real question someone searches
 * for; none of them exists to repeat keywords.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string };

export interface Post {
  slug: string;
  title: string;
  description: string;
  published: string; // ISO date
  updated?: string;
  author: string;
  readingMinutes: number;
  body: Block[];
  related: { label: string; href: string }[];
}

export const posts: Post[] = [
  {
    slug: "vulnerability-assessment-vs-penetration-testing",
    title: "Vulnerability assessment vs penetration testing: what's the difference?",
    description:
      "A vulnerability assessment lists weaknesses; a penetration test proves which ones an attacker could actually use. When you need each, and what to ask for.",
    published: "2026-09-23",
    author: "BugSnaps",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "The two terms get used interchangeably, including by vendors, which is how teams end up buying a scan report when they needed a test — or paying for a test when a scan would have done. The difference is simple once you see it: a vulnerability assessment asks what might be wrong; a penetration test asks what an attacker could actually do.",
      },
      { type: "h2", text: "What a vulnerability assessment is" },
      {
        type: "p",
        text: "A vulnerability assessment is a broad, mostly automated sweep for known weaknesses: outdated software with published CVEs, missing patches, weak configurations, exposed services. Its output is a list, usually long, prioritised by severity scores.",
      },
      {
        type: "ul",
        items: [
          "Breadth over depth: many hosts or applications, checked for known issues.",
          "Mostly automated, often continuous or scheduled.",
          "Findings are usually not confirmed as exploitable, so false positives are normal.",
          "Good for patch management, asset hygiene and compliance baselines.",
        ],
      },
      { type: "h2", text: "What a penetration test is" },
      {
        type: "p",
        text: "A penetration test is a scoped, goal-directed attempt to break in. A tester — or a system acting like one — maps the target, finds weaknesses, and tries to use them: to read another user's data, escalate privileges, or reach something that should be out of reach. The output is fewer findings, each with proof and a path to fix it.",
      },
      {
        type: "ul",
        items: [
          "Depth over breadth: one application, API or network, tested thoroughly.",
          "Findings are validated: you get reproduction steps, not just a signature match.",
          "Finds problems scanners structurally can't: broken access control, business-logic abuse, chained issues.",
          "Good for launches, customer security reviews, compliance evidence and high-value systems.",
        ],
      },
      { type: "h2", text: "Where automated penetration testing fits" },
      {
        type: "p",
        text: "Automated penetration testing sits between the two. Tools like MyPentest map an application's attack surface and then test it — confirming injection with differential probes, and checking access control by signing in as your test accounts — rather than matching signatures. It can't judge business logic, but it validates far more than a scanner, and it's cheap enough to run on every release.",
      },
      {
        type: "callout",
        text: "A useful rule: if the output doesn't tell you how to reproduce the problem, it's an assessment, whatever it's called.",
      },
      { type: "h2", text: "Which one do you need?" },
      {
        type: "ol",
        items: [
          "Many assets and a patching backlog? Start with a vulnerability assessment.",
          "Shipping a web app every week? Run automated penetration testing on each release.",
          "Launching, handling payments, or facing a customer security questionnaire? Get a manual penetration test — and retest the fixes.",
        ],
      },
      {
        type: "p",
        text: "Most teams end up with a mix: continuous automated coverage, and a manual test when the stakes justify a person's time.",
      },
    ],
    related: [
      { label: "Automated vs manual penetration testing", href: "/compare/automated-vs-manual-penetration-testing" },
      { label: "MyPentest vs vulnerability scanners", href: "/compare/mypentest-vs-vulnerability-scanners" },
      { label: "Penetration testing services", href: "/penetration-testing" },
    ],
  },
  {
    slug: "penetration-testing-for-startups",
    title: "Penetration testing for startups: when, what, and how to prepare",
    description:
      "When a startup actually needs a penetration test, what to put in scope first, and how to prepare so the budget goes on real findings instead of avoidable ones.",
    published: "2026-09-23",
    author: "BugSnaps",
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: "Early-stage teams usually meet penetration testing through a customer: an enterprise prospect sends a security questionnaire, and one line asks for a recent pentest report. That's a fine reason to test — but testing only when asked means testing later than you should, under deadline, with the easy findings still in place.",
      },
      { type: "h2", text: "When you actually need one" },
      {
        type: "ul",
        items: [
          "Before you store other people's sensitive data at any real scale — payments, health, identity documents.",
          "Before a major launch or a move into enterprise sales.",
          "When a customer, investor or auditor (SOC 2, ISO 27001) asks for evidence.",
          "After a significant change to authentication, permissions or your multi-tenant model.",
        ],
      },
      { type: "h2", text: "What to put in scope first" },
      {
        type: "p",
        text: "Budget is finite, so scope where breaches actually happen in young products:",
      },
      {
        type: "ol",
        items: [
          "Access control between users and tenants — can one customer read another's data by changing an id? This is the most common serious finding in SaaS.",
          "Authentication flows — sign-up, login, password reset, invitations, SSO.",
          "The API behind your front end, including endpoints the UI no longer uses.",
          "Anything that moves money or changes permissions.",
        ],
      },
      { type: "h2", text: "Clear the easy findings first" },
      {
        type: "p",
        text: "A manual test is expensive time. Don't spend it on issues automation can find in minutes: exposed .env or .git files, API keys in JavaScript bundles, missing security headers, tokens stored in localStorage, outdated libraries with known CVEs. Run an automated pentest first — MyPentest has a free plan — fix what it finds, then let the human testers start from a cleaner baseline.",
      },
      {
        type: "callout",
        text: "Give testers two accounts in each role. Most of the valuable findings in SaaS come from comparing what user A and user B can see.",
      },
      { type: "h2", text: "How to prepare" },
      {
        type: "ul",
        items: [
          "Provide a staging environment that mirrors production, with realistic data that isn't real customer data.",
          "Create test accounts for every role, in at least two separate tenants.",
          "Share API documentation, if you have it — it saves discovery time.",
          "Agree rules of engagement in writing: scope, testing windows, who to call if something critical turns up.",
          "Plan time to fix, and make sure retesting is included in the quote.",
        ],
      },
      { type: "h2", text: "What a good report gives you" },
      {
        type: "p",
        text: "Each finding should have a severity with its reasoning, clear reproduction steps, and a specific fix for your stack — plus an executive summary you can share with the customer who asked. If a report reads like an export from a scanner, it probably is one.",
      },
    ],
    related: [
      { label: "Run a free automated pentest", href: "/mypentest" },
      { label: "Web application pentesting", href: "/web-application-pentesting" },
      { label: "API security testing", href: "/api-security-testing" },
    ],
  },
  {
    slug: "what-automated-penetration-testing-finds",
    title: "What automated penetration testing can — and can't — find",
    description:
      "An honest breakdown of the vulnerabilities automated pentesting reliably finds, the ones it finds only with help, and the ones that still need a human tester.",
    published: "2026-09-23",
    author: "BugSnaps",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "We build an automated penetration-testing product and we sell manual penetration tests, so we have no reason to oversell either. Here's where automation genuinely works, where it needs your help, and where you still need a person.",
      },
      { type: "h2", text: "Reliably found by automation" },
      {
        type: "ul",
        items: [
          "Exposed files and secrets: .env and .git directories, backups, source maps, API keys shipped in JavaScript.",
          "Configuration weaknesses: security headers, CORS, cookie flags, TLS versions, debug endpoints left on.",
          "Known vulnerable components, when the version can be observed — and whether the CVE is on CISA's Known Exploited Vulnerabilities list.",
          "Many injection flaws (SQL, template, command) when confirmed with differential testing rather than pattern matching.",
          "Client-side issues such as DOM XSS traced from source to sink, and auth tokens kept in browser storage.",
        ],
      },
      { type: "h2", text: "Found with your help" },
      {
        type: "p",
        text: "Broken access control — the classic 'change the id in the URL' bug — is invisible to a tool that doesn't know which record belongs to whom. Give an automated tester two accounts and tell it which resources each owns, and it can check whether one user can read the other's data. That's how MyPentest tests object-level authorization, and why it asks for test accounts in its deeper mode.",
      },
      { type: "h2", text: "Still needs a human" },
      {
        type: "ul",
        items: [
          "Business logic: applying a discount twice, refunding more than was paid, skipping a verification step.",
          "Chained attacks, where three low-severity issues combine into a critical one.",
          "Context: which data actually matters to your business, and which finding is the real risk.",
          "Anything that requires creativity or social context the application can't reveal.",
        ],
      },
      {
        type: "callout",
        text: "A good automated tool tells you what it didn't cover. If a report never mentions its own limits, treat a clean result with suspicion.",
      },
      { type: "h2", text: "How to use it well" },
      {
        type: "ol",
        items: [
          "Run it on every release, not once a year.",
          "Give it test accounts so it can test access control.",
          "Fix the confirmed findings first; treat 'likely' ones as leads.",
          "Book a manual test for the logic and the high-stakes flows — with the easy findings already gone.",
        ],
      },
    ],
    related: [
      { label: "See an example MyPentest report", href: "/mypentest/example-report" },
      { label: "Automated vs manual penetration testing", href: "/compare/automated-vs-manual-penetration-testing" },
      { label: "Penetration testing services", href: "/penetration-testing" },
    ],
  },
];

export function post(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

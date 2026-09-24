/*
 * "MyPentest vs <named tool>" pages.
 *
 * The rule from lib/compare.ts still holds: nothing about a third-party product
 * is published unless it is sourced. Every competitor below carries the pages
 * its facts came from and the date they were checked. Anything their own site
 * doesn't say is marked "unstated" - never guessed as a "no". The MyPentest
 * column and our cons must stay true of the engine as it ships (see
 * lib/mypentest/content.ts and ENGINE_FACTS). When a competitor changes their
 * pricing or product, update the entry and its `checkedOn` date.
 */

import { ENGINE_FACTS } from "@/lib/mypentest";

const CHECKS = ENGINE_FACTS.checks;

export type Support = "yes" | "partial" | "no" | "unstated";

export interface Cell {
  v: Support;
  note?: string;
}

export type FeatureId =
  | "hosted"
  | "freeStart"
  | "noLlmKey"
  | "webDast"
  | "authTesting"
  | "apiTesting"
  | "exploitation"
  | "network"
  | "cloud"
  | "sast"
  | "pentestService"
  | "ci"
  | "compliance"
  | "openSource"
  | "pricePublic";

export const FEATURES: { id: FeatureId; label: string; group: string }[] = [
  { id: "hosted", label: "Hosted - nothing to install", group: "Getting started" },
  { id: "freeStart", label: "Free way to start", group: "Getting started" },
  { id: "noLlmKey", label: "No AI/LLM API key of your own needed", group: "Getting started" },
  { id: "pricePublic", label: "Prices published on the website", group: "Getting started" },
  { id: "webDast", label: "Automated testing of a live web app", group: "Testing" },
  { id: "authTesting", label: "Signed-in (authenticated) testing", group: "Testing" },
  { id: "apiTesting", label: "REST / GraphQL API testing", group: "Testing" },
  { id: "exploitation", label: "Exploitation / working proof-of-concept", group: "Testing" },
  { id: "network", label: "Network & infrastructure scanning", group: "Coverage beyond the web app" },
  { id: "cloud", label: "Cloud configuration scanning", group: "Coverage beyond the web app" },
  { id: "sast", label: "Source-code analysis (SAST)", group: "Coverage beyond the web app" },
  { id: "pentestService", label: "Pentest service from the same company", group: "Workflow" },
  { id: "ci", label: "CI/CD or ticketing integrations", group: "Workflow" },
  { id: "compliance", label: "Compliance reports or certifications", group: "Workflow" },
  { id: "openSource", label: "Open source / self-hostable", group: "Workflow" },
];

/** The MyPentest column. Keep it true of what ships. */
export const MYPENTEST_CELLS: Record<FeatureId, Cell> = {
  hosted: { v: "yes", note: "Runs in the browser at bugsnaps.in" },
  freeStart: { v: "yes", note: "Free plan with the whole engine, no card" },
  noLlmKey: { v: "yes", note: "Nothing to configure" },
  pricePublic: { v: "yes", note: "In rupees; a single paid scan or monthly plans" },
  webDast: { v: "yes", note: `Crawl, then ${CHECKS} passive and safe-active checks` },
  authTesting: { v: "yes", note: "Signs in as your test accounts and checks one user can't read another's data" },
  apiTesting: { v: "yes", note: "Discovered REST, GraphQL and OpenAPI endpoints" },
  exploitation: { v: "no", note: "By design: harmless probes only, nothing is changed" },
  network: { v: "no", note: "Web apps and their APIs only" },
  cloud: { v: "no" },
  sast: { v: "no" },
  pentestService: { v: "yes", note: "Expert-led BugSnaps engagements" },
  ci: { v: "partial", note: "SARIF and Markdown exports; no native pipeline integration yet" },
  compliance: { v: "no", note: "CVSS 3.1, CWE and CISA KEV on findings; no compliance report packs" },
  openSource: { v: "no" },
};

export interface Competitor {
  slug: string;
  name: string;
  vendor: string;
  website: string;
  /** Short category chip, e.g. "Open-source AI pentest agent". */
  category: string;
  /** One fair sentence on what it is. */
  summary: string;
  metaDescription: string;
  lead: string;
  checkedOn: string;
  sources: { label: string; url: string }[];
  cells: Record<FeatureId, Cell>;
  bestFor: string;
  mypentestBestFor: string;
  theirPros: string[];
  theirCons: string[];
  ourPros: string[];
  ourCons: string[];
  pricing: string[];
  chooseThem: string;
  chooseUs: string;
  faq: { question: string; answer: string }[];
}

const CHECKED = "2026-09-24";

export const competitors: Competitor[] = [
  {
    slug: "strix",
    name: "Strix",
    vendor: "Strix (usestrix)",
    website: "https://strix.ai",
    category: "Open-source AI pentest agent",
    summary:
      "An Apache-2.0 multi-agent AI pentester that you run locally with Docker and your own LLM key, or use as Strix Cloud.",
    metaDescription:
      "MyPentest vs Strix: hosted automated pentesting with a free plan vs an open-source AI agent that exploits findings. Features, pros and cons, and pricing compared.",
    lead:
      "Strix is an AI agent that attacks your app and proves what it finds. MyPentest is a hosted, non-destructive pentest that needs no setup. Different trade-offs - here they are, including ours.",
    checkedOn: CHECKED,
    sources: [
      { label: "Strix on GitHub (README)", url: "https://github.com/usestrix/strix" },
      { label: "Strix pricing", url: "https://strix.ai/pricing" },
    ],
    cells: {
      hosted: { v: "yes", note: "Strix Cloud; the open-source version runs on your machine" },
      freeStart: { v: "yes", note: "Open source is free (you pay your LLM provider); Pro has a 7-day trial" },
      noLlmKey: { v: "partial", note: "Open source needs your own LLM API key" },
      pricePublic: { v: "partial", note: "Pro from $29/seat/month; pentests billed separately per test" },
      webDast: { v: "yes" },
      authTesting: { v: "unstated" },
      apiTesting: { v: "yes", note: "API and web app pentesting (Pro)" },
      exploitation: { v: "yes", note: "Working proof-of-concept and reproduction steps per finding" },
      network: { v: "partial", note: "Internal infrastructure pentesting on Enterprise" },
      cloud: { v: "unstated" },
      sast: { v: "yes", note: "Describes itself as SAST + DAST; PR reviews" },
      pentestService: { v: "unstated" },
      ci: { v: "yes", note: "GitHub Actions; Jira, Linear, Slack on Pro" },
      compliance: { v: "yes", note: "SOC 2, ISO 27001, PCI DSS-ready reports" },
      openSource: { v: "yes", note: "Apache-2.0; VPC/on-prem on Enterprise" },
    },
    bestFor: "Engineering teams comfortable running Docker and paying for LLM usage, who want findings proven by exploitation and fixes as pull requests.",
    mypentestBestFor: "Teams who want a real pentest of a live app in minutes, with no install, no LLM bill and nothing changed on the target.",
    theirPros: [
      "Open source under Apache-2.0 - you can read, audit and self-host it",
      "Exploits findings and ships a working proof-of-concept, which cuts false positives",
      "Reads source code too (SAST + DAST) and can open fix pull requests",
      "GitHub Actions workflow for pull-request runs",
      "Large community around the project",
    ],
    theirCons: [
      "The open-source version needs Docker and your own LLM API key - and the LLM bill is yours",
      "Pro pricing is per seat, with each pentest billed separately",
      "Exploitation is powerful but means real attack traffic - it should point at staging, not production",
      "Results and cost depend on the LLM you pick",
    ],
    ourPros: [
      "Nothing to install and no LLM key - sign in and run",
      "Free plan with the whole engine, and single paid scans in rupees with no auto-renewal",
      "Non-destructive by design, so it is safe to point at production",
      "Domain ownership is proved with a DNS record before a single request is sent",
      "Signs in as your test accounts to confirm cross-user access-control flaws",
    ],
    ourCons: [
      "No exploitation or proof-of-concept exploits - findings carry evidence and a confidence level instead",
      "No source-code analysis and no fix pull requests",
      "Not open source and can't be self-hosted",
      "No native CI integration yet (SARIF export only)",
    ],
    pricing: [
      "Open source: free; you pay your LLM provider for the tokens it uses.",
      "Pro: $29 per seat per month, with pentests billed separately per test; 7-day free trial.",
      "Enterprise: custom (VPC/on-prem, bring-your-own model, SSO).",
    ],
    chooseThem:
      "You want an agent that exploits and proves each finding, reads your code, and you're happy to run it yourself against staging or pay per seat and per test.",
    chooseUs:
      "You want a hosted, safe-on-production pentest of a web app and its API today, free to start, with predictable rupee pricing and no LLM costs.",
    faq: [
      {
        question: "Is MyPentest an AI agent like Strix?",
        answer:
          `Not in the same way. MyPentest's findings come from ${CHECKS} defined checks with differential validation (baseline vs probe vs control), worked out in code - so results are repeatable and you never pay for model usage. A language model may write the plain-English summary, but it can't create a finding or change a severity. The trade-off: it doesn't improvise new attacks the way an agent can.`,
      },
      {
        question: "Can I use both?",
        answer:
          "Yes. A common split is MyPentest against production on every release, because it's non-destructive, and an exploiting agent like Strix against a staging copy.",
      },
      {
        question: "Does MyPentest exploit what it finds?",
        answer:
          "No, by design. It sends harmless canary inputs and read-only access checks and reports evidence plus a confidence level. When you need controlled exploitation, a BugSnaps engagement does that with a person in the loop.",
      },
    ],
  },
  {
    slug: "xbow",
    name: "XBOW",
    vendor: "XBOW",
    website: "https://xbow.com",
    category: "Autonomous offensive security platform",
    summary:
      "An enterprise autonomous pentesting platform that validates findings with working exploits, sold on usage-based quotes.",
    metaDescription:
      "MyPentest vs XBOW: a self-serve automated pentest with a free plan vs an enterprise autonomous exploitation platform. Features, pros and cons, and pricing compared.",
    lead:
      "XBOW is built for security teams at large organisations and proves findings with working exploits. MyPentest is self-serve and starts free. Here's where each one fits.",
    checkedOn: CHECKED,
    sources: [
      { label: "XBOW homepage", url: "https://xbow.com" },
      { label: "XBOW pricing", url: "https://xbow.com/pricing" },
    ],
    cells: {
      hosted: { v: "yes" },
      freeStart: { v: "no", note: "Demo and quote; no trial mentioned" },
      noLlmKey: { v: "yes", note: "Managed platform" },
      pricePublic: { v: "no", note: "Usage-based, quote on request" },
      webDast: { v: "yes" },
      authTesting: { v: "unstated" },
      apiTesting: { v: "yes", note: "Web applications and APIs" },
      exploitation: { v: "yes", note: "Attack chains with working exploit code" },
      network: { v: "unstated" },
      cloud: { v: "unstated" },
      sast: { v: "unstated" },
      pentestService: { v: "unstated" },
      ci: { v: "unstated" },
      compliance: { v: "yes", note: "SOC 2, ISO 27001, PCI DSS, NIS 2 certified" },
      openSource: { v: "no" },
    },
    bestFor: "Large security teams with budget who want continuous, exploit-validated testing across many applications.",
    mypentestBestFor: "Startups and small teams who need a real pentest now, without a sales call or an enterprise contract.",
    theirPros: [
      "Validates every finding with a working exploit and full attack chain",
      "Strong public track record - it reached #1 on the HackerOne leaderboard (June 2025)",
      "Scales from one app to thousands; available through major cloud marketplaces",
      "Vendor certifications that enterprise procurement asks for",
    ],
    theirCons: [
      "No public prices - you talk to sales for a quote",
      "No self-serve free way to try it",
      "Aimed at enterprise security teams, not a solo developer or a small startup",
    ],
    ourPros: [
      "Self-serve: sign in and run your first pentest in minutes",
      "Free plan, and prices published in rupees - from a single paid scan",
      "Non-destructive by design, so it's safe on production",
      "Expert-led BugSnaps pentests from the same team when you need a person",
    ],
    ourCons: [
      "No exploitation - evidence and confidence, not working exploits",
      "Built for one team's apps, not thousands of assets; team workspaces are still on the roadmap",
      "No compliance certifications of our own yet",
      "A young product with a far shorter track record",
    ],
    pricing: [
      "Usage-based pricing scoped to your environment; request a quote.",
      "Also purchasable through AWS, Google Cloud, Oracle and Microsoft marketplaces.",
    ],
    chooseThem:
      "You're an enterprise security team that wants exploit-validated findings at scale and has the budget for a usage-based contract.",
    chooseUs:
      "You want to test your app today, start free, and pay a published price - with a human pentest available when you're ready.",
    faq: [
      {
        question: "Is MyPentest a cheaper XBOW?",
        answer:
          "Not exactly. Both automate pentesting, but XBOW exploits findings to prove them and targets enterprise scale. MyPentest deliberately doesn't exploit - it's safe to point at production - and is built for self-serve teams.",
      },
      {
        question: "Can I get exploit-level proof with BugSnaps?",
        answer:
          "Yes, through a manual BugSnaps engagement: controlled, non-destructive exploitation agreed in writing, with reproduction steps for each finding.",
      },
    ],
  },
  {
    slug: "astra-security",
    name: "Astra Security",
    vendor: "Astra IT, Inc.",
    website: "https://www.getastra.com",
    category: "PTaaS + vulnerability scanner",
    summary:
      "A pentest-as-a-service platform combining a DAST scanner, an autonomous pentest and expert manual pentests, with compliance views.",
    metaDescription:
      "MyPentest vs Astra Security: features, pros and cons and pricing compared - free automated pentesting in rupees vs a PTaaS platform with scanners and expert pentests.",
    lead:
      "Astra bundles scanners, an AI pentest and human pentesters under one subscription. MyPentest is narrower and starts free. Here's an honest look at both.",
    checkedOn: CHECKED,
    sources: [
      { label: "Astra pricing", url: "https://www.getastra.com/pricing" },
      { label: "Astra homepage", url: "https://www.getastra.com" },
    ],
    cells: {
      hosted: { v: "yes" },
      freeStart: { v: "partial", note: "$7 one-week trial" },
      noLlmKey: { v: "yes" },
      pricePublic: { v: "yes", note: "In USD; Scanner Lite from $69/month" },
      webDast: { v: "yes", note: "Scanner with 10,000+ tests listed" },
      authTesting: { v: "yes" },
      apiTesting: { v: "yes", note: "Separate API security plans" },
      exploitation: { v: "unstated" },
      network: { v: "unstated" },
      cloud: { v: "yes", note: "AWS, Azure, GCP (separate plans)" },
      sast: { v: "unstated" },
      pentestService: { v: "yes", note: "Pentest Expert plan" },
      ci: { v: "yes", note: "CI/CD, Jira, Slack" },
      compliance: { v: "yes", note: "SOC 2, ISO 27001, PCI-DSS, HIPAA views; publicly verifiable certificate" },
      openSource: { v: "partial", note: "On-premise on Enterprise" },
    },
    bestFor: "Companies that need a pentest certificate for a compliance audit and want scanning, cloud checks and human testers from one vendor.",
    mypentestBestFor: "Teams who want to find and fix real web-app issues quickly and cheaply, before paying for a certified audit.",
    theirPros: [
      "One vendor for DAST, API, cloud scanning and expert manual pentests",
      "Compliance views (SOC 2, ISO 27001, PCI-DSS, HIPAA) and a publicly verifiable pentest certificate",
      "Large published test library for its scanner",
      "Human re-scans included on pentest plans",
    ],
    theirCons: [
      "Priced in USD, per target, with separate plans for web, API and cloud",
      "The entry scanner plan caps scans (3 a month on Scanner Lite)",
      "No free plan - the trial costs $7 for a week",
    ],
    ourPros: [
      "Free plan with the whole engine - no card, no trial clock",
      "Priced in rupees with UPI and Indian cards through Razorpay, and never auto-renews",
      "A single full pentest for one payment (Strike) instead of a subscription",
      "Every finding carries a confidence level, and pattern matches alone are never reported",
    ],
    ourCons: [
      "No compliance certificate or compliance report views",
      "No cloud or network scanning",
      `Fewer checks - ${CHECKS} focused checks, not a 10,000-test library`,
      "Manual pentests are a separate BugSnaps engagement, not a plan tier",
    ],
    pricing: [
      "Scanner Lite $69/month ($699/year), Scanner $199/month, Scanner Agency $499/month.",
      "Pentest Auto $199/month or $2,999/year; Pentest Expert from $5,999/year; Enterprise from $9,999/year.",
      "API and cloud security are separate plans. Trial: $7 for one week.",
    ],
    chooseThem:
      "An auditor or customer needs a pentest certificate, and you want scanners, cloud checks and human testers under one contract.",
    chooseUs:
      "You want to find and fix your web app's real issues first - free, or for a one-off rupee price - and book an expert test when an audit needs one.",
    faq: [
      {
        question: "Does MyPentest give a pentest certificate like Astra?",
        answer:
          "No. MyPentest reports are for engineers: evidence, CVSS 3.1, confidence and fixes. If you need an attestation for customers or auditors, a BugSnaps engagement includes an executive summary written for that.",
      },
      {
        question: "Why is MyPentest cheaper?",
        answer:
          "It does less: web apps and their APIs only, no cloud or network scanning, no human in the loop on the automated plans. That focus is what makes a free plan and a single-scan price possible.",
      },
    ],
  },
  {
    slug: "intruder",
    name: "Intruder",
    vendor: "Intruder Systems Ltd",
    website: "https://www.intruder.io",
    category: "Exposure management / vulnerability scanning",
    summary:
      "A continuous exposure-management platform: infrastructure, web app (DAST), cloud and container scanning plus attack-surface monitoring.",
    metaDescription:
      "MyPentest vs Intruder: an automated pentest of your web app vs a continuous exposure-management and vulnerability scanning platform. Features, pros and cons, pricing.",
    lead:
      "Intruder watches your whole external attack surface and keeps scanning it. MyPentest goes deeper on one web app and its API. They answer different questions.",
    checkedOn: CHECKED,
    sources: [
      { label: "Intruder homepage", url: "https://www.intruder.io" },
      { label: "Intruder pricing", url: "https://www.intruder.io/pricing" },
    ],
    cells: {
      hosted: { v: "yes" },
      freeStart: { v: "yes", note: "Free plan; 14-day trial of the Cloud plan" },
      noLlmKey: { v: "yes" },
      pricePublic: { v: "partial", note: "Plans listed; plan prices not shown on the page" },
      webDast: { v: "yes", note: "75+ application checks" },
      authTesting: { v: "yes" },
      apiTesting: { v: "yes" },
      exploitation: { v: "unstated" },
      network: { v: "yes", note: "Infrastructure scanning; internal agents on Pro" },
      cloud: { v: "yes", note: "AWS, Azure, Google Cloud; containers" },
      sast: { v: "unstated" },
      pentestService: { v: "yes", note: "Pentests listed from $3,500 per test" },
      ci: { v: "yes", note: "15+ integrations incl. GitHub, Jira, Slack" },
      compliance: { v: "yes", note: "SOC 2, ISO, HIPAA, DORA reporting" },
      openSource: { v: "unstated" },
    },
    bestFor: "IT and security teams who need continuous scanning of infrastructure, cloud accounts and many web apps, with alerts when something new appears.",
    mypentestBestFor: "Teams whose main risk is their own web app and API - access control, injection, leaked secrets - who want pentest-style depth there.",
    theirPros: [
      "Broad coverage: infrastructure, web apps, cloud accounts, containers",
      "Continuous monitoring and alerts when new ports or services appear",
      "A free plan and a 14-day trial of the paid tier",
      "Compliance reporting and many integrations",
    ],
    theirCons: [
      "Plan prices aren't published - billed as a base fee plus per-target fees",
      "Web-app testing is one part of a wide platform rather than the focus",
      "Prices exclude VAT and are not in rupees",
    ],
    ourPros: [
      "Built around the web app: crawls it, mines JavaScript for hidden endpoints, then tests them",
      "Signs in as two of your test accounts to confirm one user can read another's data",
      "Published rupee prices, including a single-scan option, with no auto-renewal",
      "A human pentest from the same team when you need one",
    ],
    ourCons: [
      "No infrastructure, cloud or container scanning",
      "No continuous monitoring or scheduled scans yet (on the roadmap)",
      "No compliance reporting",
      "Fewer integrations - exports (SARIF, Markdown, JSON) rather than connectors",
    ],
    pricing: [
      "Free plan for getting started; Cloud, Pro and Enterprise tiers.",
      "Priced per target (base fee plus per-target fee), monthly or annual (annual saves 20%); prices exclude VAT.",
      "Pentests listed from $3,500 per test.",
    ],
    chooseThem:
      "You need to keep watch over a lot of infrastructure, cloud and apps, and want alerts the moment something new is exposed.",
    chooseUs:
      "Your risk is concentrated in your web app and API, and you want pentest-style depth - access control, injection, secrets - on it.",
    faq: [
      {
        question: "Can MyPentest replace Intruder?",
        answer:
          "Only if your web app and its API are all you need tested. MyPentest doesn't scan infrastructure, cloud accounts or containers, and doesn't monitor continuously yet.",
      },
      {
        question: "Can I use both?",
        answer:
          "Yes - that's a sensible pairing. Use a platform like Intruder for breadth and monitoring, and MyPentest for deeper testing of the applications that hold your users' data.",
      },
    ],
  },
  {
    slug: "pentest-tools",
    name: "Pentest-Tools.com",
    vendor: "Pentest-Tools.com",
    website: "https://pentest-tools.com",
    category: "Online pentest toolkit",
    summary:
      "A cloud toolkit of network, website and API scanners plus exploitation tools, priced by the number of assets.",
    metaDescription:
      "MyPentest vs Pentest-Tools.com: an automated web-app pentest vs an online toolkit of scanners and exploiters. Features, pros and cons, and pricing compared.",
    lead:
      "Pentest-Tools.com gives a tester a box of online tools, exploiters included. MyPentest runs one assessment end to end for you. Here's how they differ.",
    checkedOn: CHECKED,
    sources: [{ label: "Pentest-Tools.com pricing", url: "https://pentest-tools.com/pricing" }],
    cells: {
      hosted: { v: "yes" },
      freeStart: { v: "yes", note: "Free plan: limited tools, up to 5 assets" },
      noLlmKey: { v: "yes" },
      pricePublic: { v: "yes", note: "From $95/month (NetSec)" },
      webDast: { v: "yes", note: "WebNetSec plan and above" },
      authTesting: { v: "yes", note: "AI-assisted authentication (WebNetSec)" },
      apiTesting: { v: "yes", note: "REST and GraphQL" },
      exploitation: { v: "yes", note: "Sniper CVE exploiter, SQLi and XSS exploiters (Pentest Suite)" },
      network: { v: "yes", note: "17,000+ CVEs listed" },
      cloud: { v: "yes", note: "AWS, Azure, GCP" },
      sast: { v: "unstated" },
      pentestService: { v: "unstated" },
      ci: { v: "yes", note: "API, webhooks, Jira, Teams, Vanta" },
      compliance: { v: "partial", note: "Vanta integration" },
      openSource: { v: "unstated" },
    },
    bestFor: "Pentesters and consultancies who want a hosted toolbox - scanners, exploiters and an editable report generator - across networks and web apps.",
    mypentestBestFor: "Product teams who want an end-to-end assessment of their own app without driving individual tools.",
    theirPros: [
      "Wide toolkit: network, website, API, cloud and CMS scanners",
      "Exploitation tools on the top plan (Sniper, SQLi and XSS exploiters)",
      "Editable DOCX / Google Doc report generator, and Burp Suite import",
      "Unlimited team members on paid plans",
    ],
    theirCons: [
      "USD pricing by asset count, from $95/month",
      "Built for people who drive the tools - you assemble the assessment",
      "Web-app scanning is limited on the entry plan",
    ],
    ourPros: [
      "One run does discovery, testing and a prioritised fix plan - no tools to chain",
      "Cross-user access-control testing with your test accounts",
      "Rupee pricing with a free plan and a single-scan option",
      "Non-destructive by design",
    ],
    ourCons: [
      "No network, cloud or CMS-specific scanning",
      "No exploitation tools",
      "No editable report generator or Burp import",
      "No public API for your own automation yet",
    ],
    pricing: [
      "NetSec from $95/month, WebNetSec from $140/month, Pentest Suite from $190/month.",
      "Priced by assets scanned (5-500 a month); yearly billing charges 10 months.",
      "Free plan with limited tools and up to 5 assets.",
    ],
    chooseThem:
      "You're a pentester or consultancy that wants a hosted toolbox with exploiters and editable reports across many clients' assets.",
    chooseUs:
      "You're the team that owns the app and want it assessed end to end, with fixes ranked - without learning a toolkit.",
    faq: [
      {
        question: "Is MyPentest a toolkit?",
        answer:
          `No. MyPentest is one assessment that runs start to finish: discovery, ${CHECKS} checks, validation and a report with a remediation plan. You don't pick or chain tools.`,
      },
    ],
  },
  {
    slug: "burp-suite",
    name: "Burp Suite",
    vendor: "PortSwigger",
    website: "https://portswigger.net/burp",
    category: "Manual web testing toolkit",
    summary:
      "The standard desktop toolkit for web pentesters - proxy, Repeater, Intruder and (in Professional) an automated scanner.",
    metaDescription:
      "MyPentest vs Burp Suite: a hosted automated pentest vs the professional's manual testing toolkit. Who each is for, pros and cons, and pricing.",
    lead:
      "Burp Suite is what professional pentesters use by hand. MyPentest is for the team that owns the app and wants it tested without becoming a pentester. Both can belong in the same company.",
    checkedOn: CHECKED,
    sources: [
      { label: "PortSwigger pricing", url: "https://portswigger.net/pricing" },
      { label: "Burp Suite Professional", url: "https://portswigger.net/burp/pro" },
    ],
    cells: {
      hosted: { v: "no", note: "Professional is a desktop application" },
      freeStart: { v: "yes", note: "Community Edition (manual tools); Professional trial" },
      noLlmKey: { v: "yes" },
      pricePublic: { v: "yes", note: "Professional listed at $499 per user" },
      webDast: { v: "yes", note: "Scanner in Professional and Burp Suite DAST" },
      authTesting: { v: "yes", note: "Authenticated scanning listed" },
      apiTesting: { v: "yes" },
      exploitation: { v: "yes", note: "By hand, with Repeater and Intruder" },
      network: { v: "no" },
      cloud: { v: "no" },
      sast: { v: "no" },
      pentestService: { v: "no", note: "Sells tools, not testing" },
      ci: { v: "partial", note: "Via the Burp Suite DAST edition" },
      compliance: { v: "unstated" },
      openSource: { v: "partial", note: "Runs on your machine; not open source; 300+ extensions" },
    },
    bestFor: "Security professionals who test by hand and need full control over every request.",
    mypentestBestFor: "Developers and founders who want their app tested without learning to drive a proxy.",
    theirPros: [
      "The industry-standard manual toolkit - unmatched control over every request",
      "Huge extension ecosystem (300+ BApps)",
      "Community Edition is free for learning",
      "A human can exploit and chain issues that no automated tool finds",
    ],
    theirCons: [
      "Needs a skilled operator - the value is in the person using it",
      "Desktop software, licensed per user; licences can't be shared",
      "Community Edition has no automated scanner",
    ],
    ourPros: [
      "No expertise needed - it maps and tests the app for you",
      "Hosted, nothing to install, results saved to your account",
      "A structured report with CVSS, confidence and fixes, ready for engineers",
      "Starts free",
    ],
    ourCons: [
      "Far less control - you can't hand-craft or replay requests",
      "Can't find what only a human finds: business logic and chained attacks",
      "No extensions or custom checks",
    ],
    pricing: [
      "Community Edition: free (manual tools).",
      "Professional: listed at $499 per user; each user needs their own licence.",
      "Burp Suite DAST (enterprise scanning): quote.",
    ],
    chooseThem:
      "You or your team are pentesters who want hands-on control - or you want to learn web security.",
    chooseUs:
      "You own the app and want it tested for you, repeatably, without becoming a pentester.",
    faq: [
      {
        question: "Does MyPentest replace a pentester with Burp Suite?",
        answer:
          "No. MyPentest covers the repeatable part - discovery, known issue classes, cross-user access control - on every release. A skilled tester with a manual toolkit still finds business-logic flaws and chained attacks that automation can't; that is what a BugSnaps engagement is for.",
      },
    ],
  },
  {
    slug: "owasp-zap",
    name: "ZAP",
    vendor: "ZAP by Checkmarx (open source)",
    website: "https://www.zaproxy.org",
    category: "Open-source web app scanner",
    summary:
      "The widely used free, open-source (Apache-2.0) web app scanner and proxy, now stewarded by Checkmarx.",
    metaDescription:
      "MyPentest vs ZAP (OWASP ZAP): hosted automated pentesting vs the free open-source web scanner. Setup, coverage, pros and cons compared.",
    lead:
      "ZAP is free, open source and runs anywhere you can run Docker. MyPentest is hosted and does the configuring for you. Here's what you trade either way.",
    checkedOn: CHECKED,
    sources: [
      { label: "ZAP homepage", url: "https://www.zaproxy.org" },
      { label: "ZAP on GitHub", url: "https://github.com/zaproxy/zaproxy" },
      { label: "ZAP documentation", url: "https://www.zaproxy.org/docs/" },
    ],
    cells: {
      hosted: { v: "no", note: "You run it yourself" },
      freeStart: { v: "yes", note: "Free forever" },
      noLlmKey: { v: "yes" },
      pricePublic: { v: "yes", note: "Free" },
      webDast: { v: "yes" },
      authTesting: { v: "yes", note: "Configured by you (authentication guides in the docs)" },
      apiTesting: { v: "yes" },
      exploitation: { v: "partial", note: "Proxy and manual request tools for a human tester" },
      network: { v: "no" },
      cloud: { v: "no" },
      sast: { v: "no" },
      pentestService: { v: "no" },
      ci: { v: "yes", note: "Docker images and an automation framework" },
      compliance: { v: "unstated" },
      openSource: { v: "yes", note: "Apache-2.0" },
    },
    bestFor: "Teams with security know-how who want a free scanner in their pipeline and are willing to tune it.",
    mypentestBestFor: "Teams who want results without configuring contexts, authentication scripts and scan policies.",
    theirPros: [
      "Free and open source (Apache-2.0)",
      "Runs anywhere - desktop, Docker, CI - under your control",
      "Large add-on marketplace and community",
      "Doubles as an intercepting proxy for manual testing",
    ],
    theirCons: [
      "You host, configure and tune it - authentication in particular takes work",
      "Output needs triage; it's up to you to judge what's real",
      "No vendor support by default",
    ],
    ourPros: [
      "Hosted and configured for you: discovery, sign-in and checks in one run",
      "Differential validation and a confidence level on every finding to cut triage",
      "Cross-user access-control testing with two test accounts",
      "Reports with CVSS 3.1, CISA KEV status and a remediation plan",
    ],
    ourCons: [
      "Not free beyond the free plan's limits; ZAP is free without limits",
      "Not open source, can't run inside your network or CI yet",
      "Fewer knobs - you can't write your own scan rules",
    ],
    pricing: ["Free and open source."],
    chooseThem:
      "You have the know-how and time to run and tune a scanner yourself, and want it free and inside your own pipeline.",
    chooseUs:
      "You'd rather have a hosted assessment that's configured for you, with validated findings and fixes ranked.",
    faq: [
      {
        question: "Is MyPentest built on ZAP?",
        answer:
          "No. The MyPentest engine is BugSnaps' own, with its own crawler, checks and validation.",
      },
    ],
  },
];

export function competitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}

export function versusPath(slug: string): string {
  return `/compare/mypentest-vs-${slug}`;
}

export const VERSUS_PREFIX = "mypentest-vs-";

/** Rows the hub's all-tools matrix shows (the full list is on each page). */
export const HUB_FEATURES: FeatureId[] = [
  "hosted",
  "freeStart",
  "noLlmKey",
  "authTesting",
  "exploitation",
  "network",
  "pentestService",
  "openSource",
];

export function formatCheckedOn(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

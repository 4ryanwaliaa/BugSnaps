/* Primary vendor sources checked 2026-10-02. Features are edition-specific.
 * Recommendations are editorial judgments, not measured detection rankings.
 * Unstated means the linked sources do not establish a capability.
 */
import { ENGINE_FACTS } from "@/lib/mypentest";
const CHECKS = ENGINE_FACTS.checks;
export type Support = "yes" | "partial" | "no" | "unstated";
export interface Cell { v: Support; note?: string }
export type FeatureId = "hosted" | "freeStart" | "noLlmKey" | "webDast" | "authTesting" | "apiTesting" | "exploitation" | "network" | "cloud" | "sast" | "pentestService" | "ci" | "compliance" | "openSource" | "pricePublic";
export const FEATURES: { id: FeatureId; label: string; group: string }[] = [
 { id:"hosted",label:"Hosted workflow without installing a scanner",group:"Getting started" },
 { id:"freeStart",label:"Free plan, open source or trial",group:"Getting started" },
 { id:"noLlmKey",label:"No personal LLM API key required",group:"Getting started" },
 { id:"pricePublic",label:"Public pricing information",group:"Getting started" },
 { id:"webDast",label:"Tests a running web application",group:"Testing" },
 { id:"authTesting",label:"Authenticated testing with configuration",group:"Testing" },
 { id:"apiTesting",label:"API security testing",group:"Testing" },
 { id:"exploitation",label:"Exploit validation or manual attack tools",group:"Testing" },
 { id:"network",label:"Network or infrastructure scanning",group:"Coverage beyond the web app" },
 { id:"cloud",label:"Cloud or infrastructure-as-code checks",group:"Coverage beyond the web app" },
 { id:"sast",label:"Source-code security analysis",group:"Coverage beyond the web app" },
 { id:"pentestService",label:"Separate testing service from the vendor",group:"Workflow" },
 { id:"ci",label:"CI/CD, API or ticketing integration",group:"Workflow" },
 { id:"compliance",label:"Compliance-oriented reporting",group:"Workflow" },
 { id:"openSource",label:"Open source or local deployment",group:"Workflow" },
];
export const MYPENTEST_CELLS: Record<FeatureId,Cell> = {
 hosted:{v:"yes",note:"Browser workflow at bugsnaps.in"},
 freeStart:{v:"yes",note:"One trial assessment; detailed high and critical findings need a paid plan"},
 noLlmKey:{v:"yes",note:"No personal model key for scanning"},
 pricePublic:{v:"yes",note:"Plus is a one-time scan pack with no expiry; current prices appear below"},
 webDast:{v:"yes",note:`Discovery and ${CHECKS} defined checks, subject to scan mode and reachable endpoints`},
 authTesting:{v:"partial",note:"Supported logins and supplied test accounts; cross-user checks need suitable accounts and reachable records"},
 apiTesting:{v:"partial",note:"Discovered REST, GraphQL and OpenAPI surfaces; discovery and permissions limit coverage"},
 exploitation:{v:"no",note:"Evidence probes, not general exploitation or post-exploitation"},
 network:{v:"no",note:"Automated product focuses on web applications and APIs"},
 cloud:{v:"no"},sast:{v:"no"},
 pentestService:{v:"yes",note:"Separate scoped BugSnaps engagements"},
 ci:{v:"partial",note:"SARIF and Markdown exports; no native pipeline integration"},
 compliance:{v:"no",note:"Evidence, CVSS and CWE do not constitute compliance certification"},
 openSource:{v:"no",note:"Hosted product is not an open-source scanner"},
};
export interface Competitor {
 slug:string;name:string;vendor:string;website:string;category:string;
 summary:string;metaTitle:string;metaDescription:string;lead:string;checkedOn:string;
 sources:{label:string;url:string}[];cells:Record<FeatureId,Cell>;
 bestFor:string;mypentestBestFor:string;theirPros:string[];theirCons:string[];
 ourPros:string[];ourCons:string[];pricing:string[];chooseThem:string;chooseUs:string;
 faq:{question:string;answer:string}[];
}
const yes=(note?:string):Cell=>({v:"yes",...(note?{note}:{})});
const partial=(note:string):Cell=>({v:"partial",note});
type Profile=Pick<Competitor,"slug"|"name"|"vendor"|"website"|"category"|"summary"|"sources"|"theirPros"|"theirCons"|"pricing"|"chooseThem"|"faq">&{cells:Partial<Record<FeatureId,Cell>>};
const COMPARE_META: Record<string, { title: string; description: string }> = {
 acunetix: {
  title: "MyPentest vs Acunetix: Web DAST Comparison",
  description: "Compare MyPentest and Acunetix web DAST: proof-based checks, SPA authentication, BOLA testing, and one-time scan packs vs annual licensing.",
 },
 nessus: {
  title: "MyPentest vs Tenable Nessus: Web vs Infra",
  description: "Compare MyPentest web and API pentesting with Tenable Nessus network and host vulnerability scanning: scope, auth checks, and pricing models.",
 },
 veracode: {
  title: "MyPentest vs Veracode: Self-Serve vs Suite",
  description: "Compare MyPentest self-serve web assessments with Veracode enterprise SAST, SCA, and DAST: onboarding speed, auth testing, and pricing model.",
 },
 checkmarx: {
  title: "MyPentest vs Checkmarx: Runtime vs SAST",
  description: "Compare MyPentest live runtime web and API testing with Checkmarx static source analysis (SAST) and Checkmarx One DAST: scope, proof, and cost.",
 },
 "cobalt-io": {
  title: "MyPentest vs Cobalt.io: Instant vs PTaaS",
  description: "Compare MyPentest on-demand automated web assessments with Cobalt.io human PTaaS credits: turnaround speed, manual logic coverage, and budget.",
 },
 strix: {
  title: "MyPentest vs Strix: Hosted vs AI Agent",
  description: "Compare MyPentest browser-based web checks with Strix open-source and cloud AI pentesting agents: Docker/LLM setup, exploit proof, and pricing.",
 },
 xbow: {
  title: "MyPentest vs XBOW: Scope, Proof & Pricing",
  description: "Compare MyPentest self-serve web and API checks with XBOW autonomous offensive testing: exploit evidence, DNS verification, and pricing models.",
 },
 "astra-security": {
  title: "MyPentest vs Astra Security: Plans & Scope",
  description: "Compare MyPentest one-time web scan packs with Astra Security DAST, API, and expert pentest subscriptions: free trial, auth checks, and limits.",
 },
 intruder: {
  title: "MyPentest vs Intruder: App vs Surface Scan",
  description: "Compare MyPentest authenticated web and API assessments with Intruder external infrastructure monitoring and paid DAST plans: scope and pricing.",
 },
 "pentest-tools": {
  title: "MyPentest vs Pentest-Tools.com: Web vs Kit",
  description: "Compare MyPentest focused web and API testing with Pentest-Tools.com network and web operator toolboxes: plan tiers, auth checks, and reporting.",
 },
 "burp-suite": {
  title: "MyPentest vs Burp Suite: Pro & DAST Scope",
  description: "Compare MyPentest hosted web assessments with Burp Suite Professional manual proxy tools and Burp Suite DAST: operator effort, scope, and cost.",
 },
 "owasp-zap": {
  title: "MyPentest vs OWASP ZAP: Hosted vs Local",
  description: "Compare MyPentest zero-setup browser scanning with self-hosted OWASP ZAP: authentication setup, API scans, maintenance effort, and evidence.",
 },
 nuclei: {
  title: "MyPentest vs Nuclei: Browser vs Templates",
  description: "Compare MyPentest hosted web assessments with ProjectDiscovery Nuclei YAML templates: custom regression checks, auth testing, and triage effort.",
 },
 stackhawk: {
  title: "MyPentest vs StackHawk: Browser vs CI DAST",
  description: "Compare MyPentest hosted browser scans with StackHawk HawkScan local and CI/CD runtime testing: YAML auth config, coding agents, and scan packs.",
 },
 invicti: {
  title: "MyPentest vs Invicti: Proof & Deployment",
  description: "Compare MyPentest self-serve web and API assessments with Invicti enterprise DAST: proof-based validation, SaaS vs on-prem deployment, and cost.",
 },
 detectify: {
  title: "MyPentest vs Detectify: App vs EASM Scope",
  description: "Compare MyPentest pay-as-you-go web assessments with Detectify surface monitoring and application scanning: authenticated fuzzing and asset fees.",
 },
 "qualys-was": {
  title: "MyPentest vs Qualys WAS: Agile vs Inventory",
  description: "Compare MyPentest on-demand web and API scans with Qualys Web Application Scanning (WAS): appliance placement, auth records, and licensing.",
 },
 "rapid7-insightappsec": {
  title: "MyPentest vs Rapid7 InsightAppSec: DAST",
  description: "Compare MyPentest instant browser web assessments with Rapid7 InsightAppSec: Attack Replay, private scan engines, auth setup, and pricing model.",
 },
 snyk: {
  title: "MyPentest vs Snyk: API & Web DAST vs Code",
  description: "Compare MyPentest vs Snyk Code and Snyk API & Web DAST: REST and GraphQL API testing, authenticated checks, free trial scope, and pricing.",
 },
 "hcl-appscan": {
  title: "MyPentest vs HCL AppScan: Cloud vs Suite",
  description: "Compare MyPentest hosted web assessments with HCL AppScan Standard, Cloud, and Enterprise editions: deployment models, auth setup, and licensing.",
 },
};
function profile(input:Profile, checkedOn = "2026-10-02"):Competitor {
 const cells=Object.fromEntries(FEATURES.map(f=>[f.id,{v:"unstated"}])) as Record<FeatureId,Cell>;
 return {...input,cells:{...cells,...input.cells},checkedOn,
 metaTitle:COMPARE_META[input.slug]?.title ?? `MyPentest vs ${input.name}`,
 metaDescription:COMPARE_META[input.slug]?.description ?? `MyPentest vs ${input.name}: workflow, authentication, evidence, pricing model and limitations. Compare edition-specific features with primary vendor sources.`,
 lead:`${input.summary} Compare its workflow with MyPentest's hosted assessment of a verified application, including the limits of both approaches.`,
 bestFor:input.chooseThem,
 mypentestBestFor:"Teams assessing a verified web app without installing a scanner, who can supply scoped test accounts and review coverage limits.",
 ourPros:["Browser assessment of a verified app without scanner installation","Evidence, confidence and remediation with findings","Supported authenticated checks using supplied test accounts"],
 ourCons:["No source-code, cloud-configuration or network assessment in the automated product","No general exploit chains, custom scan rules or native CI integration","Discovery and credentials limit coverage; a clean run does not guarantee every vulnerability was found","Reports do not certify compliance or replace a scoped manual business-logic test"],
 chooseUs:"You need an occasional hosted web-app assessment with evidence and remediation, and do not require the other product's wider platform or operator controls."};
}
export const competitors:Competitor[]=[
  profile({
    slug: "acunetix",
    name: "Acunetix",
    vendor: "Invicti Security",
    website: "https://www.acunetix.com",
    category: "Web vulnerability scanner",
    summary: "A vulnerability scanner providing dynamic web testing, API crawling, and proof-based validation features.",
    sources: [
      { label: "Acunetix product overview", url: "https://www.acunetix.com/vulnerability-scanner/" },
      { label: "Acunetix and Invicti alignment", url: "https://www.invicti.com/product/dast" },
    ],
    cells: {
      hosted: yes("Cloud and on-premises installation available"),
      noLlmKey: yes("Core managed scanner"),
      webDast: yes(),
      authTesting: yes("Login sequence recorder and macro support"),
      apiTesting: yes("REST and GraphQL scanning"),
      exploitation: partial("Proof-based validation on selected finding classes"),
      ci: yes("CI/CD pipeline integrations"),
      compliance: partial("Compliance-focused reporting templates"),
    },
    theirPros: ["Established DAST engine with deep vulnerability catalog", "Proof-based confirmation on supported issues", "On-premises and cloud deployment choices"],
    theirCons: ["Annual per-target licensing model", "Configuration complexity for modern SPAs", "Scanner reports alone do not establish compliance"],
    pricing: ["Licensing is typically scoped annually per target domain or web asset.", "Review add-on costs for additional targets and API modules."],
    chooseThem: "You require enterprise on-premises DAST deployment with a long-standing scanner track record.",
    faq: [
      {
        question: "How does MyPentest compare to Acunetix?",
        answer: "Acunetix is an established enterprise scanner requiring annual per-target licensing and configuration. BugSnaps MyPentest offers self-serve browser assessments, one-time scan packs, and supported paired-account BOLA read checks with supplied test accounts.",
      },
      {
        question: "Does Acunetix validate all vulnerabilities with proof?",
        answer: "Acunetix applies proof-based scanning to selected vulnerability classes like SQLi and command execution. Other findings require manual operator triage and verification.",
      },
    ],
  }),
  profile({
    slug: "nessus",
    name: "Tenable Nessus",
    vendor: "Tenable",
    website: "https://www.tenable.com/products/nessus",
    category: "Vulnerability assessment scanner",
    summary: "An industry-standard vulnerability scanner built for infrastructure, operating systems, network services, and compliance audits.",
    sources: [
      { label: "Nessus product overview", url: "https://www.tenable.com/products/nessus" },
      { label: "Nessus plugins and checks", url: "https://www.tenable.com/plugins" },
    ],
    cells: {
      hosted: partial("Nessus Expert and Cloud; Nessus Pro is local software"),
      freeStart: yes("Nessus Essentials allows up to 16 IP addresses"),
      noLlmKey: yes("Rule and plugin-based engine"),
      pricePublic: yes("Nessus Pro public annual pricing published"),
      webDast: partial("Basic web checks; dedicated web AppSec is Tenable.io WAS"),
      network: yes("Comprehensive network and service enumeration"),
      cloud: yes("Cloud infrastructure posture checks in Expert"),
      compliance: partial("Audit and compliance policy checks"),
      openSource: partial("Proprietary commercial software engine"),
    },
    theirPros: ["Extensive CVE and infrastructure plugin database", "Comprehensive operating system and network service coverage", "Familiar standard for enterprise compliance auditors"],
    theirCons: ["Not specialized for modern single-page web app logic or BOLA", "High false positive noise on banner-version matching", "Local appliance installation and management required"],
    pricing: ["Nessus Professional has published annual subscription pricing.", "Tenable.io WAS web application scanning is licensed separately."],
    chooseThem: "You need comprehensive network, host, and infrastructure vulnerability assessment across IP ranges.",
    faq: [
      {
        question: "Can Nessus replace an application penetration test?",
        answer: "No. Nessus is an infrastructure and network scanner that checks service versions and known OS vulnerabilities. It is not built to test modern JavaScript SPA state, multi-tenant BOLA, or application authorization boundaries.",
      },
      {
        question: "Does MyPentest scan network infrastructure like Nessus?",
        answer: "No. MyPentest is dedicated to web applications, SPAs, and APIs. For network and infrastructure security, BugSnaps provides expert-led network penetration testing engagements.",
      },
    ],
  }),
  profile({
    slug: "veracode",
    name: "Veracode",
    vendor: "Veracode",
    website: "https://www.veracode.com",
    category: "Enterprise application security platform",
    summary: "An enterprise AppSec platform offering static analysis (SAST), software composition analysis (SCA), and scheduled DAST scans.",
    sources: [
      { label: "Veracode DAST overview", url: "https://www.veracode.com/products/dynamic-analysis-dast" },
      { label: "Veracode platform overview", url: "https://www.veracode.com" },
    ],
    cells: {
      hosted: yes("Cloud-hosted enterprise platform"),
      noLlmKey: yes("Managed enterprise platform"),
      webDast: yes("Veracode Dynamic Analysis"),
      authTesting: yes("Configured login scripts and credentials"),
      apiTesting: yes("REST API testing"),
      sast: yes("Core Veracode static analysis"),
      ci: yes("Enterprise CI/CD and developer pipelines"),
      compliance: partial("Enterprise compliance policy reporting"),
      pentestService: yes("Manual penetration testing services available"),
    },
    theirPros: ["Broad enterprise platform covering SAST, SCA, and DAST", "Centralized corporate governance and policy management", "Established recognition among enterprise procurement teams"],
    theirCons: ["Expensive multi-year enterprise contract commitments", "Lengthy onboarding and administrative overhead", "Scanners can take hours to complete single assessments"],
    pricing: ["Custom enterprise quote based on application portfolio and modules.", "Requires discussions with sales and annual minimum commitments."],
    chooseThem: "You require a unified enterprise governance suite for both source-code SAST and dynamic DAST.",
    faq: [
      {
        question: "How does BugSnaps differ from Veracode?",
        answer: "Veracode is a broad enterprise governance platform covering SAST, SCA, and DAST under annual contracts. BugSnaps MyPentest gives developers self-serve browser assessments of verified web apps with reproducible HTTP probe evidence, confidence labels, and one-time scan packs.",
      },
      {
        question: "Does Veracode DAST test client-side single page applications?",
        answer: "Veracode DAST can crawl web applications with configured login scripts and browser recordings. BugSnaps MyPentest crawls reachable pages and inspects JavaScript bundles for referenced API endpoints within your verified scope; complex client-side workflows still benefit from manual review.",
      },
    ],
  }),
  profile({
    slug: "checkmarx",
    name: "Checkmarx",
    vendor: "Checkmarx",
    website: "https://checkmarx.com",
    category: "Enterprise AppSec & SAST platform",
    summary: "An enterprise application security suite centered around static code analysis (SAST), software supply chain security, and DAST integrations.",
    sources: [
      { label: "Checkmarx platform", url: "https://checkmarx.com" },
      { label: "Checkmarx DAST capability", url: "https://checkmarx.com/product/dast/" },
    ],
    cells: {
      hosted: yes("Checkmarx One cloud platform"),
      noLlmKey: yes("Managed engine"),
      webDast: yes("Checkmarx One DAST module"),
      authTesting: yes("Authenticated web scanning"),
      apiTesting: yes("API security testing"),
      sast: yes("Core Checkmarx SAST engine"),
      cloud: partial("KICS infrastructure-as-code analysis"),
      ci: yes("Developer pipeline and IDE plugins"),
      compliance: partial("Executive and regulatory compliance views"),
    },
    theirPros: ["Deep static source-code vulnerability analysis", "Software supply chain and open-source dependency scanning", "Robust IDE and developer pull-request integrations"],
    theirCons: ["High volume of theoretical code-level false positives", "Enterprise-only licensing with substantial price entry point", "Code analysis cannot verify real-world runtime access controls"],
    pricing: ["Enterprise pricing based on developer seats and scanned repositories.", "Custom quotes negotiated via enterprise sales teams."],
    chooseThem: "Your security programme is centered around static code analysis and software supply chain audits.",
    faq: [
      {
        question: "Can static code scanning (SAST) replace dynamic testing (DAST)?",
        answer: "No. SAST analyzes uncompiled code without runtime environment state, authentication sessions, or deployed server configurations. BugSnaps MyPentest tests live running applications with non-destructive differential probes and supplied test accounts to observe runtime behavior.",
      },
      {
        question: "Can BugSnaps MyPentest complement Checkmarx?",
        answer: "Yes. Many engineering teams use SAST in their IDEs for initial code feedback, and use BugSnaps MyPentest to assess deployed staging environments with reproducible HTTP evidence and confidence labels before releasing to production.",
      },
    ],
  }),
  profile({
    slug: "cobalt-io",
    name: "Cobalt.io",
    vendor: "Cobalt",
    website: "https://www.cobalt.io",
    category: "Pentest as a Service (PTaaS)",
    summary: "A penetration-testing-as-a-service platform connecting organizations with on-demand vetted freelance human penetration testers.",
    sources: [
      { label: "Cobalt PTaaS platform", url: "https://www.cobalt.io/platform" },
      { label: "Cobalt pricing model", url: "https://www.cobalt.io/pricing" },
    ],
    cells: {
      hosted: yes("Cloud platform for managing testing credits"),
      noLlmKey: yes(),
      pricePublic: partial("Credit unit pricing structure; annual plans"),
      webDast: yes("Human-executed testing with automated tool support"),
      authTesting: yes("Testers authenticate with supplied test accounts"),
      apiTesting: yes("Human API security testing"),
      exploitation: yes("Human pentesters execute manual exploit chains"),
      network: yes("External and internal human network pentesting"),
      cloud: yes("Cloud configuration audits by human testers"),
      pentestService: yes("Core PTaaS delivery model"),
      compliance: partial("Auditor-oriented penetration test reports; acceptance depends on the assessor"),
    },
    theirPros: ["Manual human testing for complex business logic and edge cases", "Centralized platform for managing findings, retests, and auditor reports", "Vetted community of certified offensive security specialists"],
    theirCons: ["Annual credit packages and multi-credit engagement scoping", "Testing must be scheduled days or weeks in advance", "Human availability limits instant feedback on continuous code deployments"],
    pricing: ["Cobalt uses Pentest Units sold through annual subscriptions.", "Engagements consume credits according to target scope and complexity."],
    chooseThem: "You have a dedicated PTaaS budget and want human penetration testing managed through an annual credit pool.",
    faq: [
      {
        question: "How does BugSnaps compare to Cobalt.io?",
        answer: "Cobalt connects you with human testers through an annual credit model. BugSnaps MyPentest provides on-demand automated web assessments with one-time scan packs, while BugSnaps expert services deliver separately scoped manual penetration tests with written fixed quotes.",
      },
      {
        question: "Can BugSnaps provide human penetration testing like Cobalt?",
        answer: "Yes. BugSnaps expert-led penetration testing services provide manual testing, technical and executive reports, and fix retesting to support SOC 2, ISO 27001, and customer security reviews; confirm specific deliverable requirements with your assessor.",
      },
    ],
  }),

 profile({
 slug:"strix",name:"Strix",vendor:"Strix",website:"https://www.strix.ai",category:"AI pentesting agent",
 summary:"An open-source AI testing agent with a managed cloud offering, proof-of-concept validation and fix suggestions.",
 sources:[{label:"Strix project and local setup",url:"https://github.com/usestrix/strix"},{label:"Strix cloud plans",url:"https://www.strix.ai/pricing"}],
 cells:{hosted:yes("Managed cloud; local edition also available"),freeStart:yes("Open-source edition and cloud trial"),noLlmKey:partial("Cloud manages models; local use needs a supported model credential"),pricePublic:partial("Public Pro seat price; pentests billed separately"),webDast:yes(),authTesting:yes("Authenticated instructions documented"),apiTesting:yes(),exploitation:yes("Vendor describes working proof-of-concept validation"),sast:yes("Code and runtime testing described"),network:partial("Internal infrastructure listed for Enterprise"),ci:yes("Repository and delivery integrations"),compliance:partial("Compliance-ready reports are not a certification of your app"),openSource:yes("Apache-2.0 local edition")},
 theirPros:["Open-source local engine","Code and runtime context with proof-of-concept output","Cloud workflow and repository integrations"],
 theirCons:["Local model and Docker setup need an operator","Consider both cloud seat and pentest billing","Agree permitted actions before agent-driven tests"],
 pricing:["Local engine is open source; model usage has its own costs or subscription terms.","Cloud Pro uses seat billing and separately billed pentests; Enterprise is custom."],
 chooseThem:"You want agent-driven code and runtime tests with a controlled environment for exploit validation.",
 faq:[{question:"How is MyPentest different from Strix?",answer:"Strix describes AI agents that develop and validate attacks. MyPentest runs defined checks and attaches evidence and confidence; it does not generate general exploit chains or code-fix pull requests."},{question:"Can the local Strix edition run without setup?",answer:"The official setup documents Docker and a supported model credential. Managed cloud is a separate option. Check model access and cloud billing before choosing."},{question:"Is MyPentest more accurate than Strix?",answer:"No published head-to-head run establishes that claim. Compare both tools on the same authorized staging revision, accounts and scope; review misses, false positives, reproducible evidence and total cost using the BugSnaps benchmark protocol."}],
 }, "2026-10-07"),
 profile({
 slug:"xbow",name:"XBOW",vendor:"XBOW",website:"https://xbow.com",category:"Autonomous offensive testing",
 summary:"An autonomous offensive platform describing reproducible exploits and continuous application coverage.",
 sources:[{label:"XBOW platform and finding evidence",url:"https://xbow.com"},{label:"XBOW pricing model",url:"https://xbow.com/pricing"}],
 cells:{hosted:yes(),noLlmKey:yes("Managed platform"),pricePublic:partial("Usage model published; environment-specific quote"),webDast:yes(),exploitation:yes("Reproducible exploit and attack-chain evidence described"),compliance:partial("Auditor-oriented reporting does not certify the target")},
 theirPros:["Attack-chain and exploit evidence described by the vendor","Continuous application coverage","Marketplace procurement options"],
 theirCons:["Environment-specific pricing quote","Confirm login, API and private-network requirements directly","Exploit validation needs permitted-action rules"],
 pricing:["Usage-based pricing is scoped to the environment.","Request a quote; marketplace options may support existing procurement agreements."],
 chooseThem:"Your decision depends on exploit-level proof and testing a wider application portfolio.",
 faq:[{question:"Is MyPentest equivalent to XBOW?",answer:"No. MyPentest does not claim autonomous attack-chain exploitation or equivalent portfolio coverage. Compare evidence on the same permitted target rather than treating the tools as interchangeable."},{question:"Does an auditor-ready report certify compliance?",answer:"No. A report can support an audit, but the applicable standard and assessor determine acceptance. MyPentest does not issue a compliance certification."}],
 }),
 profile({
 slug:"astra-security",name:"Astra Security",vendor:"Astra",website:"https://www.getastra.com",category:"Scanner and pentest platform",
 summary:"A platform offering DAST, API security, automated pentests and expert testing in separate plans.",
 sources:[{label:"Astra product overview",url:"https://www.getastra.com"},{label:"Astra plans, authentication and limits",url:"https://www.getastra.com/pricing"}],
 cells:{hosted:yes(),freeStart:partial("Paid limited trial advertised"),noLlmKey:yes(),pricePublic:yes("Plan and billing-cycle prices published"),webDast:yes(),authTesting:yes(),apiTesting:yes("Separate API plans"),cloud:partial("Separate cloud security offering"),pentestService:yes("Expert pentest plans"),ci:yes("Integration limits vary by plan"),compliance:partial("Compliance views; audit acceptance depends on the assessor")},
 theirPros:["Authenticated DAST and API offerings","Expert test packages","Compliance views and development integrations"],
 theirCons:["Compare web, API and expert plan scope separately","Entry scanner plan has a scan allowance","A scanner report alone does not establish compliance"],
 pricing:["Public plans distinguish scanners, automated pentests and expert engagements.","The listed scanner trial is paid; verify targets, billing cycle and retest terms."],
 chooseThem:"You need a packaged expert engagement or broader vendor support alongside scanning.",
 faq:[{question:"Does MyPentest include a pentest certificate?",answer:"No. Automated MyPentest reports contain evidence and remediation. Ask your assessor what documentation and manual testing an audit requires; a separate BugSnaps engagement needs an agreed scope."},{question:"What should I compare in Astra's plans?",answer:"Check target definitions, authenticated scanning, scan allowances, expert involvement, API scope and retest terms. An entry scanner and an expert engagement provide different services."}],
 }),
 profile({
 slug:"intruder",name:"Intruder",vendor:"Intruder",website:"https://www.intruder.io",category:"Exposure and vulnerability management",
 summary:"A hosted platform for infrastructure and cloud exposure management, with web-app and API testing on relevant plans.",
 sources:[{label:"Intruder exposure platform",url:"https://www.intruder.io"},{label:"Intruder current plans and DAST",url:"https://www.intruder.io/pricing"}],
 cells:{hosted:yes(),freeStart:yes("Free infrastructure plan; authenticated DAST is not included"),noLlmKey:yes(),pricePublic:partial("Plan structure and interactive asset pricing"),webDast:yes("Relevant paid plans"),authTesting:yes("Paid web-app and API scope"),apiTesting:yes(),network:yes(),cloud:yes("Connected cloud-account checks"),ci:yes("Plan-dependent integrations"),compliance:partial("Compliance and cyber-hygiene reporting")},
 theirPros:["External infrastructure monitoring","Cloud and container checks","Paid authenticated DAST alongside exposure workflows"],
 theirCons:["Free infrastructure coverage differs from paid DAST","Selected asset types and counts affect pricing","Evaluate application depth on your own test case"],
 pricing:["A free infrastructure plan is published.","Paid plans separate infrastructure and web-app assets; confirm configured totals and taxes."],
 chooseThem:"You want ongoing exposure management across infrastructure, cloud and applications.",
 faq:[{question:"Does Intruder's free plan include authenticated DAST?",answer:"The reviewed plan page lists free infrastructure scanning and says web-app DAST is not included there. Relevant paid plans offer web-app and API testing."},{question:"Can MyPentest complement Intruder?",answer:"A broader exposure workflow and a separate application assessment can serve different needs. Review duplicated coverage and remaining gaps before paying for both."}],
 }),
 profile({
 slug:"pentest-tools",name:"Pentest-Tools.com",vendor:"Pentest-Tools.com",website:"https://pentest-tools.com",category:"Hosted testing toolkit",
 summary:"A hosted toolkit with network, web and API scanning, exploitation and reporting features depending on the plan.",
 sources:[{label:"Pentest-Tools.com features and costs",url:"https://pentest-tools.com/pricing"},{label:"Pentest-Tools.com platform",url:"https://pentest-tools.com"}],
 cells:{hosted:yes(),freeStart:yes("Limited free tools and trial options"),noLlmKey:yes(),pricePublic:yes("Prices vary by assets and billing cycle"),webDast:yes(),authTesting:yes("WebNetSec and above"),apiTesting:yes("REST and GraphQL"),exploitation:yes("Plan-dependent CVE, SQL injection and XSS exploiters"),network:yes(),cloud:yes("Cloud checks listed"),ci:yes("API and integrations"),pentestService:yes("Expert services listed"),compliance:partial("Reporting and integrations; confirm audit requirements")},
 theirPros:["Network, web and API tools","Plan-dependent exploiters","Editable reports and finding-import workflow"],
 theirCons:["Plan tier changes scanning and exploitation scope","Assets and billing cycle affect price","An operator still chooses scope and validates relevance"],
 pricing:["Public tiers separate network assessment, web/API testing and the pentest suite.","Compare asset count, internal scanning add-ons and report requirements."],
 chooseThem:"You want a hosted toolbox and editable reporting across network and application engagements.",
 faq:[{question:"Are all Pentest-Tools.com features in the entry plan?",answer:"No. The plan page separates NetSec, WebNetSec and Pentest Suite. Authenticated web scanning and exploiters appear in different tiers."},{question:"Does MyPentest offer the same toolkit?",answer:"No. It runs a narrower web-app assessment without network tools, general exploiters or an editable DOCX report generator."}],
 }),
 profile({
 slug:"burp-suite",name:"Burp Suite",vendor:"PortSwigger",website:"https://portswigger.net/burp",category:"Manual toolkit and DAST editions",
 summary:"A manual toolkit with automated scanning in Professional and a separate portfolio-oriented Burp Suite DAST product.",
 sources:[{label:"Burp Suite Professional workflow",url:"https://portswigger.net/burp/pro"},{label:"Burp Suite DAST deployment",url:"https://portswigger.net/burp/dast"},{label:"Burp Community download",url:"https://portswigger.net/burp/communitydownload"}],
 cells:{hosted:partial("Professional is local; DAST offers managed cloud"),freeStart:yes("Community manual tools and Professional trial"),noLlmKey:partial("Core tests need no personal model key; AI features have separate terms"),pricePublic:partial("Professional price published; DAST contact sales"),webDast:yes("Professional scanner and DAST"),authTesting:yes(),apiTesting:yes(),exploitation:yes("Manual request control and attack tools"),ci:partial("DAST has pipeline and API integrations"),openSource:partial("Local commercial deployment; not an open-source engine")},
 theirPros:["Manual and automated request-level control","Extension ecosystem","DAST cloud and self-hosted deployment"],
 theirCons:["Professional and DAST are separate workflows and licences","Manual value depends on the operator","Community is not the automated scanner package"],
 pricing:["Community provides free manual tools.","Professional has a published per-user licence price; evaluate DAST separately."],
 chooseThem:"You need request crafting, extensions or a DAST programme with its own deployment controls.",
 faq:[{question:"Does MyPentest replace a pentester using Burp?",answer:"No. A skilled tester can inspect business logic, craft requests and explore chains beyond the automated MyPentest product's scope."},{question:"Which Burp edition should I compare?",answer:"Use Professional for the operator toolkit and Burp Suite DAST for portfolio scanning. DAST cloud deployment claims do not describe desktop Professional."}],
 }),
 profile({
 slug:"owasp-zap",name:"ZAP",vendor:"ZAP",website:"https://www.zaproxy.org",category:"Open-source web testing",
 summary:"A free open-source web scanner and proxy with authentication, API and automation features.",
 sources:[{label:"ZAP project",url:"https://www.zaproxy.org"},{label:"ZAP automation",url:"https://www.zaproxy.org/docs/automate/"},{label:"ZAP authentication",url:"https://www.zaproxy.org/docs/desktop/start/features/authentication/"},{label:"ZAP API scan",url:"https://www.zaproxy.org/docs/docker/api-scan/"}],
 cells:{hosted:{v:"no",note:"You run the scanner"},freeStart:yes("Free open source"),noLlmKey:yes(),pricePublic:yes("Engine is free"),webDast:yes(),authTesting:yes("Contexts, users and session verification need configuration"),apiTesting:yes("OpenAPI, SOAP and GraphQL API scans"),exploitation:partial("Proxy and request tools for manual operators"),ci:yes("Automation framework and containers"),openSource:yes()},
 theirPros:["Free open-source engine","Automation and API scans","Authentication and proxy settings under your control"],
 theirCons:["You operate and maintain the configuration","Verify login success and session state","Active scans need a suitable permitted environment"],
 pricing:["The engine is free and open source.","Your team supplies execution, configuration and triage time."],
 chooseThem:"You want a free scanner in your own environment and can maintain its configuration.",
 faq:[{question:"Is MyPentest based on ZAP?",answer:"MyPentest uses its own crawler and checks. ZAP is a separate open-source scanner with its own rules and automation framework."},{question:"Does ZAP support authenticated API tests?",answer:"ZAP documents authentication contexts and an API-scan workflow. Configure credentials, session verification and API format; this does not prove every endpoint was reached."}],
 }),
 profile({
 slug:"nuclei",name:"Nuclei",vendor:"ProjectDiscovery",website:"https://projectdiscovery.io",category:"Template-based scanning",
 summary:"An open-source YAML-template scanner with HTTP, DNS and network checks plus custom detection workflows.",
 sources:[{label:"Nuclei features and authentication",url:"https://docs.projectdiscovery.io/opensource/nuclei/overview"},{label:"Nuclei source and MIT licence",url:"https://github.com/projectdiscovery/nuclei"}],
 cells:{hosted:partial("Local engine; separate cloud options"),freeStart:yes("MIT-licensed engine"),noLlmKey:yes("Core templates need no LLM key"),pricePublic:partial("Engine is free; cloud is separate"),webDast:yes("HTTP and DAST templates"),authTesting:yes("Supported auth mechanisms need configuration"),apiTesting:partial("Selected templates and DAST determine coverage"),exploitation:partial("Some templates validate exploit conditions; review actions"),network:yes("TCP, DNS and infrastructure checks"),cloud:partial("Template-dependent checks"),ci:yes("CLI and pipeline workflow"),openSource:yes("MIT licence")},
 theirPros:["Open engine and customizable templates","Multiple protocols","Custom security regression checks"],
 theirCons:["Template selection determines coverage","Review actions before executing templates","Operators configure authentication and triage evidence"],
 pricing:["Nuclei is free under the MIT licence.","Hosted ProjectDiscovery services and infrastructure are separate."],
 chooseThem:"You need editable templates, protocol breadth or custom regressions in your pipeline.",
 faq:[{question:"Does a large template count prove better detection?",answer:"No. Results depend on selected checks, reachable functionality and evidence. Compare confirmed findings and missed seeded cases on the same authorized app, not only counts."},{question:"Can MyPentest import Nuclei templates?",answer:"The hosted product does not support importing custom Nuclei templates. Its checks and report workflow are separate."}],
 }),
 profile({
 slug:"stackhawk",name:"StackHawk",vendor:"StackHawk",website:"https://www.stackhawk.com",category:"Developer and agent-loop DAST",
 summary:"A developer security platform with HawkScan runtime tests, cloud findings and coding-agent integrations.",
 sources:[{label:"HawkScan execution",url:"https://docs.stackhawk.com/hawkscan/"},{label:"HawkScan authentication",url:"https://docs.stackhawk.com/hawkscan/authenticated-scanning/"},{label:"StackHawk workflow and plans",url:"https://www.stackhawk.com/pricing/"},{label:"HawkScan GraphQL configuration",url:"https://docs.stackhawk.com/hawkscan/configuration/graphql-configuration/"}],
 cells:{hosted:partial("Hosted results; HawkScan runs in your environment"),freeStart:yes("Trial advertised"),noLlmKey:partial("Scanner needs no model key; agent fixes depend on your coding-agent setup"),pricePublic:partial("Wingman public price; Scale scoped with sales"),webDast:yes(),authTesting:yes("Login, session type and indicators in YAML"),apiTesting:yes("API offering"),ci:yes("Local, pipeline and agent workflows"),openSource:partial("Local execution does not establish an open-source product")},
 theirPros:["Scanner runs near the application","Configured session verification","Developer and coding-agent feedback"],
 theirCons:["Scanner access and app configuration are required","Review model-assisted code fixes","Check tier and scan allowance"],
 pricing:["Wingman publishes per-user billing and a scan allowance.","Scale is scoped with the vendor; verify trial and allowance terms."],
 chooseThem:"You want runtime tests integrated with development, local environments or coding agents.",
 faq:[{question:"Does StackHawk run only in the cloud?",answer:"No. Its documentation separates the hosted results platform from HawkScan, which runs on laptops, servers, Kubernetes or pipelines and needs access to the app."},{question:"Does MyPentest automatically fix source code?",answer:"No. MyPentest supplies remediation guidance. It does not edit your repository or create automated fix pull requests."}],
 }),
 profile({
 slug:"invicti",name:"Invicti",vendor:"Invicti Security",website:"https://www.invicti.com",category:"Web, API and AppSec platform",
 summary:"A DAST platform with proof-based validation and broader AppSec engines. Acunetix is now branded Invicti Web + API by the vendor.",
 sources:[{label:"Invicti DAST",url:"https://www.invicti.com/product/dast"},{label:"Invicti platform",url:"https://www.invicti.com"},{label:"Acunetix branding and deployment",url:"https://www.acunetix.com/vulnerability-scanner/"}],
 cells:{hosted:yes("SaaS option; local deployment also described"),noLlmKey:yes("Core managed scanner"),webDast:yes(),authTesting:yes("Authenticated DAST"),apiTesting:yes(),exploitation:partial("Proof-based validation for supported findings"),sast:partial("Separate platform engines"),cloud:partial("IaC in broader platform"),ci:yes("Delivery and issue tracking"),openSource:partial("Commercial on-premises deployment")},
 theirPros:["Web and API runtime testing","Proof-based validation for supported issues","SaaS and private deployment choices"],
 theirCons:["Review engine and deployment licensing separately","Validation varies by vulnerability class","Evaluate reachable coverage and administration effort"],
 pricing:["Ask for the required deployment, assets and engines.","Older Acunetix names and current packages are not proof of identical licence terms."],
 chooseThem:"You need enterprise deployment controls or a broader AppSec programme.",
 faq:[{question:"Are Acunetix and Invicti unrelated products?",answer:"The reviewed Acunetix site states that Acunetix is Invicti Web + API. Check current packages and migration terms rather than assuming independent vendors."},{question:"Does proof-based scanning validate every possible issue?",answer:"No guarantee is made here. Ask which finding classes receive automated proof and review evidence for the rest."}],
 }),
 profile({
 slug:"detectify",name:"Detectify",vendor:"Detectify",website:"https://detectify.com",category:"Surface and application scanning",
 summary:"An attack-surface platform with authenticated DAST, API scanning and researcher-informed checks.",
 sources:[{label:"Detectify platform",url:"https://detectify.com"},{label:"Detectify authenticated DAST",url:"https://detectify.com/product/application-scanning"},{label:"Detectify pricing structure",url:"https://detectify.com/pricing"}],
 cells:{hosted:yes(),freeStart:partial("Starter and trial options; confirm usage scope"),noLlmKey:yes("Core platform"),pricePublic:partial("Platform fees; added assets and environments cost extra"),webDast:yes(),authTesting:yes(),apiTesting:yes("REST and GraphQL"),network:partial("Surface and internal scanning; confirm protocols"),ci:yes("Plan-dependent integrations"),compliance:partial("Separate PCI ASV offering")},
 theirPros:["Surface and application workflows","Authenticated crawling and fuzzing","Researcher-informed tests"],
 theirCons:["Platform fee may not be the total cost","Check application, surface and internal scope separately","Verify authentication success in your evaluation"],
 pricing:["Published tiers include Starter through Enterprise.","Added assets, domains, environments and IP ranges can increase cost."],
 chooseThem:"You need surface visibility with recurring application tests and organization controls.",
 faq:[{question:"Is Detectify only a public website scanner?",answer:"No. Reviewed pages describe surface monitoring, authenticated applications, API and internal options. The selected package determines scope."},{question:"Should I compare only the platform fee?",answer:"No. The pricing page lists added costs for assets, domains, environments and IP ranges. Compare your complete configuration."}],
 }),
 profile({
 slug:"qualys-was",name:"Qualys WAS",vendor:"Qualys",website:"https://www.qualys.com/apps/web-app-scanning",category:"Enterprise web scanning",
 summary:"Web Application Scanning with authentication records, API tests and reporting across application inventories.",
 sources:[{label:"Qualys WAS official setup guide",url:"https://www.qualys.com/docs/qualys-was-getting-started-guide.pdf"},{label:"Qualys WAS API",url:"https://docs.qualys.com/en/was/api/get_started/get_started.htm"},{label:"Qualys scan authentication status",url:"https://docs.qualys.com/en/was/portal/latest/scans/check_authentication.htm"}],
 cells:{hosted:yes("Cloud external scanners; internal targets need an appliance"),noLlmKey:yes("Managed scanner"),webDast:yes(),authTesting:yes("Records and browser scripts"),apiTesting:partial("REST/SOAP and collections; verify specification versions"),ci:yes("API and Jenkins documented"),openSource:partial("Internal appliance, not an open-source engine")},
 theirPros:["Inventory, tags and reporting","Configured authentication and API scans","Internal and external scanner options"],
 theirCons:["Internal access requires scanner placement","Verify API specification-version support","Profiles and exclusions change depth and impact"],
 pricing:["Setup and API guides do not establish current licence prices.","Confirm app count, appliances and contract terms with Qualys."],
 chooseThem:"You need application findings in an existing Qualys inventory and management workflow.",
 faq:[{question:"Does WAS include every Qualys infrastructure feature?",answer:"No. WAS is the web-application module. Network and cloud capabilities should not be treated as included merely because they share a vendor."},{question:"Can a cloud scanner reach an internal app?",answer:"The WAS guide documents an internal scanner appliance. Confirm reachability, credentials and exclusions before judging results."}],
 }),
 profile({
 slug:"rapid7-insightappsec",name:"Rapid7 InsightAppSec",vendor:"Rapid7",website:"https://www.rapid7.com/products/insightappsec/",category:"Managed application DAST",
 summary:"A DAST product with cloud and on-premises engines, authentication configuration, attack replay and remediation reporting.",
 sources:[{label:"InsightAppSec product and replay",url:"https://www.rapid7.com/products/insightappsec/"},{label:"InsightAppSec authentication",url:"https://docs.rapid7.com/insightappsec/authentication/"}],
 cells:{hosted:yes("Cloud and optional closed-network engine"),noLlmKey:yes("Managed scanner"),webDast:yes(),authTesting:yes(),apiTesting:yes("Application and API tests described"),exploitation:partial("Attack Replay reproduces reported issues"),ci:yes("Developer and ticketing integration"),compliance:partial("Compliance-oriented reports, not certification"),pentestService:yes("Separate Rapid7 services"),openSource:partial("Private scan engine, not open-source product")},
 theirPros:["Cloud and private-network engine options","Developer Attack Replay","Remediation reporting"],
 theirCons:["Engine placement and credentials need setup","Wider Rapid7 modules are separate","Interpret replay evidence in the application's context"],
 pricing:["Request current licence and asset scope from Rapid7.","Confirm engine, support and wider-platform terms separately."],
 chooseThem:"You want an integrated DAST programme with developer replay and management workflows.",
 faq:[{question:"Does InsightAppSec include network scanning?",answer:"This comparison covers application DAST. Other Rapid7 infrastructure and exposure products should not be assumed to be included."},{question:"Does MyPentest provide Attack Replay?",answer:"No. Reports provide evidence and remediation without InsightAppSec's integrated developer replay workflow."}],
 }),
 profile({
 slug:"snyk",name:"Snyk",vendor:"Snyk",website:"https://snyk.io",category:"Code security and separate DAST",
 summary:"Snyk Code scans source code; the separate Snyk API & Web offering tests running applications.",
 sources:[{label:"Snyk Code source analysis",url:"https://snyk.io/product/snyk-code/"},{label:"Snyk API & Web DAST",url:"https://snyk.io/product/dast-api-web/"},{label:"Snyk platform products",url:"https://snyk.io/platform/"}],
 cells:{hosted:yes("Requirements vary by product"),freeStart:partial("Free Code offer; not proof of free DAST"),noLlmKey:yes("Core managed products"),pricePublic:partial("Review the selected product's offer"),webDast:partial("API & Web, not Snyk Code"),authTesting:partial("API & Web lists SSO/OpenID scans"),apiTesting:partial("API & Web"),sast:yes("Snyk Code"),cloud:partial("IaC code checks, not a cloud-account audit"),ci:yes("Repository and developer workflows")},
 theirPros:["Source feedback during development","Separate runtime API and web tests","Developer integrations and fix guidance"],
 theirCons:["Code tests do not replace runtime access control","Review entitlements by product","Check languages and authentication support"],
 pricing:["Snyk Code advertises a free offering with plan-dependent features.","Confirm API & Web entitlements separately; free Code does not imply free DAST."],
 chooseThem:"You need code and dependency feedback or its separate runtime scanner in a broader programme.",
 faq:[{question:"Does Snyk API & Web test REST and GraphQL APIs?",answer:"Snyk API & Web documents dynamic testing for running web applications and APIs, including REST and GraphQL surfaces, separate from Snyk Code static source analysis. Check your Snyk plan entitlements and authentication setup."},{question:"Is Snyk only a source-code scanner?",answer:"No. Snyk Code performs source analysis, but the current platform also lists Snyk API & Web DAST. Compare product-level scope."},{question:"Can MyPentest replace Snyk Code?",answer:"No. MyPentest does not read repositories or dependency manifests. Runtime and code tests can complement each other."}],
 }),
 profile({
 slug:"hcl-appscan",name:"HCL AppScan",vendor:"HCLSoftware",website:"https://www.hcl-software.com/appscan",category:"Application security product family",
 summary:"A family of dynamic, static and other application tests, including Standard, on Cloud and enterprise deployments.",
 sources:[{label:"HCL AppScan product family",url:"https://www.hcl-software.com/appscan"},{label:"AppScan Standard DAST",url:"https://www.hcl-software.com/appscan/products/appscan-standard"},{label:"AppScan offers",url:"https://www.hcl-software.com/appscan/marketplace"},{label:"AppScan login methods",url:"https://help.hcl-software.com/appscan/Standard/10.12.0/r_ExploreLoginManagement024.html"}],
 cells:{hosted:partial("On Cloud; Standard has another deployment"),freeStart:yes("Trial advertised"),noLlmKey:yes("Core scanner"),pricePublic:partial("Selected offers; contracts vary"),webDast:yes("DAST editions"),authTesting:yes("Standard login workflows"),apiTesting:yes(),sast:partial("Source and relevant editions"),cloud:partial("Broader IaC capabilities are product-dependent"),ci:yes("Developer workflow integrations"),compliance:partial("Reporting is not application certification"),openSource:partial("Local/private deployment; not open-source engine")},
 theirPros:["Multiple testing engines","Cloud and private deployments","Developer and organizational workflows"],
 theirCons:["Compare editions and engines carefully","Deployment and login setup affect coverage","Trial is not full enterprise licensing"],
 pricing:["The marketplace lists selected offers.","Compare edition, engines, deployment, support and contract term."],
 chooseThem:"You need a specific AppScan deployment or multiple security-testing engines.",
 faq:[{question:"Are Standard and on Cloud interchangeable?",answer:"They use different deployments and packages. Standard focuses on dynamic web/API testing; the family also includes cloud and source-analysis products. Confirm the edition."},{question:"Does MyPentest include AppScan static analysis?",answer:"No. MyPentest tests reachable web surfaces and APIs. Source review requires separate tooling or a specifically scoped engagement."}],
 }),
];
export function competitor(slug:string):Competitor|undefined{return competitors.find(c=>c.slug===slug)}
export function versusPath(slug:string):string{return `/compare/mypentest-vs-${slug}`}
export const VERSUS_PREFIX="mypentest-vs-";
export const HUB_FEATURES:FeatureId[]=["hosted","freeStart","webDast","authTesting","sast","ci","openSource"];
export function formatCheckedOn(date:string):string{return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}

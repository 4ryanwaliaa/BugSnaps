import type { Post } from "@/lib/blog";

const reactRce = "https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components";
const reactFollowup = "https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components";
const nextOctober = "https://nextjs.org/blog/nextjs-security-update-october-14-2026";

export const recentAdvisoryPosts: Post[] = [
  {
    slug: "react2shell-cve-2025-55182-website-check",
    title: "React2Shell CVE-2025-55182: how to check your website's exposure",
    description: "Understand React2Shell exposure, inspect deployed React Server Components dependencies, and combine patch verification with a scoped website security scan.",
    published: "2026-10-22",
    author: "BugSnaps",
    readingMinutes: 4,
    body: [
      { type: "p", text: "React2Shell is the name commonly used for CVE-2025-55182. React disclosed this critical, unauthenticated remote code execution vulnerability on December 3, 2025. It concerns React Server Components (RSC), rather than every website displaying a React interface. Start with the software running on your server, then establish whether its deployed configuration falls within the advisory." },
      { type: "h2", text: "Which React applications were affected?" },
      { type: "p", text: "React's advisory identifies versions 19.0.0, 19.1.0, 19.1.1 and 19.2.0 of react-server-dom-webpack, react-server-dom-parcel and react-server-dom-turbopack. An application supporting RSC can be affected even without deliberately implementing Server Function endpoints. Client-only React applications without a server or RSC integration are outside this advisory's scope." },
      { type: "h2", text: "Check the deployed application, not just package.json" },
      { type: "ol", items: [
        "List production domains, preview deployments and older environments that remain reachable. Assign an owner to each application.",
        "Inspect the resolved dependency tree and lockfile for the deployed build. A declared version range alone does not identify the installed package.",
        "Record the framework, RSC packages, deployment identifier and runtime. If your hosting provider bundles dependencies, inspect its build output or ask for the resolved versions.",
        "Compare that evidence with the official advisory and the framework's current security release guidance. Keep the evidence alongside the remediation ticket.",
      ] },
      { type: "p", text: "A public page may hide framework details, and a response header may be cached or misleading. Neither an absent framework fingerprint nor a successful homepage request demonstrates that the server is patched. Where version evidence is unavailable, record the status as unknown until the application owner can verify it." },
      { type: "h2", text: "Patch, redeploy and verify the release" },
      { type: "p", text: "The initial RCE fixes were 19.0.1, 19.1.2 and 19.2.1. Later RSC advisories require additional updates, so those historical minimums are not a complete patch target today. React also cautions against relying solely on hosting-provider mitigations." },
      { type: "p", text: "Use a supported framework release that includes applicable security fixes. Rebuild and deploy the application, then verify which release serves production traffic. Updating a local lockfile leaves the running server unchanged until the deployment completes. Test sign-in, server-rendered pages and critical user journeys after the change. If compromise is suspected, preserve evidence and follow your incident-response process; a software update does not establish what happened before it." },
      { type: "h2", text: "Can a website scan tell me whether React2Shell is present?" },
      { type: "p", text: "A scan is useful only within its documented coverage. Ask whether it checks an exact dependency version, observes a public signal, or performs a dedicated validated check. Those evidence types answer different questions. A scan that finds no supported issues cannot certify an entire application free of this CVE." },
      { type: "callout", text: "Run a MyPentest scan on a site you own or are authorized to test to review supported website security checks. React2Shell-specific detection is not confirmed here. Use the official advisory and deployed dependency evidence to establish CVE-2025-55182 exposure; treat any untested condition as unknown." },
    ],
    related: [
      { label: "Run supported website security checks", href: "/mypentest" },
      { label: "RSC denial of service and source disclosure follow-up", href: "/blog/react-server-components-dos-source-code-exposure" },
      { label: "Official React security advisory: CVE-2025-55182", href: reactRce },
    ],
  },
  {
    slug: "react-server-components-dos-source-code-exposure",
    title: "React Server Components security: DoS and source code exposure after React2Shell",
    description: "Why an early React2Shell patch may leave separate RSC issues unresolved: review CVE-2026-23864, denial of service and source code exposure remediation.",
    published: "2026-10-22",
    author: "BugSnaps",
    readingMinutes: 4,
    body: [
      { type: "p", text: "A completed React2Shell ticket is not evidence that every subsequent React Server Components issue has been resolved. React published a separate advisory on December 11, 2025 and updated it on January 26, 2026. This follow-up concerns availability and source code exposure, and deserves its own deployment verification." },
      { type: "h2", text: "Which CVEs does the follow-up cover?" },
      { type: "ul", items: [
        "Denial of service: CVE-2025-55184, CVE-2025-67779 and CVE-2026-23864, rated high severity (CVSS 7.5).",
        "Source code exposure: CVE-2025-55183, rated medium severity (CVSS 5.3).",
        "These issues do not provide remote code execution; React states that the React2Shell RCE patch remains effective against that RCE issue.",
      ] },
      { type: "p", text: "The advisory names react-server-dom-webpack, react-server-dom-parcel and react-server-dom-turbopack. Its January update identifies 19.0.4, 19.1.5 and 19.2.4 as fixed versions for this group of vulnerabilities. Earlier fixes were incomplete. Treat these as historical advisory-specific minimums and consult current framework guidance for later security updates." },
      { type: "h2", text: "Why availability and code exposure need different reviews" },
      { type: "p", text: "An availability investigation asks whether the service can continue processing normal requests. Review application errors, response latency and resource usage against a normal baseline. Traffic spikes can have many causes, so an overloaded server alone is not proof that a particular vulnerability was exploited. Keep timestamps, release identifiers and supporting logs with the incident record." },
      { type: "p", text: "A source exposure review asks what information could become visible outside its intended audience. Examine how sensitive configuration reaches server code, and whether secrets were embedded in application source. Do not assume that a source disclosure advisory means every environment variable was exposed. Scope the investigation to the affected mechanism and your actual application; rotate credentials when the evidence and incident-response assessment call for it." },
      { type: "h2", text: "A practical RSC patch-verification checklist" },
      { type: "ol", items: [
        "Identify every deployed application using RSC, including preview and staging systems with external access.",
        "Record the resolved RSC dependency versions for each deployed artifact. Compare them with the advisory rather than relying on the date of a previous patch ticket.",
        "Upgrade through the framework's supported release path, rebuild and deploy. Preserve the new artifact identifier and dependency evidence.",
        "Confirm production is serving the patched artifact, then test normal workflows and observe error and resource metrics.",
        "Keep unknown or inaccessible environments open in the tracking record until someone verifies them. Avoid marking a whole organization patched from a sample of one service.",
      ] },
      { type: "h2", text: "What to ask of a website vulnerability report" },
      { type: "p", text: "Look for a clear test scope and an explanation of each result. A confirmed issue, a negative result for one executed check and an untested component are different outcomes. An external website scan can complement the release review, but it cannot read every dependency or configuration inside your deployment. Avoid attempting resource-exhaustion experiments against production just to obtain a visible failure." },
      { type: "callout", text: "Use MyPentest to run supported checks against your authorized website and review actionable findings. Coverage for these specific RSC CVEs is not confirmed here. Pair the scan with dependency verification and the official React advisory before deciding whether your application is affected." },
    ],
    related: [
      { label: "Start a scoped website security scan", href: "/mypentest" },
      { label: "React2Shell exposure and patch verification", href: "/blog/react2shell-cve-2025-55182-website-check" },
      { label: "Official React DoS and source exposure advisory", href: reactFollowup },
    ],
  },
  {
    slug: "nextjs-october-2026-security-update-rce",
    title: "Next.js October 2026 security update: RCE risks and deployment checks",
    description: "Review the October 14 Next.js fixes for Cache Components RCE, CVE-2026-96889 image optimization RCE and Server Actions DoS, with a deployment checklist.",
    published: "2026-10-22",
    author: "BugSnaps",
    readingMinutes: 4,
    body: [
      { type: "p", text: "Next.js published an upstream-security update on October 14, 2026 covering two critical remote code execution issues and a high-severity denial of service issue. Its patched releases are 15.5.28 and 16.4.1. These are separate advisories from the December 2025 React2Shell disclosure." },
      { type: "h2", text: "Three issues with different affected configurations" },
      { type: "ul", items: [
        "GHSA-673q-mjm6-r5xr: unauthenticated RCE in App Router applications with Cache Components involving use cache functions returning multiple typed arrays. Next.js says there is no known workaround and advises upgrading even without similar functions.",
        "CVE-2026-96889 / GHSA-2464-fhr4-w9xw: image optimization RCE involving an upstream library on glibc-based Linux. The advisory identifies sharp 0.35.5 or later as a workaround; patched Next.js releases pull in a fixed dependency.",
        "GHSA-p3m5-59mp-jv5r: excessive CPU use affecting App Router applications with at least one Server Action. The advisory excludes Pages Router applications and applications without Server Actions from this particular DoS issue.",
      ] },
      { type: "h2", text: "Build a configuration inventory before declaring exposure" },
      { type: "p", text: "Collect the Next.js version, resolved image-processing dependencies, hosting runtime and router configuration from the deployed artifact. Document which applications use server actions, caching features and image optimization. A statement such as 'we use Next.js' is a starting point, not a complete affectedness assessment. Likewise, an exclusion for one issue does not establish that the other issues are irrelevant." },
      { type: "p", text: "For teams with several environments, use one row per deployment: domain, owner, build identifier, relevant configuration, patch status and verification evidence. Include older previews that still receive traffic. This makes it easier to find the overlooked environment after the main production deployment has been updated." },
      { type: "h2", text: "Apply the update and prove it reached production" },
      { type: "ol", items: [
        "Read the official advisory linked below and select a supported patched release appropriate to your application. Review migration requirements if your current branch is older.",
        "Update dependencies and the lockfile, then build a fresh deployment artifact. Inspect the resolved dependency tree rather than assuming the requested version was installed.",
        "Exercise image delivery, cached pages, sign-in and server actions in a representative environment. Record any compatibility issues and resolve them before completing the rollout.",
        "Deploy the patched artifact to every affected environment. Verify the deployment identifier that actually serves requests and remove obsolete exposed deployments through your normal release process.",
        "Monitor errors and resource usage after release. Save evidence of the installed versions and functional checks with the security ticket.",
      ] },
      { type: "h2", text: "Does a clean scan mean my Next.js website is safe?" },
      { type: "p", text: "No single scan establishes that an application is free of vulnerabilities. A useful report identifies what was tested, what evidence was observed and what remained outside scope. Dependency evidence answers whether a vulnerable package is present; configuration review answers whether advisory conditions apply; runtime checks answer a narrower question about the tested behavior. Use the three together when deciding what to fix." },
      { type: "p", text: "Keep patch verification separate from compromise assessment. If you have suspicious application behavior or evidence of unauthorized access, preserve the relevant records and investigate through your incident-response process. A successful deployment does not reconstruct past activity." },
      { type: "callout", text: "Run a MyPentest scan on your authorized website to review supported security checks and prioritize findings. Dedicated detection of these October 2026 Next.js advisories is not confirmed here. Verify these CVEs through the official advisory, your deployed dependencies and configuration review; a clean general scan is not a CVE clearance certificate." },
    ],
    related: [
      { label: "Run supported checks on your website", href: "/mypentest" },
      { label: "Official Next.js October 14, 2026 security update", href: nextOctober },
      { label: "React2Shell: understand the separate RSC RCE advisory", href: "/blog/react2shell-cve-2025-55182-website-check" },
    ],
  },
];

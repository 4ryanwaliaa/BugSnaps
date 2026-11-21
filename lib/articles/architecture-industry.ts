import type { Post } from "@/lib/blog";

export const architectureIndustryPosts: Post[] = [
  {
    slug: "pentesting-saas-applications-checklist",
    title: "Multi-Tenant SaaS Pentesting Checklist",
    description:
      "Pre-launch penetration testing checklist for SaaS engineering teams: verify multi-tenant data isolation, invitations, role downgrades, and exports.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Launching or scaling a multi-tenant Software-as-a-Service (SaaS) platform places strict demands on your authorization model. Because multiple customer organizations share the same application runtime, API routes, and database tables, the highest-impact security risk is cross-tenant data exposure: a user in Organization A reading, exporting, or modifying records that belong to Organization B.",
      },
      { type: "h2", text: "Four multi-tenant isolation boundaries to test first" },
      {
        type: "p",
        text: "When scoping a SaaS penetration test or running an authenticated assessment, verify that tenant isolation holds across every path that reads or mutates data—not just the buttons visible in the frontend UI:",
      },
      {
        type: "ul",
        items: [
          "Cross-tenant object and collection lookups (BOLA/IDOR): test whether supplying Organization B's record ID, workspace slug, or filter parameter using Organization A's session token returns foreign records.",
          "Workspace invitations and domain auto-join: verify that invitation tokens are single-use, expire promptly, bind to the intended recipient or verified email domain, and cannot be replayed to join another tenant.",
          "Role downgrades and member removal: confirm that removing a member or downgrading an administrator to a read-only viewer immediately revokes privileged API actions without waiting for a long-lived JWT to expire.",
          "Asynchronous exports, webhooks, and background jobs: check that CSV/PDF report generators and queue workers re-verify tenant ownership when generating and delivering downloadable files.",
        ],
      },
      { type: "h2", text: "Testing subscription entitlements and administrative actions" },
      {
        type: "p",
        text: "In addition to horizontal tenant isolation, test vertical role boundaries inside a single workspace (Owner, Admin, Billing, Member, Read-Only) and plan-level entitlements. Ensure that restricted features, API key creation, audit-log settings, and seat changes are enforced by server-side middleware rather than hidden React components.",
      },
      {
        type: "p",
        text: "Provision at least two synthetic organizations with recognizable test data before running your assessment. Supply paired accounts to MyPentest for baseline web and API checks, and combine those results with manual testing of invitation, billing, and role-transition workflows.",
      },
      {
        type: "callout",
        text: "Scope every database query by the authenticated session's verified tenant context, and test cross-tenant isolation using two separate synthetic workspaces.",
      },
    ],
    related: [
      { label: "SaaS penetration testing solutions", href: "/solutions/saas-penetration-testing" },
      { label: "SaaS security testing use case", href: "/use-cases/saas" },
      { label: "BOLA testing guide", href: "/guides/bola-testing" },
      { label: "Web application pentesting", href: "/web-application-pentesting" },
    ],
  },
  {
    slug: "pentesting-fintech-payment-gateways-guide",
    title: "Fintech & Payment Gateway Pentesting Guide",
    description:
      "How to security test fintech apps and payment gateways: verify server-side totals, webhook HMAC signatures, currency rules, and idempotent ledgers.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Fintech applications, wallets, and payment-gateway integrations handle high-consequence state transitions where a logic bug can alter account balances or mark unpaid orders as settled. Unlike general content websites, fintech security assessments focus heavily on transaction invariants, asynchronous provider callbacks, multi-step approval workflows, and strict separation of duties between customer and operator roles.",
      },
      { type: "h2", text: "High-risk payment and transaction flaws to test" },
      {
        type: "p",
        text: "Using sandbox payment credentials and synthetic ledger accounts, penetration testers evaluate how the backend handles manipulated payment parameters and out-of-order events:",
      },
      {
        type: "ul",
        items: [
          "Negative or zero amount tampering: submitting negative quantities, zero-value transfer amounts, or fractional rounding values to test whether debit logic inadvertently credits a balance.",
          "Currency and order-ID substitution: creating a payment order in a lower-unit currency (or for a low-priced item) and attempting to apply its payment confirmation token to a higher-value order.",
          "Forged or replayed payment webhooks: sending unsigned, modified, or repeated webhook payloads to `/api/webhooks/razorpay` or `/api/webhooks/paypal` to check whether the server verifies cryptographic signatures and event uniqueness.",
          "Concurrent withdrawal and refund races (TOCTOU): issuing parallel transfer or refund requests to verify that row-level locking and idempotency keys prevent double-crediting.",
        ],
      },
      { type: "h2", text: "Enforcing authoritative server-side ledger invariants" },
      {
        type: "p",
        text: "Never trust price, currency, fee, or settlement status fields submitted by the browser. Compute totals on the server from authoritative database records, verify webhook signatures using the raw request body and constant-time comparison (`crypto.timingSafeEqual`), and record every processed provider `payment_id` or `event_id` in a unique database constraint so duplicate webhook deliveries are safely ignored. Log every payment state transition with actor and correlation identifiers so reconciliation audits can trace every balance change end to end.",
      },
      {
        type: "callout",
        text: "Test payment and ledger workflows in a sandbox using synthetic balances, and verify that every webhook and transfer enforces signature checks and idempotency.",
      },
    ],
    related: [
      { label: "Fintech penetration testing solutions", href: "/solutions/fintech-penetration-testing" },
      { label: "Fintech security testing use case", href: "/use-cases/fintech" },
      { label: "PCI DSS penetration testing", href: "/blog/penetration-testing-for-pci-dss-v4" },
      { label: "BugSnaps pentest services", href: "/penetration-testing" },
    ],
  },
  {
    slug: "pentesting-ecommerce-stores-checkout-flows",
    title: "E-Commerce Checkout Security Testing Guide",
    description:
      "How penetration testing protects e-commerce stores: test cart price tampering, coupon stacking, inventory reservation abuse, and order IDOR flaws.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "E-commerce storefronts combine public catalog browsing with authenticated customer accounts, promotional engines, payment redirects, and fulfillment webhooks. Because checkout spans multiple client and server steps, business-logic flaws in cart and order transitions can cause direct revenue loss or expose customer shipping and invoice records.",
      },
      { type: "h2", text: "Four checkout and order-management flaws to test" },
      {
        type: "p",
        text: "While automated scanners check for missing headers, cookie attributes, and injection indicators, a complete e-commerce security assessment also tests the business rules governing carts, discounts, and order ownership:",
      },
      {
        type: "ul",
        items: [
          "Order and invoice BOLA/IDOR: checking whether Shopper A (or an unauthenticated guest lookup) can view Shopper B's order confirmation, home address, or downloadable PDF invoice by changing an order ID or phone parameter.",
          "Cart price and shipping-tier tampering: intercepting `POST /api/cart` or checkout requests to verify that unit prices, tax rates, and shipping fees are looked up on the server rather than accepted from client JSON.",
          "Coupon stacking and single-use bypass: testing whether single-use promo codes, referral credits, or gift vouchers can be applied multiple times across parallel requests or combined beyond promotion rules.",
          "Cart modifications after payment initiation: adding items to a cart in one tab after a payment session is created in another tab to test whether the final webhook reconciles the paid amount against the fulfilled items.",
        ],
      },
      { type: "h2", text: "Hardening the checkout state machine" },
      {
        type: "p",
        text: "Model checkout as a strict server-side state machine. Freeze or hash the cart line items and total when creating the payment intent, verify at webhook settlement that the paid currency and amount match the locked order total exactly, expire unpaid inventory holds on a predictable schedule, and enforce object-level ownership checks on every order status and invoice download route.",
      },
      {
        type: "callout",
        text: "Lock cart items and server-calculated totals before generating a payment session, and verify paid amount and currency match before marking an order fulfilled.",
      },
    ],
    related: [
      { label: "E-commerce security testing use case", href: "/use-cases/ecommerce" },
      { label: "Web application pentesting", href: "/web-application-pentesting" },
      { label: "Try MyPentest automated scan", href: "/mypentest" },
    ],
  },
  {
    slug: "pentesting-ai-llm-web-applications",
    title: "Penetration Testing AI & LLM Web Apps",
    description:
      "How to security test AI and LLM web applications: evaluate prompt injection, insecure output handling, excessive tool agency, and RAG data isolation.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Embedding Large Language Models (LLMs), retrieval-augmented generation (RAG), and tool-calling agents into web applications introduces new trust boundaries alongside traditional web and API risks. When an application passes untrusted user text—or external documents, emails, and web pages—into a model that can query data or invoke backend functions, attackers look for ways to steer model outputs and tool calls.",
      },
      { type: "h2", text: "Four high-priority risks in AI-enabled web applications" },
      {
        type: "p",
        text: "Aligned with the OWASP Top 10 for LLM Applications, security testing of AI features focuses on where model inputs and outputs cross into application code and customer data:",
      },
      {
        type: "ul",
        items: [
          "Direct and indirect prompt injection (LLM01): crafting user prompts—or embedding hidden instructions inside uploaded documents, tickets, or web pages ingested by a RAG pipeline—to override system instructions.",
          "Insecure output handling (LLM02): rendering model-generated markdown or HTML into the browser without sanitization (causing XSS), or passing model-generated strings directly into SQL queries, shell commands, or URL fetchers.",
          "Cross-tenant RAG and vector-store leakage: retrieving embeddings or context snippets from a shared vector database without filtering by the signed-in user's `tenant_id` and document permissions.",
          "Excessive agency in tool calling (LLM08): allowing an LLM agent to invoke state-changing tools (such as sending emails, issuing refunds, or modifying records) without deterministic authorization checks and user confirmation.",
        ],
      },
      { type: "h2", text: "Architectural guardrails for LLM features" },
      {
        type: "p",
        text: "Never treat a system prompt as an authorization boundary. Enforce tenant and role filters inside the database and vector-retrieval query layer before context ever reaches the model, sanitize all model output before rendering it in the DOM, cap per-user token and tool-invocation budgets, and require explicit server-side permission checks and human confirmation before executing any state-changing tool call.",
      },
      {
        type: "callout",
        text: "Treat LLM outputs as untrusted data, enforce tenant filtering in your database and vector queries, and gate every agent tool call behind deterministic authorization.",
      },
    ],
    related: [
      { label: "AI penetration testing guide", href: "/ai-penetration-testing" },
      { label: "API security testing", href: "/api-security-testing" },
      { label: "SSRF testing guide", href: "/guides/ssrf-testing" },
      { label: "BugSnaps penetration testing", href: "/penetration-testing" },
    ],
  },
  {
    slug: "graphql-security-testing-best-practices",
    title: "GraphQL Security Testing Best Practices",
    description:
      "How to assess and secure GraphQL APIs: test resolver and nested-field authorization, query depth and batch limits, mutations, and schema exposure.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "GraphQL lets frontend clients query related objects and invoke mutations through a single HTTP endpoint (typically `/graphql`). While that flexibility simplifies frontend data fetching, it also means one URL can expose dozens of resolvers and nested data relationships—so a basic URL check never tells the full story of a GraphQL API's security posture.",
      },
      { type: "h2", text: "Four GraphQL vulnerability areas to test" },
      {
        type: "p",
        text: "When assessing a GraphQL service, testers inspect both the HTTP transport layer and the per-resolver authorization and resource controls:",
      },
      {
        type: "ul",
        items: [
          "Resolver and nested-edge BOLA/IDOR: a top-level query may verify the caller's session, while a nested relationship (such as `user(id: \"...\") { organization { invoices { amount } } }`) resolves records from a shared dataloader without checking tenant ownership at the edge.",
          "Mutation input tampering: passing extra or privileged fields inside GraphQL input types to modify account roles, tenant assignments, or internal flags that the frontend UI never sends.",
          "Query batching and alias amplification: sending an array of queries or hundreds of aliased mutations (`login1: login(...), login2: login(...)`) inside a single HTTP POST request to bypass per-request rate limiters.",
          "Deeply nested or high-cost queries: crafting circular relationship queries (`author { posts { comments { author { ... } } } }`) that trigger N+1 database queries and exhaust server memory or CPU.",
        ],
      },
      { type: "h2", text: "Hardening GraphQL resolvers and query limits" },
      {
        type: "p",
        text: "Remember that disabling GraphQL introspection in production hides schema documentation from casual browsing, but is not an access-control fix—attackers can still infer operations from your frontend JavaScript bundles or field-suggestion errors. Enforce object and tenant authorization inside every resolver or data-access layer, cap query depth, alias counts, and batch sizes at the GraphQL server, and enforce per-operation rate limits on sensitive mutations and authentication queries.",
      },
      {
        type: "callout",
        text: "Enforce object-level authorization inside every GraphQL resolver and dataloader, and cap query depth, alias counts, and batch sizes on the server.",
      },
    ],
    related: [
      { label: "GraphQL security testing guide", href: "/guides/graphql-security-testing" },
      { label: "GraphQL API testing use case", href: "/use-cases/graphql-apis" },
      { label: "API security testing services", href: "/api-security-testing" },
      { label: "MyPentest automated scanner", href: "/mypentest" },
    ],
  },
  {
    slug: "microservices-internal-api-attack-surfaces",
    title: "Securing Microservices & Internal APIs",
    description:
      "How to secure microservices and internal APIs: prevent gateway bypasses, enforce service-to-service auth and mTLS, and propagate tenant context.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "In a monolithic web application, calls between modules happen in memory inside one process. When an architecture splits into microservices, those calls become HTTP or gRPC requests crossing internal networks, service meshes, and message queues. If internal services assume that any request arriving from the private network is already authorized, a single perimeter bug can expose the entire backend.",
      },
      { type: "h2", text: "Where microservices trust boundaries break down" },
      {
        type: "p",
        text: "Many teams enforce authentication at the public API gateway while leaving downstream internal services open to any caller inside the VPC or Kubernetes cluster. During security assessments and architecture reviews, four failure patterns recur:",
      },
      {
        type: "ul",
        items: [
          "Blind trust in gateway-injected headers: internal services reading `X-User-Id` or `X-Tenant-Id` headers without verifying that the request actually came through the authenticated API gateway and that external client headers were stripped.",
          "SSRF-to-internal-API escalation: a URL-fetching or webhook feature in one public service being used to call unauthenticated administrative routes on internal microservices.",
          "Confused deputy and overly broad service tokens: a downstream service accepting a valid service-to-service credential without checking whether the end user initiating the request is authorized for the target tenant's record.",
          "Shadow and legacy internal endpoints: older service versions or debug ports left exposed on load balancers or container ingress rules without gateway policies.",
        ],
      },
      { type: "h2", text: "Enforcing service identity and user context end to end" },
      {
        type: "p",
        text: "Authenticate both the calling service and the end-user context across every hop. Use mutual TLS (mTLS) or signed service identities to verify which workload is calling, strip any untrusted identity headers at the edge ingress, and pass a short-lived, cryptographically signed token carrying the verified user ID, tenant ID, and scopes so downstream data services can enforce object-level ownership on every database query.",
      },
      {
        type: "callout",
        text: "Strip client-supplied identity headers at your edge ingress, authenticate service-to-service calls, and verify tenant ownership at the data service itself.",
      },
    ],
    related: [
      { label: "API security testing", href: "/api-security-testing" },
      { label: "Network penetration testing", href: "/network-pentesting" },
      { label: "SaaS security use case", href: "/use-cases/saas" },
    ],
  },
  {
    slug: "websocket-security-testing-guide",
    title: "WebSocket Security Testing & CSWSH Defense",
    description:
      "How to test and secure WebSocket apps: prevent Cross-Site WebSocket Hijacking (CSWSH), validate handshake Origins, and authorize every message.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "WebSockets provide persistent, bidirectional communication for live dashboards, chat, notifications, and collaborative tools. Because a WebSocket connection starts as an HTTP `Upgrade` handshake and then exchanges raw frames over a long-lived socket, standard per-request HTTP middleware and browser Same-Origin Policy protections do not automatically protect WebSocket traffic.",
      },
      { type: "h2", text: "Three WebSocket vulnerabilities to test" },
      {
        type: "p",
        text: "When assessing an application that uses `wss://` endpoints, testers evaluate the initial handshake, the ongoing session lifecycle, and per-message authorization:",
      },
      {
        type: "ul",
        items: [
          "Cross-Site WebSocket Hijacking (CSWSH): if a WebSocket handshake relies on ambient browser cookies for authentication and fails to validate the HTTP `Origin` header, a malicious third-party page can open a `new WebSocket('wss://app.example.com/ws')` from the victim's browser and read or send live messages.",
          "Missing per-message object authorization (BOLA over WebSockets): authenticating the user during the initial connection upgrade, but failing to verify on subsequent `subscribe` or `update` frames whether the user is allowed to subscribe to `channel:tenant_b` or edit `doc_id: 402`.",
          "Stale privileges on long-lived sockets: keeping a WebSocket connection open and authorized for hours after the user logged out, had their session revoked, or was removed from a workspace.",
        ],
      },
      { type: "h2", text: "How to harden WebSocket handshakes and frame handlers" },
      {
        type: "p",
        text: "Always require encrypted `wss://` connections in production. During the HTTP upgrade handshake, validate the `Origin` header against an exact allowlist of trusted origins and require a short-lived, single-use authentication token (or `SameSite` cookie paired with an anti-CSRF token).",
      },
      {
        type: "p",
        text: "Inside your message dispatcher, validate the schema and payload size of every incoming JSON frame, apply per-connection rate limits, check object-level and tenant-level permissions on every subscription or action event, and terminate active sockets immediately when a user's session or workspace membership is revoked.",
      },
      {
        type: "callout",
        text: "Validate the Origin header on every WebSocket upgrade handshake, authorize each incoming message frame, and close sockets when sessions expire.",
      },
    ],
    related: [
      { label: "WebSocket origin and session review guide", href: "/guides/websocket-origin-and-session-review" },
      { label: "API security testing", href: "/api-security-testing" },
      { label: "Web application pentesting", href: "/web-application-pentesting" },
      { label: "MyPentest features", href: "/mypentest" },
    ],
  },
  {
    slug: "webhook-security-signature-verification",
    title: "Webhook Security: HMAC Signatures & Replay",
    description:
      "Secure inbound and outbound webhooks: verify HMAC-SHA256 signatures in constant time, block replay attacks with timestamps, and prevent outbound SSRF.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Webhooks connect modern SaaS applications to payment gateways, identity providers, source-control platforms, and customer integrations. Because an inbound webhook endpoint is a publicly reachable HTTP POST route—and an outbound webhook feature lets users tell your server where to send HTTP requests—both directions require explicit security controls.",
      },
      { type: "h2", text: "Securing inbound webhooks against forgery and replay" },
      {
        type: "p",
        text: "An inbound webhook route (such as `/api/webhooks/billing`) cannot rely on a browser session cookie because the request comes from an external provider's server. Without cryptographic verification, anyone who discovers the endpoint URL can POST a forged JSON payload:",
      },
      {
        type: "ul",
        items: [
          "Verify HMAC signatures over the raw request body: compute the expected HMAC (such as HMAC-SHA256) using the provider's webhook signing secret and the exact unparsed byte payload before JSON serialization changes whitespace or key order.",
          "Use constant-time digest comparison: compare the computed signature and header signature with `crypto.timingSafeEqual` rather than `===` to prevent byte-by-byte timing side channels.",
          "Enforce timestamp tolerance and event idempotency: reject webhook deliveries whose signed timestamp is older than a short window (such as 5 minutes), and store processed `event_id` values in a unique table or cache key so replayed deliveries do not trigger duplicate credits or state changes.",
        ],
      },
      { type: "h2", text: "Securing customer-configured outbound webhooks against SSRF" },
      {
        type: "p",
        text: "When your product allows customers to register custom webhook URLs for event notifications, treat every target URL as an untrusted SSRF vector. Require `https://` URLs, disable automatic HTTP redirects on your webhook delivery client, resolve DNS inside a custom socket dialer that blocks loopback, RFC 1918 private networks, and cloud metadata IPs (`169.254.169.254`), enforce strict response timeouts and payload size limits, and dispatch outbound webhooks from an isolated worker network with no access to internal control planes.",
      },
      {
        type: "callout",
        text: "Verify inbound webhook HMAC signatures over the raw body with constant-time comparison, record event IDs for idempotency, and block private IPs on outbound webhooks.",
      },
    ],
    related: [
      { label: "Webhook signature verification testing guide", href: "/guides/webhook-signature-verification-testing" },
      { label: "SSRF prevention guide", href: "/guides/ssrf-testing" },
      { label: "API security testing", href: "/api-security-testing" },
      { label: "BugSnaps penetration testing", href: "/penetration-testing" },
    ],
  },
  {
    slug: "devsecops-pipeline-penetration-testing",
    title: "CI/CD Security Testing Tools by Stage",
    description:
      "Compare CodeQL, dependency review, Gitleaks, Trivy, ZAP, and staging assessments for CI/CD security testing with stage-by-stage release gates.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 5,
    body: [
      {
        type: "p",
        text: "Automated security testing in CI/CD works best in stages: check code, secrets and dependencies on pull requests; assess a running application in an authorized staging environment; and review unresolved findings before release. Define which evidence blocks a release, who handles exceptions, and what happens when a scan cannot complete. A failed scan must not silently become a passing security result.",
      },
      { type: "h2", text: "The right cadence for automated security gates" },
      {
        type: "p",
        text: "Not every security test belongs on every pull request. Structuring a multi-tiered security pipeline prevents developer friction while maintaining robust security assurance:",
      },
      {
        type: "ul",
        items: [
          "Pull request: review newly introduced secrets, vulnerable dependencies and relevant static-analysis findings. Set a measured runtime budget for your repository rather than assuming every check finishes in two minutes.",
          "Staging: assess the deployed application with approved test accounts and disposable data. Verify that authentication worked and the expected routes were reached before interpreting an empty findings list.",
          "Release: review unresolved findings, accepted exceptions and untested coverage. Include role separation and ownership regression cases; a passing automated scan is not a compliance certification.",
        ],
      },
      { type: "h2", text: "Which security testing solutions fit each stage?" },
      {
        type: "p",
        text: "Use a combination of methods that fits the application and available integration, rather than assuming one scanner covers every stage. SAST examines source or build artifacts for selected coding patterns; software composition analysis (SCA) compares dependencies with vulnerability information; and secret scanning looks for exposed credentials. Test these against a small known fixture before enforcing a gate.",
      },
      {
        type: "p",
        text: "For a running staging application, DAST checks reachable behavior and configuration using the access and test data supplied. Add authorization regression tests for business-specific permissions and an expert review for cases automation cannot establish. Validate tool licensing, output format, authentication, operating costs, and access to a disposable staging environment before choosing a solution.",
      },
      { type: "h2", text: "A practical tool stack, from pull request to release" },
      {
        type: "p",
        text: "These examples are starting points, not a universal ranking. Choose tools supported by your languages and build system, then verify their results and access requirements in your own pipeline. Official documentation for each example is linked below.",
      },
      {
        type: "ul",
        items: [
          "Pull request, source code: GitHub CodeQL analyzes supported languages and can report code-scanning alerts on pull requests. It is convenient for eligible GitHub repositories, but check language and repository eligibility, build requirements and Actions usage. A passing scan is limited to the analyzed code and query coverage.",
          "Pull request, dependency changes: GitHub Dependency Review can check changes in a pull request and enforce configured vulnerability or license policies. Confirm dependency graph and repository eligibility; reviewing only changes is not a complete inventory of existing vulnerabilities. Periodically assess the whole dependency set as well.",
          "Commit and pull request, secrets: Gitleaks can scan repositories for patterns suggesting exposed credentials. Decide which history and changes to scan, tune exceptions and keep reports restricted. A pattern match requires investigation, and an exposed credential must be revoked or rotated even if it is later removed from a commit. Check the separate Gitleaks Action license for your account type.",
          "Build, container image: Trivy can inspect supported OS and language packages in a built image for known vulnerabilities. Scan the image intended for release and retain its digest with the results. Database coverage, package detection and vulnerability applicability vary; an image scan does not prove application logic is secure.",
          "Staging, running application: ZAP Baseline spiders a target and performs passive checks; rules can be configured to warn, fail or ignore. Run against an authorized staging deployment with disposable data and verify the authenticated routes actually reached. A short passive scan is not an active penetration test or proof of complete coverage.",
          "Release and after deployment: review unresolved findings and scan failures before release, and rerun relevant checks as vulnerability information changes. Add app-specific access-control regression tests and periodic scoped human testing; no one tool above validates every business workflow.",
        ],
      },
      { type: "h2", text: "How to select and roll out a CI/CD security tool" },
      {
        type: "p",
        text: "First list the languages, package managers, build artifacts and environments that need coverage. Trial the candidate on a representative repository and a known test fixture; compare detected issues, missing coverage, runtime, triage effort and output. Check current pricing, license, supported languages, runner requirements and whether it can protect sensitive source code and results.",
      },
      {
        type: "p",
        text: "Start in reporting mode, assign a triage owner and establish a baseline. Once findings are understood, enforce a small, documented set of reliable checks for new issues and give exceptions an owner and expiry. Pin third-party actions to verified full commit SHAs, minimize workflow token permissions and avoid exposing credentials to untrusted pull-request code.",
      },
      { type: "h2", text: "Preventing false positives from blocking releases" },
      {
        type: "p",
        text: "Choose blocking rules according to your application's risk and the evidence available. Separate new confirmed findings from existing accepted issues and unverified candidates. Each exception needs an owner, rationale and expiry date. Severity alone is insufficient: an exposed credential can need immediate attention while another high-severity candidate still needs validation.",
      },
      {
        type: "callout",
        text: "This is a pipeline design checklist, not a ready-made MyPentest CI integration. MyPentest assessments are started by a user; native CI triggers and scheduled runs are not currently available. Its report can inform review, but it does not automatically gate a pipeline.",
      },
      { type: "h2", text: "Example: turn an ownership bug into a release check" },
      {
        type: "p",
        text: "Create an invoice for test account A and another for B. First confirm A can read its own invoice. Then verify A cannot read B's unshared invoice, including its export route. If the forbidden case returns B's protected data, preserve redacted evidence and open a finding. After a fix, repeat both the denied case and the allowed control on the new build.",
      },
      { type: "h2", text: "What should happen when a scan fails?" },
      {
        type: "p",
        text: "Distinguish scanner failure from a security finding. An expired test session, unreachable staging host or timeout means coverage is unknown. Retry only within an agreed budget, notify the responsible owner and use your documented release policy. Keep the failure visible rather than reporting zero vulnerabilities.",
      },
      { type: "h2", text: "Before enabling a blocking gate" },
      {
        type: "ul",
        items: [
          "Record the tested build, scope and test account roles.",
          "Prove that a known safe control passes and a deliberately failing test fixture is detected.",
          "Assign an owner for triage, failed runs and expiring exceptions.",
          "Store redacted evidence and keep credentials out of build logs.",
          "Measure runtime and false positives before making the check mandatory.",
        ],
      },
    ],
    related: [
      { label: "Download API security test cases", href: "/guides/api-security-test-cases" },
      { label: "Track findings and retest outcomes", href: "/guides/pentest-report-template" },
      { label: "MyPentest automated scanner", href: "/mypentest" },
      { label: "Automated vs manual penetration testing", href: "/compare/automated-vs-manual-penetration-testing" },
      { label: "BugSnaps pricing", href: "/pricing" },
      { label: "OWASP DevSecOps Guideline", href: "https://owasp.org/projects/devsecops-guideline/" },
      { label: "OWASP CI/CD Security Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html" },
      { label: "GitHub: CodeQL code scanning", href: "https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning" },
      { label: "GitHub: dependency review action", href: "https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-dependency-review-action" },
      { label: "Gitleaks: secret scanning", href: "https://github.com/gitleaks/gitleaks" },
      { label: "Gitleaks Action: configuration and licensing", href: "https://github.com/gitleaks/gitleaks-action" },
      { label: "Trivy: vulnerability scanning", href: "https://trivy.dev/docs/latest/scanner/vulnerability/" },
      { label: "ZAP: Baseline Scan", href: "https://www.zaproxy.org/docs/docker/baseline-scan/" },
      { label: "GitHub Actions: secure use", href: "https://docs.github.com/en/actions/reference/security/secure-use" },
    ],
  },
  {
    slug: "vulnerability-disclosure-policy-vdp-guide",
    title: "Vulnerability Disclosure Policy & security.txt",
    description:
      "How to draft a clear Vulnerability Disclosure Policy (VDP), publish an RFC 9116 security.txt file, and handle security researcher reports responsibly.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Independent security researchers and customers occasionally spot exposed endpoints, configuration gaps, or application bugs on public websites. Without a published Vulnerability Disclosure Policy (VDP) and an RFC 9116 `security.txt` file, a well-intentioned researcher often struggles to find the right engineering contact or hesitates to report the issue due to legal ambiguity.",
      },
      { type: "h2", text: "Four core elements of a clear Vulnerability Disclosure Policy" },
      {
        type: "p",
        text: "A practical VDP does not require a paid bounty pool to be effective; its primary job is to define authorized testing boundaries, safe-harbor expectations, and a reliable reporting channel:",
      },
      {
        type: "ul",
        items: [
          "Good-faith safe harbor statement: state clearly that your organization will not pursue civil or criminal legal action against researchers who follow the policy's rules, respect privacy, and report findings privately.",
          "Explicit scope and prohibited actions: list the owned domains and applications covered by the policy, and forbid denial-of-service testing, social engineering, physical intrusion, or accessing and exfiltrating another user's data.",
          "Direct reporting instructions: specify the intake email address or form, along with what details to include (affected URL, reproduction steps, timestamps, and minimal proof of concept).",
          "Predictable response timeline: set realistic targets for initial acknowledgement (for example, within 2 business days) and status updates as your engineering team validates and remediates the report.",
        ],
      },
      { type: "h2", text: "Publishing a machine-readable RFC 9116 security.txt file" },
      {
        type: "p",
        text: "Complement your human-readable policy page by serving a plain-text file at `/.well-known/security.txt` containing `Contact:`, `Policy:`, `Preferred-Languages:`, `Canonical:`, and an `Expires:` ISO timestamp. Keeping `/.well-known/security.txt` current lets researchers, bug reporters, and CERT coordinators route vulnerability reports directly to your security inbox instead of generic customer support queues, and gives your engineering team a documented workflow for acknowledging, triaging, and closing external reports.",
      },
      {
        type: "callout",
        text: "Publish both a human-readable Responsible Disclosure page and a valid /.well-known/security.txt file so researchers can report vulnerabilities safely.",
      },
    ],
    related: [
      { label: "BugSnaps responsible disclosure policy", href: "/responsible-disclosure" },
      { label: "Pentest scope and disclosure authorization guide", href: "/guides/pentest-scope-authorization" },
      { label: "About BugSnaps security research", href: "/about" },
      { label: "Penetration testing services", href: "/penetration-testing" },
    ],
  },
  {
    slug: "zero-trust-web-application-architecture",
    title: "Zero Trust Web Application Architecture Guide",
    description:
      "Apply Zero Trust principles to web apps: verify identity and tenant permissions on every request, segment internal services, and test boundaries.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Traditional perimeter-centric security assumed that requests originating inside a corporate network or cloud VPC were inherently trustworthy, while only external internet traffic needed strict inspection. In modern cloud-native web applications, Zero Trust architecture replaces implicit network trust with explicit identity, device, session, and permission verification on every single HTTP or RPC request.",
      },
      { type: "h2", text: "Three pillars of Zero Trust in web and API design" },
      {
        type: "p",
        text: "Applying Zero Trust to a web application is an engineering discipline rather than a single off-the-shelf product. Three architectural controls anchor the model:",
      },
      {
        type: "ul",
        items: [
          "Identity-aware access for administrative and staging tools: protect internal dashboards, staging environments, and operational consoles behind an identity-aware proxy and phishing-resistant MFA rather than relying solely on a shared network perimeter.",
          "Per-request authentication and object-level authorization: verify the caller's token, role, and specific resource ownership on every API and database query, even when the request arrives from an internal microservice.",
          "Least-privilege workload and egress segmentation: give each application service its own narrowly scoped database and cloud IAM role, and restrict outbound network egress so a compromised container cannot scan internal networks or reach cloud metadata services.",
        ],
      },
      { type: "h2", text: "Verifying Zero Trust assumptions with penetration testing" },
      {
        type: "p",
        text: "Architecture diagrams often show clean trust boundaries that drift in real deployments—such as a forgotten preview URL bypassing an access proxy, a shared service token with wildcard permissions, or an API route that checks authentication but omits tenant ownership. Use automated assessments and scoped manual penetration tests with paired test accounts to verify that your identity, session, and segmentation boundaries actually hold up under live testing and that denied requests are logged for security review.",
      },
      {
        type: "callout",
        text: "Verify caller identity, role, and resource ownership at every application and service boundary rather than trusting network location.",
      },
    ],
    related: [
      { label: "Network penetration testing", href: "/network-pentesting" },
      { label: "Web application pentesting", href: "/web-application-pentesting" },
      { label: "Access control testing guide", href: "/guides/access-control-testing" },
    ],
  },
  {
    slug: "dependency-vulnerabilities-and-sbom-management",
    title: "Dependency CVEs, Lockfiles & SBOM Management",
    description:
      "Manage software supply-chain risks in web apps: audit dependency CVEs, pin lockfiles, maintain SBOMs, and pair SCA with runtime DAST checks.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Modern web applications rely on hundreds of direct and transitive open-source packages across npm, PyPI, Go modules, and container base images. Because third-party code executes with the same process privileges as your own application code, managing dependency vulnerabilities and build integrity is a core requirement of web security hygiene.",
      },
      { type: "h2", text: "Four supply-chain and dependency risks to monitor" },
      {
        type: "p",
        text: "Software supply-chain exposure involves both accidentally vulnerable library versions and deliberate package tampering:",
      },
      {
        type: "ul",
        items: [
          "Reachable framework and library CVEs: running unpatched framework, image-processing, or serialization libraries with known vulnerabilities—especially those listed in CISA's Known Exploited Vulnerabilities (KEV) catalog.",
          "Unpinned ranges and lockfile drift: building production artifacts without enforcing a committed lockfile (`npm ci`, `pnpm install --frozen-lockfile`), allowing untested minor releases into production builds.",
          "Typosquatting and dependency confusion: installing a similarly named public package or allowing a package manager to pull a higher-versioned public package over an internal private package name.",
          "Compromised build scripts and lifecycle hooks: malicious preinstall/postinstall scripts or compromised release pipelines that read CI secrets during package installation.",
        ],
      },
      { type: "h2", text: "Combining SBOM inventories with runtime security testing" },
      {
        type: "p",
        text: "Commit and verify lockfiles in source control, scope private registries explicitly, and generate a Software Bill of Materials (SBOM) in CycloneDX or SPDX format for each deployed build artifact so you can quickly answer whether a newly disclosed CVE is present in production.",
      },
      {
        type: "p",
        text: "At the same time, remember that dependency scanning (SCA) and dynamic runtime testing (DAST) answer complementary questions: SCA identifies known vulnerable package versions in your build, while a runtime assessment with MyPentest tests your live deployed configuration, headers, exposed files, and custom application routes across your verified domain.",
      },
      {
        type: "callout",
        text: "Enforce frozen lockfiles and artifact SBOM tracking in your build pipeline, and pair dependency reviews with live runtime assessments of your deployed site.",
      },
    ],
    related: [
      { label: "SCA vs DAST for new CVE checks", href: "/blog/sca-vs-dast-new-cve-website-checks" },
      { label: "What automated penetration testing finds", href: "/blog/what-automated-penetration-testing-finds" },
      { label: "MyPentest automated scanner", href: "/mypentest" },
      { label: "BugSnaps pentest services", href: "/penetration-testing" },
    ],
  },
  {
    slug: "mobile-backend-api-security-testing",
    title: "Mobile Backend API Security Testing Guide",
    description:
      "How to security test backend APIs for iOS and Android apps: avoid relying on binary obfuscation, enforce object auth, and retire legacy routes.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Engineering teams sometimes assume that an HTTP API consumed only by a native iOS or Android mobile app is less exposed than a browser-facing web API because users do not see URLs in an address bar. In practice, mobile app packages (APKs and IPAs) are downloaded onto user-controlled devices where endpoints, headers, and embedded constants can be inspected directly.",
      },
      { type: "h2", text: "Why client-side mobile secrecy cannot protect a backend API" },
      {
        type: "p",
        text: "During a mobile backend API security assessment, testers examine the HTTP endpoints your mobile client calls under the assumption that an adversary can observe and replay any request the app makes:",
      },
      {
        type: "ul",
        items: [
          "Hardcoded API keys and service tokens in app binaries: any static secret embedded in an APK or IPA can be extracted with standard decompilation tools; privileged third-party credentials must live on your backend server, not inside the mobile app.",
          "TLS pinning is not server authorization: certificate pinning helps protect users on hostile local networks, but an attacker running the app on a rooted or instrumented test device can bypass pinning in local memory and send custom requests to your API.",
          "Broken Object Level Authorization (BOLA/IDOR) and overly broad responses: mobile APIs often return full database objects and rely on the mobile UI to hide sensitive fields, or fail to verify that the caller's bearer token owns the requested resource ID.",
          "Forgotten legacy API versions (`/api/v1`): keeping older API routes online indefinitely for un-updated mobile clients often leaves older endpoints running without rate limiting or recent authorization fixes.",
        ],
      },
      { type: "h2", text: "Hardening backend APIs that serve mobile applications" },
      {
        type: "p",
        text: "Test and harden mobile backend APIs with the exact same standards as public web APIs: use OAuth 2.0 with PKCE and short-lived access tokens, enforce object- and property-level authorization on every route, apply per-user and per-IP rate limiting on authentication and OTP flows, and deprecate unmaintained API versions on a clear schedule.",
      },
      {
        type: "callout",
        text: "Never rely on mobile binary obfuscation or TLS pinning as a substitute for server-side authentication, rate limiting, and object-level authorization.",
      },
    ],
    related: [
      { label: "REST API security testing use case", href: "/use-cases/rest-apis" },
      { label: "API security testing services", href: "/api-security-testing" },
      { label: "Web application pentesting", href: "/web-application-pentesting" },
      { label: "MyPentest features", href: "/mypentest" },
    ],
  },
  {
    slug: "preparing-for-your-first-penetration-test",
    title: "How to Prepare for Your First Penetration Test",
    description:
      "Preparation checklist for engineering teams before an external penetration test: define scope, seed staging accounts, and set rules of engagement.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Preparing for your team's first external penetration test does not need to stall product development. A few hours of structured preparation before testing begins helps prevent false starts, avoids accidental disruption to live customer workflows, and ensures testers spend their time evaluating meaningful authorization and business-logic boundaries.",
      },
      { type: "h2", text: "Five steps to complete before your penetration test starts" },
      {
        type: "p",
        text: "Whether you are running an automated assessment first or onboarding a human penetration testing team, work through these five preparation items:",
      },
      {
        type: "ol",
        items: [
          "Write down the exact scope and exclusions: list every in-scope hostname, API origin, and environment, and explicitly document out-of-scope third-party services, payment gateways, or destructive actions.",
          "Provision paired test accounts across every role and tenant: create at least two separate test organizations (Tenant A and Tenant B) and synthetic user accounts for each role (Admin, Member, Billing, Read-Only) so cross-tenant BOLA and privilege checks can be verified.",
          "Use a representative staging environment with synthetic data: test against a staging build that matches production configuration while disabling real customer emails, SMS gateways, and live payment charges.",
          "Clear baseline issues first with an automated scan: run a free or Plus assessment in MyPentest on your verified domain to fix missing security headers, cookie attributes, exposed files, and CORS issues before manual billable hours begin.",
          "Agree emergency contacts and retest windows: name the engineering point of contact for critical findings or expired test sessions, and reserve sprint capacity after report delivery so fixes can be deployed and retested on schedule.",
        ],
      },
      { type: "h2", text: "What to hand over to your testing team" },
      {
        type: "p",
        text: "Share your API documentation or OpenAPI collection, a one-page summary of your role hierarchy and intended tenant-sharing rules, and confirmed working login credentials. Clear context turns a generic scan into a high-signal architectural verification.",
      },
      {
        type: "callout",
        text: "Provide two synthetic tenants with accounts for every role, clear baseline issues early with MyPentest, and reserve developer time for fix retesting.",
      },
    ],
    related: [
      { label: "Startup penetration testing guide", href: "/blog/penetration-testing-for-startups" },
      { label: "Pentest scope and authorization guide", href: "/guides/pentest-scope-authorization" },
      { label: "BugSnaps penetration testing services", href: "/penetration-testing" },
      { label: "Example penetration test report", href: "/mypentest/example-report" },
    ],
  },
  {
    slug: "post-pentest-remediation-and-retesting-workflow",
    title: "Post-Pentest Remediation & Retesting Workflow",
    description:
      "How to triage penetration test findings, fix root causes across shared code paths, and run verified retests for customer and compliance reviews.",
    published: "2026-10-05",
    updated: "2026-11-21",
    author: "BugSnaps Security Research",
    readingMinutes: 3,
    body: [
      {
        type: "p",
        text: "Receiving a penetration test report or automated assessment is the start of the security improvement loop, not the finish line. A report only reduces risk—and satisfies enterprise customer or auditor reviews—when findings are triaged by impact, fixed at the root cause, and verified through a clean retest.",
      },
      { type: "h2", text: "Step 1: Triage findings by verified impact and root cause" },
      {
        type: "p",
        text: "Avoid turning a security report into dozens of isolated one-line patches. Review the evidence, confidence level, and affected component for each finding and group related items by their architectural root cause:",
      },
      {
        type: "ul",
        items: [
          "Critical and High findings (immediate sprint priority): confirmed unauthenticated exposure, leaked credentials, SQL/template injection, SSRF, or cross-tenant BOLA/IDOR allowing unauthorized data access.",
          "Medium findings (planned sprint work): missing rate limits on non-critical routes, permissive CORS headers, session-rotation gaps, or incomplete security header policies.",
          "Low and Informational findings (hygiene and hardening): verbose server banners, minor cookie attribute improvements, or defense-in-depth recommendations.",
          "Coverage gaps and unchecked areas: inspect routes or test accounts that failed authentication during the assessment so an unreached area is re-tested rather than assumed safe.",
        ],
      },
      { type: "h2", text: "Step 2: Fix the pattern, not just the single URL" },
      {
        type: "p",
        text: "One of the most common causes of failed retests is patching only the single endpoint or parameter cited in the report while leaving sibling endpoints untouched. If a BOLA finding showed that `GET /api/invoices/{id}` lacked a tenant check, audit the shared repository or controller middleware for `/api/orders/{id}`, `/api/exports/{id}`, and `DELETE /api/invoices/{id}` at the same time.",
      },
      { type: "h2", text: "Step 3: Verify fixes and preserve retest evidence" },
      {
        type: "p",
        text: "Replay the exact reproduction request from the report against the patched build to confirm the unauthorized request is now denied, and test a positive control request to confirm legitimate users still succeed. Then run a follow-up MyPentest scan or schedule your formal manual retest so your final report shows verified closure.",
      },
      {
        type: "callout",
        text: "Audit sibling routes for the same root cause, add an automated regression test for the fixed boundary, and record the verified retest result.",
      },
    ],
    related: [
      { label: "Remediation and retesting guide", href: "/guides/remediation-retesting" },
      { label: "BugSnaps penetration testing services", href: "/penetration-testing" },
      { label: "Example penetration test report", href: "/mypentest/example-report" },
      { label: "Automated vs manual penetration testing", href: "/compare/automated-vs-manual-penetration-testing" },
    ],
  },
];

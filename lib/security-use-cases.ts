/** Editorial testing plans, not a claim that every step is automated by MyPentest. */
export interface SecurityUseCase {
  slug: string;
  label: string;
  title: string;
  description: string;
  updated: string;
  question: string;
  answer: string;
  context: string;
  scope: { asset: string; roles: string; priority: string }[];
  preparation: string[];
  workflow: { title: string; detail: string }[];
  evidence: string[];
  automation: string;
  humanReview: string;
  releaseDecision: string;
  faq: { question: string; answer: string }[];
  related: { label: string; href: string }[];
  sources: { label: string; url: string; relevance: string }[];
}

const AUTHORIZATION = {
  label: "OWASP WSTG: Testing for bypassing authorization",
  url: "https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/05-Authorization_Testing/02-Testing_for_Bypassing_Authorization_Schema/",
  relevance: "A reference for comparing permitted and forbidden actions across identities and roles.",
};
const WORKFLOWS = {
  label: "OWASP WSTG: Testing application workflows",
  url: "https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/10-Business_Logic_Testing/06-Testing_for_the_Circumvention_of_Work_Flows/",
  relevance: "A reference for reviewing application-specific steps and the effect of cancellation or repetition.",
};
const API_OBJECTS = {
  label: "OWASP API Security: Broken object level authorization",
  url: "https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/",
  relevance: "Explains why access checks must apply to the particular object requested.",
};
const GRAPHQL = {
  label: "OWASP WSTG: Testing GraphQL",
  url: "https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/12-API_Testing/01-Testing_GraphQL/",
  relevance: "Guidance for reviewing schema exposure, resolver behavior, errors and query controls.",
};
const SSDF = {
  label: "NIST SP 800-218: Secure Software Development Framework",
  url: "https://csrc.nist.gov/pubs/sp/800/218/final",
  relevance: "A framework for incorporating security practices into software development and delivery.",
};

export function useCasePath(slug: string): string {
  return `/use-cases/${slug}`;
}

export const SECURITY_USE_CASES: SecurityUseCase[] = [
  {
    slug: "saas",
    updated: "2026-10-02",
    label: "SaaS teams",
    title: "Security testing for SaaS applications",
    description: "Plan SaaS security testing around organizations, invitations, subscription permissions and exports, with repeatable evidence and clear manual review limits.",
    question: "What should a SaaS application security test cover?",
    answer: "Start with tenant boundaries and user roles, then test invitations, privileged settings, exports and subscription permissions. Combine an authorized automated assessment with human review of the rules that decide who can act on each organization and its data.",
    context: "A SaaS dashboard can hide a forbidden button while its API still accepts the same request. The useful scope is the complete customer journey: joining an organization, gaining a role, changing a plan, accessing records and leaving. Each step needs a documented permission rule before a result can be interpreted.",
    scope: [
      { asset: "Organization records and exports", roles: "Members in two separate organizations", priority: "Check the boundary between customer data sets." },
      { asset: "Invitations and team settings", roles: "Owner, administrator and ordinary member", priority: "Identify who may invite users, change roles or remove members." },
      { asset: "Paid features and integration settings", roles: "Trial, paid and downgraded accounts", priority: "Check entitlement changes and access to stored integration credentials." },
    ],
    preparation: ["Create two synthetic organizations with distinguishable sample records.", "Write a role and feature matrix, including what happens after membership removal.", "Exclude live customer exports, billing charges and third-party integrations unless separately authorized."],
    workflow: [
      { title: "Map the organization journey", detail: "Record routes for creation, invitation acceptance, role editing, exports and deletion. Include APIs used by the dashboard and note which operations change data." },
      { title: "Collect an automated baseline", detail: "Assess the verified target and supplied test sessions for supported exposure and access-control checks. Read the coverage details to identify inaccessible routes or missing account contexts." },
      { title: "Review tenant and lifecycle rules", detail: "Use the agreed test accounts to compare permitted requests with forbidden cross-organization requests. Have a tester review invitation reuse, owner transfer and access after a member leaves." },
      { title: "Retest changed controls", detail: "Re-run the exact confirmed request after the fix, check the valid owner still succeeds, and add a regression test that distinguishes the two organizations." },
    ],
    evidence: ["The tenant and role of each synthetic test identity, with tokens removed.", "A permitted control response and the response that crossed the documented boundary.", "The organization or record affected, reproduction prerequisites and the verified fix result."],
    automation: "MyPentest can establish a repeatable web and API baseline and exercise supported checks with the access you provide. A clean result applies to that tested scope; it does not establish complete tenant isolation.",
    humanReview: "Use manual testing for custom invitations, plan-dependent permissions, delegated administration and chains that combine several otherwise valid actions. Source review is useful when a tenant filter is enforced in shared middleware or background jobs.",
    releaseDecision: "Assign an owner to any confirmed cross-organization disclosure or unauthorized role change before releasing the affected workflow. Record skipped roles and integrations as follow-up work rather than interpreting them as passes.",
    faq: [
      { question: "Can one SaaS account test tenant isolation?", answer: "One account can cover its accessible surface, but it cannot establish whether one customer can access another customer's records. Prepare at least two controlled tenant contexts for that comparison." },
      { question: "Should we test staging or production?", answer: "Use representative staging with synthetic data for actions that alter memberships, billing or records. A separately authorized production baseline can check deployment differences, with explicit exclusions and stop conditions." },
      { question: "Does an automated SaaS scan replace a manual pentest?", answer: "It supplies repeatable evidence for supported checks. Custom business rules, complex role transitions and attack chains still need human review." },
    ],
    related: [{ label: "SaaS tenant isolation guide", href: "/guides/saas-tenant-isolation" }, { label: "Access-control testing guide", href: "/guides/access-control-testing" }, { label: "Multi-tenant testing plan", href: "/use-cases/multi-tenant-apps" }, { label: "Authenticated application testing", href: "/use-cases/authenticated-apps" }, { label: "Web application pentesting", href: "/web-application-pentesting" }],
    sources: [AUTHORIZATION, API_OBJECTS],
  },
  {
    slug: "ecommerce",
    updated: "2026-10-02",
    label: "Ecommerce",
    title: "Security testing for ecommerce websites",
    description: "An ecommerce testing plan for cart totals, order ownership, discounts, refunds and checkout transitions, using sandbox payments and traceable evidence.",
    question: "How should an ecommerce website be security tested?",
    answer: "Test storefront exposure and account permissions, then review the server-side rules for cart totals, discounts, payment confirmation, fulfillment and refunds. Use synthetic orders and sandbox payments so the assessment can verify state changes without charging customers or dispatching goods.",
    context: "Checkout security depends on the relationship between several systems: the storefront, order database, payment provider and fulfillment process. A success screen alone is weak evidence. The assessment should establish which event authorizes an order and what happens if that event is repeated or arrives late.",
    scope: [
      { asset: "Orders, invoices and addresses", roles: "Two shoppers, guest and support user", priority: "Check ownership of purchase and shipping information." },
      { asset: "Cart, discount and checkout APIs", roles: "Shopper and store administrator", priority: "Review which prices and transitions the server accepts." },
      { asset: "Payment callbacks and fulfillment", roles: "Sandbox provider and controlled worker", priority: "Trace payment state into stock, shipment and refunds." },
    ],
    preparation: ["Use payment-provider sandbox accounts, test stock and a fulfillment sink.", "Document allowed discount combinations, tax and shipping calculations, and refund permissions.", "Separate the owned storefront from provider-hosted payment pages and other suppliers' systems."],
    workflow: [
      { title: "Inventory the purchase path", detail: "Capture cart creation, login, shipping selection, payment approval, order confirmation and cancellation. Mark the source of truth for totals and the event that permits fulfillment." },
      { title: "Assess the reachable application", detail: "Run an authorized baseline against the storefront and supplied sessions. Review exposed files, supported input checks and whether account-specific pages were actually reached." },
      { title: "Review business transitions", detail: "A tester should inspect client-supplied totals, discount reuse, unpaid orders, repeated callbacks and cancellation after approval. Reconcile each result against the sandbox order and provider ledger." },
      { title: "Validate the repair end to end", detail: "Retest a normal purchase as well as the previously invalid transition. Confirm a retry does not create a second fulfillment job, refund or credit." },
    ],
    evidence: ["Sanitized cart, order and sandbox payment identifiers linked to a single test case.", "The expected total or state and the server's actual stored result, including worker effects.", "A normal purchase control, the failing transition and a repeat test after remediation."],
    automation: "Automated assessment is useful for the web surface and supported API checks. It does not know your discount policy or prove that a provider callback, inventory worker and refund ledger agree.",
    humanReview: "Manual testing is needed for payment-state races, loyalty programs, refund abuse, multi-currency rounding and custom fulfillment rules. Do not let a general active scan make real purchases or request live refunds.",
    releaseDecision: "Treat an unpaid order becoming fulfillable, another shopper's data becoming accessible, or a repeat event creating duplicate value as a concrete workflow defect. Keep its business effect in the remediation ticket, rather than reporting only an HTTP response code.",
    faq: [
      { question: "Can the test use real customer orders?", answer: "Use synthetic orders wherever possible. If production verification is necessary, agree the exact read-only records and handling rules with the owner first; customer data is not needed for a repeatable checkout control test." },
      { question: "Does scanning the store test the payment provider?", answer: "It assesses the owned integration within its scope. Provider-hosted pages and infrastructure need their own authorization and are not included simply because the store uses them." },
      { question: "Why test webhooks as well as the checkout page?", answer: "Some stores update payment and fulfillment state through asynchronous events. Human review should verify how those events are authenticated, repeated and reconciled with the provider's payment record." },
    ],
    related: [{ label: "Business-logic testing guide", href: "/guides/business-logic-testing" }, { label: "BOLA testing guide", href: "/guides/bola-testing" }, { label: "API security testing", href: "/api-security-testing" }, { label: "Manual penetration testing", href: "/penetration-testing" }, { label: "View an example assessment report", href: "/mypentest/example-report" }],
    sources: [WORKFLOWS, API_OBJECTS],
  },
  {
    slug: "fintech",
    updated: "2026-10-02",
    label: "Fintech applications",
    title: "Security testing for fintech applications",
    description: "Scope fintech application testing around account access, transaction approvals and ledger evidence. Separate automated checks from financial workflow review.",
    question: "What is a useful security testing scope for a fintech application?",
    answer: "Start with account boundaries and transaction permissions, then trace approval, settlement, cancellation and reconciliation using synthetic balances. Combine web and API checks with a human review of financial state transitions; an application scan is not a regulatory certification or a ledger audit.",
    context: "A financial workflow often depends on delayed provider responses and privileged operator actions. Define the expected invariant, such as one approved transfer producing one ledger effect, before testing it. This makes the result useful to engineering and risk owners without assuming that a particular response means money moved.",
    scope: [
      { asset: "Accounts and statements", roles: "Two customers and an authorized support role", priority: "Check access to balances, statements and personal information." },
      { asset: "Transfer and approval endpoints", roles: "Initiator, approver and read-only operator", priority: "Review separation of duties and state transitions." },
      { asset: "Provider callbacks and ledger updates", roles: "Sandbox integration and reconciliation worker", priority: "Trace retries and delayed events into the final recorded state." },
    ],
    preparation: ["Use synthetic identities, sandbox provider connections and accounts that cannot send live funds.", "Document approval thresholds, operator permissions and transaction invariants.", "Arrange an escalation contact and exclude production transactions, denial-of-service testing and third-party systems."],
    workflow: [
      { title: "Define the financial boundary", detail: "Map customer APIs, operator tools and provider integrations. Record the account owner and permissible state transitions for each transaction type." },
      { title: "Run controlled web and API checks", detail: "Collect a baseline with the approved target and test identities. Review supported exposure and authorization results alongside the report's coverage limits." },
      { title: "Test the transaction model manually", detail: "Review stale approvals, duplicate submissions, cancellation and provider retries in a sandbox. Confirm behavior through application state and ledger entries, not just a UI message." },
      { title: "Retest both paths", detail: "Verify that the fix rejects the forbidden transition while a properly approved transaction still reconciles. Store the regression case with the transaction invariant it protects." },
    ],
    evidence: ["A trace from the sanitized API request to the test transaction and corresponding ledger entries.", "The actor's documented permissions and a permitted comparison request.", "The expected invariant, actual mismatch, affected operation and subsequent reconciliation result."],
    automation: "MyPentest can assess reachable web and API controls within the authorized scope. It does not independently verify balances, prove cryptographic key management or certify the application for a financial regulation.",
    humanReview: "Have specialists review ledger consistency, approval rules, signing boundaries, fraud assumptions and asynchronous race conditions. Architecture and source review may be required to understand guarantees that an external scan cannot observe.",
    releaseDecision: "Use the business impact and verified ledger effect to prioritize defects. An unresolved gap in a high-value transfer path should be an explicit risk decision by its owner, with the missing test and responsible reviewer recorded.",
    faq: [
      { question: "Will this provide fintech compliance certification?", answer: "No. A scoped security assessment can contribute technical evidence, but certification, legal requirements and control audits require their own qualified review and agreed scope." },
      { question: "Can an automated test validate transaction correctness?", answer: "It can detect supported web and API weaknesses. Financial correctness depends on application-specific invariants, provider behavior and ledger reconciliation that need separate tests and human interpretation." },
      { question: "Should transfer testing happen in production?", answer: "Use a representative sandbox for state-changing cases. Any necessary production check needs a narrowly defined scope that cannot move customer funds or disrupt live processing." },
    ],
    related: [{ label: "Business-logic testing guide", href: "/guides/business-logic-testing" }, { label: "Authorization and test scope guide", href: "/guides/pentest-scope-authorization" }, { label: "REST API testing plan", href: "/use-cases/rest-apis" }, { label: "Authenticated testing plan", href: "/use-cases/authenticated-apps" }, { label: "Discuss a scoped manual assessment", href: "/contact" }],
    sources: [AUTHORIZATION, WORKFLOWS],
  },
  {
    slug: "healthcare",
    updated: "2026-10-02",
    label: "Healthcare applications",
    title: "Security testing for healthcare applications",
    description: "Plan healthcare application testing with synthetic patient records, explicit clinician permissions, redacted evidence and separate compliance review.",
    question: "How do you scope security testing for a healthcare application?",
    answer: "Use synthetic patient records and define which patient, clinician and administrative roles may read or change each record. Test the patient portal, exports, uploads and APIs within an agreed authorization boundary, with human review for consent and emergency-access workflows.",
    context: "A healthcare app's visible screens may look identical across roles even though its data permissions are very different. Scope the relationship between a user and a record, including delegated caregivers, clinician assignments and revoked access. The assessment must avoid introducing clinical actions or copying real health information into reports.",
    scope: [
      { asset: "Patient portal and document downloads", roles: "Two synthetic patients and a delegated caregiver", priority: "Check who may view records and exported attachments." },
      { asset: "Clinician dashboard and assignments", roles: "Assigned clinician, unassigned clinician and administrator", priority: "Review access changes when care relationships change." },
      { asset: "Uploads, sharing and audit records", roles: "Patient, clinical user and support user", priority: "Review file handling, revoked shares and traceable access." },
    ],
    preparation: ["Populate a representative environment with clearly synthetic records and test attachments.", "Document consent, assignment, delegation and emergency-access rules with the system owner.", "Exclude medical devices, live clinical actions, real messaging and partner systems unless separately scoped."],
    workflow: [
      { title: "Agree the data handling plan", detail: "Identify sensitive fields and where they may appear in responses, logs and exports. Set retention, redaction and deletion expectations for all test evidence." },
      { title: "Assess the application surface", detail: "Run a baseline for the verified portal and supplied test sessions. Check the coverage report for upload paths, authenticated pages and APIs that were not exercised." },
      { title: "Review relationship-based access", detail: "Compare assigned and unassigned synthetic identities. A tester should inspect delegation expiry, revoked links and emergency access against the documented policy." },
      { title: "Retest and remove test artifacts", detail: "Confirm the repaired permission rejects the unauthorized context and allows legitimate care access. Remove synthetic uploads and test shares according to the agreed plan." },
    ],
    evidence: ["Synthetic record identifiers, the actor's role and the expected care relationship.", "Redacted response excerpts showing the specific unauthorized field or action.", "A permitted control request and a repair retest, with access-log references where available."],
    automation: "Automated checks can identify supported web exposure and access-control problems in reachable paths. They cannot decide clinical appropriateness, establish consent validity or certify healthcare compliance.",
    humanReview: "Manual review is needed for consent delegation, emergency access, care-team transitions and disclosure rules. Request architecture review for data flows into partner systems, background exports and audit infrastructure outside the scan's view.",
    releaseDecision: "Prioritize confirmed unauthorized access to synthetic health records and privilege changes. Keep assessment evidence separate from clinical records, and assign an owner to each untested relationship or excluded integration.",
    faq: [
      { question: "Do we need real patient data for a useful test?", answer: "No. Representative synthetic records can exercise record ownership, file access and sharing controls without putting real health information into test evidence." },
      { question: "Does a healthcare scan prove compliance?", answer: "No. It supplies technical findings for its agreed scope. Compliance and privacy obligations require separate review by the appropriate qualified people." },
      { question: "Are connected medical devices included?", answer: "Only if they are explicitly authorized and scoped with suitable expertise and operational safeguards. A web application assessment does not automatically include clinical devices or partner infrastructure." },
    ],
    related: [{ label: "Access-control testing guide", href: "/guides/access-control-testing" }, { label: "File-upload security guide", href: "/guides/file-upload-security" }, { label: "Multi-tenant access testing", href: "/use-cases/multi-tenant-apps" }, { label: "Web application pentesting", href: "/web-application-pentesting" }, { label: "Discuss data handling and scope", href: "/contact" }],
    sources: [AUTHORIZATION, API_OBJECTS],
  },
  {
    slug: "startup-before-launch",
    updated: "2026-10-02",
    label: "Before launch",
    title: "Security testing before a startup launch",
    description: "A practical pre-launch security testing plan for public exposure, account boundaries and core workflows, with fixes and documented release decisions.",
    question: "What security testing should a startup do before launch?",
    answer: "Inventory the public app and APIs, test account separation and the core revenue or data workflow, then fix and retest confirmed problems. Start with an authorized automated baseline and reserve human review for high-impact business rules and any critical paths the scan cannot reach.",
    context: "Before launch, the main challenge is deciding what deserves attention when time is limited. A short, explicit scope gives the team a better result than a large report with no owner. Include the actual release configuration: a test of an old preview does not establish the condition of the build being shipped.",
    scope: [
      { asset: "Public site, APIs and static assets", roles: "Anonymous visitor and new user", priority: "Review deployment exposure and unintended public data." },
      { asset: "Account, upload and download paths", roles: "Two controlled users and an administrator", priority: "Check the boundary around customer data." },
      { asset: "The main paid or privileged workflow", roles: "Ordinary user and workflow owner", priority: "Review the action whose failure would hurt the launch most." },
    ],
    preparation: ["Identify the release candidate, approved hostname and the person who can stop the test.", "Create synthetic accounts and sample files; disable real notifications and payment effects in staging.", "Write the three highest-impact failure cases in plain language before choosing checks."],
    workflow: [
      { title: "Make a compact target inventory", detail: "List the app, API origins, login flow and administrative endpoints. Note third-party services and decide which systems the team is authorized to test." },
      { title: "Run and triage a baseline", detail: "Use MyPentest for supported checks on the verified target. Separate confirmed findings from unchecked categories, and turn each actionable result into a ticket with an owner." },
      { title: "Review the launch-critical journey", detail: "Have a tester examine account recovery, another user's records, privileged actions and the product's main business rule. Use synthetic data to reproduce failures safely." },
      { title: "Retest the release candidate", detail: "Confirm fixes against the build and configuration that will be released. Record remaining gaps, compensating controls and who accepted the follow-up work." },
    ],
    evidence: ["Release identifier, hostname, assessment date and the exact included routes.", "Reproduction details tied to a confirmed finding, with a working control where relevant.", "A fix owner, retest result and a separate list of inaccessible or deferred paths."],
    automation: "A baseline helps surface supported web and API problems quickly. A zero-finding report does not establish launch readiness if login failed, only a small route set was discovered, or the most important feature was excluded.",
    humanReview: "Use manual testing for the product's unique abuse cases, identity recovery and sensitive actions. Review infrastructure permissions and secrets through configuration or source inspection when they are not externally observable.",
    releaseDecision: "Decide from the verified impact and the paths actually tested. Document any unresolved high-impact finding and its owner; do not turn a scanner score into an automatic launch approval.",
    faq: [
      { question: "Is a free scan enough before launch?", answer: "It can provide a useful baseline for supported checks. Its adequacy depends on the app's risk, available authenticated coverage and the complexity of its business rules, not on the price of the scan." },
      { question: "When should the test happen?", answer: "Test early enough to fix issues, then retest the actual release candidate. Repeat relevant checks when authentication, data permissions or critical workflows change." },
      { question: "What should a founder receive from the assessment?", answer: "A scoped report with reproducible evidence, impact, repair guidance and coverage limits, followed by clear retest results for the fixes that matter to the release." },
    ],
    related: [{ label: "Attack surface inventory guide", href: "/guides/attack-surface-inventory" }, { label: "Remediation and retesting guide", href: "/guides/remediation-retesting" }, { label: "Small-team testing plan", href: "/use-cases/small-teams" }, { label: "Release validation plan", href: "/use-cases/ci-release-validation" }, { label: "See MyPentest", href: "/mypentest" }],
    sources: [SSDF, AUTHORIZATION],
  },
  {
    slug: "agencies",
    updated: "2026-10-02",
    label: "Development agencies",
    title: "Security testing for development agencies",
    description: "A client-ready testing workflow for agencies: written scope, isolated test accounts, reproducible findings, remediation ownership and handover evidence.",
    question: "How can a development agency test a client website responsibly?",
    answer: "Obtain explicit authorization for the client's exact targets, create controlled test accounts and agree operational exclusions. Run a scoped baseline, verify actionable findings and deliver fixes with retest evidence. Owning the code or hosting login does not by itself authorize testing every connected system.",
    context: "Agency projects often combine agency-managed code, client-managed hosting and vendor integrations. A test plan must establish who controls each system before work starts. The handover should let a client see what was checked, what changed and which remaining responsibilities belong to their provider or internal team.",
    scope: [
      { asset: "Client website and owned APIs", roles: "Agency tester and client target owner", priority: "Document exact targets and permitted methods." },
      { asset: "CMS, customer and support functions", roles: "Content editor, administrator and customer", priority: "Compare content management permissions and customer access." },
      { asset: "Deployment and vendor boundaries", roles: "Agency engineer and client operations owner", priority: "Separate owned controls from systems requiring another authorization." },
    ],
    preparation: ["Get written approval for hostnames, dates, accounts, data handling and stop conditions.", "Create client-specific synthetic accounts and keep their evidence separate from other engagements.", "Agree who fixes application code, hosting configuration, plugins and third-party integration settings."],
    workflow: [
      { title: "Confirm ownership and scope", detail: "Map client targets and their vendors. Get the proper owner to approve each target; exclude shared hosting infrastructure and vendor services that have not been authorized." },
      { title: "Collect a repeatable baseline", detail: "Assess the verified application with agreed accounts. Preserve the target and coverage details so the client can distinguish tested behavior from missing access." },
      { title: "Verify and assign findings", detail: "Confirm the relevant response and business impact with synthetic data. Route each defect to the party who can repair it, including any manual review needed for custom CMS or commerce workflows." },
      { title: "Retest and hand over", detail: "Retest the repaired deployment and provide the client with evidence, outstanding exclusions and ownership. Revoke test credentials and apply the agreed evidence retention policy." },
    ],
    evidence: ["The client's approved hostname list, assessment window and permitted account roles.", "Sanitized reproduction steps linked to the responsible code or configuration owner.", "Before-and-after control results and a clear inventory of excluded vendor systems."],
    automation: "An automated baseline can support repeatable project handovers. The agency must still check authorization, interpret coverage and verify that a finding belongs to the client's application rather than an unrelated shared system.",
    humanReview: "Use human review for scope decisions, custom CMS permissions, payment workflows and client-specific requirements. Validate any assurance statement against the actual evidence before putting it into a delivery certificate or proposal.",
    releaseDecision: "Give the client a decision record for unresolved issues and exclusions. A report should not say the whole site is secure when only public pages or a staging environment were tested.",
    faq: [
      { question: "Can an agency scan every site it built?", answer: "Only with current authorization from the appropriate owner for the intended assessment. A past development engagement is not a blanket permission for future testing or connected vendors." },
      { question: "Can we send the report directly to the client?", answer: "Review its scope, evidence and redaction first, then share through the agreed delivery channel. Include retest results and remaining limitations so the client can act on it." },
      { question: "Is white-label reporting part of this workflow?", answer: "This page describes an agency testing process, not a claim that MyPentest includes a white-label feature. Use the product's available report format and an agreed client handover." },
    ],
    related: [{ label: "Authorization and test scope guide", href: "/guides/pentest-scope-authorization" }, { label: "Security report evidence guide", href: "/guides/security-testing-report" }, { label: "Web application pentesting", href: "/web-application-pentesting" }, { label: "Example assessment report", href: "/mypentest/example-report" }, { label: "Discuss a client engagement", href: "/contact" }],
    sources: [AUTHORIZATION, SSDF],
  },
  {
    slug: "multi-tenant-apps",
    updated: "2026-10-02",
    label: "Multi-tenant applications",
    title: "Security testing for multi-tenant applications",
    description: "A tenant-isolation test plan for records, search, exports, files and background jobs, with two controlled tenants and positive and negative evidence.",
    question: "How do you test whether tenants are isolated?",
    answer: "Create controlled tenants with distinct records, then compare authorized access with requests from an identity belonging to another tenant. Include list views, files, search, exports and asynchronous jobs. A server's status code alone does not establish isolation; inspect the returned data and any state change.",
    context: "Tenant identity can travel through a hostname, path, header, token or server-side membership lookup. Record which mechanism is authoritative for each operation. The aim is to check that every path into a customer resource enforces the same boundary, including paths the dashboard never renders.",
    scope: [
      { asset: "Individual records and collection APIs", roles: "Same-role users in tenant A and tenant B", priority: "Compare direct lookups, lists and search results." },
      { asset: "Files, exports and share links", roles: "Owner, member and user in another tenant", priority: "Check data reached outside the main dashboard." },
      { asset: "Jobs, integrations and administration", roles: "Tenant administrator and platform operator", priority: "Review tenant context in privileged and delayed work." },
    ],
    preparation: ["Seed two tenants with unique harmless markers and document valid ownership.", "Prepare both same-role and different-role accounts; separate platform support from tenant administration.", "Specify whether cross-tenant sharing is ever valid and how such permission is granted and revoked."],
    workflow: [
      { title: "Map tenant identifiers", detail: "List where the client supplies organization IDs and how the server derives membership. Include resource identifiers nested in request bodies and export jobs." },
      { title: "Assess supported access checks", detail: "Provide the authorized account contexts needed for an automated baseline. Review whether the report exercised both identities and which tenant-dependent paths remained unchecked." },
      { title: "Compare owned and foreign resources", detail: "Use controlled records to verify allowed and forbidden reads or writes. Manually inspect list filters, caches, file URLs and worker outputs that a direct resource check might miss." },
      { title: "Retest the enforcement layer", detail: "Confirm the foreign-tenant request no longer returns or changes the record while the owner's request still works. Add coverage to all routes using the affected data access layer." },
    ],
    evidence: ["The identity-to-tenant mapping and harmless markers that identify each test record.", "Paired owner and foreign-tenant requests, redacted responses and observed state effects.", "The tested access paths, missed routes and retest of the shared enforcement layer."],
    automation: "Supported access-control checks can reveal evidence of cross-account behavior when valid contexts and resources are available. They cannot prove every tenant filter, cache key or background job is correctly implemented.",
    humanReview: "Review tenant context propagation, customer-managed sharing, support impersonation and asynchronous work manually. Source and architecture review can identify paths that are difficult to reach from the external application.",
    releaseDecision: "Treat a confirmed read or write across a prohibited tenant boundary as a specific data access defect. Preserve legitimate sharing controls in the fix, and record untested worker or storage paths separately.",
    faq: [
      { question: "Does using UUIDs provide tenant isolation?", answer: "No. An identifier's unpredictability does not replace the server's check that the requesting identity is allowed to access the particular resource." },
      { question: "Is checking individual record endpoints enough?", answer: "No. Search, collection responses, exports, files, caches and background jobs may use different access paths, so the test scope should include them where they exist." },
      { question: "How do we avoid touching another customer's data?", answer: "Create two test tenants you control and use synthetic records. Demonstrate the boundary failure with those records rather than retrieving data from a real customer." },
    ],
    related: [{ label: "SaaS tenant isolation guide", href: "/guides/saas-tenant-isolation" }, { label: "BOLA testing guide", href: "/guides/bola-testing" }, { label: "SaaS testing plan", href: "/use-cases/saas" }, { label: "REST API testing plan", href: "/use-cases/rest-apis" }, { label: "Manual access-control review", href: "/penetration-testing" }],
    sources: [API_OBJECTS, AUTHORIZATION],
  },
  {
    slug: "rest-apis",
    updated: "2026-10-02",
    label: "REST APIs",
    title: "Security testing for REST APIs",
    description: "Plan REST API testing using a route and permission inventory, controlled object ownership, response evidence and separate business-flow review.",
    question: "What should REST API security testing include?",
    answer: "Inventory routes, methods, authentication contexts and object ownership. Test whether each role may perform the requested action on the requested object, inspect returned fields and review sensitive multi-step flows. Supply valid test sessions and representative routes so coverage is explicit.",
    context: "An API may expose useful paths that no page crawler discovers. Start with the specification and traffic from legitimate client journeys, then identify obsolete versions and administrative methods. The specification is a scope aid; it is not proof that the deployed implementation follows its security rules.",
    scope: [
      { asset: "Resource routes and methods", roles: "Anonymous, owner and another controlled user", priority: "Check authentication and object-specific permissions." },
      { asset: "Collections, response fields and updates", roles: "Ordinary user and privileged operator", priority: "Review sensitive properties, pagination and allowed writes." },
      { asset: "Versioned APIs and business flows", roles: "Client service and workflow approver", priority: "Review old routes, integrations and multi-step permissions." },
    ],
    preparation: ["Provide the approved API origins, route specification and supported authentication mechanism.", "Seed owned and non-owned synthetic objects and document expected method permissions.", "Agree request bounds and exclude expensive, destructive or third-party operations unless specifically authorized."],
    workflow: [
      { title: "Build the endpoint matrix", detail: "List each method, path, expected role and resource owner. Include collection, export and administrative operations, and identify which requests alter data." },
      { title: "Run supported API checks", detail: "Assess the reachable verified target with supplied contexts. Compare discovery and coverage with the endpoint matrix so a route not reached is visible as a gap." },
      { title: "Inspect permissions and fields", detail: "Compare owner and other-user responses using test records. A tester should review extra response fields, accepted write properties and custom approval or state transitions." },
      { title: "Retest the deployed route", detail: "Verify the fix on the relevant API version and method. Keep a valid control response, and add a regression test for the unauthorized object or property access." },
    ],
    evidence: ["The method, route, API version and actor context, with credentials redacted.", "Controlled resource ownership and paired permitted and forbidden responses.", "The returned or changed property, business effect and exact repair retest."],
    automation: "MyPentest provides supported web and API checks within the discovered and accessible scope. Coverage depends on target access, route discovery and session validity; it does not automatically establish every endpoint in an API specification was tested.",
    humanReview: "Manual review is useful for object-property rules, service-to-service trust and sensitive sequences such as approval, export or refund. Review request bounds carefully before load or resource-exhaustion tests, which are outside a general safe baseline.",
    releaseDecision: "Track findings by endpoint and security property, rather than treating the whole API as one passed component. Keep missing roles, old versions and excluded methods in the follow-up inventory.",
    faq: [
      { question: "Is an OpenAPI document enough for API security testing?", answer: "It helps define the routes and request formats. The test still needs representative objects, valid authentication contexts and documented permission rules for the deployed API." },
      { question: "Does a 403 response prove the endpoint is protected?", answer: "It is one observation for one request. Verify the request was valid, the owner's control succeeds, and the forbidden action did not change state or expose information through another path." },
      { question: "Are mobile app APIs included?", answer: "Owned HTTP APIs used by a mobile client can be included in a scoped API assessment. That does not include the mobile binary, device storage or platform-specific controls unless separately agreed." },
    ],
    related: [{ label: "OpenAPI security testing guide", href: "/guides/openapi-security-testing" }, { label: "BOLA testing guide", href: "/guides/bola-testing" }, { label: "API security testing service", href: "/api-security-testing" }, { label: "GraphQL testing plan", href: "/use-cases/graphql-apis" }, { label: "Example evidence report", href: "/mypentest/example-report" }],
    sources: [API_OBJECTS, AUTHORIZATION],
  },
  {
    slug: "graphql-apis",
    updated: "2026-10-02",
    label: "GraphQL APIs",
    title: "Security testing for GraphQL APIs",
    description: "A GraphQL security test plan for resolvers, nested fields, mutations and query limits, with manual schema review and explicit automated coverage boundaries.",
    question: "How is GraphQL security testing different from a web scan?",
    answer: "A GraphQL endpoint can expose many operations and nested data relationships behind one URL. Review permissions at resolver, object and field boundaries, then test mutations and query controls with representative identities. Do not assume a general web scan covered the schema or every resolver.",
    context: "The route count says little about the size of a GraphQL API. A permitted top-level query can return nested records with different owners, and a mutation can update fields the UI never offers. Use the schema and application rules to define a meaningful scope before interpreting a generic endpoint result.",
    scope: [
      { asset: "Queries, objects and nested fields", roles: "Owner, another user and privileged reader", priority: "Review authorization where related objects are resolved." },
      { asset: "Mutations and input properties", roles: "Ordinary user and workflow administrator", priority: "Check allowed changes and application state transitions." },
      { asset: "Schema visibility, errors and query controls", roles: "Anonymous and authenticated client", priority: "Review exposed detail and the bounds of accepted queries." },
    ],
    preparation: ["Provide the approved endpoint, schema if available and representative queries from the application.", "Seed related synthetic objects with different owners so nested boundaries can be observed.", "Agree small query bounds; exclude stress, deep recursive or high-cost query testing from the baseline."],
    workflow: [
      { title: "Map schema operations to permissions", detail: "Identify sensitive queries, fields and mutations. Record ownership rules for nested relationships, along with which operations are intended to be public." },
      { title: "Collect an HTTP baseline", detail: "Assess the approved application surface for supported checks. Record GraphQL-specific work separately; a discovered endpoint does not establish that resolver or query-complexity tests ran." },
      { title: "Review resolvers and mutations", detail: "A tester should compare controlled identities on representative operations and nested fields. Inspect error detail and accepted input properties against the schema and documented permissions." },
      { title: "Retest the affected operation", detail: "Repeat the exact query or mutation after remediation, then verify the valid owner's operation still works. Add regression cases at the resolver or shared authorization layer." },
    ],
    evidence: ["The sanitized operation document, variables and actor context used for the test.", "The specific field path or mutation result crossing the documented boundary.", "Valid owner controls, affected resolver context and the repaired operation's response."],
    automation: "MyPentest can provide a supported HTTP baseline for an owned target. This page does not claim full schema enumeration, resolver authorization coverage or GraphQL query-cost testing as an automated product capability.",
    humanReview: "Plan a manual GraphQL assessment for nested authorization, mutation business rules and the implementation of query limits. Source review can show whether shared data loaders or resolver middleware enforce consistent permissions.",
    releaseDecision: "Record findings by operation and field path. Keep query-limit work and untested resolvers explicit, particularly when one shared loader supplies data to many operations.",
    faq: [
      { question: "Does disabling introspection secure GraphQL?", answer: "It changes schema visibility, but it does not establish correct object, field or mutation authorization. Review those controls independently using approved schema information and application traffic." },
      { question: "Can one endpoint mean a small assessment?", answer: "No. One GraphQL URL can expose a large set of operations and nested relationships. The schema, roles and business rules determine the assessment scope." },
      { question: "Will MyPentest automatically test every resolver?", answer: "No such coverage is claimed here. Use its reported supported HTTP checks as a baseline and arrange separate schema-driven manual testing for GraphQL-specific controls." },
    ],
    related: [{ label: "GraphQL security testing guide", href: "/guides/graphql-security-testing" }, { label: "API rate-limiting guide", href: "/guides/api-rate-limiting" }, { label: "API security testing", href: "/api-security-testing" }, { label: "REST API testing plan", href: "/use-cases/rest-apis" }, { label: "Discuss a GraphQL assessment", href: "/contact" }],
    sources: [GRAPHQL, API_OBJECTS],
  },
  {
    slug: "ci-release-validation",
    updated: "2026-10-02",
    label: "Release validation",
    title: "Security testing for release validation",
    description: "Connect scoped security assessments with release evidence: stable staging, commit context, coverage review, regression tests and explicit deployment decisions.",
    question: "How should security testing support a software release?",
    answer: "Assess a stable release candidate, record its commit and configuration, and compare confirmed findings with prior results. Retest fixes and review coverage gaps before the release decision. Use your team's release process to collect this evidence; this page does not claim a built-in MyPentest CI integration.",
    context: "A repeatable assessment needs a target that stays consistent while testing runs. A changing preview, expired session or empty database can make results difficult to compare. Tie the test to a known candidate and treat application changes, authentication failures and environment differences as context the reviewer must see.",
    scope: [
      { asset: "Release candidate and deployment settings", roles: "Release engineer and application owner", priority: "Identify the build and configuration actually tested." },
      { asset: "Authentication and sensitive routes", roles: "Seeded test users and administrator", priority: "Check that expected journeys remain reachable." },
      { asset: "Previously fixed security defects", roles: "Developer and security reviewer", priority: "Verify regressions against representative controls." },
    ],
    preparation: ["Create stable staging with a known candidate, synthetic fixtures and an agreed reset process.", "Provide valid test sessions and stop overlapping deployments while the assessment runs.", "Set triage owners and release criteria that distinguish confirmed findings from incomplete coverage."],
    workflow: [
      { title: "Capture candidate context", detail: "Record commit, build, hostname and relevant configuration differences from production. Preserve fixture and role information so later assessments use comparable conditions." },
      { title: "Run the scoped assessment", detail: "Start the authorized assessment through the supported product flow. Link its report to the release record and inspect whether expected routes and sessions were reached." },
      { title: "Review changes and regressions", detail: "Triage new confirmed findings and recheck previous fixes. A tester should examine changed business rules or privileges that a general baseline cannot understand." },
      { title: "Make an evidence-based release decision", detail: "Retest remediation on the final candidate. Record accepted issues, coverage gaps and a responsible owner for each follow-up before shipping." },
    ],
    evidence: ["A release identifier and deployment context linked to the assessment report.", "Comparable route and account coverage across runs, including session or target failures.", "Confirmed new findings, retested prior defects and the release owner's recorded decisions."],
    automation: "Repeated assessments support a consistent baseline. There is no claim here of a built-in CI action, unattended release gate or complete diff-aware testing; integration into your pipeline needs the supported interfaces and an explicit implementation.",
    humanReview: "Use a reviewer for changing data models, authentication flows, privilege rules and critical workflows. Avoid gating only on a finding count, which can fall when a session expires or the target becomes unreachable.",
    releaseDecision: "A successful test run is one release input. Require valid target access and reviewed coverage, then apply your organization's impact and risk criteria to the confirmed evidence.",
    faq: [
      { question: "Is there a built-in MyPentest CI action?", answer: "This page does not announce one. It describes how a release team can associate an assessment and its report with a release candidate using the currently supported product workflow." },
      { question: "Should a pipeline fail whenever any finding appears?", answer: "Set criteria around verified impact, relevance and ownership. A count alone does not distinguish a critical defect, an accepted issue or a run that missed authenticated routes." },
      { question: "Why keep the commit and configuration with the report?", answer: "They identify what was assessed and help explain changed results. Testing one deployment does not automatically describe another build or production configuration." },
    ],
    related: [{ label: "Remediation and retesting guide", href: "/guides/remediation-retesting" }, { label: "Security report evidence guide", href: "/guides/security-testing-report" }, { label: "Pre-launch testing plan", href: "/use-cases/startup-before-launch" }, { label: "Authenticated testing plan", href: "/use-cases/authenticated-apps" }, { label: "Automated versus manual testing", href: "/compare/automated-vs-manual-penetration-testing" }],
    sources: [SSDF],
  },
  {
    slug: "authenticated-apps",
    updated: "2026-10-02",
    label: "Authenticated applications",
    title: "Security testing for authenticated applications",
    description: "Improve signed-in testing coverage with representative users, session verification, role controls and explicit account-recovery and SSO review.",
    question: "What is needed for authenticated security testing?",
    answer: "Supply valid test sessions for representative roles, document what each role may do and confirm the assessment reaches signed-in pages. Use separate controlled identities for account-boundary checks. An authenticated scan still needs human review for login recovery, SSO transitions and application-specific privileges.",
    context: "A scanner may receive an expired token and spend the run assessing the login page. Before judging the findings, establish that the expected private routes were reached. Authentication proves who the actor is; the separate authorization question is whether that actor may perform the particular action.",
    scope: [
      { asset: "Login and session lifecycle", roles: "Signed-out, signed-in and signed-out-again user", priority: "Check session context and access after state changes." },
      { asset: "Private data and privileged actions", roles: "Two ordinary users and an administrator", priority: "Compare permitted and forbidden requests." },
      { asset: "Recovery, SSO and account linking", roles: "Account owner and controlled alternative identity", priority: "Review transitions that change control of an account." },
    ],
    preparation: ["Create synthetic users for the relevant roles and avoid sharing personal administrator accounts.", "Provide the session mechanism the product supports and verify its lifetime covers the assessment.", "Document MFA, SSO, recovery and logout expectations; exclude real notifications and identity-provider infrastructure unless authorized."],
    workflow: [
      { title: "Define expected signed-in journeys", detail: "List the private routes and sensitive actions per role. Include pages only reached through onboarding, deep links or state-dependent navigation." },
      { title: "Verify session access", detail: "Confirm the supplied context reaches an expected private route before assessing coverage. Review redirects and inaccessible pages in the final report rather than treating them as successful tests." },
      { title: "Assess and compare permissions", detail: "Run supported checks with the available contexts. A tester should compare controlled owners and other users, then examine recovery, account linking and role changes manually." },
      { title: "Retest and revoke credentials", detail: "Verify fixes with both a legitimate and forbidden context, then invalidate test sessions and remove temporary accounts according to the agreed plan." },
    ],
    evidence: ["A role matrix and proof the test context reached the intended private routes.", "Sanitized control and unauthorized requests, with credentials and recovery tokens removed.", "Session validity context, affected operation, coverage gaps and the post-fix result."],
    automation: "Authenticated coverage depends on valid contexts, reachable routes and supported session handling. MyPentest's reported checks and unchecked sections should be used to establish that scope; a token being accepted once does not prove the entire account journey was tested.",
    humanReview: "Manually review recovery, MFA enrollment, SSO account linking, support impersonation and privileged actions. These journeys often involve out-of-band channels or rules that cannot be inferred from ordinary page discovery.",
    releaseDecision: "Do not call a private application assessed when its account contexts failed. Record the tested roles, missing flows and confirmed permission defects, then retest the relevant session and access controls after remediation.",
    faq: [
      { question: "Can I give the scanner my own administrator session?", answer: "Prefer a dedicated test account with the required role and synthetic data. Its permissions and lifetime should be scoped to the assessment, and its credentials should be revoked afterwards." },
      { question: "Does signed-in testing cover MFA and SSO?", answer: "A supplied session can cover reachable application behavior after login. MFA enrollment, SSO linking and identity-provider flows require separately planned testing and may need human interaction." },
      { question: "How do I tell whether login worked during the test?", answer: "Review whether the expected private routes were reached and whether the account context stayed valid. Login redirects, expired sessions or unchecked authenticated categories should remain visible as coverage gaps." },
    ],
    related: [{ label: "Authentication testing guide", href: "/guides/authentication-security-testing" }, { label: "Session security guide", href: "/guides/session-security-testing" }, { label: "SaaS testing plan", href: "/use-cases/saas" }, { label: "Web application pentesting", href: "/web-application-pentesting" }, { label: "View report coverage and evidence", href: "/mypentest/example-report" }],
    sources: [AUTHORIZATION],
  },
  {
    slug: "small-teams",
    updated: "2026-10-02",
    label: "Small engineering teams",
    title: "Security testing for small engineering teams",
    description: "Build a manageable security testing routine with a scoped baseline, evidence-driven triage, repair owners, retests and focused manual review.",
    question: "How can a small team make security testing useful?",
    answer: "Start with the app and APIs you own, a few representative test accounts and the highest-impact customer journeys. Run a repeatable baseline, turn confirmed findings into owned repair tickets and retest the fixes. Track missing coverage and request focused manual help for complex or high-risk rules.",
    context: "A small team needs work it can act on, not a report that consumes a sprint before anyone knows which issue is real. Define a manageable surface and a regular triage owner. Expand coverage as the product adds roles, integrations and sensitive features, while keeping evidence connected to a concrete customer impact.",
    scope: [
      { asset: "Primary application and APIs", roles: "Developer owner and two test users", priority: "Establish a repeatable starting point." },
      { asset: "Account and revenue-critical features", roles: "Customer and privileged operator", priority: "Focus on defects with concrete business effects." },
      { asset: "Fixes and newly changed routes", roles: "Repair engineer and reviewer", priority: "Keep verified defects from returning." },
    ],
    preparation: ["Maintain a short owned-target inventory and a synthetic fixture set.", "Assign one triage owner and a repair owner for each relevant application area.", "Choose the customer journeys that matter most and document any excluded integration or role."],
    workflow: [
      { title: "Define a small meaningful scope", detail: "Include the main host, API routes and two controlled users. Write what a harmful failure would look like for your account, data and payment workflows." },
      { title: "Collect and interpret the baseline", detail: "Run the authorized assessment and review coverage before findings. Investigate confirmed evidence and mark inaccessible routes as work to restore access or review separately." },
      { title: "Repair by impact", detail: "Give engineers a sanitized reproduction, affected control and business consequence. Ask for manual review when a suspected issue depends on a custom rule or cannot be established from the evidence." },
      { title: "Retest and expand deliberately", detail: "Reproduce the repaired case with a valid control, record the result and add a useful regression test. Expand the next scope when new roles or integrations introduce another boundary." },
    ],
    evidence: ["A stable target and role inventory, with a list of tested and inaccessible journeys.", "Confirmed reproductions linked to repair tickets, owners and expected controls.", "Retest results and regression cases, rather than a changing count of open alerts."],
    automation: "A repeatable baseline reduces the effort needed to check supported web and API controls. It remains one part of engineering security work and does not replace dependency maintenance, source review or access management.",
    humanReview: "Use focused manual help for permission architecture, recovery flows and high-impact business logic. This can be narrower than a full engagement when the team has already documented the suspected boundary and supplied useful fixtures.",
    releaseDecision: "Use verified impact and repair ownership to decide what must be fixed first. Keep untested areas visible so a small initial scope can grow without creating a false claim of complete coverage.",
    faq: [
      { question: "Do we need a dedicated security team to start?", answer: "You need an authorized target owner, usable test accounts and someone responsible for triage and repairs. Bring in specialist review for complex or high-impact issues the team cannot validate confidently." },
      { question: "How often should a small team assess its app?", answer: "Repeat relevant checks after meaningful changes to authentication, data permissions or critical workflows, and use a regular cadence your team can triage. Keep the build and scope comparable across runs." },
      { question: "How should we prioritize a long report?", answer: "Start with confirmed evidence, the affected customer or business boundary and exploit prerequisites. Assign repair owners, retest fixes and separate missing coverage from verified defects." },
    ],
    related: [{ label: "Attack surface inventory guide", href: "/guides/attack-surface-inventory" }, { label: "Automated and manual testing guide", href: "/guides/automated-vs-manual-testing" }, { label: "Pre-launch testing plan", href: "/use-cases/startup-before-launch" }, { label: "MyPentest product and scope", href: "/mypentest" }, { label: "Automated and manual approaches", href: "/compare/automated-vs-manual-penetration-testing" }],
    sources: [SSDF],
  },
];

export function securityUseCase(slug: string): SecurityUseCase | undefined {
  return SECURITY_USE_CASES.find((item) => item.slug === slug);
}

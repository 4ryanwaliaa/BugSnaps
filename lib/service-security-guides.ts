import type { SecurityGuide } from "@/lib/security-guides";

/** Assessment planning guides for teams arranging a scoped security review. */
export const SERVICE_SECURITY_GUIDES: SecurityGuide[] = [
  {
    slug: "web-vs-api-security-assessment",
    title: "Web application or API security assessment: how to choose the scope",
    description: "Decide which browser flows, API endpoints, user roles and integrations to include in a security assessment, with a practical scoping example.",
    category: "Testing workflow",
    answer: "Choose the assessment scope around the assets and trust boundaries you need to evaluate. A web review can cover browser-facing flows and sessions; an API review focuses on exposed operations and their authorization. Most modern applications need an agreed combination of both.",
    updated: "2026-10-28",
    sections: [
      { title: "Map the application before choosing a label", paragraphs: ["List the browser application, mobile clients, APIs, administration interfaces and third-party services that support the feature. Mark which are owned by your organization, which environments may be tested and which components are outside the engagement.", "A browser application may call the same API used by a mobile client. Testing only visible browser pages can miss routes or permissions that are not reached through that interface."], source: 0 },
      { title: "Choose tests based on the risk", paragraphs: ["A web-focused review can examine browser rendering, session handling, login, user journeys and security-relevant application logic. An API-focused review can examine request and response handling, object and function authorization, token use, rate controls and endpoint inventory. The two overlap on authentication and authorization.", "If a customer portal lets users download invoices through an API, include both the browser download flow and the underlying API operation. Give the tester two isolated accounts with separately owned test invoices so that allowed and denied access can be compared."], source: 1 },
      { title: "Supply practical assessment inputs", paragraphs: ["Prepare test URLs, API documentation or an OpenAPI definition if available, a role and permissions matrix, and test accounts for each role and tenant. Include representative safe test records and explain expected access, including support users and shared objects.", "Identify integrations that send email, charge a card or affect external systems. Agree whether they use test modes and what actions are excluded before testing starts."], checklist: ["List each in-scope host, API version and environment, plus exclusions.", "Provide role-specific accounts and written expected permissions.", "Agree on test windows, rate limits, contacts and evidence handling." ] },
      { title: "Agree on coverage and outputs", paragraphs: ["Ask for a coverage record showing which journeys, API routes and roles were tested and what could not be tested. Findings should include enough sanitized evidence to reproduce the issue, impact in context and a proposed remediation.", "Plan a retest of agreed fixes with the same test accounts and include positive cases to confirm that legitimate access still works. A report is a snapshot of the agreed scope and conditions."], source: 2 },
    ],
    limitations: "Names such as web pentest and API pentest do not guarantee a fixed set of tests. Coverage depends on agreed scope, time, accessible routes, accounts and test data. Neither assessment alone establishes that all infrastructure or business logic is secure.",
    faqs: [
      { question: "Does a web application pentest automatically cover every API?", answer: "No. The scope should name API versions, routes, clients and roles. An endpoint not reached by the tested browser flows may need separate coverage." },
      { question: "Can an API assessment test access between customers?", answer: "Yes, if the agreement includes that boundary and suitable isolated test accounts, records and expected permission rules are provided." },
      { question: "Is an automated scan a substitute for all manual testing?", answer: "Automation can support defined checks, but business logic and intended permission decisions often require context and manual review." },
    ],
    sources: [
      { title: "OWASP Web Security Testing Guide", url: "https://owasp.org/projects/web-security-testing-guide" },
      { title: "OWASP API Security Top 10: Broken Object Level Authorization", url: "https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/" },
      { title: "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment", url: "https://csrc.nist.gov/pubs/sp/800/115/final" },
    ],
    related: ["pentest-scope-authorization", "bola-testing", "business-logic-testing", "security-testing-report"],
  },
  {
    slug: "network-pentest-preparation",
    title: "Prepare for a network penetration test",
    description: "Define owned IP ranges, testing vantage points, safety limits and operational contacts before an external or internal network assessment.",
    category: "Testing workflow",
    answer: "A useful network assessment begins with written authorization, a verified inventory of targets, a clear testing location and agreed operational limits. These details let testers distinguish the intended network from shared or third-party systems and reduce disruption.",
    updated: "2026-10-28",
    sections: [
      { title: "Define the objective and vantage point", paragraphs: ["Decide whether the assessment should represent an external internet user, an internal user on a particular network, or both. The same service can be reachable from one location and blocked from another, so document each starting point separately.", "Identify the questions you need answered: for example, which authorized external services are exposed, or whether a test user can reach a sensitive internal segment. Agree on how success will be evidenced without accessing unrelated data."], source: 0 },
      { title: "Verify assets and authority", paragraphs: ["List in-scope IP addresses, ranges, domains, locations and owned devices; specify exclusions and any address ranges that are shared, leased, cloud-hosted or managed by a third party. A domain resolving to an IP is not sufficient by itself to establish permission to test everything at that address.", "Name the person authorizing the engagement and obtain required approvals from system owners and service providers. Supply an owner and emergency contact for each important environment."], checklist: ["Confirm each range and environment belongs to the authorized scope.", "Identify fragile systems and out-of-scope third parties.", "Record the tester's source addresses and approved network access." ] },
      { title: "Set rules of engagement", paragraphs: ["Agree on dates, hours, traffic limits, allowed techniques, escalation channels and stop conditions. Decide in advance whether credentialed access, exploitation, password testing or wireless testing is included; exclude disruptive techniques unless explicitly planned and authorized.", "Tell monitoring and incident-response teams how to verify the engagement and reach the tester. Define what happens if an unexpected service, production incident or evidence of a separate compromise is discovered."], source: 0 },
      { title: "Prepare evidence and retesting", paragraphs: ["Agree how findings and sensitive evidence will be stored, transferred and retained. Ask the assessment team to record the tested asset, source location, observation, impact and limitations, including assets that were unavailable.", "Assign owners and timelines for remediation, then define the retest scope. Verify both the intended restriction and required administrative access after a change."] },
    ],
    limitations: "An assessment covers the authorized assets, vantage points and time window, not every network path or future configuration. Discovery is affected by filtering and availability; a quiet result does not establish that no vulnerability exists.",
    faqs: [
      { question: "What is the difference between external and internal testing?", answer: "They start from different network locations and can reveal different reachable services. Define each vantage point and its authorized targets." },
      { question: "Can a tester assess a vendor-managed IP address?", answer: "Only after the relevant owner and provider permissions and applicable rules are confirmed. Include the boundary in the written scope." },
      { question: "Should every network test include disruptive exploitation?", answer: "No. Agree the techniques, limits and stop conditions in advance based on the objective and operational risk." },
    ],
    sources: [{ title: "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment", url: "https://csrc.nist.gov/pubs/sp/800/115/final" }],
    related: ["pentest-scope-authorization", "attack-surface-inventory", "security-testing-report", "remediation-retesting"],
  },
  {
    slug: "cloud-security-assessment-scope",
    title: "Scope a cloud security assessment across identity, configuration and exposure",
    description: "Prepare cloud accounts, permissions, resources and provider testing rules for a focused assessment without assuming every cloud service has the same responsibility boundary.",
    category: "Testing workflow",
    answer: "Scope a cloud assessment by account, service, region, identity and data boundary, then agree the evidence and testing permissions for each. Customer and provider responsibilities vary by service, so verify the relevant provider rules before testing.",
    updated: "2026-10-28",
    sections: [
      { title: "Map accounts and ownership", paragraphs: ["List the cloud organizations, subscriptions or projects, accounts, regions and environments to review. Identify the owner of each and the services that hold sensitive data or expose interfaces to other networks.", "Document the intended boundaries: production versus test, internet-facing versus internal, and the systems that are operated by a separate provider or customer. Establish a contact who can approve access and coordinate changes."], source: 0 },
      { title: "Select controls and evidence", paragraphs: ["Choose the review objectives for the actual services in scope. Typical areas include identity and role permissions, public storage exposure, network access, logging, secret handling and configuration drift. Document which resources and identities will be sampled and which require full inventory.", "Provide an appropriately limited assessment identity and agree how permissions will be granted and revoked. A read-only configuration review and an active penetration test answer different questions; specify whether each is authorized and what evidence is needed." ] },
      { title: "Check provider rules and shared responsibility", paragraphs: ["Provider testing policies and customer responsibilities differ across services and can change. AWS, for example, publishes a list of permitted services and restrictions for security testing; verify the current policy and resolve any questions with the provider before starting.", "For a managed service, the provider may operate some layers while the customer controls configuration, identities or data. Map that boundary for each selected service instead of assuming the same division applies to every workload."], checklist: ["Identify the provider, service and region for each target.", "Check current permitted activities and any approval requirements.", "Obtain customer and third-party authorization for every included environment."], source: 1 },
      { title: "Agree on safe handling and retest", paragraphs: ["Use non-production fixtures where practical and avoid copying sensitive records into evidence. Agree on excluded actions, rate limits, a stop procedure and incident contacts. Logs and inventory exports may reveal secrets or personal data, so set access and retention rules before collecting them.", "For each finding, record the resource and identity involved, observed configuration, intended policy, business impact and recommended change. Recheck the affected resource and legitimate access after the owner applies a fix."], source: 2 },
    ],
    limitations: "A limited-permission or sampled review can miss accounts, regions, temporary resources and policy interactions. Provider rules and service capabilities change; scope and current policy must be verified for the specific environment. An assessment does not establish certification or compliance by itself.",
    faqs: [
      { question: "Is a cloud configuration review the same as a penetration test?", answer: "No. A configuration review inspects selected settings and permissions; a penetration test exercises agreed attack paths. An engagement may include both when explicitly authorized." },
      { question: "Does a read-only identity see every cloud risk?", answer: "No. Its visibility depends on permissions, included accounts and services. Record denied access and gaps in the coverage." },
      { question: "Can a customer test the cloud provider's infrastructure?", answer: "Customer authorization does not automatically authorize testing the provider's own infrastructure. Follow the provider's current policy and obtain any required approvals." },
    ],
    sources: [
      { title: "AWS shared responsibility model", url: "https://aws.amazon.com/compliance/shared-responsibility-model/" },
      { title: "AWS penetration testing policy", url: "https://aws.amazon.com/security/penetration-testing/" },
      { title: "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment", url: "https://csrc.nist.gov/pubs/sp/800/115/final" },
    ],
    related: ["pentest-scope-authorization", "attack-surface-inventory", "exposed-secrets", "remediation-retesting"],
  },
];

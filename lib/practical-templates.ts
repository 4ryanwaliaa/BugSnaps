import type { SecurityGuide } from "@/lib/security-guides";

export const PRACTICAL_TEMPLATES: SecurityGuide[] = [
  {
    slug: "api-security-test-cases",
    title: "API Security Test Cases: Checklist & CSV Template",
    description: "Download an API security test-case CSV with allowed and denied requests. Cover authentication, BOLA, tenant isolation, rate limits and retesting.",
    category: "API security", updated: "2026-10-21",
    download: { path: "/templates/api-security-test-cases.csv", label: "Download API test cases (CSV)" },
    answer: "An API security test case needs a caller, an operation, a known test object, an expected permission decision and observable evidence. The downloadable matrix gives you eight starting cases, including a positive control. Replace the examples with your application's actual access policy before running any checks.",
    sections: [
      { title: "Set up two accounts and two workspaces", paragraphs: ["Create a staging workspace for tenant A and another for tenant B. Give each a disposable record with recognizable, non-sensitive contents. Within tenant A, create a viewer and an administrator. This fixture lets you distinguish ownership failures from role failures without probing unrelated records.", "Record the build, API base URL, account aliases and approved scope beside the matrix. Store credentials in your approved secret store, never inside the CSV. The example routes are placeholders; the download does not send requests or run a scanner."], source: 0 },
      { title: "Run a valid request before each denied case", paragraphs: ["Start with an owner reading their own test invoice. If that fails, a later denied response tells you little: the record may be missing or the session expired. Next, change only the test identity or object required by the case. Compare the response and resulting state with the written permission policy."], checklist: ["Authentication: an anonymous caller must not read a private record.", "Ownership: account B must not read A's unshared invoice.", "Roles: a viewer must not perform an administrator-only update.", "Tenant isolation: changing a workspace identifier must not cross the membership boundary."] },
      { title: "Check property access, limits and revocation", paragraphs: ["An endpoint can protect the record while accepting a privileged field such as role or approval status. Use a disposable fixture to confirm forbidden fields are rejected or ignored, and inspect the resulting state. Keep an allowed field update as a control.", "Agree a small request budget before checking rate limits. Record the expected threshold and time window; do not infer a missing control from a handful of successful calls. Remove a test membership and check subsequent access against the product's documented revocation timing."], source: 0 },
      { title: "Record evidence and retest the boundary", paragraphs: ["Every row starts as Not run. Use Pass for expected behavior, Finding for a demonstrated policy violation, or Unchecked with a reason when a fixture is unavailable. A 200 response alone is not proof of unauthorized access: inspect the protected data or state change.", "Assign confirmed findings to an owner and retest the same identity-object-action combination after remediation. Repeat the positive control so the fix does not simply deny every request. Add export, batch and attachment routes where they reach the same resource."], checklist: ["Save redacted evidence references, not session tokens.", "Record expected and actual behavior separately.", "Keep the tested build and retest date with each result."] },
    ],
    limitations: "These examples are a starting matrix, not complete OWASP coverage or proof that an API is secure. Business workflows and integrations need additional cases. This is a planning resource, not a claim that MyPentest automates every listed check.",
    faqs: [
      { question: "Can I open this checklist in Excel?", answer: "Yes. Open or import the CSV in Excel, Google Sheets or your issue tracker. Preserve separate columns for expected behavior, observations, status and evidence." },
      { question: "Must denied requests return 403?", answer: "No. Some applications use 404 to avoid revealing an object. Verify protected data and actions remain unavailable using the application's documented response policy." },
      { question: "Is this an automated test suite?", answer: "No. It is a downloadable planning matrix. Implement the cases in your authorized test environment or use them to review assessment coverage." },
    ],
    sources: [{ title: "OWASP API Security Top 10", url: "https://api-security.owasp.org/editions/2023/en/0x11-t10/" }],
    related: ["bola-testing", "access-control-testing", "openapi-security-testing"],
  },
  {
    slug: "pentest-report-template",
    title: "Pentest Report Template: Findings & Retest CSV",
    description: "Download a free pentest findings template with evidence, impact, remediation and retest fields. See what belongs in the executive summary and scope.",
    category: "Testing workflow", updated: "2026-10-21",
    download: { path: "/templates/pentest-findings-template.csv", label: "Download findings and retest template (CSV)" },
    answer: "A useful pentest report connects each finding to an affected asset, reproducible evidence, business impact, a fix and a retest result. Download the blank findings register, then accompany it with an executive summary, scope and coverage statement. A filled spreadsheet alone is not a complete assessment report.",
    sections: [
      { title: "Write an executive summary that supports a decision", paragraphs: ["State what was assessed, when testing happened and which release was examined. Explain demonstrated impact in terms the owner can act on, such as access to another test tenant's records. Separate observed impact from possible consequences that were not tested.", "End with concrete decisions: who owns remediation, what should happen first and what must be retested. Avoid claiming zero findings means zero vulnerabilities. Readers should understand the assessment's value and limits without interpreting raw scanner output."], source: 0 },
      { title: "Document scope and unavailable coverage", paragraphs: ["List authorized assets, environments, assessment dates, test roles and exclusions. Document restrictions on active testing, data access and third-party integrations. Note missing accounts or unreachable workflows because these change what conclusions the report supports.", "Keep a coverage list for checks that passed, produced findings or could not be completed. Do not count unavailable tests as passes. A finding register records issues; it cannot describe every check that was attempted."], checklist: ["Assessment dates, build and environment", "Authorized assets, accounts and permitted actions", "Exclusions, unavailable features and evidence limitations"] },
      { title: "Complete one row per actionable finding", paragraphs: ["The CSV includes an identifier, title, asset, preconditions, expected and observed behavior, evidence reference, impact, severity rationale, remediation, owner and status. Where several routes share one underlying repair, link those locations to the same finding.", "For an invoice ownership failure, record which test role reached which other test record and why that action was forbidden. Keep the redacted request and response in your approved evidence location. Do not embed passwords, session tokens or customer records in a shared report."], source: 0 },
      { title: "Explain severity and verify the repair", paragraphs: ["If you use CVSS, include its version, vector and rationale alongside the score. Product context still matters: affected data, exposure and required privileges inform priority. Do not copy a generic critical label onto an unverified candidate.", "Describe a testable repair, such as enforcing caller ownership at every route that reads an invoice. Keep the original evidence and record the fixed build, retest date and result separately. Repeat the failing case and a valid control, then check adjacent routes. If retesting is unavailable, record that limit instead of declaring the issue fixed."], source: 1 },
    ],
    limitations: "This template is not a certification, compliance attestation or independent penetration test. It does not establish that a scanner covers all required tests. Agree report and evidence requirements with the recipient before work begins.",
    faqs: [
      { question: "Is the pentest report template free?", answer: "Yes. Download the blank CSV findings and retest register without an account. This guide explains the accompanying report sections." },
      { question: "Can this replace an independent pentest?", answer: "No. A template organizes evidence but does not perform an assessment or establish tester independence. The recipient determines required scope and evidence." },
      { question: "Where is the example assessment report?", answer: "The MyPentest example report shows the product's report layout and a labelled example assessment. It illustrates the format, not results from your application." },
    ],
    sources: [{ title: "OWASP WSTG: Reporting", url: "https://wstg.owasp.org/stable/5-Reporting/README/" }, { title: "FIRST CVSS v4.0 specification", url: "https://www.first.org/cvss/v4.0/specification-document" }],
    related: ["security-testing-report", "remediation-retesting", "pentest-scope-authorization"],
  },
];

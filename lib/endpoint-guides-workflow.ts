import type { SecurityGuide } from "@/lib/security-guides";

/** Practical editorial guides; examples describe a workflow, not product capabilities. */
export const ENDPOINT_WORKFLOW_GUIDES: SecurityGuide[] = [
  {
    slug: "windows-endpoint-security-assessment-checklist",
    title: "Windows endpoint security assessment checklist",
    description: "Plan an authorized Windows endpoint assessment, establish a baseline, review common exposure areas, and record actionable evidence.",
    category: "Testing workflow",
    answer: "A Windows endpoint security assessment compares the state of an authorized device with its intended configuration and risk profile. Start with ownership and scope, record the system and collection limits, review relevant controls, and assign findings for verification and remediation.",
    updated: "2026-10-28",
    sections: [
      { title: "Agree on devices and boundaries", paragraphs: ["List the machines, owners, permitted testing window, and contact for service interruptions. A laptop used by a travelling employee has a different exposure profile from a shared workstation. Agree whether checks are observational, whether changes are permitted, and how device reports will be stored."], checklist: ["Obtain authorization for each system and use the least privilege needed.", "Record device identity, operating system version, time, and whether the machine is on the corporate network.", "Choose a representative sample when assessing a fleet, including exceptions and remote devices."], source: 0 },
      { title: "Establish the expected baseline", paragraphs: ["Compare the machine against a documented policy appropriate to its role: supported Windows version and updates, account privileges, disk encryption, firewall profile, endpoint protection, and remote access. A policy exception or a managed alternative can explain an apparent deviation; retain the policy version alongside the result."], checklist: ["Identify who owns patching and what reboot window is allowed.", "Record whether the device is centrally managed or independently configured.", "Treat disabled controls as findings to investigate, not proof of compromise."] },
      { title: "Inspect exposure and access", paragraphs: ["Review local administrators, unnecessary services, remote management exposure, and shared folders against approved business needs. For example, an administrative service reachable only from a managed support network has a different context from one exposed to untrusted networks. Confirm effective settings, not just the intended policy."], checklist: ["Check each active firewall profile and the networks it applies to.", "Identify unused or unowned local accounts without publishing their names.", "Note which protections could not be checked with the available permissions."] },
      { title: "Record evidence and next steps", paragraphs: ["For each issue, capture the affected asset, observed state, expected state, impact hypothesis, evidence source, and responsible owner. Store sensitive output in the approved location and remove tokens, usernames, and internal addresses from material shared more broadly. Give each issue an explicit retest condition."], source: 0 },
    ],
    limitations: "A point-in-time review covers only the devices and controls actually examined. It does not prove the absence of malware, validate every policy, or substitute for continuous monitoring. Some checks require elevated access or information held by a management platform.",
    faqs: [
      { question: "How many devices should an endpoint assessment cover?", answer: "Choose a sample based on device roles, operating system versions, management groups, remote users, and known exceptions. A representative sample provides insight, but cannot establish the state of every unexamined device." },
      { question: "Is a security scan the same as an endpoint assessment?", answer: "A scan supplies observations for the controls it can examine. An assessment adds the intended policy, device context, validation of findings, and a plan to address and retest gaps." },
      { question: "Should an assessor fix issues during collection?", answer: "Only when the owner has approved changes. Record the original state before changing it and coordinate potentially disruptive actions such as service changes or restarts." },
    ],
    sources: [{ title: "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment", url: "https://csrc.nist.gov/pubs/sp/800/115/final" }],
    related: ["interpreting-local-endpoint-security-scan-reports", "prioritizing-endpoint-security-findings", "verifying-endpoint-security-remediation", "security-testing-report"],
  },
  {
    slug: "interpreting-local-endpoint-security-scan-reports",
    title: "How to interpret a local endpoint security scan report",
    description: "Read local Windows security scan results in context, distinguish observed facts from risk ratings, and identify missing or stale evidence.",
    category: "Testing workflow",
    answer: "Read an endpoint scan report as a collection of time-bound observations, not a verdict that the device is secure or compromised. Check the machine, scan time, permissions, evidence, and coverage first; then compare each observation with policy and verify uncertain findings independently.",
    updated: "2026-10-28",
    sections: [
      { title: "Check the identity and collection context", paragraphs: ["Confirm the report belongs to the intended machine and was collected recently enough for the decision. Record the operating system, scanner version, time, execution permissions, and whether the device was connected to its management network. A report generated before a restart or policy refresh may no longer describe the current state."], checklist: ["Separate an unavailable check from a passing check.", "Check collection errors and unsupported controls before interpreting a summary score.", "Keep the original report in an access-controlled location."] },
      { title: "Read the observation before the severity", paragraphs: ["A finding should say what was observed and which rule triggered it. An example is a firewall profile reported disabled. Verify which profile is active, what policy applies, and whether an alternative approved network control exists. Those facts determine the appropriate response; the label alone does not."], source: 0 },
      { title: "Resolve uncertainty and conflicting evidence", paragraphs: ["If an assessment shows a missing update while a management console shows it installed, compare timestamps, versions, reboot status, and the device identity. Consult the relevant vendor guidance and the system owner. A mismatch may reflect stale data, incomplete collection, or an installation that has not taken effect."], checklist: ["Preserve the observed value and the source that supports it.", "Record what could not be observed and why.", "Mark a result as unverified until the underlying state is confirmed."] },
      { title: "Share only the necessary evidence", paragraphs: ["Reports can reveal usernames, software versions, device names, and network details. Redact or summarize those fields for a ticket or outside recipient while retaining enough context for the responsible administrator to reproduce the observation. Use the organization's approved transfer and retention process."], source: 0 },
    ],
    limitations: "A local report may miss cloud policy, protections applied elsewhere, software not inventoried, or checks blocked by permissions. Severity labels depend on the assessment method and should not be interpreted as proof of exploitation.",
    faqs: [
      { question: "Does a clean report prove a device is safe?", answer: "No. It means the checks that ran did not report the conditions they were designed to find at that time. Review skipped checks and use other controls and evidence for risks outside that scope." },
      { question: "Can a report contain a false positive?", answer: "Yes. Stale state, incomplete permissions, detection rules, or an approved alternative control can lead to a misleading result. Verify the observation and document the reason for any exception." },
      { question: "What should a useful finding contain?", answer: "It should identify the affected device and observed condition, explain the relevant policy or risk, preserve evidence, name an owner, and describe how the fix will be verified." },
    ],
    sources: [{ title: "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment", url: "https://csrc.nist.gov/pubs/sp/800/115/final" }],
    related: ["windows-endpoint-security-assessment-checklist", "prioritizing-endpoint-security-findings", "verifying-endpoint-security-remediation", "security-testing-report"],
  },
  {
    slug: "prioritizing-endpoint-security-findings",
    title: "How to prioritize endpoint security findings",
    description: "Combine device exposure, business impact, threat evidence, compensating controls, and ownership to prioritize Windows endpoint fixes.",
    category: "Testing workflow",
    answer: "Prioritize endpoint findings using the actual device context as well as the reported severity. Consider reachability, the value and sensitivity of the device, credible threat evidence, available controls, and the cost and urgency of a safe fix; revisit the order when those facts change.",
    updated: "2026-10-28",
    sections: [
      { title: "Confirm the issue applies", paragraphs: ["Before scheduling work, verify the device and observed version or configuration. A finding for software already removed, a disabled feature, or a stale inventory record may need correction rather than the proposed patch. Keep uncertain items visible until their state is confirmed."], source: 0 },
      { title: "Consider exposure and business impact", paragraphs: ["Compare two examples: an outdated remote-access component on a public-facing support machine and the same component on a disconnected test device. The first may warrant a faster response because of reachability and operational role, even when both share the same technical severity. Confirm the network path and business dependency before deciding."], checklist: ["Record whether the device is reachable from untrusted networks.", "Identify sensitive data, privileged access, and operational dependencies.", "Document existing controls and whether they are actually effective."] },
      { title: "Use current threat information carefully", paragraphs: ["Vendor advisories and trusted threat sources can provide evidence of active exploitation, affected versions, and available mitigations. Check that the evidence applies to the installed product and configuration. A severity score is a useful starting point, but it does not describe every organization's exposure."], source: 0 },
      { title: "Assign and review decisions", paragraphs: ["Give each action an owner, target date, supporting evidence, and a verification step. If a fix must be delayed for compatibility or availability reasons, record the approver, reason, temporary mitigation, expiry date, and review trigger. An exception does not make the underlying condition disappear."], checklist: ["Schedule changes with the system owner and consider rollback.", "Escalate newly exposed or actively exploited conditions promptly.", "Reassess temporary exceptions and devices whose role has changed."], source: 1 },
    ],
    limitations: "Priority is a risk decision based on the available evidence, not a guarantee of exploitability. Reachability and compensating controls can change, so stale findings and exceptions need regular review.",
    faqs: [
      { question: "Should the highest severity always be fixed first?", answer: "Not automatically. Consider whether the finding applies, whether the device is reachable, what it protects, and what threat evidence and effective controls exist. Document the decision and revisit it when the situation changes." },
      { question: "What if a patch cannot be applied immediately?", answer: "Agree a time-limited exception with the responsible owner and use an appropriate temporary mitigation where available. Record the residual risk and a date to reassess the patch and mitigation." },
      { question: "Can one priority cover every device with the same finding?", answer: "A shared issue can have different urgency across devices. Group similar devices for efficient work, but account for meaningful differences in exposure and business impact." },
    ],
    sources: [
      { title: "Microsoft Defender Vulnerability Management: Security recommendations", url: "https://learn.microsoft.com/defender-vulnerability-management/tvm-security-recommendation" },
      { title: "NIST SP 800-40 Rev. 4: Guide to Enterprise Patch Management Planning", url: "https://csrc.nist.gov/pubs/sp/800/40/r4/final" },
    ],
    related: ["interpreting-local-endpoint-security-scan-reports", "verifying-endpoint-security-remediation", "remediation-retesting"],
  },
  {
    slug: "verifying-endpoint-security-remediation",
    title: "Verify endpoint security remediation after a fix",
    description: "Retest endpoint patches and configuration changes, confirm effective state and normal operation, and close findings with evidence.",
    category: "Testing workflow",
    answer: "Verify endpoint remediation by comparing the original finding with the effective post-change state on the affected device. Check that the update or configuration took effect, repeat the relevant observation, confirm normal use still works, and retain evidence before closing the finding.",
    updated: "2026-10-28",
    sections: [
      { title: "Define the expected result before changing anything", paragraphs: ["Record the device, original observation, policy or affected version, planned change, and the acceptance condition. For an outdated application, that could be the vendor-confirmed fixed version installed and active. Agree an owner, change window, and rollback path for changes that could interrupt work."], source: 0 },
      { title: "Confirm the effective state", paragraphs: ["An installer reporting success is not the same as a verified fix. Check the installed version and whether a restart is required, then verify the process or service is using the updated component. For a configuration issue, inspect the setting that actually applies to the active user, device, and network profile."], checklist: ["Capture the device identity and verification time.", "Account for management-policy refresh and restart delays.", "Repeat the original check where possible, using comparable permissions and scope."], source: 0 },
      { title: "Test the intended workflow", paragraphs: ["Security controls should protect the device without unnecessarily breaking approved work. After changing a firewall rule for remote administration, verify that the unauthorized path is blocked and that the authorized support path still works. Use agreed test accounts and avoid disrupting production users."], checklist: ["Test one expected allowed path and one relevant denied path.", "Record any compatibility issue or rollback.", "Avoid exposing secrets in screenshots or tickets."] },
      { title: "Close or reopen with evidence", paragraphs: ["Attach a concise before-and-after record to the finding, including the effective state, check time, verifier, and change reference. If the condition remains, investigate collection differences and policy conflicts, leave the finding open, and assign the next action. Verify other affected devices rather than assuming one successful retest applies to the fleet."], source: 1 },
    ],
    limitations: "A successful retest establishes only the condition and devices checked at that time. A patch can address one issue while other weaknesses remain; a local check may not reveal a conflicting policy or delayed management-console update.",
    faqs: [
      { question: "Is a completed change ticket enough to close a finding?", answer: "A ticket records the action, but the affected device should also show the expected effective state. Keep the verification evidence and the time it was collected." },
      { question: "Why can a finding remain after an update?", answer: "The update may require a restart, target a different installation, have failed, or the report may be stale. Compare device identity, version, timestamps, permissions, and vendor guidance before deciding." },
      { question: "Do all devices need to be retested?", answer: "Verification should match the risk and agreed scope. A sample may demonstrate a rollout pattern, but it cannot prove every device is fixed; track devices that were offline or excluded separately." },
    ],
    sources: [
      { title: "NIST SP 800-40 Rev. 4: Guide to Enterprise Patch Management Planning", url: "https://csrc.nist.gov/pubs/sp/800/40/r4/final" },
      { title: "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment", url: "https://csrc.nist.gov/pubs/sp/800/115/final" },
    ],
    related: ["windows-endpoint-security-assessment-checklist", "interpreting-local-endpoint-security-scan-reports", "prioritizing-endpoint-security-findings", "remediation-retesting"],
  },
];

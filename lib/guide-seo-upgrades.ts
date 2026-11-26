export type GuideSeoUpgrade = {
  title?: string;
  description?: string;
  updated?: string;
  quickFacts?: { label: string; value: string }[];
  readNext?: { label: string; href: string }[];
  extraFaqs?: { question: string; answer: string }[];
};

const windowsEventWorksheet = {
  label: "Use the Windows Event Viewer evidence worksheet",
  href: "/guides/windows-endpoint-evidence-handling",
};

export const GUIDE_SEO_UPGRADES: Record<string, GuideSeoUpgrade> = {
  // ── Top GSC High-Impression Guides (CTR + Search-Query Alignment + Depth) ──
  "secure-cookie-attribute-review": {
    title: "Secure vs HttpOnly vs SameSite for Cookies",
    description:
      "Compare Secure, HttpOnly and the SameSite settings. Use a Set-Cookie example and Chrome DevTools to find out why a login cookie is missing.",
    updated: "2026-11-25",
    quickFacts: [
      { label: "Secure", value: "Limits cookie transmission to HTTPS on ordinary web hosts. Localhost has a browser exception." },
      { label: "HttpOnly", value: "Keeps the cookie value out of JavaScript cookie APIs. The browser can still attach the cookie to eligible requests." },
      { label: "SameSite=Strict", value: "Sends the cookie in same-site contexts. The first visit from another site may arrive without it." },
      { label: "SameSite=Lax", value: "Also permits certain top-level cross-site navigations, such as following a link with a GET request." },
      { label: "SameSite=None", value: "Allows cross-site use under SameSite rules and requires Secure. Browser privacy settings can still block the cookie." },
      { label: "__Host- prefix", value: "In browsers that support it, requires an HTTPS response, Secure, Path=/, and an omitted Domain attribute." },
    ],
    readNext: [
      { label: "Website security checklist before launch", href: "/website-security-checklist" },
    ],
  },
  "windows-smartscreen-warning-review": {
    title: "Microsoft Defender SmartScreen Warning: What to Do",
    description:
      "Seeing “Windows protected your PC”? Learn what a SmartScreen warning means, what to check before running a download, and how to report a false positive.",
    updated: "2026-11-25",
    quickFacts: [
      { label: "What the warning means", value: "SmartScreen checks reputation. A download can be flagged because it is known to be unsafe or because the file or publisher has limited reputation." },
      { label: "First action", value: "Leave the file unopened. Check that you requested it and confirm the download through the vendor’s known site or your organization’s software catalog." },
      { label: "What to record", value: "Save the warning text, file name, expected publisher and time. Keep private URLs, tokens and file contents out of shared tickets." },
      { label: "Possible false positive", value: "Use the vendor or Microsoft reporting channel after confirming the source. On a managed device, ask IT to review the warning under its approved process." },
    ],
    readNext: [
      { label: "Review an unfamiliar download link", href: "/guides/how-to-assess-a-suspicious-url-safely" },
      { label: "Find recent actions in Windows Security Protection History", href: "/guides/windows-security-protection-history" },
      { label: "Review Windows endpoint posture with EndpointRadar", href: "/endpointradar" },
    ],
    extraFaqs: [
      {
        question: "What should I do when I see “Windows protected your PC”?",
        answer:
          "Leave the download unopened and independently verify the publisher and source. On a work or school device, send the warning text and download context to the people who manage that device.",
      },
      {
        question: "Can a signed installer still trigger a SmartScreen warning?",
        answer:
          "Yes. Microsoft considers the reputation of the particular file and its publisher. A valid signature identifies the signer and helps check integrity. Verify that the signer and source match the software you expected.",
      },
    ],
  },
  "windows-security-event-1102-review": {
    title: "Windows Event ID 1102: Audit Log Cleared",
    description:
      "Event ID 1102 means the Windows Security audit log was cleared. Find the event, match its account and logon ID, and preserve forwarded evidence.",
    updated: "2026-11-25",
    quickFacts: [
      { label: "Where to find it", value: "In Event Viewer, filter Windows Logs → Security for Event ID 1102, or look for the same event in your central log archive." },
      { label: "What to preserve", value: "Capture the host, timestamp and time zone, event record ID, SubjectUserName, SubjectDomainName and SubjectLogonId." },
      { label: "How to correlate it", value: "Look in retained logs for a 4624 successful logon on the same host around the event time with the same logon ID. Then compare the account and time with the approved maintenance record." },
      { label: "When to escalate", value: "Escalate a log clear that you cannot explain. Record any forwarding gap and preserve central copies before retention expires." },
    ],
    readNext: [
      windowsEventWorksheet,
      { label: "Windows Event IDs 1102, 4672, 5140 & 5145 triage guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Audit Windows endpoint posture with EndpointRadar", href: "/endpointradar" },
    ],
    extraFaqs: [
      {
        question: "What is the difference between Event ID 1102 and Event ID 4624?",
        answer: "Event 1102 records that the Windows Security audit log was cleared. Event 4624 records a successful logon. On the same host, matching logon IDs can help identify the session associated with the clear.",
      },
    ],
  },
  "windows-network-share-access-event-5140": {
    title: "Windows Event ID 5140: Network Share Access",
    description:
      "Event ID 5140 records the first network-share access attempt in a session. Find the source and account, then check Event 5145 for file-level detail.",
    updated: "2026-11-25",
    quickFacts: [
      { label: "Event ID & Channel", value: "Event ID 5140 in the Windows Security log (Audit File Share subcategory)." },
      { label: "What it records", value: "The first access attempt to a network share in a session. Start with the server, account, source address and share name." },
      { label: "What to record", value: "Keep the timestamp with time zone, EventRecordID, ShareName, SubjectLogonId and IP address under your approved evidence policy." },
      { label: "When 5145 helps", value: "On the same server, look for Event 5145 for the named file or folder and requested access. Use the account, logon ID and time to join the records." },
    ],
    readNext: [
      windowsEventWorksheet,
      { label: "Windows Event IDs 1102, 4672, 5140 & 5145 triage guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Event ID 5145 detailed share access guide", href: "/guides/windows-detailed-share-access-event-5145" },
      { label: "Explore EndpointRadar Windows posture tool", href: "/endpointradar" },
    ],
  },
  "windows-special-privileges-event-4672": {
    title: "Windows Event ID 4672: Special Privileges",
    description:
      "Event ID 4672 records special privileges assigned at Windows logon. Match it with Event 4624 to check the account, logon type and source.",
    updated: "2026-11-25",
    quickFacts: [
      { label: "Event ID & Channel", value: "Event ID 4672 in the Windows Security log (Audit Special Logon subcategory)." },
      { label: "What it records", value: "Assignment of sensitive administrative privileges (such as SeDebugPrivilege, SeBackupPrivilege, SeImpersonatePrivilege) to a new logon session." },
      { label: "Key triage fields", value: "Keep the device, time, SubjectUserSid, SubjectUserName, SubjectLogonId and PrivilegeList. Match the logon ID on the same device against a nearby Event 4624." },
      { label: "Start with what you expected", value: "Compare the matched logon type, account and source with the device’s approved service activity or maintenance. The privilege list identifies what the session received." },
    ],
    readNext: [
      windowsEventWorksheet,
      { label: "Windows Event IDs 1102, 4672, 5140 & 5145 triage guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Explore EndpointRadar Windows security workspace", href: "/endpointradar" },
    ],
  },
  "windows-detailed-share-access-event-5145": {
    title: "Windows Event ID 5145: Detailed Share Access",
    description:
      "Event ID 5145 records a Windows share access check. Read RelativeTargetName and AccessList, distinguish 5145 from 5140, and document the result.",
    updated: "2026-11-25",
    quickFacts: [
      { label: "Event ID & Channel", value: "Event ID 5145 in the Windows Security log (Audit Detailed File Share subcategory)." },
      { label: "What it records", value: "A file or folder access check inside a particular share. Start with ShareName, RelativeTargetName, SubjectUserName, IpAddress and AccessList." },
      { label: "How to read a failure", value: "Microsoft documents 5145 failure records for share-level denials. Review file-system permissions and other applicable logs separately when investigating an NTFS denial." },
      { label: "Difference from 5140", value: "Event 5140 identifies the share at the first access attempt of a session. Event 5145 provides the object and access requested within the share." },
    ],
    readNext: [
      windowsEventWorksheet,
      { label: "Windows Event IDs 1102, 4672, 5140 & 5145 triage guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Event ID 5140 network share access guide", href: "/guides/windows-network-share-access-event-5140" },
      { label: "Explore EndpointRadar Windows posture tool", href: "/endpointradar" },
    ],
  },
  "lookalike-domain-triage": {
    title: "Lookalike Domain Triage & Phishing URL Check",
    description:
      "How to verify a suspected lookalike domain (such as courier or retail delivery links like Shadowfax, Xpressbees, or Ajio) safely using PhishLens.",
    quickFacts: [
      { label: "First safety rule", value: "Do not open the unfamiliar link directly; inspect the raw URL text locally in PhishLens (/phishing-detector)." },
      { label: "Common impersonation targets", value: "Courier parcel updates (Shadowfax, Xpressbees), retail refund lures (Ajio), and workspace sign-in pages." },
      { label: "Signals to compare", value: "Registrable base domain right before the TLD, hyphenated suffixes, Punycode (xn--), and RDAP registration age." },
    ],
    readNext: [
      { label: "Check a suspicious link free with PhishLens", href: "/phishing-detector" },
      { label: "Lookalike courier & e-commerce domain check guide", href: "/blog/lookalike-domain-courier-and-ecommerce-phishing-check" },
      { label: "Suspicious QR code response guide", href: "/guides/suspicious-qr-code-response" },
    ],
    extraFaqs: [
      {
        question: "How do I verify a suspected Shadowfax, Xpressbees, or Ajio lookalike domain safely?",
        answer:
          "Copy the link address from the SMS, WhatsApp, or email message without tapping it, and paste it into PhishLens at bugsnaps.in/phishing-detector. Check the actual registrable base domain right before the top-level domain (.com, .in, .top, .shop) rather than words in the subdomain or path, and verify any real shipment or order directly inside the official app or typed website.",
      },
    ],
  },
  "suspicious-qr-code-response": {
    title: "Suspicious QR Code? What to Do Without Opening It",
    description:
      "Check an unexpected QR code using the official app or a trusted contact. Learn what to do if you already opened the link, paid, or entered a password.",
    updated: "2026-11-25",
    quickFacts: [
      { label: "Parking, payment or delivery", value: "Open the operator’s official app or use a number you already trust. For a code on a public sign, tell the venue where you found it." },
      { label: "Opened the link", value: "Close the page. Note the time and what happened. If it downloaded a file, leave the file unopened and use your device’s approved support process." },
      { label: "Entered a password or payment details", value: "Use the service’s official app or website to secure the account. For payments or card details, contact your bank or card issuer through its official number." },
    ],
    readNext: [
      { label: "Review an address you already have with PhishLens", href: "/phishing-detector" },
      { label: "What to do after opening a phishing link", href: "/guides/phishing-click-incident-triage" },
    ],
  },
  "pentest-network-vantage-points": {
    title: "Global Vantage Point Network Testing Guide",
    description:
      "Choose global, external, and internal vantage points for network testing: compare multi-region reachability checks with scoped penetration testing.",
    quickFacts: [
      { label: "Global external vantage points", value: "Test how geo-routing, CDN edge rules, and regional firewall policies respond across geographic locations." },
      { label: "Allowlisted external vantage", value: "Tests application controls directly when an edge proxy or rate limiter is intentionally bypassed by owner agreement." },
      { label: "Internal / segmented vantage", value: "Evaluates lateral reachability and east-west segmentation inside a VPC, office network, or zero-trust boundary." },
    ],
    readNext: [
      { label: "Explore BugSnaps network penetration testing services", href: "/network-pentesting" },
      { label: "Run a web and API assessment with MyPentest", href: "/mypentest" },
    ],
    extraFaqs: [
      {
        question: "What is global vantage point network testing and why does vantage location matter?",
        answer:
          "Global vantage point network testing compares how an application or network perimeter responds from multiple geographic regions and autonomous systems (ASNs). Because CDNs, GeoIP firewall blocks, and Anycast DNS can serve different routes or rules by country, recording the exact source IP and region of a test prevents mistaking a regional block for a global security control.",
      },
    ],
  },
  "defender-sensor-health-assessment": {
    title: "Windows Defender Sensor Health Check Guide",
    description:
      "Investigate inactive or misconfigured Microsoft Defender endpoint sensors, review reporting gaps, and verify restored Windows security telemetry.",
    quickFacts: [
      { label: "Key distinction", value: "Separate an offline machine from an online machine whose Defender or sense service has stopped reporting." },
      { label: "Local verification", value: "Check Windows Defender Antivirus and service status locally using EndpointRadar." },
    ],
    readNext: [
      { label: "Review Windows endpoint posture with EndpointRadar", href: "/endpointradar" },
      { label: "Windows security posture checklist", href: "/blog/windows-security-posture-checklist" },
    ],
  },
  "intune-retire-versus-wipe-windows": {
    title: "Intune Retire vs Wipe for Windows Devices",
    description:
      "Compare Microsoft Intune retire and wipe actions on Windows endpoints, verify device ownership, and plan data handling before device removal.",
    quickFacts: [
      { label: "Intune Retire", value: "Removes managed corporate app data, policies, and management enrollment while leaving personal user files intact." },
      { label: "Intune Wipe", value: "Resets the Windows device back to factory defaults (or removes all user accounts and data depending on wipe options)." },
    ],
    readNext: [
      { label: "Windows security posture checklist", href: "/blog/windows-security-posture-checklist" },
      { label: "Explore EndpointRadar Windows posture tool", href: "/endpointradar" },
    ],
  },
  "windows-bitlocker-encryption-status": {
    title: "Check Windows BitLocker Status & Recovery",
    description:
      "Verify Windows BitLocker drive encryption, protection status, and BitLocker recovery key readiness across managed endpoints.",
    quickFacts: [
      { label: "Two separate states", value: "A volume can show Encryption Percentage: 100% while Protection Status is Off (suspended) during an update." },
      { label: "Preparing BitLocker recovery", value: "Verify that the 48-digit recovery password ID matches the key escrowed in Entra ID, Active Directory, or your management vault before changing TPM or BIOS settings." },
    ],
    readNext: [
      { label: "Verify Windows BitLocker and posture with EndpointRadar", href: "/endpointradar" },
      { label: "Windows security posture checklist", href: "/blog/windows-security-posture-checklist" },
    ],
    extraFaqs: [
      {
        question: "What should I verify when preparing BitLocker recovery on a Windows device?",
        answer:
          "Before updating firmware, modifying TPM/Secure Boot settings, or rotating protectors, confirm that the device's Recovery Password numerical identifier matches a verified recovery key stored in your organization's recovery repository and that a designated administrator can retrieve it.",
      },
    ],
  },
  "firewall-rule-cleanup-review": {
    title: "Firewall Rule Cleanup: Retire Obsolete Rules",
    description:
      "Perform a safe firewall rule cleanup: review rule ownership, hit counts, and shadow rules, then retire obsolete access with a tested rollback plan.",
    quickFacts: [
      { label: "Zero hit count caution", value: "A rule with zero recent hits may still be used by quarterly batch jobs, disaster recovery, or failover paths." },
      { label: "Safe retirement workflow", value: "Confirm owner -> disable or log-only first -> observe across a full business cycle -> delete with a saved rollback artifact." },
    ],
    readNext: [
      { label: "Windows firewall profile review guide", href: "/guides/windows-firewall-profile-review" },
      { label: "Explore EndpointRadar Windows posture workspace", href: "/endpointradar" },
    ],
  },
  "windows-explicit-credentials-event-4648": {
    title: "Windows Event ID 4648: Explicit Credentials",
    description:
      "What does explicit credentials meaning cover in Windows Security Event ID 4648? Triage RunAs, scheduled tasks, RDP, and lateral movement.",
    quickFacts: [
      { label: "Event ID & Channel", value: "Event ID 4648 in the Windows Security log (Audit Logon subcategory)." },
      { label: "Explicit credentials meaning", value: "A process passed a specific username and password explicitly (e.g., RunAs, outbound network auth, or scheduled task) instead of using its current session token." },
      { label: "Key triage fields", value: "SubjectUserName (caller), TargetUserName (supplied credential), TargetServerName, ProcessName, and IpAddress." },
    ],
    readNext: [
      { label: "Windows Event IDs 1102, 4672, 5140 & 5145 triage guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Explore EndpointRadar Windows posture tool", href: "/endpointradar" },
    ],
    extraFaqs: [
      {
        question: "What is the explicit credentials meaning in Windows Event ID 4648?",
        answer:
          "An explicit-credentials logon (Event ID 4648) means an already logged-on user or process explicitly supplied a username and password to authenticate as another identity or connect to a remote server (TargetServerName), such as when running `runas.exe`, mapping a network drive with different credentials, or launching an outbound RDP session.",
      },
    ],
  },
  "windows-account-created-event-4720": {
    title: "Windows Event ID 4720: User Account Created",
    description:
      "Investigate Windows Security Event ID 4720 (user account created): verify SubjectUserName, TargetUserName, group joins (4732), and approval records.",
    quickFacts: [
      { label: "Event ID & Channel", value: "Event ID 4720 in the Windows Security log (Audit User Account Management)." },
      { label: "Key fields to check", value: "SubjectUserName (who created it), TargetUserName (new account), and correlated 4728/4732 group additions." },
    ],
    readNext: [
      { label: "Windows Event IDs 1102, 4672, 5140 & 5145 triage guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Explore EndpointRadar Windows posture tool", href: "/endpointradar" },
    ],
  },
  "windows-audit-policy-change-event-4719": {
    title: "Windows Event ID 4719: Audit Policy Changed",
    description:
      "Investigate Windows Security Event ID 4719 (system audit policy changed): review SubcategoryGuid, SubjectUserName, and disabled logging visibility.",
    quickFacts: [
      { label: "Event ID & Channel", value: "Event ID 4719 in the Windows Security log (Audit Policy Change)." },
      { label: "Why it matters", value: "Shows when Success or Failure auditing was removed or added for a security subcategory on the endpoint." },
    ],
    readNext: [
      { label: "Windows Event IDs 1102, 4672, 5140 & 5145 triage guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Event ID 1102 audit log cleared guide", href: "/guides/windows-security-event-1102-review" },
    ],
  },
  "windows-update-pending-restart": {
    title: "Windows Update Pending Restart Triage Guide",
    description:
      "Investigate a pending Windows restart after security updates, verify the active OS build after reboot, and coordinate maintenance windows safely.",
    readNext: [
      { label: "Check Windows update posture with EndpointRadar", href: "/endpointradar" },
      { label: "Windows security posture checklist", href: "/blog/windows-security-posture-checklist" },
    ],
  },
  "windows-firewall-profile-review": {
    title: "Review Windows Firewall Profiles & Policy",
    description:
      "Check Domain, Private, and Public Windows Firewall profiles, investigate an unexpected disabled state, and verify active policy before rule changes.",
    readNext: [
      { label: "Audit Windows firewall status with EndpointRadar", href: "/endpointradar" },
      { label: "Firewall rule cleanup guide", href: "/guides/firewall-rule-cleanup-review" },
    ],
  },
  "api-idempotency-key-review": {
    title: "API Idempotency Keys: Prevent Double Actions",
    description:
      "Test how REST APIs handle retries, concurrent requests, and modified payloads under the same Idempotency-Key header without duplicate side effects.",
    readNext: [
      { label: "Web race conditions & business logic testing guide", href: "/blog/race-conditions-business-logic-attacks" },
      { label: "Test your API and web app with MyPentest", href: "/mypentest" },
    ],
  },
  "jwt-audience-and-issuer-validation": {
    title: "JWT Issuer (iss) & Audience (aud) Validation",
    description:
      "Test whether an API rejects valid JWT tokens issued for a different service audience (aud) or by an unexpected issuer (iss) across tenants.",
    readNext: [
      { label: "JWT security best practices & attack vectors", href: "/blog/jwt-security-best-practices-attack-vectors" },
      { label: "Run an API security assessment with MyPentest", href: "/mypentest" },
    ],
  },
  "windows-security-log-retention-review": {
    title: "Windows Security Log Size & Retention Review",
    description:
      "Check Windows Security event log maximum size, overwrite behavior, and SIEM forwarding gaps so audit evidence is not lost before triage.",
    readNext: [
      { label: "Windows Event IDs 1102, 4672, 5140 & 5145 triage guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Explore EndpointRadar Windows posture tool", href: "/endpointradar" },
    ],
  },
  "windows-sysmon-process-network-correlation": {
    title: "Sysmon Process & Network Event Correlation",
    description:
      "Correlate Sysmon Event ID 1 (process creation) and Event ID 3 (network connection) with Windows Security audit logs during endpoint investigations.",
    quickFacts: [
      { label: "Sysmon Event ID 1 vs Security 4688", value: "Both log process creation; Sysmon Event ID 1 adds ProcessGuid, parent command line, and cryptographic file hashes." },
      { label: "Sysmon Event ID 3", value: "Links outbound TCP/UDP network connections directly to ProcessGuid, Image path, and User." },
      { label: "Native Security log role", value: "Still required for logon types (4624/4648/4672), SMB share access (5140/5145), and audit policy changes (1102/4719)." },
    ],
    readNext: [
      { label: "Windows Event IDs & Sysmon overlap investigation guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Explore EndpointRadar Windows posture workspace", href: "/endpointradar" },
    ],
    extraFaqs: [
      {
        question: "Do Windows audit logs and Sysmon data overlap in coverage?",
        answer:
          "Yes, they overlap on events such as process creation (Security Event ID 4688 and Sysmon Event ID 1), but they complement rather than replace each other. Sysmon provides ProcessGuid correlation, file hashes, DNS queries, and process-attributed network connections (Event ID 3), whereas native Windows Security audit logs cover authentication (4624, 4625, 4648, 4672), account management (4720, 4732), and SMB file-share access (5140, 5145).",
      },
    ],
  },
  "windows-system-service-install-event-7045": {
    title: "Windows Event ID 7045: New Service Installed",
    description:
      "Investigate Windows System Event ID 7045 (new service installed): inspect ServiceName, ImagePath, AccountName, and correlate with Security Event 4697.",
    quickFacts: [
      { label: "Event ID & Channel", value: "Event ID 7045 in the Windows System event log (Service Control Manager)." },
      { label: "Key triage fields", value: "ServiceName, ImagePath (executable or command line), ServiceType, StartType, and AccountName (e.g., LocalSystem)." },
    ],
    readNext: [
      { label: "Windows Event IDs 1102, 4672, 5140, 5145 & 7045 guide", href: "/blog/windows-security-event-ids-1102-4672-5140-5145-guide" },
      { label: "Explore EndpointRadar Windows posture tool", href: "/endpointradar" },
    ],
  },

  // ── Remaining Guide Title (<=56 chars) & Description (115–148 chars) Bounds Fixes ──
  "free-agentless-edr-vs-windows-security-assessment": {
    description:
      "Compare free EDR tools, agentless endpoint scans, and Windows posture assessments. See what each detects and where EndpointRadar fits.",
  },
  "windows-antivirus-state-review": {
    description:
      "Identify the registered Windows antivirus provider, interpret Microsoft Defender modes, and investigate disabled or unknown protection states.",
  },
  "windows-update-posture-review": {
    title: "Assess Windows Update Posture & Build Status",
  },
  "windows-service-hardening-review": {
    title: "Windows Service Hardening: Accounts & Startup",
  },
  "windows-software-inventory-review": {
    title: "Windows Software Inventory: List Installed Apps",
  },
  "windows-local-administrator-review": {
    title: "Windows Local Administrator Privilege Review",
  },
  "windows-endpoint-hardening-baseline": {
    title: "Windows Endpoint Hardening Baseline Checklist",
  },
  "windows-laps-password-management-review": {
    title: "Review Windows LAPS Local Admin Passwords",
  },
  "windows-device-backup-restore-test": {
    description:
      "Plan a representative Windows endpoint backup restore test, verify recovered files and permissions, and document recovery times and gaps.",
  },
  "windows-device-inventory-reconciliation": {
    title: "Reconcile Windows Endpoint Asset Inventories",
  },
  "device-compliance-and-conditional-access": {
    title: "Device Compliance & Conditional Access Checks",
  },
  "edge-browser-profile-separation": {
    title: "Separate Work & Personal Browser Profiles",
    description:
      "Review browser profile ownership, data synchronization, and session sign-out controls on managed or shared Windows endpoints.",
  },
  "endpoint-media-sanitization-disposal": {
    description:
      "Choose and verify a secure storage media sanitization process for Windows endpoints and drives before equipment disposal or transfer.",
  },
  "windows-endpoint-clock-synchronization": {
    title: "Windows Endpoint Time Sync for Investigations",
  },
  "windows-update-rollback-decision": {
    title: "Plan a Windows Update Rollback Safely",
  },
  "windows-endpoint-security-onboarding-checklist": {
    title: "Windows Endpoint Security Onboarding Checklist",
  },
  "windows-local-group-addition-event-4732": {
    description:
      "Investigate Windows Security Event ID 4732 (member added to local security group): verify approval tickets and evaluate effective admin access.",
  },
  "web-vs-api-security-assessment": {
    title: "Web App vs API Security Assessment Scope",
  },
  "cloud-security-assessment-scope": {
    title: "Scope a Cloud Security Assessment & IAM Review",
    description:
      "Prepare cloud accounts, IAM permissions, resources, and provider rules for a scoped cloud security assessment across shared responsibilities.",
  },
  "webhook-replay-and-idempotency": {
    title: "Webhook Replay & Duplicate Delivery Testing",
  },
  "oauth-redirect-uri-validation": {
    title: "OAuth Redirect URI Validation & Testing Guide",
  },
  "oauth-scope-enforcement-testing": {
    title: "OAuth Scope Enforcement Testing on APIs",
  },
  "sensitive-response-cache-review": {
    title: "Sensitive Response Caching: Browser & CDN Test",
  },
  "api-deprecated-version-inventory": {
    title: "Retiring an Old API Version: Security Review",
  },
  "security-event-logging-review": {
    title: "Security Event Logging Review Without Secrets",
  },
  "api-function-authorization-testing": {
    title: "API Function Authorization Testing by Role",
  },
  "clickjacking-framing-assessment": {
    title: "Clickjacking Assessment: CSP & X-Frame-Options",
  },
  "api-method-authorization-review": {
    title: "API HTTP Method Authorization Review Guide",
    description:
      "Review API HTTP method handling (GET, POST, PUT, PATCH, DELETE) and alternate routes to verify only intended operations are authorized.",
  },
  "jwt-expiry-and-revocation-review": {
    title: "JWT Expiry & Session Revocation Testing Guide",
  },
  "password-change-session-review": {
    title: "Password Change & Active Session Revocation",
  },
  "business-workflow-race-condition-review": {
    title: "Business Workflow Race Condition Testing Guide",
  },
  "recovery-token-expiry-reuse": {
    description:
      "Verify that password recovery and reset tokens expire promptly and cannot be reused, using controlled test accounts and isolated inboxes.",
  },
  "tenant-export-job-authorization": {
    title: "Tenant Export Job & Download Authorization",
    description:
      "Test asynchronous data export creation, job status polling, and download URL access across isolated test tenants and synthetic records.",
  },
  "third-party-api-response-validation": {
    title: "Third-Party API Response Validation Testing",
    description:
      "Test how your application handles malformed, delayed, or unexpected partner API responses using a controlled mock service in staging.",
  },
  "background-job-authorization-recheck": {
    title: "Background Job Authorization Recheck Guide",
    description:
      "Test whether asynchronous background jobs and queued workers re-verify user permissions when access changes between job submission and execution.",
  },
  "transaction-confirmation-integrity-review": {
    title: "Transaction Confirmation Integrity Testing",
  },
  "graphql-query-cost-control-review": {
    description:
      "Review GraphQL query depth, alias counts, pagination bounds, and cost limits using small controlled queries and an agreed resource budget.",
  },
  "account-invitation-access-review": {
    title: "Account Invitation Role & Expiry Testing Guide",
  },
  "user-offboarding-access-revocation": {
    title: "User Offboarding & Session Revocation Review",
    description:
      "Test removal of a dedicated test user's access across workspace memberships, API tokens, background jobs, and active browser sessions.",
  },
  "email-header-investigation-limits": {
    title: "How to Read Suspicious Email Headers Safely",
  },
  "registration-data-investigation-limits": {
    title: "Interpret Domain Registration & RDAP Data",
  },
  "username-result-no-match-interpretation": {
    title: "What a Missing Username Search Result Means",
  },
  "breach-record-date-interpretation": {
    description:
      "Separate the original breach incident date, disclosure date, and lookup date when reviewing a reported email or credential exposure record.",
  },
  "cloud-security-group-rule-review": {
    title: "Cloud Security Group Rules & Exposure Review",
  },
  "azure-storage-access-review": {
    title: "Azure Storage Access & Public Exposure Review",
  },
  "network-segmentation-validation": {
    title: "Validate Network Segmentation & Access Paths",
  },
  "remote-administration-exposure-review": {
    title: "Remote Administration Exposure Review (RDP/SSH)",
  },
  "cloud-provider-pentest-authorization": {
    title: "Cloud Pentest Authorization & Provider Rules",
  },
  "cloud-shared-responsibility-scope": {
    title: "Cloud Shared Responsibility Control Mapping",
  },
  "google-service-account-key-lifecycle": {
    title: "Google Cloud Service Account Key Rotation",
  },
  "cloud-database-public-endpoint-review": {
    title: "Cloud Database Public Endpoint Exposure Review",
    description:
      "Review managed cloud database addressing, network paths, firewall rules, and IAM identities without querying unrelated production data.",
  },
  "backup-restore-security-exercise": {
    title: "Backup Restore Exercise & Access Boundaries",
  },
  "cloud-external-access-finding-triage": {
    title: "Cloud External Access Finding Triage Guide",
  },
  "google-vpc-firewall-rule-review": {
    title: "Google Cloud VPC Firewall Rule Review Guide",
  },
  "azure-conditional-access-safe-testing": {
    title: "Azure Conditional Access Safe Policy Testing",
  },
  "dns-dangling-record-review": {
    title: "Dangling DNS Record Review & Takeover Prevention",
  },
  "cloud-security-alert-routing-test": {
    title: "Cloud Security Alert Routing & Ownership Test",
  },
  "pentest-rules-of-engagement-stop-conditions": {
    title: "Pentest Stop Conditions & Escalation Contacts",
  },
  "third-party-pentest-authorization": {
    description:
      "Identify third-party hosted services, vendor-owned assets, and shared cloud infrastructure boundaries before arranging a penetration test.",
  },
  "pentest-remediation-handoff": {
    title: "Pentest Finding Handoff for Engineering Fixes",
  },
  "security-assessment-coverage-ledger": {
    title: "Track Tested & Excluded Security Coverage",
  },
  "api-key-rotation-after-exposure": {
    title: "Rotate an Exposed API Key Without Downtime",
  },
  "security-finding-bulk-grouping": {
    title: "Group Similar Security Findings by Root Cause",
  },
  "security-remediation-evidence-retention": {
    description:
      "Retain the request logs, screenshots, and retest records needed to verify a security fix while controlling access and data retention.",
  },
  "security-metrics-remediation-aging": {
    description:
      "Track how long security findings remain open across engineering teams using clear status labels, owners, severity context, and exceptions.",
  },
  "threat-model-business-workflow": {
    title: "Threat Model a Business Workflow Before Testing",
  },
  "security-control-owner-mapping": {
    description:
      "Map each technical security control to an accountable engineering owner, operator, verification evidence source, and review cadence.",
  },
  "security-assessment-procurement-scope": {
    title: "Compare Security Assessment Proposals by Scope",
  },
  "security-control-effectiveness-vs-presence": {
    title: "Test Security Control Effectiveness vs Presence",
  },
  "security-header-testing": {
    description:
      "Review HTTP security headers across HTML and API responses, prioritize browser protections, and avoid treating a header check as a full pentest.",
  },
  "content-security-policy": {
    description:
      "Plan Content Security Policy (CSP) around real script and frame dependencies, test report-only mode first, and verify checkout and login flows.",
  },
  "exposed-secrets": {
    description:
      "Validate, contain, and rotate suspected API keys or credentials in public bundles and files, and distinguish public client IDs from private secrets.",
  },
  "automated-vs-manual-testing": {
    title: "Automated vs Manual Security Testing Guide",
  },
  "interpreting-local-endpoint-security-scan-reports": {
    title: "How to Interpret a Local Endpoint Scan Report",
  },
  "verifying-endpoint-remediation-with-follow-up-scans": {
    title: "Verify Endpoint Fixes with Follow-Up Scans",
  },
  "preparing-windows-endpoint-for-local-security-assessment": {
    title: "Prepare a Windows PC for a Local Security Scan",
  },
};

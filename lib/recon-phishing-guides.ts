import type { SecurityGuide } from "@/lib/security-guides";

const CISA_PHISHING = { title: "CISA: Recognize and report phishing", url: "https://www.cisa.gov/secure-our-world/recognize-and-report-phishing" };
const FTC_SCAM = { title: "FTC: What to do if you were scammed", url: "https://consumer.ftc.gov/articles/what-do-if-you-were-scammed" };
const NIST_IR = { title: "NIST SP 800-61 Rev. 3: Incident response recommendations", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final" };
const NIST_TEST = { title: "NIST SP 800-115: Technical information security testing", url: "https://csrc.nist.gov/pubs/sp/800/115/final" };
const ICANN_LOOKUP = { title: "ICANN: Registration data lookup", url: "https://lookup.icann.org/" };

/** Decision-specific guides. Sources support the guidance; examples are illustrative. */
export const RECON_PHISHING_GUIDES: SecurityGuide[] = [
  {
    slug: "suspicious-qr-code-response",
    title: "How to handle a suspicious QR code without scanning it",
    description: "Assess an unexpected QR code in a message or physical location, verify the request independently and report suspicious material safely.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Treat an unexpected QR code like an unexpected link: pause, verify the request through a trusted channel and avoid entering credentials or payment details. A QR image can hide its destination until a device reads it, so its appearance alone is not evidence of legitimacy.",
    sections: [
      { title: "Check the reason for the request", paragraphs: ["A code on a parking meter, delivery notice or workplace email might claim payment is overdue. Compare the request with what you expected and use a known app, official website or published telephone number rather than the contact details supplied beside the code.", "A sticker placed over a printed code is a reason to ask the venue, but an unaltered appearance does not establish that the destination is safe."], source: 0 },
      { title: "Keep the image out of the critical path", paragraphs: ["Do not scan the code simply to discover whether it is trustworthy. At work, follow the security team's reporting process and preserve the message or photograph only as instructed. Avoid forwarding a suspicious image to a large group where someone might accidentally open it."], checklist: ["Record where and when the code appeared and the action it requested.", "Check the request with the organization using an independently obtained contact.", "Do not type passwords or card details into an unexpected page."] },
      { title: "If you already scanned it", paragraphs: ["A scan, a page visit, a download and credential entry are different events. Record which occurred without revisiting the page. If you entered a password, change it through a trusted route, address reuse and tell your security team or service provider. If payment details were supplied, contact the card issuer promptly."], source: 1 },
      { title: "Use analysis tools carefully", paragraphs: ["A URL extracted from a code may be examined with a link tool, but a clean-looking address does not verify ownership or reveal the behavior of the destination. PhishLens does not decode QR images; its initial address review is local and optional external checks provide domain context, not a safety verdict."] },
    ], limitations: "QR code context and URL patterns are clues, not proof of fraud or safety. Organizational procedures and the response to an interaction depend on what was disclosed or downloaded.",
    faqs: [{ question: "Is every QR code in email malicious?", answer: "No. QR codes have legitimate uses, but unexpected requests should be verified through a known channel before entering sensitive information." }, { question: "Does scanning a QR code always compromise a device?", answer: "No. The effect depends on what the device did and what information was entered. Report the exact interaction and follow the relevant response process." }],
    sources: [CISA_PHISHING, FTC_SCAM], related: ["how-to-assess-a-suspicious-url-safely", "what-to-do-after-a-breach-exposure-result"]
  },
  {
    slug: "verify-payment-change-request",
    title: "Verify a supplier bank account change request",
    description: "Use an independent callback and payment controls to investigate an unexpected supplier bank-detail change before funds are sent.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Verify a bank-detail change using a known supplier contact and an existing independent channel before updating the payment record. Email address, signature and a familiar invoice alone do not establish that the request is authorized.",
    sections: [
      { title: "Pause the change", paragraphs: ["Separate receipt of a request from approval to change a payee. Hold the payment while the finance owner checks the request, especially when it arrives near a deadline or claims that the usual contact is unavailable.", "An attacker may use a compromised mailbox or an address that resembles the supplier's domain. A reply to the request could reach the same attacker."], source: 0 },
      { title: "Call back independently", paragraphs: ["Use a number from an existing verified supplier record or a previously agreed channel, not a number in the new message or attachment. Ask an established contact to confirm the change and follow the organization's payee-change procedure."], checklist: ["Record the request date, invoice reference and claimed new account in a restricted case record.", "Use a second approver where the organization's policy requires one.", "Check whether other recent invoices are affected before releasing payment."] },
      { title: "Investigate indicators without relying on one", paragraphs: ["A lookalike domain, unusual reply-to address or unexpected urgency can support escalation. None is conclusive by itself: a legitimate company can change providers, and a genuine supplier mailbox can be compromised. Have the security team preserve the original message and metadata under its normal process."], source: 1 },
      { title: "If payment was already sent", paragraphs: ["Contact your bank immediately using its established fraud channel, provide the transaction details and ask what recovery options exist. Notify internal incident contacts and the real supplier. Keep a timeline of actions without promising that a transfer can be reversed."], source: 2 },
    ], limitations: "An independent callback reduces the chance of acting on a forged request but cannot guarantee a payment is legitimate. Use your organization's finance controls and bank guidance.",
    faqs: [{ question: "Is an email from the supplier's real domain sufficient?", answer: "No. A real mailbox can be compromised. Confirm a payment change through a previously established independent channel." }, { question: "Should I reply asking if the request is genuine?", answer: "Use an independently verified contact instead; the person controlling the requesting mailbox could answer the reply." }],
    sources: [CISA_PHISHING, NIST_IR, FTC_SCAM], related: ["how-to-assess-a-suspicious-url-safely", "security-testing-report"]
  },
  {
    slug: "phishing-email-evidence-preservation",
    title: "Preserve a suspected phishing email for investigation",
    description: "Record the original message, relevant context and handling decisions without exposing credentials or spreading a suspicious link.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Use your organization's reporting function to preserve a suspected phishing message and its context. Keep original message data available to authorized investigators, restrict access and avoid opening links or attachments during collection.",
    sections: [
      { title: "Capture the context", paragraphs: ["Record the recipient, time, business context, claimed sender and requested action. Note whether anyone clicked, entered information, downloaded a file or merely received the message. These distinctions help responders choose containment steps.", "If an organization has a reporting button or mailbox, follow that process rather than forwarding an active link into an ordinary chat."], source: 0 },
      { title: "Preserve the original when permitted", paragraphs: ["Screenshots help explain what a user saw but can omit full headers and message structure. Authorized responders may request the original message or a supported export from the mail system. Use the documented collection method and record who collected it and when."], checklist: ["Do not open an attachment to determine its contents.", "Retain a copy in the approved restricted incident location.", "Record any handling or transformation of the evidence."] },
      { title: "Share a minimized working summary", paragraphs: ["An email may contain names, addresses, internal references and credential-reset links. Give the wider team a redacted summary with the incident identifier, suspected tactic and recommended action. Keep sensitive originals available only to the people who need them."], source: 1 },
      { title: "Connect evidence to action", paragraphs: ["The response owner can compare similar reports, identify affected recipients and check mail-system logs within authorized scope. A screenshot or one suspicious domain does not prove a mailbox was compromised. Record uncertainty and what additional evidence would change the conclusion."] },
    ], limitations: "Message headers and content can be forged or incomplete. Evidence handling depends on organizational policy, applicable law and the mail system; a preserved email does not prove a particular sender or compromise.",
    faqs: [{ question: "Is a screenshot enough for every investigation?", answer: "It can show the user-visible message, but may omit headers and message structure. Ask the incident team what original evidence it needs." }, { question: "Should I send the link to coworkers as a warning?", answer: "Use an approved reporting process and a sanitized description, so the warning does not spread a clickable suspicious link." }],
    sources: [CISA_PHISHING, NIST_IR], related: ["how-to-assess-a-suspicious-url-safely", "security-testing-report"]
  },
  {
    slug: "email-header-investigation-limits",
    title: "Read suspicious email headers without overclaiming attribution",
    description: "Understand what email header fields can and cannot establish, and document a safe handoff to an authorized mail administrator.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Email headers provide technical clues about message handling and authentication, but individual fields can be forged or misunderstood. A trusted mail administrator should interpret results in the context of the receiving system and the complete message.",
    sections: [
      { title: "Start with the receiving system", paragraphs: ["Export or inspect the original message using the mail provider's instructions. Record the recipient system, collection time and message identifier. The visible From name is presentation data; an address in that field alone does not prove who controlled the message."], source: 0 },
      { title: "Identify trusted authentication results", paragraphs: ["Mail systems can record SPF, DKIM and DMARC evaluation in authentication results. Determine which result was added by your receiving infrastructure before relying on it; an earlier untrusted field might have been supplied by the sender. Ask the administrator which internal gateways add trusted results."], source: 1 },
      { title: "Interpret results in context", paragraphs: ["A passing authentication result relates to a checked domain and an authentication mechanism. It does not prove that the message's business request is authorized or that a legitimate mailbox is uncompromised. Forwarding and mailing lists can also affect authentication outcomes, so a failure requires context rather than an automatic verdict."], checklist: ["Compare the displayed sender, reply address and request with the expected business process.", "Preserve the complete original rather than an edited header excerpt.", "Record uncertain conclusions and the trusted system that produced each result."] },
      { title: "Escalate using established channels", paragraphs: ["Report the message through the organization's mechanism. A mail administrator can correlate delivery and authentication logs with the original message, while a business owner independently verifies the requested action. Avoid publishing raw headers that contain internal addresses or routing details."] },
    ], limitations: "Authentication and routing information are not a complete attribution system. Header interpretation depends on trusted infrastructure, forwarding paths, available logs and the message's full context.",
    faqs: [{ question: "Does a DMARC pass prove an email is safe?", answer: "No. It reports an authentication and alignment result; a legitimate domain or mailbox can still be used in a harmful message." }, { question: "Can a sender name prove identity?", answer: "No. Display names are easy to imitate. Verify consequential requests through a known channel." }],
    sources: [CISA_PHISHING, { title: "RFC 8601: Message header field for authentication results", url: "https://www.rfc-editor.org/rfc/rfc8601" }], related: ["phishing-email-evidence-preservation", "verify-payment-change-request"]
  },
  {
    slug: "phishing-click-incident-triage",
    title: "Triage a phishing click: what happened after the link?",
    description: "Distinguish a link click from credential entry, downloads and payment exposure, and collect the facts needed for an incident response.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Record the actual interaction and promptly involve the appropriate security or service provider. A click, credential submission and downloaded program present different questions; avoid assuming that all clicks have the same effect.",
    sections: [
      { title: "Establish a timeline", paragraphs: ["Ask when the message arrived, which device was used, whether a page loaded and what the user entered or downloaded. Use the original message and existing logs where authorized rather than opening the link again.", "Do not ask the user to repeat the action for a screenshot. Preserve the report and avoid sharing passwords, one-time codes or sensitive URL parameters in the incident ticket."], source: 0 },
      { title: "Separate the possible exposures", paragraphs: ["If credentials were submitted, use a trusted channel to change the affected password and any reused passwords, then follow the provider's account recovery guidance. If a payment card was entered, contact the issuer. If software was downloaded or run, the device owner and security team need to assess the device."], source: 1 },
      { title: "Coordinate response and evidence", paragraphs: ["A work account may require the security team to review active sessions, recovery settings and sign-in activity. Record actions and their times; avoid deleting evidence or performing changes that conflict with incident procedures."], checklist: ["Identify the affected account and device without recording a password.", "Note if a multifactor prompt was approved or a code was shared.", "Record whether a download was merely saved or executed."] },
      { title: "Communicate uncertainty", paragraphs: ["A local link check can show structural clues but cannot establish what the page delivered or whether an account was accessed. Responders may need account, email or endpoint logs and the provider's assistance. Document checks that could not be completed."] },
    ], limitations: "The appropriate containment depends on the interaction, device and account. A benign-looking link or a lack of immediate symptoms cannot prove an incident did not occur.",
    faqs: [{ question: "Does one click prove an account was taken over?", answer: "No. Determine what happened after the click and review relevant account and device evidence with the appropriate owner." }, { question: "Should I revisit the page to understand it?", answer: "Avoid repeating the interaction. Give the original message and your account of events to authorized responders." }],
    sources: [NIST_IR, FTC_SCAM], related: ["phishing-email-evidence-preservation", "what-to-do-after-a-breach-exposure-result"]
  },
  {
    slug: "lookalike-domain-triage",
    title: "Investigate a potential lookalike domain responsibly",
    description: "Compare a suspected brand lookalike with verified domains, preserve observations and distinguish an unverified lead from confirmed impersonation.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "A similar domain is a lead for investigation, not proof of malicious ownership or impersonation. Compare the full hostname and its use against verified brand information, record the evidence and escalate suspected abuse through the appropriate channel.",
    sections: [
      { title: "Establish the genuine reference", paragraphs: ["Start with the organization's independently verified domains and official communications. Write the observed hostname in a non-clickable case record and compare the complete domain, not just a familiar word appearing at the beginning.", "For example, a brand name embedded as a subdomain under an unrelated registered domain does not make the whole hostname the brand's domain."], source: 0 },
      { title: "Document the observed use", paragraphs: ["Record where the address appeared, the claim made in the message and the date. A similar domain may be unrelated, parked or legitimately owned; a real compromised domain may also be abused. Do not access private resources or test the host without explicit authorization."], checklist: ["Keep the original report and identify the reporting channel.", "Record the exact hostname and any uncertainty about the source.", "Use a trusted route to check the brand's identity and current contact details."] },
      { title: "Treat registration and DNS as context", paragraphs: ["Registration records can be redacted, incomplete or outdated; DNS records describe technical configuration at a particular time. Neither alone proves who operates a website or why it exists. Optional domain-context checks can help prioritize follow-up, but provider results may be unavailable."], source: 1 },
      { title: "Escalate without public attribution", paragraphs: ["Send the evidence to the brand owner, mail provider or relevant abuse contact using the documented process. Record what was reported and any response. Avoid publicly identifying an individual as the operator based solely on a registration field or username match."] },
    ], limitations: "Similarity, a registration record or a DNS response does not establish malicious intent, ownership or current page behavior. Some evidence may change or be unavailable.",
    faqs: [{ question: "Is a similar domain necessarily phishing?", answer: "No. Similar names can be independent or legitimate. Examine the observed use and corroborate before attributing intent." }, { question: "Does a DNS record identify the site's owner?", answer: "No. It is technical configuration and can involve service providers; ownership requires additional evidence." }],
    sources: [CISA_PHISHING, ICANN_LOOKUP], related: ["how-to-assess-a-suspicious-url-safely", "how-to-corroborate-public-username-search-results"]
  },
  {
    slug: "public-domain-ownership-verification",
    title: "Verify domain ownership before security testing",
    description: "Corroborate a domain's owner and obtain authorization before assessment, separating DNS resolution from permission to test.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Confirm a domain's owner with the responsible organization and obtain explicit written authorization for the specified systems and methods. DNS resolution and public registration information can provide context but do not themselves authorize security testing.",
    sections: [
      { title: "Define the asset", paragraphs: ["Write down the exact domain, environment and intended purpose. A company may use a third party for hosting or a service at a subdomain; determine who operates the application and who can authorize testing of each component.", "Record the person providing authorization and the expected business owner, rather than assuming a brand name in a hostname establishes control."], source: 0 },
      { title: "Use public records as leads", paragraphs: ["DNS can show where a name resolves. Registration lookup may show administrative information or privacy-protected records. These records can be stale or managed by a provider, so compare them with the organization's own verified inventory and ask the asset owner to resolve conflicts."], source: 1 },
      { title: "Set the rules of engagement", paragraphs: ["Agree in writing on target names and addresses, testing window, methods, source IPs, exclusions, rate limits and emergency contacts. Clarify whether testing shared infrastructure, external vendors or production systems requires separate approval."], checklist: ["Identify in-scope hosts and explicitly excluded services.", "Agree safe test accounts and data where authenticated testing is included.", "Record stop conditions and evidence-handling requirements."] },
      { title: "Maintain the boundary", paragraphs: ["A discovered subdomain or IP address is a candidate for the owner to verify, not an automatic extension of the scope. If ownership is unclear or the host changes during the engagement, pause the dependent test and obtain a scope update."] },
    ], limitations: "Ownership can be shared or delegated, and a domain can change service providers. Public information and a DNS verification mechanism do not replace a complete agreement or permission from other affected parties.",
    faqs: [{ question: "Does a public website grant permission to scan it?", answer: "No. Obtain authorization from the relevant owner and agree the methods and scope before active testing." }, { question: "Does an IP address shared by two domains mean both are in scope?", answer: "No. Shared hosting can serve multiple unrelated customers; authorization must cover the actual assets and activities." }],
    sources: [NIST_TEST, ICANN_LOOKUP], related: ["pentest-scope-authorization", "attack-surface-inventory"]
  },
  {
    slug: "dns-records-public-footprint-review",
    title: "Review public DNS records as attack-surface inventory",
    description: "Record public DNS observations for owned domains, interpret time-bound results and verify service ownership before taking action.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Public DNS can help inventory names and the services they point to. Record the queried name, record type, response and observation time, then verify the owner and service purpose; DNS alone does not establish a vulnerability or authorization to test.",
    sections: [
      { title: "Define the owned domain set", paragraphs: ["Use the organization's inventory and owner confirmation to choose the names to review. A domain discovered in a third-party source may be a candidate, not a confirmed organizational asset. Record the environment and business owner where known."], source: 0 },
      { title: "Record the response and context", paragraphs: ["Different records answer different questions: address records can point to an IP address, aliases can point to another name, and mail exchanger records indicate mail routing. Record the exact name and type requested, the answer, collection time and resolver or source where appropriate.", "DNS responses can vary by location and cache state. A missing answer during one query is not proof that a service never exists."], source: 1 },
      { title: "Correlate with asset ownership", paragraphs: ["Compare an unfamiliar name with the asset inventory and consult the responsible team. An external provider may legitimately host the service. Do not treat an address shared with other customers as permission to examine those customers."], checklist: ["Mark uncertain ownership explicitly.", "Separate observed record data from a proposed risk.", "Review an unexpected change with the DNS or service owner before modifying it."] },
      { title: "Plan maintenance and retesting", paragraphs: ["After an approved DNS change, repeat the same query and compare expected results, allowing for relevant caching and provider behavior. Preserve before-and-after evidence and verify that necessary services still function. Investigate inconsistent results rather than declaring the issue fixed from a single resolver."] },
    ], limitations: "Public DNS is a partial, time-dependent view and cannot establish all assets, service ownership, exploitability or global reachability. More complete review needs authoritative inventory and the service owner's context.",
    faqs: [{ question: "Does a DNS result prove a service is vulnerable?", answer: "No. It is a configuration observation. Assess ownership, intended use and the relevant control before drawing a security conclusion." }, { question: "Does no DNS answer prove a host does not exist?", answer: "No. Configuration, record type, caching or location can affect a result; record the test and its limits." }],
    sources: [NIST_TEST, { title: "RFC 1034: Domain names: concepts and facilities", url: "https://www.rfc-editor.org/rfc/rfc1034" }], related: ["public-domain-ownership-verification", "attack-surface-inventory"]
  },
  {
    slug: "registration-data-investigation-limits",
    title: "Interpret domain registration data without guessing the owner",
    description: "Use registration lookup as time-bound investigative context while accounting for privacy, intermediaries and incomplete records.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Registration data can help identify a registrar, dates or available contact information, but it may be redacted, proxied or outdated. It does not by itself prove who operates a website or sent a message.",
    sections: [
      { title: "Record the exact domain and source", paragraphs: ["Extract the relevant registered domain carefully and distinguish it from a subdomain or a word in a URL path. Use a recognized registration lookup service and record when the lookup occurred and what it actually returned."], source: 0 },
      { title: "Separate fields from conclusions", paragraphs: ["A registrar provides registration services; it is not necessarily the site's operator. A privacy service or redacted contact field does not establish that an owner is hiding malicious activity. Registration dates can supply context but do not establish whether a site is trustworthy."], checklist: ["Copy only fields needed for the investigation.", "Mark missing or redacted fields as unavailable, not suspicious by default.", "Check whether a field identifies a provider, registrant contact or another role."] },
      { title: "Corroborate through independent channels", paragraphs: ["Compare the record with verified business records, the organization's own public domain inventory and the observed use of the domain. Ask the owner directly through an established contact where appropriate. A matching name or old contact detail alone is insufficient for attribution."], source: 1 },
      { title: "Protect the evidence", paragraphs: ["Registration data may contain personal information. Share a concise finding with authorized responders and keep raw records in approved storage. If there is suspected abuse, use the registrar's published abuse reporting process and document the result without claiming guaranteed removal."] },
    ], limitations: "Data availability and accuracy vary by registry, registrar, privacy rules and collection time. Registration records do not independently prove intent, account control or the current operator.",
    faqs: [{ question: "Does a new domain mean a scam?", answer: "No. New domains are routinely used legitimately. Consider the request, observed use and independent verification." }, { question: "Is the registrar the same as the website owner?", answer: "Not necessarily. The registrar supplies registration services; separate evidence is needed to establish operation or control." }],
    sources: [ICANN_LOOKUP, NIST_TEST], related: ["public-domain-ownership-verification", "lookalike-domain-triage"]
  },
  {
    slug: "public-footprint-evidence-ledger",
    title: "Create an evidence ledger for public-footprint research",
    description: "Record source, time, observation and uncertainty for authorized public-source leads without collecting unnecessary personal data.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "For each public-source lead, record the research question, exact source, observation time, what was observed, confidence and remaining uncertainty. Keep the observation separate from identity attribution and retain only what the authorized purpose requires.",
    sections: [
      { title: "Define a narrow research question", paragraphs: ["For an organization reviewing its own exposure, the question might be which public domains appear in its approved inventory. Record who approved the work, exclusions and the intended decision. Public availability does not authorize account access, harassment or unrelated personal research."], source: 0 },
      { title: "Capture reproducible observations", paragraphs: ["A useful row includes an asset identifier, source address, collection date, visible observation, collector and evidence reference. For a matching username, write that a matching public handle was observed; do not silently change that into a statement of account ownership."], checklist: ["Distinguish direct observations from search snippets or tool summaries.", "Record source access errors and conflicting results.", "Avoid storing session tokens, unnecessary personal records and complete sensitive links."] },
      { title: "Rate corroboration honestly", paragraphs: ["Two websites repeating the same copied biography are not necessarily independent evidence. A link from an independently verified official website may support a stronger connection, but it can also become stale. Record the basis for the conclusion and what could disprove it."], source: 0 },
      { title: "Control access and retention", paragraphs: ["Keep originals in an approved restricted location and share a minimal summary with decision makers. Apply the organization's retention schedule and correct the record when the source changes. A tool output is a lead to investigate, not an attribution or a complete account inventory."], source: 1 },
    ], limitations: "Public sources can be copied, removed, impersonated or inaccessible. An evidence ledger preserves uncertainty but does not guarantee accuracy, completeness or identity verification.",
    faqs: [{ question: "Are two matching usernames independent confirmation?", answer: "No. Handles can be reused or impersonated. The connection needs additional independent evidence." }, { question: "What if the source no longer loads?", answer: "Retain the original observation and time if policy permits, and mark the current state as unverified rather than assuming it is unchanged." }],
    sources: [NIST_TEST, NIST_IR], related: ["how-to-corroborate-public-username-search-results", "security-testing-report"]
  },
  {
    slug: "breach-notice-authenticity-check",
    title: "Verify an unexpected data breach notice",
    description: "Check a breach notice through a trusted channel, identify potentially exposed data and avoid responding to a second phishing attempt.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "Verify an unexpected breach notice by visiting the provider through a known address or contacting its established support channel. Identify which information may have been exposed before choosing response steps; do not rely on links or phone numbers in an unverified message.",
    sections: [
      { title: "Check the notice independently", paragraphs: ["A genuine notice may describe the affected service, approximate incident and exposed data. Open a trusted app or type the service's known address yourself, then look for an official announcement or contact support through an established channel. A breach announcement can itself be impersonated."], source: 0 },
      { title: "Identify the data involved", paragraphs: ["A password, payment card, identity number and email address call for different actions. Do not assume a notice means all categories were exposed. Record what the provider states and what remains unknown without putting full sensitive identifiers in a shared ticket."], checklist: ["Record the affected account and incident date if known.", "Look for official instructions and deadlines applicable to your location.", "Treat a search result as a lead rather than proof of current account compromise."] },
      { title: "Secure the affected account", paragraphs: ["If a password may be exposed, change it and reused or similar passwords through trusted channels. Enable multifactor authentication where available and check recovery settings and account activity. For payment details, contact the issuer and review transactions."], source: 1 },
      { title: "Watch for follow-on scams", paragraphs: ["A caller who knows your address or account name may still be an impersonator. Do not supply passwords, one-time codes or payment details in response to a message claiming to offer breach support. Escalate workplace accounts through the organization's incident process."] },
    ], limitations: "A notice or public search can be incomplete or delayed. Identity protection and reporting options vary by country and the data exposed; follow the affected provider and appropriate local guidance.",
    faqs: [{ question: "Does receiving a breach notice prove fraud occurred?", answer: "No. It indicates information may have been exposed. Verify the notice and take steps appropriate to the data and account involved." }, { question: "Can a breach notice itself be phishing?", answer: "Yes. Verify it independently through the provider's known website or support channel." }],
    sources: [CISA_PHISHING, { title: "FTC: Respond to a data breach notice", url: "https://consumer.ftc.gov/consumer-alerts/2022/10/have-you-been-affected-data-breach-read" }], related: ["what-to-do-after-a-breach-exposure-result", "how-to-assess-a-suspicious-url-safely"]
  },
  {
    slug: "redact-suspicious-url-before-sharing",
    title: "Share suspicious URL evidence without exposing secrets",
    description: "Minimize URL evidence before sharing by separating the hostname and relevant indicators from tokens and personal information.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "A suspicious URL can contain reset tokens, email addresses or other sensitive values. Give authorized responders the original through an approved secure channel, and use a minimized or redacted version for broader communication.",
    sections: [
      { title: "Identify what the recipient needs", paragraphs: ["A security analyst investigating a message may need the original in a controlled evidence store, while a general warning may need only the claimed brand, request and reporting instructions. Agree which recipient needs which level of detail before copying the address."], source: 0 },
      { title: "Review sensitive components", paragraphs: ["Paths and query strings can contain account identifiers, access tokens or personalized tracking. User information before an at-sign and encoded values can also mislead or reveal sensitive data. Do not assume that a link is safe to publish just because the host appears public."], checklist: ["Remove or mask sensitive query values in a broad summary.", "Avoid posting credentials, one-time codes or personal identifiers in tickets or chat.", "Preserve the original only according to incident and retention procedures."] },
      { title: "Keep evidence and summary distinct", paragraphs: ["Record an evidence identifier, collection time and the fact that a shared version was redacted. A sanitized summary is useful for coordination but may remove details needed to reproduce the analysis. Do not silently substitute it for the original evidence."], source: 0 },
      { title: "Understand tool outputs", paragraphs: ["A tool may identify a hostname or warning pattern without proving a destination is malicious. PhishLens offers an initial local review and optional external checks; consult the interface's disclosure before using an external provider. Review any exported report before sharing it."] },
    ], limitations: "Redaction is context-dependent and can remove evidence needed for analysis. A hostname-only summary cannot establish what a specific path or destination did.",
    faqs: [{ question: "Can I post the entire link in a public warning?", answer: "Avoid doing so without an approved reason. URLs can contain sensitive values and may spread an active link; share a minimized summary instead." }, { question: "Should the original always be deleted?", answer: "Follow the incident team's evidence and retention procedures. Authorized responders may need the original in restricted storage." }],
    sources: [NIST_IR, CISA_PHISHING], related: ["phishing-email-evidence-preservation", "how-to-assess-a-suspicious-url-safely"]
  },
  {
    slug: "username-result-no-match-interpretation",
    title: "What a missing username search result does and does not mean",
    description: "Interpret unavailable, private and missing profile results without turning an incomplete public search into a claim of absence.",
    category: "Testing workflow", updated: "2026-10-28",
    answer: "No result in a public username search means the checked sources did not produce a usable match under the conditions of that search. It does not establish that a person has no account or that the username is unused everywhere.",
    sections: [
      { title: "Record the search boundary", paragraphs: ["Write down the authorized purpose, exact identifier, source or tool used, date and relevant coverage. A search for one spelling does not cover alternate names, changed handles or every platform. Do not broaden the investigation into unrelated private information."], source: 0 },
      { title: "Separate outcomes", paragraphs: ["A source may return no public profile, a private or renamed profile, a timeout or an access error. These conditions should not all be labeled 'account absent'. Record the outcome as reported and repeat only when appropriate and permitted."], checklist: ["Mark provider errors and unavailable sources as inconclusive.", "Distinguish an accessible matching handle from verified account ownership.", "Record the collection time because profiles and source behavior change."] },
      { title: "Corroborate a possible match", paragraphs: ["A shared handle or image can be reused or impersonated. An independently verified official website linking to the profile may provide stronger support, but compare the link's currency and context. If the evidence is insufficient, leave ownership unconfirmed."], source: 0 },
      { title: "Make a defensible report", paragraphs: ["Describe the specific sources and outcome, not an unsupported claim that all accounts were found. MyRecon can surface public-source leads; coverage and availability vary. The tool's lack of a result cannot certify the absence of an account or establish a person's identity."] },
    ], limitations: "Platforms can restrict automated access, change content or hide profiles. Public username results are incomplete, time-bound and unsuitable as sole evidence for identity attribution.",
    faqs: [{ question: "Does no match prove someone has no profile?", answer: "No. The profile may be private, renamed, inaccessible or outside the sources checked." }, { question: "Does a matching handle establish identity?", answer: "No. Seek independent corroboration and report uncertainty." }],
    sources: [NIST_TEST], related: ["how-to-corroborate-public-username-search-results", "public-footprint-evidence-ledger"]
  },
];

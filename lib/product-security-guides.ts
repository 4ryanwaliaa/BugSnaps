import type { SecurityGuide } from "@/lib/security-guides";

/** Guides cover a decision or workflow, not a promise of tool coverage. */
export const PRODUCT_SECURITY_GUIDES: SecurityGuide[] = [
  {
    slug: "how-to-assess-a-suspicious-url-safely",
    title: "How to assess a suspicious URL without opening it",
    description: "Inspect an unexpected link safely, understand URL warning signs, and verify the sender through a trusted independent channel.",
    category: "Testing workflow",
    answer: "Do not open a suspicious link to see whether it is real. Copy it without visiting the destination, examine the hostname and message context, and contact the organization through a known address or app. A URL checker can highlight clues but cannot guarantee safety.",
    updated: "2026-10-28",
    sections: [
      { title: "Pause and preserve the context", paragraphs: ["Unexpected requests to sign in, pay, or act urgently deserve independent verification, even if they appear to come from a familiar sender. Do not reply or use the message's phone number. Contact the organization using a number or website you found independently, or open its app yourself."], checklist: ["Do not open attachments or click an unsubscribe link in a suspicious message.", "Use your workplace's reporting process if the message arrived on a work account.", "Keep a copy for the security team only if that is consistent with your organization's reporting instructions."], source: 0 },
      { title: "Examine the actual hostname", paragraphs: ["A link's displayed text can differ from its destination. Copy the address without opening it and inspect the hostname carefully. For example, in https://accounts.example.test.attacker.test/login, the hostname is accounts.example.test.attacker.test; the earlier example.test text does not make it an example.test address. Those names are illustrative, not real services."], checklist: ["Be alert to unfamiliar domains, unexpected subdomains, unusual spelling, and shortened URLs.", "A URL containing an @ character can place misleading text before the actual hostname.", "HTTPS encrypts a connection; it does not establish that the site or request is trustworthy."] },
      { title: "Use a local checker as a clue", paragraphs: ["BugSnaps PhishLens examines URL structure and text in the browser and does not visit the destination. Its highlighted patterns are a starting point: familiar-looking addresses can still be malicious, while an unusual address can be legitimate. Optional domain intelligence and DNS checks are initiated separately and may be incomplete or unavailable; the tool does not follow redirects or establish domain ownership."], checklist: ["Avoid pasting sensitive links containing authentication tokens into tools you do not trust.", "Treat an unflagged result as inconclusive, not a safe-to-open verdict.", "Do not try to inspect the destination yourself when your organization's procedure calls for security staff." ] },
      { title: "If you already interacted", paragraphs: ["If you entered a password or payment information, contact the affected service or financial institution through a trusted channel promptly. Change the exposed password and any reused passwords, enable multi-factor authentication where available, and follow your organization's incident process. The right response depends on what was disclosed or downloaded."], source: 1 },
    ],
    limitations: "Visual URL checks and automated patterns cannot prove ownership, reveal what a destination will do, or establish the safety of a redirect. Scammers can use legitimate hosting and convincing language; independent verification remains necessary.",
    faqs: [
      { question: "Does HTTPS mean a link is safe?", answer: "No. HTTPS protects the connection to the server you reach; it does not establish whether that server is the intended organization or whether its request is legitimate." },
      { question: "Does PhishLens visit a suspicious site?", answer: "The BugSnaps page describes a local browser check of URL structure and text; it says the tool does not visit the destination or follow redirects. Optional external domain checks run only when selected and do not establish complete URL safety." },
      { question: "Is a short link automatically malicious?", answer: "No. A short link hides the final destination and may be legitimate, but it makes independent verification more important. Avoid opening an unexpected link to find out where it goes." },
    ],
    sources: [
      { title: "CISA: Avoid Phishing Scams with Three Simple Tips", url: "https://www.cisa.gov/sites/default/files/2024-09/Secure-Our-World-Phishing-Tip-Sheet.pdf" },
      { title: "FTC: What To Do if You Were Scammed", url: "https://consumer.ftc.gov/articles/what-do-if-you-were-scammed" },
    ],
    related: ["how-to-corroborate-public-username-search-results", "what-to-do-after-a-breach-exposure-result", "security-testing-report"],
  },
  {
    slug: "how-to-corroborate-public-username-search-results",
    title: "How to corroborate public username search results",
    description: "Treat matching public usernames as leads, compare independent evidence, and avoid attributing an account to a person without support.",
    category: "Testing workflow",
    answer: "A public profile with a matching username is a lead, not proof of a person's identity. Record what the source actually shows, look for independent corroboration such as links from a verified official site, and leave the result unconfirmed when the evidence is insufficient.",
    updated: "2026-10-28",
    sections: [
      { title: "Start with a legitimate question", paragraphs: ["Research your own public footprint or work within an authorized investigation. Decide what question you need to answer before collecting information, and limit the result to information necessary for that purpose. Public visibility does not grant permission to access private accounts, harass someone, or test a system."], source: 0 },
      { title: "Separate a match from an attribution", paragraphs: ["A handle such as 'alexsmith' can be used by many unrelated people across services. A matching name, profile image, city, or biography may be copied or stale. Write 'matching public handle found' when that is all the evidence supports; avoid presenting it as a confirmed identity."], checklist: ["Record the profile URL, observation time, and what was visible.", "Distinguish a current public page from a search snippet or archived result.", "Avoid collecting private or unrelated personal information."] },
      { title: "Seek independent corroboration", paragraphs: ["A profile linked from an organization's independently verified official website provides a stronger lead than a repeated display name alone. Compare the link direction, date, context, and whether multiple clues derive from the same copied biography. Contact the person through an established channel when confirmation is appropriate and authorized."], checklist: ["Record conflicting evidence rather than ignoring it.", "Check whether claimed affiliations can be verified through their official channels.", "Describe uncertainty when no independent evidence is available."], source: 0 },
      { title: "Interpret tool outcomes carefully", paragraphs: ["MyRecon can surface public username leads, but a matching result is not proof of ownership. Availability and coverage vary by source. A timeout, restricted profile, changed page, or provider error is inconclusive; it is not proof that the account exists or does not exist. Document the source and verification separately from the tool's result." ] },
    ],
    limitations: "No username search is a complete inventory of a person's accounts. Matching handles, reused images, and public biographies can be copied or outdated, and source access may fail. Do not attribute identity without sufficient independent evidence.",
    faqs: [
      { question: "Does the same username on two sites mean the same person owns both?", answer: "No. Handles can be independently chosen, recycled, or impersonated. Corroborate the relationship with independent evidence and report the remaining uncertainty." },
      { question: "Does no result prove there is no account?", answer: "No. A profile might be private, renamed, inaccessible to the source, or outside the tool's coverage. Distinguish absence from an inconclusive lookup." },
      { question: "Can public OSINT authorize a security test?", answer: "No. Public information can help establish context, but testing requires authorization and agreed scope from the relevant owner." },
    ],
    sources: [{ title: "FTC: Did a new online friend ask for money? Odds are it's a scam", url: "https://consumer.ftc.gov/consumer-alerts/2025/06/did-new-online-friend-ask-money-odds-are-its-scam" }],
    related: ["how-to-assess-a-suspicious-url-safely", "what-to-do-after-a-breach-exposure-result", "security-testing-report"],
  },
  {
    slug: "what-to-do-after-a-breach-exposure-result",
    title: "What to do after a breach exposure result",
    description: "Interpret a breach exposure signal, verify the notice, secure affected accounts, and choose actions based on the data potentially exposed.",
    category: "Testing workflow",
    answer: "A breach exposure result is a signal to investigate, not proof that an account is currently compromised or that the result is complete. Verify the incident through the affected service, secure any affected and reused credentials, and respond according to the type of information exposed.",
    updated: "2026-10-28",
    sections: [
      { title: "Verify the source and the scope", paragraphs: ["Check whether the notice or result identifies the affected service, the incident and the type of data involved. Visit the service using a known address rather than a link in an unexpected message. An email address in a dataset does not by itself prove who owns the address or that the corresponding account has been taken over."], source: 0 },
      { title: "Secure credentials and recovery methods", paragraphs: ["When a password may be exposed, change it for the affected service and for other accounts where it was reused. Choose unique passwords and enable multi-factor authentication where supported. Review account recovery methods and recent activity through the service's normal security settings."], checklist: ["Start with important email, financial, and administrator accounts when they share exposed credentials.", "Use a password manager if it helps you keep unique passwords.", "Report unauthorized activity to the provider using a trusted channel."], source: 0 },
      { title: "Respond to the actual data exposed", paragraphs: ["Different data calls for different steps. A payment-card exposure warrants contact with the card issuer and review of transactions. An identity-number exposure may require fraud monitoring or a credit freeze where available. Follow the affected provider's notice and your local consumer-protection guidance; do not assume every breach includes passwords or financial details."], source: 1 },
      { title: "Understand search coverage and privacy", paragraphs: ["MyRecon offers breach exposure checks subject to provider coverage and access limits. A missing result cannot establish that an address has never appeared in a breach; a returned signal cannot establish account ownership. Use such tools only for addresses you are authorized to check, and do not share full reports or sensitive personal details unnecessarily." ] },
    ],
    limitations: "Breach records can be incomplete, delayed, misattributed, or missing the specific fields needed for a decision. A result is not confirmation of a live compromise. Local reporting and consumer-protection options vary by country and the type of data exposed.",
    faqs: [
      { question: "Does a breach result mean someone accessed my account?", answer: "Not necessarily. It indicates information may appear in a reported dataset or incident. Verify the source and secure the account; investigate unfamiliar activity separately." },
      { question: "Does no result mean my email address has never been exposed?", answer: "No. Coverage varies by provider and some incidents or datasets may not be available to the search. A negative result is not a guarantee." },
      { question: "Should I change every password after a breach?", answer: "Change the affected password and any reused or similar passwords promptly. Prioritize important accounts and use unique passwords to limit the impact of future exposures." },
    ],
    sources: [
      { title: "FTC: Have you been affected by a data breach?", url: "https://consumer.ftc.gov/consumer-alerts/2022/10/have-you-been-affected-data-breach-read" },
      { title: "FTC: What To Do After a Data Breach", url: "https://consumer.ftc.gov/media/79862" },
    ],
    related: ["how-to-assess-a-suspicious-url-safely", "how-to-corroborate-public-username-search-results", "remediation-retesting"],
  },
];

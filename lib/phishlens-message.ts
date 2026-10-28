import { inspectInput } from "./phishlens-review";
import type { AnalysisResult } from "./phishing-detector";

/**
 * Review optional message context locally. The displayed link must be copied
 * separately: plain text cannot reveal an email's underlying hyperlink.
 */
export function analyzePhishingMessage({
  url,
  displayedLink = "",
  messageText = "",
}: {
  url: string;
  displayedLink?: string;
  messageText?: string;
}): AnalysisResult {
  const result = inspectInput(url);
  if (!result.ok) return result;
  if (displayedLink.length > 4096) return { ok: false, error: "Enter displayed link text shorter than 4,096 characters." };
  if (messageText.length > 10000) return { ok: false, error: "Enter message text shorter than 10,000 characters." };

  const findings = [...result.findings];
  const visible = displayedLink.trim();
  // Only compare explicit web addresses and domain-shaped labels. A button
  // label like "Review account" is not evidence of a destination mismatch.
  const domainShaped = /^(?:https?:\/\/)?(?:[^\s/@]+\.)+[^\s/@.]+(?::\d+)?(?:[/?#][^\s]*)?$/i.test(visible);
  if (visible && domainShaped) {
    const displayed = inspectInput(visible);
    if (displayed.ok && displayed.hostname.replace(/\.$/, "") !== result.hostname.replace(/\.$/, "")) {
      findings.push({
        id: "displayed-destination-mismatch",
        title: "Displayed address and destination differ",
        detail: `The visible address points to ${displayed.hostname}, while the supplied destination is ${result.hostname}. This can be legitimate, but verify the sender and destination through a trusted channel.`,
        severity: "high",
      });
    }
  }

  if (/\b(?:urgent(?:ly)?|immediately|right away|act now|within (?:\d+|twenty.four|24) (?:minutes?|hours?)|account (?:will be|is being) (?:closed|suspended|disabled))\b/i.test(messageText)) {
    findings.push({ id: "message-urgency", title: "The message creates urgency", detail: "Pressure to act quickly can discourage careful checks. Confirm the request through a known contact or the service's official app.", severity: "moderate" });
  }
  if (/\b(?:password|passcode|one[ -]time (?:code|password)|verification code|security code|login code|recovery code|pin)\b/i.test(messageText)) {
    findings.push({ id: "message-credentials", title: "The message mentions a password or security code", detail: "Unexpected requests involving credentials or codes deserve care. Do not share a password or one-time code; check with the sender through a trusted channel.", severity: "moderate" });
  }
  if (/\b(?:gift cards?|wire transfer|bank transfer|payment details|credit card|debit card|crypto(?:currency)?)\b/i.test(messageText)) {
    findings.push({ id: "message-payment", title: "The message mentions payment or financial details", detail: "Payment references can be legitimate. Independently confirm unexpected payment requests using contact details you already trust.", severity: "moderate" });
  }

  const mismatch = findings.some((finding) => finding.id === "displayed-destination-mismatch");
  return {
    ...result,
    findings,
    verdict: mismatch || result.verdict === "high-risk" ? "high-risk" : findings.some((finding) => finding.severity !== "info") ? "review" : result.verdict,
  };
}

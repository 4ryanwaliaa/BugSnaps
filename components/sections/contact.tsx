"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Linkedin, Mail } from "lucide-react";
import { CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";

const inputClasses =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] text-foreground placeholder:text-muted-2 " +
  "transition-colors focus:border-accent/50 focus:bg-white/[0.05] focus:outline-none";

// Web3Forms relays submissions to the BugSnaps inbox - no backend needed.
// The access key is public by design (it only lets people send us mail);
// manage it at web3forms.com.
const FORM_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = "c74ca709-a8b6-45b8-8cad-a3b3bcc12d6a";

const TOPICS: { value: string; label: string }[] = [
  { value: "pentest", label: "Penetration testing engagement" },
  { value: "web", label: "Web application pentest" },
  { value: "api", label: "API security testing" },
  { value: "network", label: "Network pentest" },
  { value: "cloud", label: "Cloud security review" },
  { value: "code", label: "Source code review" },
  { value: "enterprise", label: "Manual pentest alongside MyPentest - book a consultation" },
  { value: "mypentest-billing", label: "MyPentest plans and billing" },
  { value: "mypentest-support", label: "MyPentest support" },
  { value: "other", label: "Something else" },
];

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [topic, setTopic] = useState("");
  const [mailtoHref, setMailtoHref] = useState(`mailto:${CONTACT_EMAIL}`);

  // /contact?topic=… (from the pricing page and the app) preselects the topic.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("topic");
    if (requested && TOPICS.some((t) => t.value === requested)) setTopic(requested);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    // The name ends up in an email subject line - never let it carry
    // newlines (header injection) or unbounded length.
    const safeName = (data.name || "").replace(/[\r\n]+/g, " ").trim().slice(0, 80);
    const topicLabel = TOPICS.find((t) => t.value === data.topic)?.label ?? "General";
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `BugSnaps inquiry (${topicLabel}) from ${safeName || "website visitor"}`,
          from_name: "BugSnaps website",
          ...data,
          topic: topicLabel,
        }),
        // Don't leave visitors staring at "Sending…" if the relay is down.
        signal: AbortSignal.timeout(12_000),
      });
      const body = (await res.json()) as { success?: string | boolean };
      if (!res.ok || String(body.success) !== "true") throw new Error(`Web3Forms responded ${res.status}`);
      setStatus("sent");
    } catch {
      // Fallback: hand the visitor a prefilled email so the message
      // still reaches us even if the form relay is down.
      const subject = `${topicLabel} - inquiry from ${safeName || "the website"}`;
      const lines = [
        `Name: ${data.name || "-"}`,
        `Work email: ${data.email || "-"}`,
        `Company: ${data.company || "-"}`,
        `Topic: ${topicLabel}`,
        "",
        data.message || "",
      ];
      setMailtoHref(
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`,
      );
      setStatus("error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-white/[0.07] bg-surface p-7 sm:p-9">
        {status === "sent" ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center text-center" role="status">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-success/25 bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">Message received</h2>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
              Thanks - we&apos;ll get back to you within one business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold tracking-tight">Send us a message</h2>
            {/* Honeypot - invisible to humans; bots that tick it are dropped. */}
            <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">Name</label>
                <input id="name" name="name" required maxLength={100} autoComplete="name" placeholder="Jane Smith" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">Work email</label>
                <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="jane@company.com" className={inputClasses} />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-medium">Company</label>
                <input id="company" name="company" maxLength={150} autoComplete="organization" placeholder="Acme Inc." className={inputClasses} />
              </div>
              <div>
                <label htmlFor="topic" className="mb-2 block text-sm font-medium">What do you need?</label>
                <select id="topic" name="topic" className={inputClasses} value={topic} onChange={(e) => setTopic(e.target.value)} required>
                  <option value="" disabled>Select a topic</option>
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium">Tell us about your product</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                maxLength={5000}
                placeholder="What are you building, what's your stack, and what's driving the need - a customer requirement, compliance, or peace of mind?"
                className={inputClasses}
              />
            </div>

            {status === "error" && (
              <div role="alert" className="rounded-xl border border-critical/25 bg-critical/10 px-4 py-4 text-sm">
                <p className="text-critical">
                  Something went wrong sending your message - but don&apos;t retype it. Click below and it opens in your
                  email app, already written and addressed to us.
                </p>
                <a
                  href={mailtoHref}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-foreground hover:bg-white/[0.1]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Send it via your email app
                </a>
              </div>
            )}

            <div className="flex flex-col items-start justify-between gap-4 pt-1 sm:flex-row sm:items-center">
              <p className="text-[13px] text-muted-2">NDA available on request. Your details stay with us.</p>
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[15px] font-medium text-white transition-colors hover:bg-accent disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send message"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-white/[0.07] bg-surface p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-accent">
              <CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Book a call</h2>
              <p className="text-[13px] text-muted">30 min · free · no obligation</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>{" "}
            with a couple of times that work for you and we&apos;ll set it up.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-surface p-7">
          <h2 className="text-base font-semibold tracking-tight">Other channels</h2>
          <ul className="mt-5 space-y-4">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="group flex items-center gap-3 text-sm text-muted hover:text-foreground">
                <Mail className="h-4 w-4 text-muted-2 group-hover:text-accent" aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-sm text-muted hover:text-foreground">
                <Linkedin className="h-4 w-4 text-muted-2 group-hover:text-accent" aria-hidden="true" />
                BugSnaps on LinkedIn
              </a>
            </li>
          </ul>
          <p className="mt-6 border-t border-white/[0.06] pt-5 text-[13px] leading-relaxed text-muted-2">
            Reporting a vulnerability in a BugSnaps system? See our{" "}
            <a href="/responsible-disclosure" className="text-accent hover:underline">responsible disclosure policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

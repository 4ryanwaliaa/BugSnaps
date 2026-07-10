"use client";

import { useState } from "react";
import { Mail, Linkedin, CalendarDays, CheckCircle2, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const inputClasses =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] text-foreground placeholder:text-muted-2 " +
  "transition-colors focus:border-accent/50 focus:bg-white/[0.05] focus:outline-none";

// Web3Forms relays submissions to aryan@bugsnaps.in — no backend needed.
// The access key is public by design (it only lets people send you mail);
// manage it at web3forms.com.
const FORM_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = "c74ca709-a8b6-45b8-8cad-a3b3bcc12d6a";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [mailtoHref, setMailtoHref] = useState("mailto:aryan@bugsnaps.in");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<
      string,
      string
    >;
    // The name ends up in an email subject line — never let it carry
    // newlines (header injection) or unbounded length.
    const safeName = (data.name || "").replace(/[\r\n]+/g, " ").trim().slice(0, 80);
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `BugSnaps inquiry from ${safeName || "website visitor"}`,
          from_name: "BugSnaps website",
          ...data,
        }),
        // Don't leave visitors staring at "Sending…" if the relay is down.
        signal: AbortSignal.timeout(12_000),
      });
      const body = (await res.json()) as { success?: string | boolean };
      if (!res.ok || String(body.success) !== "true") {
        throw new Error(`Web3Forms responded ${res.status}: ${JSON.stringify(body)}`);
      }
      setStatus("sent");
    } catch {
      // Fallback: hand the visitor a prefilled email so the message
      // still reaches us even if the form relay is down.
      const subject = `Pentest inquiry from ${safeName || "your website"}`;
      const lines = [
        `Name: ${data.name || "-"}`,
        `Work email: ${data.email || "-"}`,
        `Company: ${data.company || "-"}`,
        `Service: ${data.service || "-"}`,
        "",
        data.message || "",
      ];
      setMailtoHref(
        `mailto:aryan@bugsnaps.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          lines.join("\n"),
        )}`,
      );
      setStatus("error");
    }
  }

  return (
    <Section id="contact" className="overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[140px]"
      />

      <Reveal className="relative mx-auto max-w-2xl text-center">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
          Get started
        </p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Ready to know where you stand?
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Tell us about your product. We&apos;ll respond within one business day with
          honest advice — even if that advice is that you don&apos;t need us yet.
        </p>
      </Reveal>

      <div className="relative mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Form */}
        <Reveal className="h-full">
          <div className="h-full rounded-2xl border border-white/[0.07] bg-surface p-7 sm:p-9">
            {status === "sent" ? (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-success/25 bg-success/10">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">Message received</h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
                  Thanks — we&apos;ll get back to you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot — invisible to humans; bots that tick it are
                    dropped as spam by Web3Forms. */}
                <input
                  type="checkbox"
                  name="botcheck"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Jane Smith"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                      Work email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={200}
                      autoComplete="email"
                      placeholder="jane@company.com"
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company" className="mb-2 block text-sm font-medium">
                      Company
                    </label>
                    <input
                      id="company"
                      name="company"
                      maxLength={150}
                      autoComplete="organization"
                      placeholder="Acme Inc."
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="mb-2 block text-sm font-medium">
                      What do you need?
                    </label>
                    <select id="service" name="service" className={inputClasses} defaultValue="">
                      <option value="" disabled>
                        Select a service
                      </option>
                      <option>Web Application Pentest</option>
                      <option>API Security Testing</option>
                      <option>Network Security Assessment</option>
                      <option>Cloud Security Review</option>
                      <option>Source Code Review</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium">
                    Tell us about your product
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    maxLength={5000}
                    placeholder="What are you building, what's your stack, and what's driving the need — a customer requirement, compliance, or peace of mind?"
                    className={inputClasses}
                  />
                </div>

                {status === "error" && (
                  <div className="rounded-xl border border-critical/25 bg-critical/10 px-4 py-4 text-sm">
                    <p className="text-critical">
                      Something went wrong sending your message — but don&apos;t
                      retype it. Click below and it opens in your email app,
                      already written and addressed to us.
                    </p>
                    <a
                      href={mailtoHref}
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.1]"
                    >
                      <Mail className="h-4 w-4" />
                      Send it via your email app
                    </a>
                  </div>
                )}

                <div className="flex flex-col items-start justify-between gap-4 pt-1 sm:flex-row sm:items-center">
                  <p className="text-[13px] text-muted-2">
                    NDA available on request. Your details stay with us.
                  </p>
                  <Button type="submit" size="lg" disabled={status === "sending"}>
                    {status === "sending" ? "Sending…" : "Send message"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Reveal>

        {/* Side rail: booking + contact channels */}
        <div className="flex flex-col gap-6">
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-white/[0.07] bg-surface p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-accent">
                  <CalendarDays className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">Book a call directly</h3>
                  <p className="text-[13px] text-muted">30 min · free · no obligation</p>
                </div>
              </div>
              {/* Online booking placeholder — swap in a Calendly/Cal.com embed when ready */}
              <div className="mt-5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.015] p-5">
                <p className="text-sm leading-relaxed text-muted">
                  Online booking is coming soon. Until then, email{" "}
                  <a href="mailto:aryan@bugsnaps.in" className="text-accent hover:underline">
                    aryan@bugsnaps.in
                  </a>{" "}
                  with a couple of times that work for you and we&apos;ll take it
                  from there.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-white/[0.07] bg-surface p-7">
              <h3 className="text-base font-semibold tracking-tight">Other channels</h3>
              <ul className="mt-5 space-y-4">
                <li>
                  <a
                    href="mailto:aryan@bugsnaps.in"
                    className="group flex items-center gap-3 text-sm text-muted transition-colors hover:text-foreground"
                  >
                    <Mail className="h-4 w-4 text-muted-2 transition-colors group-hover:text-accent" />
                    aryan@bugsnaps.in
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/company/bugsnaps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-sm text-muted transition-colors hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4 text-muted-2 transition-colors group-hover:text-accent" />
                    Bugsnaps
                  </a>
                </li>
              </ul>
              <p className="mt-6 border-t border-white/[0.06] pt-5 text-[13px] leading-relaxed text-muted-2">
                Reporting a vulnerability in a BugSnaps system? See our{" "}
                <a href="/responsible-disclosure" className="text-accent hover:underline">
                  responsible disclosure policy
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

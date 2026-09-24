"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MYRECON_URL } from "@/lib/site";
import {
  ArrowRight,
  Search,
  FileText,
  Trash2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Fingerprint,
  Ghost,
  Database,
  UserX,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

// Delivers to aryan@bugsnaps.in (same verified Web3Forms inbox as the main contact form).
const FORM_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = "c74ca709-a8b6-45b8-8cad-a3b3bcc12d6a";

// HERO

export function PersonalHero() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="dot-grid absolute inset-0" />
        <div className="animate-glow-drift absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/[0.13] blur-[140px]" />
      </div>

      <section className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 pt-28 pb-16 sm:pt-40 sm:pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8">
        <div>
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-medium text-muted"
          >
            <Fingerprint className="h-3.5 w-3.5 text-accent" />
            BugSnaps Personal · for individuals
          </motion.span>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="mt-6 text-5xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-6xl lg:text-[4rem]"
          >
            Erase the accounts you forgot you had.
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty"
          >
            Old profiles, dead forums, data-broker listings, breach leaks - your
            past is scattered across the internet. We find every account tied to
            your name, then help you delete it before someone else uses it.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button href="#start" size="lg">
              Start with a free scan
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#how" size="lg" variant="secondary">
              How it works
            </Button>
          </motion.div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex items-center gap-2 font-mono text-[12px] tracking-wide text-muted-2"
          >
            <Lock className="h-3.5 w-3.5" />
            Consent-first · your data, your call · nothing without your say-so
          </motion.p>
        </div>

        <FootprintVisual />
      </section>
    </div>
  );
}

const FOUND = [
  { handle: "old-forum-2013", meta: "gaming forum · public" },
  { handle: "@you_college", meta: "social · dormant" },
  { handle: "you@oldmail.com", meta: "in 2 known breaches" },
  { handle: "data-broker listing", meta: "name · city · phone" },
  { handle: "shopping-acct-2016", meta: "saved address" },
];

function FootprintVisual() {
  const reduceMotion = useReducedMotion();
  // phase 0: found  ·  1: cleaning  ·  2: clean
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setPhase(2);
      return;
    }
    const timings = [2600, 2600, 2800];
    const t = setTimeout(() => setPhase((p) => (p + 1) % 3), timings[phase]);
    return () => clearTimeout(t);
  }, [phase, reduceMotion]);

  const removed = phase >= 1;
  const clean = phase === 2;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
      className="relative mx-auto w-full max-w-[420px]"
      aria-hidden="true"
    >
      <div className="glass rounded-[26px] p-5 shadow-[0_28px_90px_-30px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-accent" />
            <span className="font-mono text-[11px] tracking-wide text-muted-2">
              your digital footprint
            </span>
          </div>
          <motion.span
            key={clean ? "clean" : "count"}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={
              clean
                ? "inline-flex items-center gap-1.5 rounded-md border border-success/25 bg-success/10 px-2 py-1 font-mono text-[11px] font-medium text-success"
                : "inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/10 px-2 py-1 font-mono text-[11px] font-medium text-accent"
            }
          >
            {clean ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> 0 exposed
              </>
            ) : (
              <>
                <Search className="h-3 w-3" /> {FOUND.length} found
              </>
            )}
          </motion.span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {FOUND.map((item, i) => (
            <motion.li
              key={item.handle}
              initial={reduceMotion ? false : { opacity: 0, x: 14 }}
              animate={{
                opacity: removed ? 0.4 : 1,
                x: 0,
              }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.6 + i * 0.14, ease: EASE }}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p
                  className={
                    "truncate text-[13px] font-medium transition-colors " +
                    (removed ? "text-muted-2 line-through" : "text-foreground/90")
                  }
                >
                  {item.handle}
                </p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-muted-2">{item.meta}</p>
              </div>
              <motion.span
                animate={{
                  backgroundColor: removed ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
                  borderColor: removed ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.25)",
                  color: removed ? "#22c55e" : "#ef4444",
                }}
                transition={{ duration: 0.4, delay: reduceMotion ? 0 : (removed ? i * 0.1 : 0) }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border"
              >
                {removed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
              </motion.span>
            </motion.li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <span className="font-mono text-[11px] text-muted-2">
            {phase === 0 && "scan complete · review with you"}
            {phase === 1 && "removing · with your consent"}
            {phase === 2 && "footprint cleaned · verified"}
          </span>
          <ShieldCheck className={"h-4 w-4 " + (clean ? "text-success" : "text-muted-2")} />
        </div>
      </div>
    </motion.div>
  );
}

// HOW IT WORKS

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Discovery",
    body: "You give us the usernames, emails, and names you've used. We search 100+ platforms and public sources to find every account and listing tied to you.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Your report",
    body: "You get a clear list of what's out there - old profiles, forgotten forums, data-broker entries, and whether your email shows up in known breaches.",
  },
  {
    icon: Trash2,
    step: "03",
    title: "Deletion",
    body: "You decide what goes. We either walk you through deleting each account, or - with you present and authorizing - remove them through each platform's own official process.",
  },
  {
    icon: KeyRound,
    step: "04",
    title: "Recovery (if needed)",
    body: "Locked out of an old account that's still yours? We help you regain access using only the platform's official 'forgot password' flow, sent to an inbox you control.",
  },
];

export function PersonalHowItWorks() {
  return (
    <Section id="how" className="border-y border-white/[0.05] bg-surface/40">
      <SectionHeading
        eyebrow="How it works"
        title="Four steps. You approve every one."
        description="Nothing is searched, deleted, or recovered without your explicit go-ahead. You are always in control."
      />

      <RevealGroup className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4" stagger={0.08}>
        {STEPS.map((s, i) => (
          <RevealItem key={s.step} className="h-full">
            <div className="card-hover relative flex h-full flex-col rounded-2xl border border-white/[0.07] bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-accent max-lg:shadow-[0_0_24px_-6px_rgba(37,99,235,0.55)]">
                  <s.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <span className="font-mono text-[12px] font-medium text-accent">{s.step}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              <span
                aria-hidden="true"
                className="absolute top-6 right-6 font-mono text-[24px] font-semibold leading-none text-white/[0.05]"
              >
                {i + 1}
              </span>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

// WHAT WE FIND

const FINDS = [
  {
    icon: Ghost,
    title: "Forgotten accounts",
    body: "Old social profiles, dead forums, trial sign-ups and shopping accounts you made years ago and never closed.",
  },
  {
    icon: Database,
    title: "Data-broker listings",
    body: "Sites that quietly compile and sell your name, age, address, and phone number to anyone who searches.",
  },
  {
    icon: Fingerprint,
    title: "Username trails",
    body: "The same handle reused across dozens of platforms - an easy thread for a stranger to pull on and map your whole life.",
  },
  {
    icon: ShieldCheck,
    title: "Breach exposure",
    body: "Whether your email appears in known data breaches - so you know which passwords to change and which accounts to close.",
  },
];

export function PersonalWhatWeFind() {
  return (
    <Section id="what">
      <SectionHeading
        eyebrow="Why it matters"
        title="Your old accounts are a map to you"
        description="Every dormant login is a door you left open - a way for a stranger to impersonate you, reset your passwords, or piece your identity together."
      />
      <RevealGroup
        className="no-scrollbar -mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0"
        stagger={0.07}
      >
        {FINDS.map((f) => (
          <RevealItem
            key={f.title}
            className="h-full w-[82vw] max-w-[330px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink"
          >
            <div className="card-hover flex h-full gap-4 rounded-2xl border border-white/[0.07] bg-surface p-5 sm:gap-5 sm:p-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-accent">
                <f.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.body}</p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* free tool link */}
      <Reveal className="mt-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-accent/20 bg-accent/[0.05] p-6 sm:flex-row sm:items-center sm:p-7">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Curious what&apos;s already out there?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Try our free scanner on <span className="text-foreground">your own</span> username - no
              account, no signup.
            </p>
          </div>
          <a
            href={MYRECON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.1]"
          >
            Open myrecon.xyz
            <ExternalLink className="h-4 w-4 text-accent" />
          </a>
        </div>
      </Reveal>
    </Section>
  );
}

// TRUST / LEGAL

const PROMISES = [
  {
    ok: true,
    title: "What we always do",
    items: [
      "Act only on identities you confirm are yours (or that you're authorized to manage).",
      "Show you the full report before anything is deleted.",
      "Use each platform's own official deletion and recovery flows.",
      "Send account recovery only to an inbox or phone you currently control.",
      "Delete your search data after the job, on a schedule we agree.",
    ],
  },
  {
    ok: false,
    title: "What we never do",
    items: [
      "Break into, guess, or crack any password.",
      "Use leaked breach passwords to log into anything.",
      "Access an account through anything but its official process.",
      "Search or act on someone else's identity for you.",
      "Sell, share, or keep your data beyond the agreed window.",
    ],
  },
];

export function PersonalTrust() {
  return (
    <Section id="trust" className="border-y border-white/[0.05] bg-surface/40">
      <SectionHeading
        eyebrow="Done right, done legal"
        title="A cleanup you can stand behind"
        description="We're a security company - we hold ourselves to the same line we'd expect anyone testing us to hold. Here's exactly where that line is."
      />
      <RevealGroup className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-2" stagger={0.1}>
        {PROMISES.map((col) => (
          <RevealItem key={col.title} className="h-full">
            <div
              className={
                "flex h-full flex-col rounded-2xl border bg-surface p-6 sm:p-7 " +
                (col.ok ? "border-success/25" : "border-critical/25")
              }
            >
              <div className="flex items-center gap-2.5">
                {col.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <UserX className="h-5 w-5 text-critical" />
                )}
                <h3 className="text-base font-semibold tracking-tight">{col.title}</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                    <span
                      className={
                        "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full " +
                        (col.ok ? "bg-success" : "bg-critical")
                      }
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="mt-8">
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-muted-2">
          Handled under India&apos;s DPDP Act 2023. You sign a short consent form before we begin - it names exactly which identities you&apos;re authorizing us to search and act on.
        </p>
      </Reveal>
    </Section>
  );
}

// PRICING (honest, free scan first)

const PLANS = [
  {
    name: "Free discovery scan",
    price: "Free",
    note: "No obligation",
    highlight: false,
    features: [
      "We search your identities across 100+ platforms",
      "A plain-language report of what's exposed",
      "Breach-exposure check on your emails",
      "A fixed quote for cleanup - only if you want it",
    ],
    cta: "Start free scan",
  },
  {
    name: "Full cleanup",
    price: "Fixed quote",
    note: "After your free scan",
    highlight: true,
    features: [
      "Everything in the free scan",
      "Guided or authorized deletion of every account you choose",
      "Data-broker opt-out requests on your behalf",
      "A before/after report confirming what's gone",
    ],
    cta: "Start free scan",
  },
  {
    name: "Recovery assist",
    price: "Per account",
    note: "Official flows only",
    highlight: false,
    features: [
      "Regain access to your own locked accounts",
      "Only via the platform's official recovery process",
      "Verified to an inbox or phone you control",
      "Guidance to secure it once you're back in",
    ],
    cta: "Ask about recovery",
  },
];

export function PersonalPricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free. Pay only if you want the cleanup."
        description="We scan first and show you what's out there at no cost. If you want us to clean it up, you get a fixed quote before anything happens - no surprises."
      />
      <RevealGroup className="mt-12 grid gap-4 sm:mt-16 sm:gap-5 lg:grid-cols-3" stagger={0.1}>
        {PLANS.map((plan) => (
          <RevealItem key={plan.name} className="h-full">
            <article
              className={
                "relative flex h-full flex-col rounded-2xl border p-6 sm:p-8 " +
                (plan.highlight
                  ? "border-accent/40 bg-surface shadow-[0_0_60px_-20px_rgb(37_99_235/0.35)]"
                  : "card-hover border-white/[0.07] bg-surface")
              }
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
              <div className="mt-4">
                <p className="text-3xl font-semibold tracking-tight">{plan.price}</p>
                <p className="mt-1.5 font-mono text-[12px] text-muted-2">{plan.note}</p>
              </div>
              <ul className="mt-6 flex-1 space-y-3 border-t border-white/[0.06] pt-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckCircle2
                      className={"mt-0.5 h-4 w-4 shrink-0 " + (plan.highlight ? "text-accent" : "text-muted-2")}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  href="#start"
                  variant={plan.highlight ? "primary" : "secondary"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

// INTAKE (consent-first, Web3Forms)

const inputClasses =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] text-foreground placeholder:text-muted-2 " +
  "transition-colors focus:border-accent/50 focus:bg-white/[0.05] focus:outline-none";

type Status = "idle" | "sending" | "sent" | "error";

export function PersonalIntake() {
  const [status, setStatus] = useState<Status>("idle");
  const [mailtoHref, setMailtoHref] = useState("mailto:aryan@bugsnaps.in");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const safeName = (data.name || "").replace(/[\r\n]+/g, " ").trim().slice(0, 80);
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `BugSnaps Personal - footprint scan request from ${safeName || "an individual"}`,
          from_name: "BugSnaps Personal",
          ...data,
        }),
        signal: AbortSignal.timeout(12_000),
      });
      const body = (await res.json()) as { success?: string | boolean };
      if (!res.ok || String(body.success) !== "true") {
        throw new Error("relay failed");
      }
      setStatus("sent");
    } catch {
      const subject = `BugSnaps Personal - footprint scan request from ${safeName || "me"}`;
      const lines = [
        `Name: ${data.name || "-"}`,
        `Contact email: ${data.email || "-"}`,
        `Identities to search (mine / authorized): ${data.identities || "-"}`,
        "",
        data.notes || "",
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
    <Section id="start" className="overflow-hidden border-t border-white/[0.05]">
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[140px]"
      />
      <Reveal className="relative mx-auto max-w-2xl text-center">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
          Start free
        </p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Find out what the internet still knows about you.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Tell us the identities that are yours. We&apos;ll scan, send you the report, and you decide
          what happens next. No charge for the scan.
        </p>
      </Reveal>

      <Reveal className="relative mx-auto mt-12 max-w-2xl" delay={0.1}>
        <div className="rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-9">
          {status === "sent" ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-success/25 bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Request received</h3>
              <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
                We&apos;ll be in touch within one business day to confirm your consent form and start
                the scan.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="p-name" className="mb-2 block text-sm font-medium">
                    Your name
                  </label>
                  <input id="p-name" name="name" required maxLength={100} autoComplete="name" placeholder="Your name" className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="p-email" className="mb-2 block text-sm font-medium">
                    Contact email
                  </label>
                  <input id="p-email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@email.com" className={inputClasses} />
                </div>
              </div>

              <div>
                <label htmlFor="p-identities" className="mb-2 block text-sm font-medium">
                  Usernames / emails to search <span className="text-muted-2">(only ones that are yours)</span>
                </label>
                <textarea
                  id="p-identities"
                  name="identities"
                  rows={3}
                  required
                  maxLength={2000}
                  placeholder="e.g. old usernames you've used, past email addresses, handles you remember…"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="p-notes" className="mb-2 block text-sm font-medium">
                  Anything else? <span className="text-muted-2">(optional)</span>
                </label>
                <textarea id="p-notes" name="notes" rows={2} maxLength={2000} placeholder="A locked account you want back, a specific site worrying you…" className={inputClasses} />
              </div>

              {/* consent gates */}
              <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <label className="flex items-start gap-3 text-[13px] leading-relaxed text-muted">
                  <input type="checkbox" name="consent_owner" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#2563eb]" />
                  I confirm the identities above are mine, or I&apos;m legally authorized to manage them.
                </label>
                <label className="flex items-start gap-3 text-[13px] leading-relaxed text-muted">
                  <input type="checkbox" name="consent_flows" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#2563eb]" />
                  I understand any account recovery uses only the platform&apos;s official process, verified to an inbox I control.
                </label>
              </div>

              {status === "error" && (
                <div className="rounded-xl border border-critical/25 bg-critical/10 px-4 py-4 text-sm">
                  <p className="text-critical">
                    Something went wrong sending your request - but don&apos;t retype it. Click below and
                    it opens in your email app, already written.
                  </p>
                  <a
                    href={mailtoHref}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.1]"
                  >
                    Send it via your email app
                  </a>
                </div>
              )}

              <div className="flex flex-col items-start justify-between gap-4 pt-1 sm:flex-row sm:items-center">
                <p className="text-[13px] text-muted-2">Free scan · no card · we reply within a day.</p>
                <Button type="submit" size="lg" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Request my free scan"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </Reveal>
    </Section>
  );
}

// FULL LANDING

export function PersonalLanding() {
  return (
    <>
      <PersonalHero />
      <PersonalWhatWeFind />
      <PersonalHowItWorks />
      <PersonalTrust />
      <PersonalPricing />
      <PersonalIntake />
    </>
  );
}

"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import {
  AlertCircle, ArrowRight, ArrowUpRight, ChevronRight,
  Clipboard, Globe2, Info, Layers3, Link2, LockKeyhole,
  RotateCcw, ScanSearch, ShieldAlert, ShieldCheck, Sparkles,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/phishing-detector";
import { inspectInput, domainBoundary, evidenceDecision, type Evidence } from "@/lib/phishlens-review";
import { analyzePhishingMessage } from "@/lib/phishlens-message";
import { InvestigationCheck } from "./investigation-check";
import { ReportActions } from "./report-actions";
import { BatchReview } from "./batch-review";
import { DnsCheck } from "./dns-check";
import { ThreatCheck } from "./threat-check";

const examples = [
  { label: "Deceptive address", value: "https://trusted.example@account-check.example/login" },
  { label: "Ordinary-looking link", value: "https://example.com/hello" },
];

const workflow = [
  { number: "01", title: "Decode the address", detail: "Reveal the initial hostname and domain boundary.", tag: "LOCAL" },
  { number: "02", title: "Review the signals", detail: "See the patterns that deserve a closer look.", tag: "LOCAL" },
  { number: "03", title: "Add more context", detail: "Choose whether to check external sources.", tag: "OPTIONAL" },
];

function Summary({ result }: { result: Extract<AnalysisResult, { ok: true }> }) {
  const [copied, setCopied] = useState(false);
  const [evidence, setEvidence] = useState<Evidence>({});
  const [reviewedAt] = useState(() => new Date().toISOString());
  const boundary = domainBoundary(result.hostname);
  const decision = evidenceDecision(result, evidence);
  const address = new URL(result.normalizedUrl);
  const signals = result.findings.filter((item) => item.severity !== "info");
  const infos = result.findings.filter((item) => item.severity === "info");
  const label = result.verdict === "high-risk" ? "High-concern patterns" : result.verdict === "review" ? "Patterns to review" : "No obvious patterns";
  const assessmentTone = decision.level === "danger" ? "border-rose-400/25 bg-rose-400/[.06]" : decision.level === "caution" ? "border-amber-400/25 bg-amber-400/[.05]" : "border-cyan-400/20 bg-cyan-400/[.04]";
  const iconTone = decision.level === "danger" ? "text-rose-300 border-rose-400/25 bg-rose-400/10" : decision.level === "caution" ? "text-amber-300 border-amber-400/25 bg-amber-400/10" : "text-cyan-300 border-cyan-400/25 bg-cyan-400/10";

  async function copyHost() {
    try { await navigator.clipboard.writeText(result.hostname); setCopied(true); }
    catch { setCopied(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-cyan-300">Investigation / 01</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">Your link review</h2></div><p className="text-xs text-zinc-500">Local analysis complete · External checks are optional</p></div>
      <section aria-label="Combined evidence assessment" className={`overflow-hidden rounded-2xl border ${assessmentTone}`}>
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex min-w-0 gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconTone}`}><ShieldAlert className="h-5 w-5" /></span><div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-zinc-400">Evidence assessment</p><h3 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">{decision.title}</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">{decision.detail}</p></div></div>
          <div className="flex flex-wrap gap-2 lg:max-w-[260px] lg:justify-end"><span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-300">{label}</span><span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-300">{decision.completed}/3 external checks</span></div>
        </div>
        <div className="border-t border-white/[.07] px-5 py-3.5 sm:px-6"><p className="text-xs leading-relaxed text-zinc-400">{decision.scope}</p>{(decision.gaps || decision.degraded) && <p className="mt-2 text-xs leading-relaxed text-amber-200">{decision.gaps ? "Some attempted checks could not establish a result. " : ""}{decision.degraded ? "Provider freshness is degraded or unavailable; coverage may be incomplete." : ""}</p>}</div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="destination-title" className="min-w-0 rounded-2xl border border-sky-400/15 bg-gradient-to-br from-sky-400/[.045] to-[#0b1218] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-zinc-500">01 / Destination</p><h3 id="destination-title" className="mt-2 text-base font-semibold text-white">Where the link starts</h3></div><Globe2 className="h-5 w-5 text-cyan-400/70" /></div>
          <div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[.035] p-4"><div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[.14em] text-zinc-500">Initial hostname</p><button type="button" onClick={copyHost} className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-cyan-300 hover:bg-cyan-400/10"><Clipboard className="h-3.5 w-3.5" />{copied ? "Copied" : "Copy"}</button></div><p className="mt-1 break-all font-mono text-sm leading-relaxed text-zinc-100">{result.hostname}</p></div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 text-sm"><div className="border-b border-white/[.06] py-3"><dt className="text-xs text-zinc-500">Scheme in review</dt><dd className="mt-1.5 font-mono text-zinc-200">{address.protocol.replace(":", "").toUpperCase()}</dd></div><div className="border-b border-white/[.06] py-3"><dt className="text-xs text-zinc-500">Query parameters</dt><dd className="mt-1.5 text-zinc-200">{address.search ? "Present" : "None"}</dd></div><div className="col-span-2 py-3"><dt className="text-xs text-zinc-500">Registrable domain · Public Suffix List</dt><dd className="mt-1.5 break-all font-mono text-cyan-200">{boundary.registrableDomain ?? (boundary.isIp ? "IP address; no registrable domain" : "No recognized domain boundary")}</dd>{boundary.subdomain && <dd className="mt-2 break-all text-xs text-zinc-400">Subdomain: {boundary.subdomain}</dd>}</div></dl>
          <p className="text-xs leading-relaxed text-zinc-500">{boundary.privateSuffix ? "A private hosting suffix was recognized; the site tenant is distinct from the shared platform. " : ""}The hostname is parsed from the link. Ownership and the connection have not been verified.</p>
          {result.embeddedHosts.length > 0 && <div className="mt-4 border-t border-white/[.07] pt-4"><p className="font-mono text-[10px] uppercase tracking-[.14em] text-zinc-500">Embedded destination hostnames</p><ul className="mt-2 space-y-1">{result.embeddedHosts.map((host) => <li key={host} className="break-all font-mono text-xs text-zinc-300">{host}</li>)}</ul><p className="mt-2 text-xs leading-relaxed text-zinc-500">Parsed from the address; these destinations were not followed.</p></div>}
        </section>

        <section aria-labelledby="evidence-title" className="min-w-0 rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-400/[.045] to-[#0b1218] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-zinc-500">02 / Local signals</p><h3 id="evidence-title" className="mt-2 text-base font-semibold text-white">What the link and message reveal</h3></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-400">{signals.length} {signals.length === 1 ? "signal" : "signals"}</span></div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">{result.verdict === "no-obvious-signals" ? "Harmful links can look ordinary. No warning does not mean this link is safe." : "These patterns can also occur in legitimate links. Verify the destination independently."}</p>
          {signals.length ? <ul className="mt-4 space-y-2">{signals.map((finding) => <li key={finding.id} className="flex gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-4"><AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${finding.severity === "high" ? "text-rose-400" : "text-amber-400"}`} /><div><p className="text-sm font-medium text-zinc-100">{finding.title}</p><p className="mt-1 text-xs leading-relaxed text-zinc-400">{finding.detail}</p></div></li>)}</ul> : <p className="mt-4 flex gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-4 text-sm leading-relaxed text-zinc-400"><Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> No warning patterns matched. This is not a safety verdict.</p>}
          {infos.length > 0 && <ul className="mt-4 space-y-3">{infos.map((finding) => <li key={finding.id} className="flex gap-2.5 text-xs leading-relaxed text-zinc-400"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" /><span><span className="font-medium text-zinc-300">{finding.title}.</span> {finding.detail}</span></li>)}</ul>}
        </section>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 pt-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-cyan-300">Investigation / 02</p><h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Add external context</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">Choose the checks you want to run. Each one explains what it shares before you start.</p></div><span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/20 bg-violet-300/[.07] px-3 py-1.5 text-xs text-violet-200"><LockKeyhole className="h-3.5 w-3.5" /> Always optional</span></div>
      <ThreatCheck key={result.hostname} hostname={result.hostname} onResult={value => setEvidence(previous => ({ ...previous, threat: value ? { result: value, observedAt: new Date().toISOString() } : undefined }))} />
      <InvestigationCheck key={result.hostname} hostname={result.hostname} onResult={value => setEvidence(previous => ({ ...previous, investigation: value }))} />
      <DnsCheck key={result.hostname} hostname={result.hostname} onResult={value => setEvidence(previous => ({ ...previous, dns: value ? { result: value, observedAt: new Date().toISOString() } : undefined }))} />
      <ReportActions result={result} evidence={evidence} reviewedAt={reviewedAt} />
      <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-5"><p className="text-sm font-medium text-zinc-200">Before you interact</p><ul className="mt-3 grid gap-2 text-xs leading-relaxed text-zinc-400 sm:grid-cols-3"><li className="flex gap-2"><ChevronRight className="h-4 w-4 shrink-0 text-cyan-400" /> Compare the hostname with an address you already trust.</li><li className="flex gap-2"><ChevronRight className="h-4 w-4 shrink-0 text-cyan-400" /> Verify unexpected requests through a separate, known channel.</li><li className="flex gap-2"><ChevronRight className="h-4 w-4 shrink-0 text-cyan-400" /> Avoid entering credentials until you verify the destination.</li></ul></div>
    </div>
  );
}

export function PhishLensWorkspace() {
  const [input, setInput] = useState("");
  const [displayedLink, setDisplayedLink] = useState("");
  const [messageText, setMessageText] = useState("");
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function inspect(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setResult(analyzePhishingMessage({ url: input, displayedLink, messageText })); }
  function reset() { setInput(""); setDisplayedLink(""); setMessageText(""); setResult(null); }
  function moveTab(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "single" : event.key === "End" ? "batch" : mode === "single" ? "batch" : "single";
    setMode(next); document.getElementById(`tab-${next}`)?.focus();
  }
  const success = result?.ok ? result : null;

  return (
    <div id="checker" className="scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-white/[.12] bg-[#101820] shadow-[0_32px_90px_-35px_rgba(0,0,0,.9)] sm:rounded-[1.75rem]">
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-emerald-400 via-cyan-300 to-violet-400" />
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.08] bg-white/[.018] px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[.08] text-cyan-300"><ScanSearch className="h-5 w-5" /></span><div><p className="text-sm font-semibold tracking-tight text-white">PhishLens workspace</p><p className="mt-0.5 text-xs text-zinc-500">A closer look at suspicious links</p></div></div><span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[.07] px-3 py-1.5 text-[11px] font-medium text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Local review first</span></div>
      <div className="p-4 sm:p-7">
        <div role="tablist" aria-label="Investigation mode" className="grid grid-cols-2 gap-1 rounded-xl border border-white/[.07] bg-[#090f14] p-1 sm:max-w-md">{(["single", "batch"] as const).map(tab => <button key={tab} id={`tab-${tab}`} type="button" role="tab" aria-selected={mode === tab} tabIndex={mode === tab ? 0 : -1} onKeyDown={moveTab} aria-controls={`panel-${tab}`} onClick={() => setMode(tab)} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors sm:text-sm ${mode === tab ? "bg-emerald-400/15 text-emerald-200 shadow-sm ring-1 ring-emerald-400/20" : "text-zinc-400 hover:bg-white/[.04] hover:text-zinc-200"}`}>{tab === "single" ? <><Link2 className="h-4 w-4" /> Single link</> : <><Layers3 className="h-4 w-4" /> Batch review <span className="hidden text-[10px] text-zinc-400 sm:inline">100</span></>}</button>)}</div>
        <div id="panel-batch" role="tabpanel" aria-labelledby="tab-batch" hidden={mode !== "batch"} className="mt-6"><BatchReview onInspect={value => { setInput(value.normalizedUrl); setDisplayedLink(""); setMessageText(""); setResult(value); setMode("single"); }} /></div>
        <div id="panel-single" role="tabpanel" aria-labelledby="tab-single" hidden={mode !== "single"}>
          <div className={`mt-6 grid gap-4 ${result ? "" : "lg:grid-cols-[minmax(0,1.2fr)_minmax(270px,.8fr)]"}`}>
            <form onSubmit={inspect} className="rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-400/[.045] to-[#0a1116] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-cyan-300">Start an investigation</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">A little context goes a long way.</h2><p className="mt-2 text-sm leading-relaxed text-zinc-400">Paste the link you want to understand. Your initial review stays in this browser.</p></div><span className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 sm:flex"><ArrowUpRight className="h-4 w-4" /></span></div>
              <label htmlFor="phish-url" className="mt-6 block text-xs font-medium text-zinc-300">URL, domain or defanged indicator</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row"><div className="relative min-w-0 flex-1"><Link2 className="pointer-events-none absolute top-[18px] left-4 h-4 w-4 text-zinc-500" /><input id="phish-url" type="text" inputMode="url" autoComplete="off" spellCheck={false} maxLength={4096} value={input} onChange={(event) => { setInput(event.target.value); setResult(null); }} aria-invalid={result !== null && !result.ok} placeholder="https://example.com" className="h-[52px] w-full rounded-xl border border-white/10 bg-[#070c10] pr-4 pl-11 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/10" /></div></div>
              <div className="mt-5 grid gap-4">
                <div><label htmlFor="phish-displayed" className="block text-xs font-medium text-zinc-300">Displayed address (optional)</label><p id="display-help" className="mt-1 text-xs leading-relaxed text-zinc-400">Paste the address shown in the message. Enter its actual link destination above; plain text cannot reveal it.</p><input id="phish-displayed" value={displayedLink} onChange={e => { setDisplayedLink(e.target.value); setResult(null); }} aria-describedby="display-help" maxLength={4096} autoComplete="off" spellCheck={false} placeholder="example.com" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#070c10] px-4 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none" /></div>
                <div><label htmlFor="phish-message" className="block text-xs font-medium text-zinc-300">Message text (optional)</label><p id="message-help" className="mt-1 text-xs leading-relaxed text-zinc-400">Paste only relevant text. Leave out passwords, codes and other sensitive information.</p><textarea id="phish-message" value={messageText} onChange={e => { setMessageText(e.target.value); setResult(null); }} aria-describedby="message-help" maxLength={10000} rows={3} placeholder="Paste the relevant part of the message" className="mt-2 w-full rounded-xl border border-white/10 bg-[#070c10] p-4 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none" /></div>
              </div>
              <button type="submit" className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-6 text-sm font-semibold text-[#071b17] transition-colors hover:bg-emerald-200">Investigate link and message <ArrowRight className="h-4 w-4" /></button>
              <div className="mt-5 rounded-xl border border-violet-300/15 bg-violet-300/[.05] p-4"><p className="flex items-center gap-2 text-xs font-medium text-violet-200"><Sparkles className="h-3.5 w-3.5" /> Don’t have a link handy? Try an example</p><div className="mt-3 flex flex-wrap gap-2">{examples.map((example) => <button type="button" key={example.label} onClick={() => { setInput(example.value); setDisplayedLink(""); setMessageText(""); setResult(inspectInput(example.value)); }} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.04] px-3 text-xs font-medium text-zinc-200 transition-colors hover:border-violet-300/30 hover:bg-violet-300/10 hover:text-white">{example.label}<ChevronRight className="h-3 w-3 text-violet-300" /></button>)}{result && <button type="button" onClick={reset} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs text-zinc-400 hover:text-white"><RotateCcw className="h-3 w-3" /> Clear</button>}</div></div>
            </form>
            {!result && <aside aria-label="How an investigation works" className="relative overflow-hidden rounded-2xl border border-sky-400/15 bg-gradient-to-br from-[#10242b] to-[#111726] p-5 sm:p-6"><div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-cyan-400/[.07] blur-3xl" /><div className="relative"><div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-cyan-300">The review process</p><Sparkles className="h-4 w-4 text-cyan-400/60" /></div><h3 className="mt-3 text-base font-semibold text-white">From link to clarity.</h3><div className="mt-4 divide-y divide-white/[.07]">{workflow.map(step => <div key={step.number} className="flex items-start gap-3 py-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-300/15 bg-sky-300/[.08] font-mono text-[10px] text-sky-300">{step.number}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium text-zinc-200">{step.title}</p><p className="mt-1 text-xs leading-relaxed text-zinc-400">{step.detail}</p></div><span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[9px] tracking-wider text-zinc-400">{step.tag}</span></div>)}</div><p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-zinc-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> The destination is never opened by PhishLens.</p></div></aside>}
          </div>
          <div aria-live="polite" className="sr-only">{success ? "Local link review complete. Review the evidence below." : ""}</div>
          <div className="mt-7">{result && !result.ok && <div role="alert" className="flex gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[.07] p-4 text-sm text-rose-200"><AlertCircle className="h-5 w-5 shrink-0" />{result.error}</div>}{success && <Summary key={success.normalizedUrl} result={success} />}</div>
        </div>
        <p className="mt-6 flex gap-2 border-t border-white/[.07] pt-5 text-xs leading-relaxed text-zinc-500"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Results are signals to investigate, not proof that a link is safe or malicious. The destination is never visited.</p>
      </div>
    </div>
  );
}

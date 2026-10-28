"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Check, ChevronRight, Clipboard, Download, FileSearch, Fingerprint, Globe2, Info, Link2, LockKeyhole, RotateCcw, ScanSearch, ShieldAlert } from "lucide-react";
import { analyzePhishingUrl, type AnalysisResult } from "@/lib/phishing-detector";
import { DnsCheck } from "@/components/phishing-detector/dns-check";
import { ThreatCheck } from "@/components/phishing-detector/threat-check";

const examples = [
  { label: "Deceptive hostname", value: "https://trusted.example@account-check.example/login" },
  { label: "Ordinary-looking link", value: "https://example.com/hello" },
];

function downloadReport(result: Extract<AnalysisResult, { ok: true }>) {
  // Deliberately leave out the submitted URL, paths, queries and credentials.
  const report = {
    report: "PhishLens local URL pattern review",
    generatedAt: new Date().toISOString(),
    hostname: result.hostname,
    result: result.verdict,
    findings: result.findings,
    embeddedHostnames: result.embeddedHosts,
    scope: "Local URL pattern review only. DNS and other external checks are not included. The full submitted URL was omitted.",
    limitation: "Patterns do not establish whether a link is safe or malicious.",
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "phishlens-review.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Summary({ result }: { result: Extract<AnalysisResult, { ok: true }> }) {
  const [copied, setCopied] = useState(false);
  const address = new URL(result.normalizedUrl);
  const signals = result.findings.filter((item) => item.severity !== "info");
  const infos = result.findings.filter((item) => item.severity === "info");
  const label = result.verdict === "high-risk" ? "High-concern signals" : result.verdict === "review" ? "Review recommended" : "No obvious patterns found";
  const tone = result.verdict === "high-risk" ? "text-rose-300 border-rose-400/20 bg-rose-400/[.06]" : result.verdict === "review" ? "text-amber-300 border-amber-400/20 bg-amber-400/[.06]" : "text-cyan-300 border-cyan-400/20 bg-cyan-400/[.05]";

  async function copyHost() {
    try { await navigator.clipboard.writeText(result.hostname); setCopied(true); }
    catch { setCopied(false); }
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-5 sm:p-6 ${tone}`}>
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-black/10"><ShieldAlert className="h-5 w-5" /></span><div><p className="font-mono text-[10px] uppercase tracking-[.16em]">Local URL analysis</p><h2 className="mt-1.5 text-xl font-semibold text-white sm:text-2xl">{label}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">{result.verdict === "no-obvious-signals" ? "Many harmful links look ordinary. No warning does not mean this link is safe." : "These patterns can occur in legitimate links too. Verify the destination independently."}</p></div></div><span className="rounded-full border border-current/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wider">{signals.length} {signals.length === 1 ? "signal" : "signals"}</span></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section aria-labelledby="evidence-title" className="min-w-0 rounded-2xl border border-white/[.08] bg-[#0d141a] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-white/[.07] pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-cyan-400">Evidence</p><h3 id="evidence-title" className="mt-2 text-lg font-semibold">What the URL reveals</h3></div><Fingerprint className="h-5 w-5 text-zinc-500" /></div>
          {signals.length ? <ul className="mt-4 space-y-2">{signals.map((finding) => <li key={finding.id} className="flex gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-4"><AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${finding.severity === "high" ? "text-rose-400" : "text-amber-400"}`} /><div><p className="text-sm font-medium text-zinc-100">{finding.title}</p><p className="mt-1 text-sm leading-relaxed text-zinc-400">{finding.detail}</p></div></li>)}</ul> : <p className="mt-4 flex gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-4 text-sm leading-relaxed text-zinc-400"><Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> No warning patterns matched. This is not a safety verdict.</p>}
          {infos.length > 0 && <ul className="mt-3 space-y-2">{infos.map((finding) => <li key={finding.id} className="flex gap-3 p-1 text-sm leading-relaxed text-zinc-400"><Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" /><span><span className="font-medium text-zinc-300">{finding.title}.</span> {finding.detail}</span></li>)}</ul>}
        </section>
        <div className="min-w-0 space-y-5">
          <section aria-labelledby="destination-title" className="rounded-2xl border border-white/[.08] bg-[#0d141a] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-cyan-400">Address breakdown</p><h3 id="destination-title" className="mt-2 text-lg font-semibold">Initial destination</h3></div><Globe2 className="h-5 w-5 text-zinc-500" /></div><div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[.035] p-4"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-zinc-500">Parsed destination hostname</p><p className="mt-2 break-all font-mono text-sm leading-relaxed text-zinc-100">{result.hostname}</p><button type="button" onClick={copyHost} className="mt-3 inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200"><Clipboard className="h-3.5 w-3.5" />{copied ? "Hostname copied" : "Copy hostname"}</button></div><dl className="mt-4 divide-y divide-white/[.07] text-sm"><div className="flex justify-between gap-4 py-2.5"><dt className="text-zinc-500">Scheme in review</dt><dd className="font-mono text-zinc-300">{address.protocol.replace(":", "").toUpperCase()}</dd></div><div className="flex justify-between gap-4 py-2.5"><dt className="text-zinc-500">Query parameters</dt><dd className="font-mono text-zinc-300">{address.search ? "Present" : "None"}</dd></div><div className="flex justify-between gap-4 py-2.5"><dt className="text-zinc-500">Destination visited</dt><dd className="text-zinc-300">No</dd></div></dl><p className="mt-3 text-xs leading-relaxed text-zinc-500">Hostname is parsed from the link. Its identity and the connection have not been verified.</p>{result.embeddedHosts.length > 0 && <div className="mt-4 border-t border-white/[.07] pt-4"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-zinc-500">Embedded destination hostnames</p><ul className="mt-2 space-y-1">{result.embeddedHosts.map((host) => <li key={host} className="break-all font-mono text-xs text-zinc-300">{host}</li>)}</ul><p className="mt-2 text-xs leading-relaxed text-zinc-500">Parsed from the address. These destinations were not followed.</p></div>}</section>
          <section aria-labelledby="next-title" className="rounded-2xl border border-white/[.08] bg-[#0d141a] p-5 sm:p-6"><p className="font-mono text-[10px] uppercase tracking-[.17em] text-cyan-400">Next steps</p><h3 id="next-title" className="mt-2 text-lg font-semibold">Before you interact</h3><ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-400"><li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> Compare the hostname with an address you already trust.</li><li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> Verify unexpected requests through a separate, known channel.</li><li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> Avoid entering credentials until you have verified the destination.</li></ul></section>
        </div>
      </div>
      <ThreatCheck key={result.hostname} hostname={result.hostname} />
      <DnsCheck key={result.hostname} hostname={result.hostname} />
      <div className="flex flex-wrap items-center gap-4 border-t border-white/[.07] pt-5"><button type="button" onClick={() => downloadReport(result)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-zinc-200 hover:bg-white/5"><Download className="h-4 w-4" /> Export local review</button><p className="max-w-lg text-xs leading-relaxed text-zinc-500">The JSON export includes hostnames and local findings, but omits the full link and external check results.</p></div>
    </div>
  );
}

export function PhishLensWorkspace() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function inspect(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setResult(analyzePhishingUrl(input)); }
  function reset() { setInput(""); setResult(null); }
  const success = result?.ok ? result : null;

  return (
    <div id="checker" className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101920] shadow-2xl shadow-black/40">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.08] px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><ScanSearch className="h-5 w-5" /></span><div><p className="font-semibold">Investigation workspace</p><p className="text-xs text-zinc-500">URL analysis <span className="mx-1 text-zinc-700">/</span> PhishLens</p></div></div><span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400"><LockKeyhole className="h-3 w-3" /> Local review</span></div>
      <div className="p-5 sm:p-7">
        <form onSubmit={inspect}>
          <div className="flex flex-wrap items-baseline justify-between gap-2"><label htmlFor="phish-url" className="text-sm font-medium text-zinc-200">URL or domain</label><p className="text-xs text-zinc-500">We never open the destination</p></div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row"><div className="relative min-w-0 flex-1"><Link2 className="pointer-events-none absolute top-4 left-4 h-4 w-4 text-zinc-500" /><input id="phish-url" type="text" inputMode="url" autoComplete="off" spellCheck={false} maxLength={4096} value={input} onChange={(event) => { setInput(event.target.value); setResult(null); }} placeholder="Paste a suspicious link or domain" className="h-12 w-full rounded-xl border border-white/10 bg-[#080d11] pr-4 pl-11 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none" /></div><button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 text-sm font-semibold text-[#071319] transition-colors hover:bg-cyan-200">Investigate link <ArrowRight className="h-4 w-4" /></button></div>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500"><span>Try an example:</span>{examples.map((example) => <button type="button" key={example.label} onClick={() => { setInput(example.value); setResult(analyzePhishingUrl(example.value)); }} className="text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-cyan-300">{example.label}</button>)}{result && <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white"><RotateCcw className="h-3 w-3" /> Clear</button>}</div>
        <div aria-live="polite" className="mt-7">
          {result && !result.ok && <div role="alert" className="flex gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[.07] p-4 text-sm text-rose-200"><AlertCircle className="h-5 w-5 shrink-0" />{result.error}</div>}
          {!result && <div className="grid overflow-hidden rounded-2xl border border-white/[.07] bg-[#0b1116] md:grid-cols-[1fr_1fr]"><div className="px-6 py-9 sm:px-8"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[.05] text-cyan-300"><FileSearch className="h-6 w-6" /></span><p className="mt-5 text-lg font-medium text-zinc-100">Your investigation starts here.</p><p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">Paste a link to inspect its destination and review potential warning signs.</p></div><div className="border-t border-white/[.07] px-6 py-7 sm:px-8 md:border-t-0 md:border-l"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-zinc-500">What you can review</p><ul className="mt-5 space-y-4 text-sm text-zinc-300"><li className="flex items-center gap-3"><Check className="h-4 w-4 text-cyan-400" /> Initial destination hostname</li><li className="flex items-center gap-3"><Check className="h-4 w-4 text-cyan-400" /> Explainable warning patterns</li><li className="flex items-center gap-3"><Check className="h-4 w-4 text-cyan-400" /> Optional domain intelligence and DNS signals</li></ul></div></div>}
          {success && <Summary key={success.normalizedUrl} result={success} />}
        </div>
        <p className="mt-6 flex gap-2 border-t border-white/[.07] pt-5 text-xs leading-relaxed text-zinc-500"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Results are signals to investigate, not proof that a link is safe or malicious. The destination is never visited.</p>
      </div>
    </div>
  );
}

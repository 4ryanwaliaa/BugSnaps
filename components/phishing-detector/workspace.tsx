"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Check, CircleHelp, Link2, LockKeyhole, RotateCcw, ScanSearch, ShieldAlert } from "lucide-react";
import { analyzePhishingUrl, type AnalysisResult } from "@/lib/phishing-detector";
import { DnsCheck } from "@/components/phishing-detector/dns-check";

const examples = [
  { label: "Deceptive host", value: "https://trusted.example@account-check.example/login" },
  { label: "Ordinary-looking link", value: "https://example.com/hello" },
];

export function PhishLensWorkspace() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function inspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(analyzePhishingUrl(input));
  }

  const success = result?.ok ? result : null;
  const label = success?.verdict === "high-risk" ? "High-concern signals" : success?.verdict === "review" ? "Review this link" : "No obvious signals found";
  const tone = success?.verdict === "high-risk" ? "text-rose-300 border-rose-400/20 bg-rose-400/[.07]" : success?.verdict === "review" ? "text-amber-300 border-amber-400/20 bg-amber-400/[.07]" : "text-cyan-300 border-cyan-400/20 bg-cyan-400/[.06]";

  return (
    <div id="checker" className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#10151a] shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between gap-3 border-b border-white/[.08] px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><ScanSearch className="h-5 w-5" /></span><div><p className="font-semibold">Link inspector</p><p className="text-xs text-zinc-400">A free tool by BugSnaps</p></div></div><span className="hidden items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 sm:inline-flex"><LockKeyhole className="h-3 w-3" /> Browser local</span></div>
      <div className="p-5 sm:p-7">
        <form onSubmit={inspect}>
          <label htmlFor="phish-url" className="text-sm font-medium text-zinc-200">Paste a link to inspect</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row"><div className="relative min-w-0 flex-1"><Link2 className="pointer-events-none absolute top-4 left-4 h-4 w-4 text-zinc-500" /><input id="phish-url" type="text" inputMode="url" autoComplete="off" spellCheck={false} maxLength={4096} value={input} onChange={(event) => { setInput(event.target.value); setResult(null); }} placeholder="https://example.com" className="h-12 w-full rounded-xl border border-white/10 bg-[#090d10] pr-4 pl-11 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none" /></div><button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 text-sm font-semibold text-[#071319] transition-colors hover:bg-cyan-200">Inspect link <ArrowRight className="h-4 w-4" /></button></div>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500"><span>Try an example:</span>{examples.map((example) => <button type="button" key={example.label} onClick={() => { setInput(example.value); setResult(analyzePhishingUrl(example.value)); }} className="text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-cyan-300">{example.label}</button>)}</div>
        <div aria-live="polite" className="mt-7">
          {result && !result.ok && <div role="alert" className="flex gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[.07] p-4 text-sm text-rose-200"><AlertCircle className="h-5 w-5 shrink-0" />{result.error}</div>}
          {!result && <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-6 py-10 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[.03] text-zinc-400"><ScanSearch className="h-6 w-6" /></span><p className="mt-4 font-medium text-zinc-200">Ready when you are</p><p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">Paste a link above to see its destination and potential warning signs.</p></div>}
          {success && <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${tone}`}><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="text-xs font-medium uppercase tracking-[.15em]">Inspection complete</p><h2 className="mt-2 text-xl font-semibold text-white">{label}</h2><p className="mt-2 text-sm leading-relaxed text-zinc-300">{success.verdict === "no-obvious-signals" ? "The link's appearance alone cannot establish that it is safe. Verify the sender and destination independently." : "These patterns can appear in legitimate links too. Verify the destination independently before interacting."}</p></div></div></div>
            <div className="rounded-xl border border-white/[.08] bg-black/15 p-4"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-zinc-500">Destination hostname</p><p className="mt-2 break-all font-mono text-sm text-zinc-100">{success.hostname}</p></div>
            <div><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-zinc-200">What we found</h3><span className="font-mono text-xs text-zinc-500">{success.findings.length} {success.findings.length === 1 ? "signal" : "signals"}</span></div>{success.findings.length ? <ul className="space-y-2">{success.findings.map((finding) => <li key={finding.id} className="flex gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-4"><span className={`mt-0.5 ${finding.severity === "high" ? "text-rose-400" : finding.severity === "moderate" ? "text-amber-400" : "text-cyan-400"}`}><AlertCircle className="h-4 w-4" /></span><div><p className="text-sm font-medium text-zinc-100">{finding.title}</p><p className="mt-1 text-sm leading-relaxed text-zinc-400">{finding.detail}</p></div></li>)}</ul> : <p className="flex gap-2 rounded-xl border border-white/[.07] p-4 text-sm leading-relaxed text-zinc-400"><Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />No listed patterns were found. This is not a safety verdict.</p>}</div>
            <DnsCheck key={success.hostname} hostname={success.hostname} />
            <button type="button" onClick={() => { setInput(""); setResult(null); }} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><RotateCcw className="h-4 w-4" /> Clear and check another</button>
          </div>}
        </div>
        <p className="mt-6 flex gap-2 border-t border-white/[.07] pt-5 text-xs leading-relaxed text-zinc-500"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0" /> URL patterns and the optional DNS check do not establish whether a site is safe. The destination is never visited.</p>
      </div>
    </div>
  );
}

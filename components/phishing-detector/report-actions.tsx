"use client";

import { Download, FileText } from "lucide-react";
import { createReport, reportMarkdown, type Evidence, type LocalReview } from "@/lib/phishlens-review";

export function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ReportActions({ result, evidence, reviewedAt }: { result: LocalReview; evidence: Evidence; reviewedAt: string }) {
  function exportReport(format: "json" | "md") {
    const report = createReport(result, evidence, reviewedAt);
    downloadFile(format === "json" ? JSON.stringify(report, null, 2) : reportMarkdown(report), `phishlens-investigation.${format}`, format === "json" ? "application/json" : "text/markdown;charset=utf-8");
  }
  return <section aria-labelledby="report-title" className="rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[.055] to-[#0c141b] p-5 sm:p-6">
    <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.07] text-cyan-300"><FileText aria-hidden="true" className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-cyan-300">Investigation report</p><h3 id="report-title" className="mt-2 text-lg font-semibold text-zinc-100">Take the evidence with you</h3><p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">Export completed checks, source health, observation times and missing coverage.</p></div>
    </div>
    <div className="mt-5 flex flex-col items-start gap-4 border-t border-white/[.07] pt-5 lg:flex-row lg:items-center lg:justify-between"><p className="max-w-2xl text-xs leading-relaxed text-zinc-400">Full URLs, paths, credentials and queries are omitted. Hostnames and provider evidence remain; review before sharing.</p><div className="flex w-full gap-2 sm:w-auto">{(["json", "md"] as const).map(format => <button key={format} type="button" onClick={() => exportReport(format)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[.08] sm:flex-none"><Download aria-hidden="true" className="h-4 w-4" />{format === "json" ? "JSON" : "Markdown"}</button>)}</div></div>
  </section>;
}

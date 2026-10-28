"use client";

import { Download } from "lucide-react";
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
  return <div className="rounded-2xl border border-white/10 bg-black/15 p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-sm font-medium">Take the evidence with you</h3><p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500">Exports include completed checks, missing coverage, source health and observation times. Full URLs, paths, credentials and queries are omitted. Hostnames and provider evidence remain; review before sharing.</p></div><div className="flex gap-2">{(["json", "md"] as const).map(format => <button key={format} type="button" onClick={() => exportReport(format)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-zinc-200 hover:bg-white/5"><Download className="h-4 w-4" />{format === "json" ? "JSON" : "Markdown"}</button>)}</div></div></div>;
}

"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, CheckCircle2, ChevronDown } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SeverityBadge } from "@/components/ui/badge";
import { LogoMark } from "@/components/site/logo";
import { reportFindings, riskDistribution } from "@/lib/data";
import { cn } from "@/lib/utils";

const maxCount = Math.max(...riskDistribution.map((r) => r.count));

export function ReportPreview() {
  const reduceMotion = useReducedMotion();
  // Phones start with the tall report document collapsed to a preview.
  const [expanded, setExpanded] = useState(false);

  return (
    <Section id="report">
      <SectionHeading
        eyebrow="Deliverables"
        title="A report worth more than the test"
        description="Here's a sample of exactly what you receive: a summary anyone can read, reproduction steps and fixes for your developers, and proof you can show your customers."
      />

      <Reveal className="mt-16" y={32}>
        <div className="relative mx-auto max-w-4xl">
          {/* Glow behind the document */}
          <div
            aria-hidden="true"
            className="absolute -inset-8 rounded-[32px] bg-primary/[0.07] blur-3xl"
          />

          {/* The document — capped height on phones until expanded */}
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0d10] shadow-[0_32px_120px_-32px_rgb(0_0_0/0.9)]",
              !expanded && "max-lg:max-h-[520px]",
            )}
          >
            {/* Document header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4 sm:px-10">
              <div className="flex items-center gap-3">
                <LogoMark className="h-6 w-6" />
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    Penetration Test Report
                  </p>
                  <p className="font-mono text-[11px] text-muted-2">
                    Example Co. · Web Application &amp; API
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden rounded-md border border-accent/25 bg-accent/10 px-2 py-1 font-mono text-[10px] tracking-[0.15em] text-accent uppercase sm:inline-flex">
                  Sample
                </span>
                <span className="font-mono text-[11px] text-muted-2">v2.1 · 24 pages</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_260px]">
              {/* Main content */}
              <div className="space-y-8 px-6 py-8 sm:px-10">
                {/* Executive summary */}
                <div>
                  <h3 className="font-mono text-[11px] font-medium tracking-[0.2em] text-accent uppercase">
                    1 · Executive Summary
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    BugSnaps performed a manual penetration test of the Example Co. web
                    application and public API. Testing identified{" "}
                    <span className="font-medium text-foreground">24 findings</span>, including
                    two critical issues permitting unauthorized access to customer order data.
                    All critical and high-severity findings were remediated and{" "}
                    <span className="font-medium text-success">verified fixed on retest</span>.
                  </p>
                </div>

                {/* Risk distribution */}
                <div>
                  <h3 className="font-mono text-[11px] font-medium tracking-[0.2em] text-accent uppercase">
                    2 · Risk Distribution
                  </h3>
                  <div className="mt-4 space-y-2.5">
                    {riskDistribution.map((row, index) => (
                      <div key={row.label} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-right font-mono text-[11px] text-muted">
                          {row.label}
                        </span>
                        <div className="h-5 flex-1 overflow-hidden rounded-sm bg-white/[0.03]">
                          <motion.div
                            initial={reduceMotion ? false : { width: 0 }}
                            whileInView={{ width: `${(row.count / maxCount) * 100}%` }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{
                              duration: 0.9,
                              delay: 0.15 + index * 0.08,
                              ease: [0.21, 0.47, 0.32, 0.98],
                            }}
                            className="h-full rounded-sm opacity-80"
                            style={{ backgroundColor: row.color }}
                          />
                        </div>
                        <span className="w-6 shrink-0 font-mono text-[12px] text-muted">
                          {row.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Findings table */}
                <div>
                  <h3 className="font-mono text-[11px] font-medium tracking-[0.2em] text-accent uppercase">
                    3 · Critical &amp; Selected Findings
                  </h3>
                  <div className="mt-4 -mx-2 overflow-x-auto">
                    <table className="w-full min-w-[540px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/[0.08]">
                          <th className="px-2 py-2.5 font-mono text-[10px] font-medium tracking-[0.15em] text-muted-2 uppercase">
                            ID
                          </th>
                          <th className="px-2 py-2.5 font-mono text-[10px] font-medium tracking-[0.15em] text-muted-2 uppercase">
                            Finding
                          </th>
                          <th className="px-2 py-2.5 font-mono text-[10px] font-medium tracking-[0.15em] text-muted-2 uppercase">
                            Severity
                          </th>
                          <th className="px-2 py-2.5 text-right font-mono text-[10px] font-medium tracking-[0.15em] text-muted-2 uppercase">
                            CVSS
                          </th>
                          <th className="px-2 py-2.5 text-right font-mono text-[10px] font-medium tracking-[0.15em] text-muted-2 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportFindings.map((finding) => (
                          <tr
                            key={finding.id}
                            className="border-b border-white/[0.05] last:border-0"
                          >
                            <td className="px-2 py-3 font-mono text-[12px] whitespace-nowrap text-muted-2">
                              {finding.id}
                            </td>
                            <td className="px-2 py-3 text-[13px] font-medium text-foreground/90">
                              {finding.title}
                            </td>
                            <td className="px-2 py-3">
                              <SeverityBadge severity={finding.severity} />
                            </td>
                            <td className="px-2 py-3 text-right font-mono text-[12px] text-muted">
                              {finding.cvss.toFixed(1)}
                            </td>
                            <td className="px-2 py-3 text-right">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-success">
                                <CheckCircle2 className="h-3 w-3" />
                                {finding.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-mono text-[11px] font-medium tracking-[0.2em] text-accent uppercase">
                    4 · Key Recommendations
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {[
                      "Adopt parameterized queries across all order-management data access.",
                      "Enforce object-level authorization checks in the shared API middleware.",
                      "Introduce per-account rate limiting on all authentication endpoints.",
                    ].map((rec) => (
                      <li key={rec} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Meta sidebar */}
              <aside className="border-t border-white/[0.07] bg-white/[0.015] px-6 py-8 lg:border-t-0 lg:border-l">
                <dl className="space-y-5">
                  {[
                    { term: "Engagement", detail: "Web app + API pentest" },
                    { term: "Testing window", detail: "Mar 4 – Mar 15" },
                    { term: "Methodology", detail: "OWASP WSTG · PTES" },
                    { term: "Testers", detail: "2 senior consultants" },
                    { term: "Retest", detail: "Completed · Apr 2" },
                  ].map((item) => (
                    <div key={item.term}>
                      <dt className="font-mono text-[10px] tracking-[0.15em] text-muted-2 uppercase">
                        {item.term}
                      </dt>
                      <dd className="mt-1 text-[13px] font-medium text-foreground/90">
                        {item.detail}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 rounded-xl border border-success/20 bg-success/[0.06] p-4">
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    All findings closed
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                    24 of 24 findings verified fixed on retest.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-muted-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-mono text-[11px]">PDF · Page 3 of 24</span>
                </div>
              </aside>
            </div>

            {/* Phones: fade + expand control while collapsed */}
            {!expanded && (
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/85 to-transparent pt-24 pb-5 lg:hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm active:scale-95"
                >
                  View full sample report
                  <ChevronDown className="h-4 w-4 text-accent" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

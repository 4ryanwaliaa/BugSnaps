import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Laptop, Link2, ScanSearch } from "lucide-react";
import { Section } from "@/components/site/page-parts";
import { product } from "@/lib/products";
import { newAssessmentUrl } from "@/lib/mypentest";
import { MYRECON_ANDROID_URL, MYRECON_URL } from "@/lib/site";

const cards = [
  { id: "mypentest", icon: ScanSearch, category: "WEB & API SECURITY", question: "Built an app? See what needs attention.", description: "Test your verified web app and review findings with evidence and suggested fixes.", color: "text-blue-300", border: "border-blue-400/20", tint: "bg-blue-400/[0.08]", glow: "bg-blue-500/10" },
  { id: "myrecon", icon: ScanSearch, category: "DIGITAL FOOTPRINT", question: "Curious about your digital footprint?", description: "Explore public username leads, breach exposure and domain context on the web or Android.", color: "text-cyan-300", border: "border-cyan-400/20", tint: "bg-cyan-400/[0.08]", glow: "bg-cyan-500/10" },
  { id: "endpointradar", icon: Laptop, category: "ENDPOINT SECURITY", question: "Get a clearer view of your Windows endpoint.", description: "Scan locally, explore your report in the browser and review guidance for your next steps.", color: "text-violet-300", border: "border-violet-400/20", tint: "bg-violet-400/[0.08]", glow: "bg-violet-500/10" },
  { id: "phishlens", icon: Link2, category: "LINK SAFETY", question: "That link look a little off?", description: "Inspect a link's destination and common warning signs before you decide what to do next.", color: "text-emerald-300", border: "border-emerald-400/20", tint: "bg-emerald-400/[0.08]", glow: "bg-emerald-500/10" },
].map((card) => ({ ...card, product: product(card.id) }));

export function HomeProducts() {
  return (
    <Section labelledBy="products-title" className="border-t border-white/[0.05]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Products · The BugSnaps toolkit</p>
          <h2 id="products-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Curiosity, meet clarity.</h2>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">Four tools for the questions you want to answer, from suspicious links to your app's attack surface.</p>
        </div>
        <Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">Explore all four products <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>

      <ul className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2">
        {cards.map(({ id, icon: Icon, category, question, description, color, border, tint, glow, product }, index) => (
          <li key={id} className="flex">
            <article className="card-hover relative flex w-full flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-surface p-6 sm:p-8">
              <div aria-hidden="true" className={`pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl ${glow}`} />
              <div className="relative flex items-center gap-3">
                {id === "myrecon" ? <Image src="/myrecon-logo.svg" alt="" width={48} height={48} className="h-12 w-12" /> : <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${border} ${tint} ${color}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>}
                <div><h3 className="text-lg font-semibold tracking-tight">{product.name}</h3><p className={`mt-1 font-mono text-[10px] tracking-[0.15em] ${color}`}>{category}</p></div>
                <span className="ml-auto font-mono text-xs text-muted-2">0{index + 1} / 04</span>
              </div>
              <h4 className="relative mt-7 max-w-md text-2xl font-semibold leading-tight tracking-tight">{question}</h4>
              <p className="relative mt-3 flex-1 text-[15px] leading-relaxed text-muted">{description}</p>
              <div className="relative mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
                {id === "mypentest" ? <a href={newAssessmentUrl()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-blue-200">Start free <ArrowRight className="h-4 w-4" aria-hidden="true" /></a> : <Link href={product.href} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-blue-200">{product.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
                {id === "myrecon" ? <><a href={MYRECON_URL} className="inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-foreground">Website <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a><a href={MYRECON_ANDROID_URL} className="inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-foreground">Android app <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></> : <Link href={`/products#${id}`} className="inline-flex min-h-10 items-center text-sm text-muted hover:text-foreground">See how it works</Link>}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}

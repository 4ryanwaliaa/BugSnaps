import type { Metadata } from "next";
import { Mail, Search, GraduationCap, HeartHandshake } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join BugSnaps — a new offensive security team. Send us your CV and tell us why you want to break things (legally) for a living.",
};

const values = [
  {
    icon: Search,
    title: "Curiosity over credentials",
    description:
      "We care more about how you think than which certificates you hold. If you pull things apart to see how they break, you'll fit right in.",
  },
  {
    icon: GraduationCap,
    title: "Learn by doing",
    description:
      "We're a young team, which means real responsibility from day one — real targets, real reports, real clients. You'll grow fast because you'll have to.",
  },
  {
    icon: HeartHandshake,
    title: "Honesty is the product",
    description:
      "We don't inflate findings, pad reports, or pretend to be bigger than we are. If that sounds refreshing rather than scary, we want to meet you.",
  },
];

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 pt-36 pb-24 lg:px-8">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
          Careers
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Break things, legally. Help us build BugSnaps.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          We&apos;re a new offensive security company — small team, no bureaucracy,
          plenty of interesting problems. If making the internet a little safer
          sounds like your kind of work, we&apos;d love to hear from you.
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-white/[0.07] bg-surface p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-accent">
                <value.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </div>
              <h2 className="mt-4 text-base font-semibold tracking-tight">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-accent/25 bg-surface">
          <div className="p-8 sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight">How to apply</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
              No forms, no portals. Email us your CV and a few honest lines about{" "}
              <span className="text-foreground">why you want to join us</span> —
              what excites you about security, what you&apos;ve built or broken,
              what you want to learn. That&apos;s it.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button
                href="mailto:4ryanwalia@gmail.com?subject=Joining%20BugSnaps"
                size="lg"
              >
                <Mail className="h-4 w-4" />
                4ryanwalia@gmail.com
              </Button>
              <p className="text-[13px] text-muted-2">
                We read everything and reply to everyone.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

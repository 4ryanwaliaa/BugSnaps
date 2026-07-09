import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-6 pt-36 pb-24 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 font-mono text-[12px] text-muted-2">Last updated: {updated}</p>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

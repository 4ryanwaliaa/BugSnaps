import type { Metadata } from "next";
import { SiteShell } from "@/components/site/page-parts";
import { HomeHero } from "@/components/home/hero";
import { HomeProducts } from "@/components/home/products";
import { HomeHowItRuns, HomeMarquee, HomeReport, HomeStats } from "@/components/home/sections";
import { HomeWhy } from "@/components/home/why";
import { HomeResearch } from "@/components/home/research";
import { HomeClosing } from "@/components/home/closing";
import { LegacyHashRedirect } from "@/components/home/legacy-hash-redirect";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "BugSnaps - Penetration Testing, Automated and Expert-Led",
  absoluteTitle: true,
  description:
    "Security testing that actually tests. Run MyPentest - our automated penetration test - free to start, or bring in the BugSnaps team for a manual engagement.",
  path: "/",
});

export default function Home() {
  return (
    <SiteShell>
      <LegacyHashRedirect />
      <HomeHero />
      <HomeMarquee />
      <HomeHowItRuns />
      <HomeStats />
      <HomeReport />
      <HomeProducts />
      <HomeWhy />
      <HomeResearch />
      <HomeClosing />
    </SiteShell>
  );
}

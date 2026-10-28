import type { Metadata } from "next";
import { SiteShell } from "@/components/site/page-parts";
import { PhishLensTeam } from "@/components/phishing-detector/team";

export const metadata: Metadata = { title: "Team review inbox | PhishLens", robots: { index: false, follow: false } };
export default function TeamPage() { return <SiteShell><PhishLensTeam /></SiteShell>; }

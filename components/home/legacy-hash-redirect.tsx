"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/*
 * The old single-page site linked to on-page anchors (#services, #pricing,
 * #contact, #how, #report, #intel). Those sections now live on their own
 * pages. A fragment never reaches the server, so a permanent redirect can't
 * catch them - this does, in the browser, once, on load. New internal links
 * point straight at the pages; this is only for old bookmarks and backlinks.
 */
const MAP: Record<string, string> = {
  services: "/services",
  pricing: "/pricing",
  contact: "/contact",
  how: "/penetration-testing",
  report: "/mypentest/example-report",
  faq: "/penetration-testing#faq",
  intel: "/", // Domain Intelligence was removed; no replacement.
  personal: "/personal",
  briefing: "/about",
};

export function LegacyHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const destination = MAP[hash];
    if (destination) router.replace(destination);
  }, [router]);
  return null;
}

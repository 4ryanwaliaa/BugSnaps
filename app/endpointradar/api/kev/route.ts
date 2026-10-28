import { NextResponse } from "next/server";

// General CISA context only. No endpoint scan data is sent to this route or CISA.
const CATALOG = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const text = (value: unknown, max = 250) => typeof value === "string" ? value.slice(0, max) : "";

export async function GET() {
  try {
    const response = await fetch(CATALOG, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("CISA catalog unavailable");
    const catalog = await response.json();
    if (!Array.isArray(catalog.vulnerabilities) || !text(catalog.dateReleased)) throw new Error("Unexpected catalog format");
    const entries = catalog.vulnerabilities
      .filter((item: Record<string, unknown>) => /^CVE-\d{4}-\d{4,}$/i.test(text(item.cveID)) && /^\d{4}-\d{2}-\d{2}$/.test(text(item.dateAdded)))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => text(b.dateAdded).localeCompare(text(a.dateAdded)) || text(b.cveID).localeCompare(text(a.cveID)))
      .slice(0, 4)
      .map((item: Record<string, unknown>) => ({ id: text(item.cveID, 30), name: text(item.vulnerabilityName), vendor: text(item.vendorProject, 120), added: text(item.dateAdded, 10) }));
    if (!entries.length) throw new Error("Empty catalog");
    return NextResponse.json({ released: text(catalog.dateReleased, 80), entries }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ error: "CISA catalog is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

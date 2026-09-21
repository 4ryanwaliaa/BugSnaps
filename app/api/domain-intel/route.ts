import { NextRequest, NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { collectProfile } from "@/lib/domain-intel/collect";
import { buildFindings } from "@/lib/domain-intel/findings";
import { normalizeDomain } from "@/lib/domain-intel/dns";

export const runtime = "nodejs";
// Results are per-visitor and point-in-time; never let a shared cache or CDN
// hand one visitor's lookup to the next.
export const dynamic = "force-dynamic";

// One HTTP request now fans out to roughly forty DNS queries plus a
// Certificate Transparency search, so an unthrottled endpoint is both a
// reflection vector and a good way to get our address rate-limited by the
// public resolvers. The ceiling is deliberately lower than the old seven-query
// version's.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function GET(request: NextRequest) {
  const quota = rateLimit(clientKey(request), RATE_LIMIT, RATE_WINDOW_MS);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Too many lookups from this network. Try again in a minute." },
      {
        status: 429,
        headers: {
          ...NO_STORE,
          "Retry-After": String(quota.retryAfterSeconds),
          "RateLimit-Limit": String(quota.limit),
          "RateLimit-Remaining": "0",
        },
      },
    );
  }

  const domain = normalizeDomain(request.nextUrl.searchParams.get("domain"));
  if (!domain) {
    return NextResponse.json(
      { error: "Enter a public domain such as example.com (without a path)." },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    const profile = await collectProfile(domain);

    // A name with no addresses, no nameservers and no mail is not a domain we
    // can report on. Saying so is more honest than returning a page of
    // findings that are all really just "this does not exist".
    const resolvesToSomething =
      profile.addresses.ipv4.length > 0 ||
      profile.addresses.ipv6.length > 0 ||
      profile.nameservers.value.length > 0 ||
      profile.mail.exchangers.length > 0;

    if (!resolvesToSomething && profile.addresses.status !== "unavailable") {
      return NextResponse.json(
        { error: `${domain} does not resolve. Check the spelling, or try the root domain.` },
        { status: 404, headers: NO_STORE },
      );
    }

    const report = buildFindings(profile);

    return NextResponse.json(
      { profile, report },
      {
        headers: {
          ...NO_STORE,
          "RateLimit-Limit": String(quota.limit),
          "RateLimit-Remaining": String(quota.remaining),
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "The lookup could not be completed. Please try again." },
      { status: 502, headers: NO_STORE },
    );
  }
}

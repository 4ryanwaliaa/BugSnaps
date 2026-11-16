/*
 * Where a visitor is paying from, for showing one checkout instead of two:
 * Razorpay in INR inside India, PayPal in USD everywhere else.
 *
 * The country comes from x-vercel-ip-country, which Vercel sets on every
 * request (and overwrites if a client sends its own). Without it - local
 * development, CI, another host - the answer is "intl".
 *
 * Reading a request header makes the calling page render per request. That is
 * the point: a statically cached page would show one visitor's country to
 * everyone. Server-only; client components take the result as a prop.
 */
import { headers } from "next/headers";
import type { Region } from "@/lib/plans";

/** An explicit choice (a query parameter), or null when it isn't one. */
export function parseRegion(value: unknown): Region | null {
  return value === "in" || value === "intl" ? value : null;
}

/** The visitor's region; `override` is their own explicit choice and wins. */
export async function visitorRegion(override?: unknown): Promise<Region> {
  const chosen = parseRegion(override);
  if (chosen) return chosen;
  const country = (await headers()).get("x-vercel-ip-country");
  return country?.trim().toUpperCase() === "IN" ? "in" : "intl";
}

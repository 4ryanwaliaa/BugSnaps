import { NextRequest, NextResponse } from "next/server";
import {
  resolve4,
  resolve6,
  resolveCaa,
  resolveMx,
  resolveNs,
  resolveTxt,
} from "node:dns/promises";

export const runtime = "nodejs";

type RecordResult<T> = T | [];

function normalizeDomain(input: string | null) {
  const domain = (input ?? "").trim().toLowerCase().replace(/\.$/, "");
  const labels = domain.split(".");
  const valid =
    domain.length <= 253 &&
    labels.length >= 2 &&
    labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));

  return valid ? domain : null;
}

async function record<T>(operation: () => Promise<T>): Promise<RecordResult<T>> {
  try {
    // Some DNS resolvers retry for a long time when a record type is blocked.
    // Keep the public tool responsive; an unavailable record is shown as absent.
    return await Promise.race([
      operation(),
      new Promise<[]>(resolve => setTimeout(() => resolve([]), 4_000)),
    ]);
  } catch {
    // A missing DNS record is a useful result, not an application error.
    return [];
  }
}

export async function GET(request: NextRequest) {
  const domain = normalizeDomain(request.nextUrl.searchParams.get("domain"));
  if (!domain) {
    return NextResponse.json(
      { error: "Enter a public domain such as example.com (without http:// or a path)." },
      { status: 400 },
    );
  }

  const [ipv4, ipv6, nameservers, mail, txt, dmarc, caa] = await Promise.all([
    record(() => resolve4(domain)),
    record(() => resolve6(domain)),
    record(() => resolveNs(domain)),
    record(() => resolveMx(domain)),
    record(() => resolveTxt(domain)),
    record(() => resolveTxt(`_dmarc.${domain}`)),
    record(() => resolveCaa(domain)),
  ]);

  const flattenedTxt = (txt as string[][]).map((value) => value.join(""));
  const flattenedDmarc = (dmarc as string[][]).map((value) => value.join(""));
  const spf = flattenedTxt.find((value) => value.toLowerCase().startsWith("v=spf1")) ?? null;
  const dmarcPolicy =
    flattenedDmarc.find((value) => value.toLowerCase().startsWith("v=dmarc1")) ?? null;

  return NextResponse.json({
    domain,
    analyzedAt: new Date().toISOString(),
    records: {
      ipv4,
      ipv6,
      nameservers,
      mail: (mail as { exchange: string; priority: number }[]).sort((a, b) => a.priority - b.priority),
      caa,
    },
    emailSecurity: {
      spf: Boolean(spf),
      dmarc: Boolean(dmarcPolicy),
      dmarcPolicy,
    },
    summary: {
      dnsRecords: (ipv4 as string[]).length + (ipv6 as string[]).length,
      nameservers: (nameservers as string[]).length,
      mailExchangers: (mail as unknown[]).length,
      certificateAuthorities: (caa as unknown[]).length,
    },
  });
}

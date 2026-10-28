import { timingSafeEqual } from "node:crypto";
import { server, replyError, validId } from "@/lib/endpointradar/server";
import { markMissing } from "@/lib/endpointradar/watchdog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Index bounds avoid silently timing out and claiming all devices were checked.
const MAX_DEVICES = 500;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const expected = Buffer.from(`Bearer ${secret || ""}`);
  const provided = Buffer.from(request.headers.get("authorization") || "");
  if (!secret || secret.length < 16 || provided.length !== expected.length || !timingSafeEqual(provided, expected)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { db } = server();
    const index = (await db.ref("watchdogDevices").get()).val() || {};
    const entries: Array<[string, string]> = [];
    for (const [wid, devices] of Object.entries(index)) {
      if (!validId(wid) || !devices || typeof devices !== "object" || Array.isArray(devices)) continue;
      for (const [did, enabled] of Object.entries(devices)) {
        if (enabled === true && validId(did)) entries.push([wid, did]);
        if (entries.length > MAX_DEVICES) return Response.json({ error: "Watchdog capacity exceeded; increase capacity or add paging." }, { status: 503 });
      }
    }
    const now = Date.now();
    for (let i = 0; i < entries.length; i += 10) {
      await Promise.all(entries.slice(i, i + 10).map(([wid, did]) => db.ref(`monitor/${wid}/${did}`).transaction(current => markMissing(current, now))));
    }
    return Response.json({ checked: entries.length });
  } catch (e) { return replyError(e); }
}

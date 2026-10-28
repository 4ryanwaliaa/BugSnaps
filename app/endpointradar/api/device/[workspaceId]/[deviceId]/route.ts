import { body, digest, HttpError, replyError, requireId, secretMatches, server, token, uid } from "@/lib/endpointradar/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = {params: Promise<{workspaceId:string; deviceId:string}>};
const plain = (x: unknown): x is Record<string, any> => Boolean(x) && typeof x === "object" && !Array.isArray(x);
function posture(scan: Record<string, any>) {
  const profiles = plain(scan.firewall) && plain(scan.firewall.profiles) ? scan.firewall.profiles : {};
  const values = ["Domain","Private","Public"].map(n => String(profiles[n]?.state ?? "unknown").toUpperCase());
  const firewall = values.some(s => s === "OFF") ? "Profile off" : values.every(s => s === "ON") ? "All profiles on" : "Unknown";
  const antivirus = typeof scan.antivirus?.status === "string" ? scan.antivirus.status.slice(0,100) : "Unknown";
  return {firewall,antivirus};
}
async function handle(request: Request, ctx: Params) {
  const {workspaceId,deviceId} = await ctx.params; requireId(workspaceId); requireId(deviceId);
  const ref = server().db.ref(`workspaces/${workspaceId}/devices/${deviceId}`); const secret = token(request);
  // Read only the credential before parsing an upload; never return it.
  const credential = (await server().db.ref(`deviceCredentials/${workspaceId}/${deviceId}`).get()).val();
  if (!credential?.enabled || !secretMatches(secret, credential.secretHash || "")) throw new HttpError(401, "Device authentication failed.");
  if (request.method === "GET") { const [name, schedule, requested] = await Promise.all([ref.child("name").get(), ref.child("intervalMinutes").get(), ref.child("scanRequestedAt").get()]); return Response.json({deviceId,name:name.val(),enabled:true,intervalMinutes:schedule.val(),scanRequestedAt:requested.val() || null}); }
  const input = await body(request);
  if (input.event === "scan_error") {
    const at = new Date().toISOString();
    const recorded = await server().db.ref(`monitor/${workspaceId}/${deviceId}`).transaction(current => {
      if (current === null) return null;
      if (!current.enabled) return;
      const id = `agent-error-${at.slice(0,10)}`;
      const alerts = {...current.alerts};
      if (!alerts[id]) alerts[id] = {kind:"agent_error",message:"The scheduled scan or upload failed. Check the device clock, scanner and Windows scheduled-task result.",createdAt:at};
      const keys = Object.keys(alerts).sort((a,b) => String(alerts[b].createdAt).localeCompare(String(alerts[a].createdAt)));
      for (const old of keys.slice(100)) delete alerts[old];
      return {...current,alerts};
    });
    if (!recorded.committed || !recorded.snapshot.exists()) throw new HttpError(503,"Could not record device failure.");
    // Failure events never count as successful scans or refresh reporting freshness.
    return Response.json({ok:true});
  }
  const scanId = typeof input.scanId === "string" ? input.scanId.toLowerCase() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(scanId) || !plain(input.scan) || !Array.isArray(input.scan.vulnerabilities) || input.scan.vulnerabilities.length > 1000) throw new HttpError(400, "Invalid scan or scan ID.");
  const scan = input.scan; const at = new Date().toISOString(); const alertId = uid();
  const captured = typeof scan.last_scan_at === "string" ? Date.parse(scan.last_scan_at) : NaN;
  if (!Number.isFinite(captured) || captured > Date.parse(at)) throw new HttpError(422, "A valid non-future scan capture timestamp is required. Check the device clock before scanning again.");
  const result = await ref.transaction(device => {
    if (device === null) return null;
    if (!device.enabled || !secretMatches(secret,device.secretHash || "")) return;
    const key = scanId.replaceAll("-", "");
    if (device.scans?.[key]) return device;
    if (device.latestCapturedAt && captured <= Date.parse(device.latestCapturedAt)) return;
    // A device can retry a lost response immediately, but cannot create scans at an unlimited rate.
    if (device.lastSeenAt && Date.parse(at) - Date.parse(device.lastSeenAt) < 10_000) return;
    const scans = device.scans || {}; const ordered = Object.values(scans) as Array<Record<string, any>>;
    ordered.sort((a,b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
    const before = ordered[0]?.scanJson ? posture(JSON.parse(ordered[0].scanJson)) : null; const after = posture(scan);
    const changes: string[] = [];
    if (before) for (const name of ["firewall","antivirus"] as const) if (before[name] !== after[name]) changes.push(`${name}: ${before[name]} → ${after[name]}`);
    scans[key] = {id:scanId,receivedAt:at,scanJson:JSON.stringify(scan)};
    device.latestScanId = key;
    const oldKeys = Object.keys(scans).filter(id => id !== device.latestScanId).sort((a,b) => String(scans[b].receivedAt).localeCompare(String(scans[a].receivedAt))).slice(9);
    for (const old of oldKeys) delete scans[old];
    device.scans = scans; device.latestCapturedAt = new Date(captured).toISOString(); device.lastSeenAt = at;
    if (changes.length) { device.alerts = {...device.alerts,[alertId]:{kind:"posture",message:changes.join("; "),createdAt:at}}; const keys = Object.keys(device.alerts).sort((a,b) => String(device.alerts[b].createdAt).localeCompare(String(device.alerts[a].createdAt))); for (const old of keys.slice(100)) delete device.alerts[old]; }
    return device;
  });
  const stored = result.snapshot.val()?.scans?.[scanId.replaceAll("-", "")];
  if (!result.committed || !stored) {
    const latest = result.snapshot.val()?.latestCapturedAt;
    if (latest && captured <= Date.parse(latest)) throw new HttpError(409, "Scan capture is older than or equal to the latest accepted capture.");
    throw new HttpError(429, "Upload rate is too high or device is unavailable; retry later.");
  }
  // A retry repairs a failed monitor update without making an old scan appear fresh.
  const monitor = await server().db.ref(`monitor/${workspaceId}/${deviceId}`).transaction(current => {
    if (current === null) return null;
    if (!current.enabled) return;
    if (current.lastSeenAt && Date.parse(current.lastSeenAt) >= Date.parse(stored.receivedAt)) return current;
    return {...current,lastSeenAt:stored.receivedAt,alertMissingSince:null};
  });
  if (!monitor.committed || !monitor.snapshot.val()) throw new HttpError(503, "Scan was stored, but reporting status could not be updated; retry this scan ID.");
  return Response.json({ok:true});
}
async function wrapped(request: Request, ctx: Params) { try { return await handle(request,ctx); } catch(e) { return replyError(e); } }
export const GET = wrapped; export const POST = wrapped;

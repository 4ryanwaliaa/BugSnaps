import { body, boundedName, digest, HttpError, interval, membership, randomSecret, replyError, requireId, server, uid, user } from "@/lib/endpointradar/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request, ctx: {params: Promise<{path: string[]}>}) {
  const identity = await user(request); const key = digest(identity.uid); const {db} = server();
  const p = (await ctx.params).path; const method = request.method;
  if (p.length === 1 && p[0] === "workspaces") {
    if (method === "POST") {
      const name = boundedName((await body(request)).name, "Workspace name"); const id = uid(); const at = new Date().toISOString();
      // Reserve a bounded workspace slot before writing any workspace data.
      const reserved = await db.ref(`users/${key}/workspaces`).transaction(current => { const existing = current || {}; if (Object.keys(existing).length >= 10) return; return {...existing,[id]:true}; });
      if (!reserved.committed) throw new HttpError(429, "Workspace limit reached.");
      const global = await db.ref("workspaceSlots").transaction(current => { const slots = current || {}; if (Object.keys(slots).length >= 25) return; return {...slots,[id]:true}; });
      if (!global.committed) { await db.ref(`users/${key}/workspaces/${id}`).remove(); throw new HttpError(429, "Service workspace capacity reached."); }
      await db.ref().update({[`workspaces/${id}/name`]: name, [`workspaces/${id}/createdAt`]: at, [`workspaces/${id}/access/members/${key}`]: {role:"admin",email:identity.email!.toLowerCase()}});
      return Response.json({workspace: {id,name,role: "admin"}}, {status: 201});
    }
    if (method === "GET") {
      const ids = Object.keys((await db.ref(`users/${key}/workspaces`).get()).val() || {});
      const workspaces = (await Promise.all(ids.map(async id => { if (!/^[a-f0-9]{36}$/.test(id)) return null; const ref = db.ref(`workspaces/${id}`); const [name, membership] = await Promise.all([ref.child("name").get(),ref.child(`access/members/${key}/role`).get()]); const role = membership.val(); return role === "admin" || role === "viewer" ? {id,name:name.val(),role} : null; }))).filter(Boolean);
      return Response.json({workspaces});
    }
  }
  if (p.length === 2 && p[0] === "invites" && p[1] === "accept" && method === "POST") {
    const input = await body(request); const id = requireId(String(input.inviteId || ""));
    const index = (await db.ref(`inviteIndex/${id}`).get()).val(); if (!index || !/^[a-f0-9]{36}$/.test(index)) throw new HttpError(404, "Invitation is invalid or expired.");
    const now = Date.now(); const email = identity.email!.toLowerCase(); const access = db.ref(`workspaces/${index}/access`);
    const claimed = await access.transaction(current => {
      if (current === null) return null;
      const inv = current.invites?.[id];
      if (!inv || inv.email !== email || inv.expiresAt < now || inv.claimedBy || inv.revoked || (inv.role !== "admin" && inv.role !== "viewer")) return;
      const previous = current.members?.[key];
      current.members = {...current.members,[key]:{email,role:previous?.role === "admin" ? "admin" : inv.role}};
      current.invites[id] = {...inv,claimedBy:key}; return current;
    });
    if (!claimed.committed || claimed.snapshot.val()?.invites?.[id]?.claimedBy !== key) throw new HttpError(404, "Invitation is invalid or expired.");
    await db.ref(`users/${key}/workspaces/${index}`).set(true);
    await db.ref(`inviteIndex/${id}`).remove();
    return Response.json({ok:true,workspaceId:index});
  }
  if (p[0] !== "workspaces" || !p[1]) throw new HttpError(404, "Not found.");
  const wid = requireId(p[1]); const role = await membership(wid, identity.uid, method !== "GET"); const base = `workspaces/${wid}`;
  if (p.length === 2 && method === "GET") {
    const ref = db.ref(base);
    const [nameSnap,slotsSnap,accessSnap,reviewSnap] = await Promise.all([ref.child("name").get(),ref.child("deviceSlots").get(),role === "admin" ? ref.child("access/members").get() : Promise.resolve(null),ref.child("review/meta").get()]);
    const ids = Object.keys(slotsSnap.val() || {});
    const rows = await Promise.all(ids.map(async id => {
      if (!/^[a-f0-9]{36}$/.test(id)) return null;
      const d = ref.child(`devices/${id}`);
      const [name,intervalMinutes,enabled,createdAt,lastSeenAt,scanRequestedAt,latestId,alerts] = await Promise.all(["name","intervalMinutes","enabled","createdAt","lastSeenAt","scanRequestedAt","latestScanId","alerts"].map(field => d.child(field).get()));
      const scanEntry = latestId.val() ? (await d.child(`scans/${latestId.val()}`).get()).val() : null;
      let latestScan = null; if (scanEntry) { try { latestScan = {id:scanEntry.id,receivedAt:scanEntry.receivedAt,scan:JSON.parse(scanEntry.scanJson)}; } catch { /* Bad data is not returned as a clean scan. */ } }
      const monitorAlerts = (await db.ref(`monitor/${wid}/${id}/alerts`).get()).val() || {};
      return {device:{id,name:name.val(),intervalMinutes:intervalMinutes.val(),enabled:enabled.val(),createdAt:createdAt.val(),lastSeenAt:lastSeenAt.val(),scanRequestedAt:scanRequestedAt.val(),latestScan},alerts:[...Object.entries(alerts.val() || {}),...Object.entries(monitorAlerts)].map(([alertId,alert]) => ({id:alertId,deviceId:id,...(alert as object)}))};
    }));
    const devices = rows.filter(Boolean).map(row => row!.device);
    const alerts = rows.filter(Boolean).flatMap(row => row!.alerts);
    const members = role === "admin" ? Object.entries(accessSnap?.val() || {}).map(([id, value]) => ({id,...(value as object)})) : [];
    const reviewMeta = reviewSnap.val();
    const review = reviewMeta?.at ? {at:reviewMeta.at,revision:reviewMeta.revision,deviceIds:Object.keys(reviewMeta.deviceIds || {})} : null;
    return Response.json({workspace:{id:wid,name:nameSnap.val(),role},devices,alerts,members,review});
  }
  if (p.length === 3 && p[2] === "review" && method === "POST") {
    const ref = db.ref(base); const ids = Object.keys((await ref.child("deviceSlots").get()).val() || {}).filter(id => /^[a-f0-9]{36}$/.test(id));
    const pairs = await Promise.all(ids.map(async did => {
      const device = ref.child(`devices/${did}`); const latest = (await device.child("latestScanId").get()).val();
      if (!latest || !/^[a-f0-9]{32}$/.test(latest)) return null;
      const scan = (await device.child(`scans/${latest}`).get()).val();
      if (!scan || typeof scan.scanJson !== "string" || Buffer.byteLength(scan.scanJson, "utf8") > 131072) return null;
      return [did,{id:scan.id,receivedAt:scan.receivedAt,scanJson:scan.scanJson}] as const;
    }));
    const entries = pairs.filter((item): item is NonNullable<typeof item> => item !== null);
    if (!entries.length) throw new HttpError(400, "There are no valid device results to include in the review.");
    // Verify admin still holds access immediately before replacing the snapshot.
    await membership(wid, identity.uid, true);
    const at = new Date().toISOString(); const revision = uid();
    await ref.child("review").set({meta:{at,revision,deviceIds:Object.fromEntries(entries.map(([did]) => [did,true]))},devices:Object.fromEntries(entries.map(([did, entry]) => [did,{...entry,at,revision}]))});
    return Response.json({ok:true,at,revision,deviceCount:entries.length});
  }
  if (p.length === 4 && p[2] === "review" && method === "GET") {
    const did = requireId(p[3]); const snapshot = (await db.ref(`${base}/review/devices/${did}`).get()).val();
    if (!snapshot || typeof snapshot.scanJson !== "string") throw new HttpError(404, "No previous review for that device.");
    try { return Response.json({at:snapshot.at,revision:snapshot.revision,scan:{id:snapshot.id,receivedAt:snapshot.receivedAt,scan:JSON.parse(snapshot.scanJson)}}); }
    catch { throw new HttpError(500, "Saved review could not be read."); }
  }
  if (p.length === 3 && p[2] === "invites" && method === "POST") {
    const input = await body(request); const email = String(input.email || "").trim().toLowerCase(); const inviteRole = input.role;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || (inviteRole !== "admin" && inviteRole !== "viewer")) throw new HttpError(400, "Provide an email address and valid role.");
    const id = uid(); const now = Date.now();
    const existingInvites = (await db.ref(`${base}/access/invites`).get()).val() || {};
    const expiredIds = Object.entries(existingInvites).filter(([, invite]) => (invite as any).expiresAt < now).map(([inviteId]) => inviteId);
    const created = await db.ref(`${base}/access`).transaction(current => {
      if (current === null) return null;
      if (current.members?.[key]?.role !== "admin") return;
      const invites = current.invites || {};
      for (const [inviteId, invite] of Object.entries(invites)) if ((invite as any).expiresAt < now) delete invites[inviteId];
      if (Object.keys(invites).length >= 100) return;
      invites[id] = {email,role:inviteRole,expiresAt:now+7*86400000}; current.invites = invites; return current;
    });
    if (!created.committed || !created.snapshot.val()?.invites?.[id]) throw new HttpError(429, "Invitation could not be created or the invitation limit was reached.");
    const cleanup: Record<string, null> = {};
    for (const inviteId of expiredIds) if (/^[a-f0-9]{36}$/.test(inviteId)) cleanup[`inviteIndex/${inviteId}`] = null;
    if (Object.keys(cleanup).length) await db.ref().update(cleanup);
    await db.ref(`inviteIndex/${id}`).set(wid); return Response.json({inviteId:id}, {status:201});
  }
  if (p.length === 5 && p[2] === "members" && p[4] === "revoke" && method === "POST") {
    const memberId = p[3]; if (!/^[a-f0-9]{64}$/.test(memberId)) throw new HttpError(404, "Member not found.");
    if (memberId === key) throw new HttpError(400, "You cannot remove your own access.");
    const changed = await db.ref(`${base}/access`).transaction(current => {
      if (current === null) return null;
      if (current.members?.[key]?.role !== "admin" || !current.members?.[memberId]) return;
      const email = current.members[memberId].email; delete current.members[memberId];
      for (const invite of Object.values(current.invites || {}) as any[]) if (invite.email === email) invite.revoked = true;
      return current;
    });
    if (!changed.committed || !changed.snapshot.val() || changed.snapshot.val().members?.[memberId]) throw new HttpError(404, "Member not found or access denied.");
    await db.ref(`users/${memberId}/workspaces/${wid}`).remove();
    return Response.json({ok:true});
  }
  if (p.length === 3 && p[2] === "devices" && method === "POST") {
    const input = await body(request); const id = uid(); const secret = randomSecret();
    const d = {name:boundedName(input.name,"Device name"),intervalMinutes:interval(input.intervalMinutes),enabled:true,createdAt:new Date().toISOString(),secretHash:digest(secret)};
    const allocated = await db.ref(`${base}/deviceSlots`).transaction(current => { if (current && Object.keys(current).length >= 20) return; return {...current,[id]:true}; });
    if (!allocated.committed) throw new HttpError(429, "Workspace device limit reached.");
    await db.ref().update({[`${base}/devices/${id}`]:d,[`watchdogDevices/${wid}/${id}`]:true,[`deviceCredentials/${wid}/${id}`]:{secretHash:d.secretHash,enabled:true},[`monitor/${wid}/${id}`]:{name:d.name,enabled:true,intervalMinutes:d.intervalMinutes,createdAt:d.createdAt}}); return Response.json({deviceId:id,secret}, {status:201});
  }
  if (p.length >= 4 && p[2] === "devices") {
    const did = requireId(p[3]); const ref = db.ref(`${base}/devices/${did}`);
    if (!(await ref.get()).exists()) throw new HttpError(404, "Device not found.");
    if (p.length === 5 && p[4] === "scans" && method === "GET") { const scans = (await ref.child("scans").get()).val() || {}; return Response.json({scans:Object.values(scans).map((entry: any) => ({...entry, scan: JSON.parse(entry.scanJson), scanJson: undefined}))}); }
    if (p.length === 5 && p[4] === "schedule" && method === "POST") { const minutes = interval((await body(request)).intervalMinutes); await db.ref().update({[`${base}/devices/${did}/intervalMinutes`]:minutes,[`monitor/${wid}/${did}/intervalMinutes`]:minutes}); return Response.json({ok:true}); }
    if (p.length === 5 && p[4] === "retest" && method === "POST") { await ref.child("scanRequestedAt").set(new Date().toISOString()); return Response.json({ok:true}); }
    if (p.length === 5 && p[4] === "disable" && method === "POST") { await db.ref().update({[`${base}/devices/${did}/enabled`]:false,[`deviceCredentials/${wid}/${did}/enabled`]:false,[`monitor/${wid}/${did}/enabled`]:false}); return Response.json({ok:true}); }
  }
  throw new HttpError(404, "Not found.");
}
async function wrapped(request: Request, ctx: {params: Promise<{path:string[]}>}) { try { return await handle(request,ctx); } catch(e) { return replyError(e); } }
export const GET = wrapped; export const POST = wrapped;

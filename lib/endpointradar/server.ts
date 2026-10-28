import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Access is rooted to endpointRadar. Existing database rules must deny parent reads and writes.
function scopedDb(app: ReturnType<typeof initializeApp>) {
  const db = getDatabase(app);
  return {ref: (path = "") => db.ref(path ? `endpointRadar/${path}` : "endpointRadar")};
}
export function server() {
  // Explicit local-only emulators; production can never use this bypass.
  if (process.env.NODE_ENV !== "production" && process.env.ENDPOINTRADAR_ALLOW_EMULATOR === "true" && process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
    const app = getApps().find(a => a.name === "endpoint-radar") ?? initializeApp({projectId: "demo-endpointradar", databaseURL: "https://demo-endpointradar-default-rtdb.firebaseio.com"}, "endpoint-radar");
    return {auth: getAuth(app), db: scopedDb(app)};
  }
  const json = process.env.ENDPOINTRADAR_SERVICE_ACCOUNT_JSON;
  const databaseURL = process.env.ENDPOINTRADAR_DATABASE_URL;
  if (!json || !databaseURL || process.env.ENDPOINTRADAR_DATABASE_LOCKED !== "true") throw new HttpError(503, "Managed workspace is not configured.");
  if (!/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.firebasedatabase\.app$/i.test(databaseURL) && !/^https:\/\/[a-z0-9-]+\.firebaseio\.com$/i.test(databaseURL)) throw new HttpError(503, "Managed workspace database configuration is invalid.");
  const app = getApps().find(a => a.name === "endpoint-radar") ?? initializeApp({ credential: cert(JSON.parse(json)), databaseURL }, "endpoint-radar");
  return { auth: getAuth(app), db: scopedDb(app) };
}
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function replyError(error: unknown) {
  if (error instanceof HttpError) return Response.json({error: error.message}, {status: error.status});
  return Response.json({error: "The request could not be completed."}, {status: 500});
}
export function uid() { return randomBytes(18).toString("hex"); }
export function validId(id: string) { return /^[a-f0-9]{36}$/.test(id); }
export function requireId(id: string) { if (!validId(id)) throw new HttpError(404, "Not found."); return id; }
export async function body(request: Request, max = 131_072): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > max) throw new HttpError(413, "Request too large.");
  const reader = request.body?.getReader(); if (!reader) throw new HttpError(400, "Missing request body.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const next = await reader.read(); if (next.done) break; size += next.value.byteLength; if (size > max) { await reader.cancel(); throw new HttpError(413, "Request too large."); } chunks.push(next.value); }
  const bytes = Buffer.concat(chunks).toString("utf8");
  let parsed: unknown; try { parsed = JSON.parse(bytes); } catch { throw new HttpError(400, "Invalid JSON."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new HttpError(400, "Expected a JSON object.");
  return parsed as Record<string, unknown>;
}
export function token(request: Request) { const m = /^Bearer ([^\s]+)$/.exec(request.headers.get("authorization") ?? ""); if (!m) throw new HttpError(401, "Authentication required."); return m[1]; }
export async function user(request: Request) {
  const {auth} = server();
  try { const identity = await auth.verifyIdToken(token(request), true); if (!identity.email || !identity.email_verified) throw new HttpError(403, "Verify your email before using managed workspaces."); return identity; }
  catch(e) { if (e instanceof HttpError) throw e; throw new HttpError(401, "Sign in again."); }
}
export const digest = (secret: string) => createHash("sha256").update(secret).digest("hex");
export function secretMatches(secret: string, hash: string) {
  if (!/^[a-f0-9]{64}$/.test(hash)) return false;
  return timingSafeEqual(Buffer.from(digest(secret), "hex"), Buffer.from(hash, "hex"));
}
export function randomSecret() { return randomBytes(32).toString("base64url"); }
export function boundedName(v: unknown, label: string) { if (typeof v !== "string" || !v.trim() || v.trim().length > 100) throw new HttpError(400, `${label} must be 1 to 100 characters.`); return v.trim(); }
export function interval(v: unknown) { if (!Number.isInteger(v) || Number(v) < 15 || Number(v) > 10080) throw new HttpError(400, "Interval must be 15 to 10080 minutes."); return Number(v); }
export async function membership(wid: string, userId: string, admin = false) {
  requireId(wid); const {db} = server(); const role = (await db.ref(`workspaces/${wid}/access/members/${digest(userId)}/role`).get()).val();
  if (role !== "admin" && role !== "viewer") throw new HttpError(404, "Workspace not found.");
  if (admin && role !== "admin") throw new HttpError(403, "Administrator access required."); return role as "admin" | "viewer";
}

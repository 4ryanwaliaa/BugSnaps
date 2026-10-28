"use client";

import { loadApp } from "@/lib/firebase-auth";
import { analyzePhishingUrl } from "@/lib/phishing-detector";

export type ReviewStatus = "unresolved" | "suspicious" | "legitimate";
export type TeamRole = "admin" | "member";
export type Review = {
  id: string; url: string; hostname: string; sender: string; message: string; displayed: string;
  status: ReviewStatus; notes: string; submittedBy: string; submittedAt: number; updatedBy: string; updatedAt: number;
};
export type Team = { name: string; owner: string; members: Record<string, TeamRole>; reviews: Review[] };

const validKey = (key: string) => /^[A-Za-z0-9_-]{1,128}$/.test(key);
function teamPath(id: string) {
  if (!validKey(id)) throw new Error("Enter a valid team ID.");
  return `phishlensTeams/${id}`;
}
async function database() {
  const [app, db, auth] = await Promise.all([loadApp(), import("firebase/database"), import("firebase/auth")]);
  const user = auth.getAuth(app).currentUser;
  if (!user) throw new Error("Sign in first.");
  return { db, handle: db.getDatabase(app), user };
}
function waitForRead<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Couldn't reach team history. Try again.")), 12000))]);
}
export async function createTeam(name: string): Promise<string> {
  name = name.trim();
  if (!name || name.length > 100) throw new Error("Enter a team name of up to 100 characters.");
  const { db, handle, user } = await database();
  const reference = db.push(db.ref(handle, "phishlensTeams"));
  if (!reference.key) throw new Error("Couldn't create a team ID.");
  await db.set(reference, { name, owner: user.uid, members: { [user.uid]: "admin" } });
  return reference.key;
}
export async function getTeam(id: string): Promise<Team> {
  const { db, handle } = await database();
  const snapshot = await waitForRead(db.get(db.ref(handle, teamPath(id))));
  if (!snapshot.exists()) throw new Error("Team not found, or you don't have access.");
  const data = snapshot.val();
  const reviews = Object.entries(data.reviews ?? {}).map(([key, value]) => ({ ...(value as Omit<Review, "id">), id: key })).sort((a, b) => b.submittedAt - a.submittedAt);
  return { name: data.name, owner: data.owner, members: data.members ?? {}, reviews };
}
export async function setMember(id: string, uid: string, role: TeamRole | null) {
  if (!validKey(uid)) throw new Error("Enter a valid Firebase user ID.");
  const { db, handle } = await database();
  await db.set(db.ref(handle, `${teamPath(id)}/members/${uid}`), role);
}
export async function submitReview(id: string, input: { url: string; sender: string; message: string; displayed: string }) {
  const parsed = analyzePhishingUrl(input.url);
  if (!parsed.ok) throw new Error(parsed.error);
  if (input.sender.length > 320 || input.message.length > 10000 || input.displayed.length > 4096) throw new Error("One of the fields is too long.");
  const { db, handle, user } = await database();
  const timestamp = db.serverTimestamp();
  await db.set(db.push(db.ref(handle, `${teamPath(id)}/reviews`)), {
    url: input.url.trim(), hostname: parsed.hostname, sender: input.sender.trim(), message: input.message, displayed: input.displayed,
    status: "unresolved", notes: "", submittedBy: user.uid, submittedAt: timestamp, updatedBy: user.uid, updatedAt: timestamp,
  });
}
export async function updateReview(id: string, review: Review, status: ReviewStatus, notes: string) {
  if (!validKey(review.id) || notes.length > 4000) throw new Error("Review or action note is invalid.");
  const { db, handle, user } = await database();
  await db.update(db.ref(handle, `${teamPath(id)}/reviews/${review.id}`), { status, notes, updatedBy: user.uid, updatedAt: db.serverTimestamp() });
}

export async function deleteReview(id: string, reviewId: string) {
  if (!validKey(reviewId)) throw new Error("Invalid review ID.");
  const { db, handle } = await database();
  await db.remove(db.ref(handle, `${teamPath(id)}/reviews/${reviewId}`));
}

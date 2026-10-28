"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { friendlyError, onUser, signInEmail, signOutUser, signUpEmail } from "@/lib/firebase-auth";
import { analyzePhishingMessage } from "@/lib/phishlens-message";
import { createTeam, deleteReview, getTeam, setMember, submitReview, updateReview, type Review, type ReviewStatus, type Team, type TeamRole } from "@/lib/phishlens-team";

const field = "mt-2 w-full rounded-xl border border-white/10 bg-[#090f15] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-300/60 focus:outline-none";
const button = "rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-[#092126] hover:bg-cyan-200 disabled:opacity-50";
const panel = "rounded-2xl border border-white/10 bg-white/[.03] p-5";
function errorText(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === "PERMISSION_DENIED" || code === "database/permission-denied") return "Access denied. Check the team ID and ask its administrator to add your user ID.";
  if (code?.startsWith("auth/")) return friendlyError(error);
  return error instanceof Error ? error.message : "Something went wrong. Try again.";
}

function ReviewCard({ review, admin, onSave, onDelete }: { review: Review; admin: boolean; onSave: (review: Review, status: ReviewStatus, notes: string) => Promise<void>; onDelete: (review: Review) => Promise<void> }) {
  const [status, setStatus] = useState<ReviewStatus>(review.status);
  const [notes, setNotes] = useState(review.notes);
  const [busy, setBusy] = useState(false);
  const analysis = useMemo(() => analyzePhishingMessage({ url: review.url, displayedLink: review.displayed, messageText: review.message }), [review.url, review.displayed, review.message]);
  useEffect(() => { setStatus(review.status); setNotes(review.notes); }, [review.status, review.notes]);
  return <article className={panel}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="break-all text-sm font-semibold text-white">{review.hostname}</p><p className="mt-1 text-xs text-zinc-400">Submitted {new Date(review.submittedAt).toLocaleString()} · {review.status}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">{review.status}</span></div>
    <dl className="mt-4 space-y-2 text-sm text-zinc-300"><div><dt className="text-xs text-zinc-500">Link destination</dt><dd className="break-all">{review.url}</dd></div>{review.displayed && <div><dt className="text-xs text-zinc-500">Displayed address</dt><dd className="break-all">{review.displayed}</dd></div>}{review.sender && <div><dt className="text-xs text-zinc-500">Sender</dt><dd className="break-all">{review.sender}</dd></div>}{review.message && <div><dt className="text-xs text-zinc-500">Message text</dt><dd className="whitespace-pre-wrap break-words">{review.message}</dd></div>}</dl>
    {analysis.ok && <div className="mt-4 rounded-xl border border-cyan-300/10 bg-cyan-300/[.035] p-3"><p className="text-xs font-semibold text-cyan-200">Local warning signs</p>{analysis.findings.length ? <ul className="mt-2 space-y-2">{analysis.findings.map((finding) => <li key={finding.id} className="text-xs leading-relaxed text-zinc-300"><strong>{finding.title}:</strong> {finding.detail}</li>)}</ul> : <p className="mt-2 text-xs text-zinc-400">No listed patterns found. This does not mean the message is safe.</p>}</div>}
    <p className="mt-4 text-xs text-zinc-500">Last updated {new Date(review.updatedAt).toLocaleString()} · User ID {review.updatedBy}</p>
    {admin ? <div className="mt-4 grid gap-3"><label className="text-xs text-zinc-400">Decision<select className={field} value={status} onChange={(event) => setStatus(event.target.value as ReviewStatus)}><option value="unresolved">Unresolved</option><option value="suspicious">Suspicious</option><option value="legitimate">Legitimate</option></select></label><label className="text-xs text-zinc-400">Action taken or review notes<textarea className={field} rows={3} maxLength={4000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button className={button} disabled={busy} onClick={async () => { setBusy(true); try { await onSave(review, status, notes); } finally { setBusy(false); } }}>Save decision</button><button type="button" className="text-left text-xs text-rose-300 hover:underline" disabled={busy} onClick={() => { if (window.confirm("Delete this report and its recorded decision?")) void onDelete(review); }}>Delete report</button></div> : <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-300"><span className="text-zinc-500">Action taken: </span>{review.notes || "Not recorded yet."}</p>}
  </article>;
}

export function PhishLensTeam() {
  const [user, setUser] = useState<User | null>(null);
  const sessionVersion = useRef(0);
  const sessionUser = useRef<string | null | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [teamId, setTeamId] = useState(""); const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState(""); const [uid, setUid] = useState(""); const [role, setRole] = useState<TeamRole>("member");
  const [url, setUrl] = useState(""); const [sender, setSender] = useState(""); const [displayed, setDisplayed] = useState(""); const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState(""); const [error, setError] = useState("");
  useEffect(() => {
    let stop: (() => void) | undefined; let cancelled = false;
    onUser((next) => {
      if (cancelled) return;
      const nextUid = next?.uid ?? null;
      if (sessionUser.current !== nextUid) {
        sessionUser.current = nextUid;
        sessionVersion.current += 1;
        setTeam(null); setTeamId(""); setTeamName(""); setUid(""); setRole("member");
        setUrl(""); setSender(""); setDisplayed(""); setMessage("");
        setEmail(""); setPassword(""); setNotice(""); setError(""); setBusy(false);
      }
      setUser(next); setReady(true);
    }).then((unsubscribe) => { if (cancelled) unsubscribe(); else stop = unsubscribe; }).catch(() => { if (!cancelled) { setReady(true); setError("Couldn't connect to sign-in."); } });
    return () => { cancelled = true; sessionVersion.current += 1; stop?.(); };
  }, []);
  const admin = !!user && team?.members[user.uid] === "admin";
  const repeatDomains = useMemo(() => {
    const counts = new Map<string, number>(); for (const item of team?.reviews ?? []) counts.set(item.hostname, (counts.get(item.hostname) ?? 0) + 1);
    return [...counts].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]);
  }, [team]);
  const repeatSenders = useMemo(() => {
    const counts = new Map<string, number>(); for (const item of team?.reviews ?? []) { const senderKey = item.sender.trim().toLowerCase(); if (senderKey) counts.set(senderKey, (counts.get(senderKey) ?? 0) + 1); }
    return [...counts].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]);
  }, [team]);
  async function run(action: (isCurrent: () => boolean) => Promise<void>, success?: string) {
    const version = sessionVersion.current;
    const isCurrent = () => version === sessionVersion.current;
    setBusy(true); setError(""); setNotice("");
    try { await action(isCurrent); if (isCurrent() && success) setNotice(success); }
    catch (err) { if (isCurrent()) setError(errorText(err)); }
    finally { if (isCurrent()) setBusy(false); }
  }
  async function refresh(id = teamId.trim()) {
    const version = sessionVersion.current;
    const nextTeam = await getTeam(id);
    if (version === sessionVersion.current) { setTeam(nextTeam); setTeamId(id); }
  }
  function signIn(event: FormEvent, create: boolean) { event.preventDefault(); void run(async () => { if (create) await signUpEmail(email, password); else await signInEmail(email, password); }, create ? "Account created. Share your user ID with your team's administrator." : undefined); }
  return <main className="mx-auto max-w-5xl px-5 pt-28 pb-20 text-white">
    <a href="/phishing-detector" className="text-sm text-cyan-300 hover:underline">← Back to PhishLens</a><h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Team review inbox</h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">Report suspicious messages, record a decision and spot repeated senders or domains. Team members can read submitted content; do not include passwords or one-time codes.</p>
    {(error || notice) && <p role={error ? "alert" : "status"} className={`mt-5 rounded-xl border p-4 text-sm ${error ? "border-rose-400/30 text-rose-200" : "border-emerald-400/30 text-emerald-200"}`}>{error || notice}</p>}
    {!ready ? <p className="mt-8 text-zinc-400">Loading sign-in…</p> : !user ? <form onSubmit={(event) => signIn(event, false)} className={`${panel} mt-8 max-w-xl space-y-4`}><h2 className="font-semibold">Sign in or create an account</h2><label className="block text-sm text-zinc-300">Email<input className={field} type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="block text-sm text-zinc-300">Password<input className={field} type="password" required minLength={6} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><div className="flex flex-wrap gap-3"><button disabled={busy} className={button}>Sign in</button><button type="button" disabled={busy} onClick={(event) => signIn(event, true)} className="rounded-xl border border-white/15 px-4 py-3 text-sm hover:bg-white/5">Create account</button></div></form> : <>
      <div className={`${panel} mt-7 flex flex-wrap items-center justify-between gap-4`}><div><p className="text-sm">Signed in as {user.email || "Firebase user"}</p><p className="mt-1 break-all text-xs text-zinc-400">Your user ID: {user.uid}</p></div><button onClick={() => void run(async () => { await signOutUser(); })} className="text-sm text-cyan-300 hover:underline">Sign out</button></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><form className={panel} onSubmit={(event) => { event.preventDefault(); void run(() => refresh()); }}><h2 className="font-semibold">Open a team</h2><p className="mt-2 text-xs text-zinc-400">Ask your administrator for the team ID and share your user ID above so they can add you.</p><input className={field} aria-label="Team ID" placeholder="Team ID" value={teamId} onChange={(event) => { sessionVersion.current += 1; setBusy(false); setTeamId(event.target.value); setTeam(null); setUrl(""); setSender(""); setDisplayed(""); setMessage(""); setUid(""); setNotice(""); setError(""); }} /><button className={`${button} mt-3`} disabled={busy}>Open inbox</button></form><form className={panel} onSubmit={(event) => { event.preventDefault(); void run(async (isCurrent) => { const id = await createTeam(teamName); if (!isCurrent()) return; setTeamId(id); await refresh(id); if (isCurrent()) setTeamName(""); }, "Team created. Save the team ID and share it with your members."); }}><h2 className="font-semibold">Create a team</h2><p className="mt-2 text-xs text-zinc-400">You become its administrator and decide who can join.</p><input className={field} aria-label="New team name" maxLength={100} placeholder="Team name" value={teamName} onChange={(event) => setTeamName(event.target.value)} /><button className={`${button} mt-3`} disabled={busy}>Create team</button></form></div>
      {team && <section className="mt-8 space-y-5"><div><h2 className="text-2xl font-semibold">{team.name}</h2><p className="mt-1 break-all text-xs text-zinc-400">Team ID: {teamId} · Your role: {admin ? "administrator" : "member"}</p></div>
        {admin && <form className={panel} onSubmit={(event) => { event.preventDefault(); void run(async (isCurrent) => { await setMember(teamId, uid.trim(), role); if (!isCurrent()) return; setUid(""); await refresh(); }, "Team member updated."); }}><h3 className="font-semibold">Manage team access</h3><p className="mt-2 text-xs text-zinc-400">Add someone by their exact user ID. Everyone on the team can read the inbox and message text. Administrators can also change decisions and membership.</p><div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto_auto]"><input className={field} aria-label="Member user ID" placeholder="User ID" value={uid} onChange={(event) => setUid(event.target.value)} /><select className={field} aria-label="Member role" value={role} onChange={(event) => setRole(event.target.value as TeamRole)}><option value="member">Member</option><option value="admin">Administrator</option></select><button className={`${button} mt-2`} disabled={busy}>Add or update</button></div><ul className="mt-4 space-y-2 text-xs text-zinc-400">{Object.entries(team.members).map(([id, memberRole]) => <li key={id} className="flex flex-wrap items-center justify-between gap-2"><span className="break-all">{id} · {memberRole}{id === team.owner ? " · owner" : ""}</span>{id !== team.owner && <button type="button" className="text-rose-300 hover:underline" onClick={() => void run(async (isCurrent) => { await setMember(teamId, id, null); if (!isCurrent()) return; if (id === user.uid) setTeam(null); else await refresh(); }, "Access removed.")}>Remove</button>}</li>)}</ul></form>}
        <form className={panel} onSubmit={(event) => { event.preventDefault(); void run(async (isCurrent) => { await submitReview(teamId, { url, sender, displayed, message }); if (!isCurrent()) return; setUrl(""); setSender(""); setDisplayed(""); setMessage(""); await refresh(); }, "Report submitted to your team."); }}><h3 className="font-semibold">Report a message</h3><p className="mt-2 text-xs text-zinc-400">These details are saved to the shared team inbox. Submit only information your team is authorized to store.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm text-zinc-300">Link destination<input className={field} required maxLength={4096} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" /></label><label className="text-sm text-zinc-300">Displayed address (optional)<input className={field} maxLength={4096} value={displayed} onChange={(event) => setDisplayed(event.target.value)} /></label><label className="text-sm text-zinc-300 sm:col-span-2">Sender (optional)<input className={field} maxLength={320} value={sender} onChange={(event) => setSender(event.target.value)} /></label><label className="text-sm text-zinc-300 sm:col-span-2">Relevant message text (optional)<textarea className={field} rows={4} maxLength={10000} value={message} onChange={(event) => setMessage(event.target.value)} /></label></div><button className={`${button} mt-4`} disabled={busy}>Submit report</button></form>
        <div className={panel}><h3 className="font-semibold">Reports and repeated patterns</h3><p className="mt-2 text-sm text-zinc-400">{team.reviews.length} reports · {team.reviews.filter((item) => item.status === "unresolved").length} unresolved · {team.reviews.filter((item) => item.status === "suspicious").length} suspicious · {team.reviews.filter((item) => item.status === "legitimate").length} legitimate</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-semibold text-zinc-300">Repeated domains</p>{repeatDomains.length ? repeatDomains.map(([name, count]) => <p key={name} className="mt-1 break-all text-sm text-zinc-400">{name} · {count} reports</p>) : <p className="mt-1 text-sm text-zinc-500">None yet</p>}</div><div><p className="text-xs font-semibold text-zinc-300">Repeated senders</p>{repeatSenders.length ? repeatSenders.map(([name, count]) => <p key={name} className="mt-1 break-all text-sm text-zinc-400">{name} · {count} reports</p>) : <p className="mt-1 text-sm text-zinc-500">None yet</p>}</div></div></div>
        <div className="flex items-center justify-between"><h3 className="text-xl font-semibold">Review history</h3><button className="text-sm text-cyan-300 hover:underline" onClick={() => void run(() => refresh())}>Refresh</button></div>{team.reviews.length ? team.reviews.map((item) => <ReviewCard key={item.id} review={item} admin={admin} onSave={async (review, status, notes) => { await run(async (isCurrent) => { await updateReview(teamId, review, status, notes); if (isCurrent()) await refresh(); }, "Decision saved."); }} onDelete={async (review) => { await run(async (isCurrent) => { await deleteReview(teamId, review.id); if (isCurrent()) await refresh(); }, "Report deleted."); }} />) : <p className="text-sm text-zinc-400">No reports yet.</p>}
      </section>}
    </>}
  </main>;
}

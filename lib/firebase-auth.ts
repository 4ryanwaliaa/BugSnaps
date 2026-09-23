/*
 * Sign-in for MyPentest, on bugsnaps.in.
 *
 * Firebase project `mypentest-bugsnaps`: Authentication for identity, and the
 * Realtime Database for each user's private scan history (lib/mypentest/
 * history.ts). The SDK is imported on first use, so pages stay light until
 * someone actually signs in.
 *
 * The apiKey is a Firebase *Web* API key: a public project identifier that is
 * meant to ship to browsers and grants no access by itself. What protects the
 * history is database.rules.json in the scanner repository (each user reads
 * and writes only their own subtree), and what protects scanning is the engine
 * verifying the ID token this module hands it.
 *
 * Needs, in the Firebase console: bugsnaps.in and www.bugsnaps.in under
 * Authentication → Settings → Authorized domains. The CSP that lets these
 * requests through is in next.config.ts.
 */
import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAozJSDdUVByXcz5BbPSdcEIDodY75Iccg",
  authDomain: "mypentest-bugsnaps.firebaseapp.com",
  databaseURL: "https://mypentest-bugsnaps-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mypentest-bugsnaps",
  appId: "1:603343618585:web:afe9403bb4002c5b34e088",
};

let appPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<Auth> | null = null;

export function loadApp(): Promise<FirebaseApp> {
  appPromise ??= (async () => {
    const { initializeApp, getApps } = await import("firebase/app");
    return getApps()[0] ?? initializeApp(firebaseConfig);
  })();
  return appPromise;
}

function loadAuth(): Promise<Auth> {
  authPromise ??= (async () => {
    const [app, { getAuth, connectAuthEmulator }] = await Promise.all([
      loadApp(),
      import("firebase/auth"),
    ]);
    const auth = getAuth(app);
    // Local development only: point at the Firebase Auth emulator. Tokens it
    // issues are unsigned, so a real MyPentest engine rejects them.
    const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR;
    if (emulator && process.env.NODE_ENV !== "production") {
      connectAuthEmulator(auth, emulator, { disableWarnings: true });
    }
    return auth;
  })();
  return authPromise;
}

/** Resolves once Firebase has restored (or failed to restore) the session. */
export async function currentUser(): Promise<User | null> {
  const auth = await loadAuth();
  const { onAuthStateChanged } = await import("firebase/auth");
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (user) => {
      stop();
      resolve(user);
    });
  });
}

/** Subscribe to sign-in changes (including sign-out in another tab). */
export async function onUser(callback: (user: User | null) => void): Promise<() => void> {
  const auth = await loadAuth();
  const { onAuthStateChanged } = await import("firebase/auth");
  return onAuthStateChanged(auth, callback);
}

/**
 * The signed-in user's ID token, for the MyPentest engine. Firebase refreshes
 * it before expiry; `force` asks for a fresh one after the engine said 401.
 */
export async function idToken(force = false): Promise<string | null> {
  const auth = await loadAuth();
  const user = auth.currentUser ?? (await currentUser());
  return user ? user.getIdToken(force) : null;
}

export async function signInEmail(email: string, password: string): Promise<User> {
  const auth = await loadAuth();
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  return (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
}

export async function signUpEmail(email: string, password: string): Promise<User> {
  const auth = await loadAuth();
  const { createUserWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth");
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  // Worth having, and sign-up does not wait on it.
  sendEmailVerification(user).catch(() => {});
  return user;
}

/*
 * Redirect, not popup: `signInWithPopup` only calls `window.open` after a
 * hidden cross-origin iframe on `authDomain` finishes loading, and that first
 * load is slow enough to lose the click's user-gesture status — the popup
 * then gets treated as blocked, and only the next attempt (once the iframe
 * is cached) succeeds. Redirect never opens a popup, so it has no such race.
 */
export async function signInGoogle(): Promise<void> {
  const auth = await loadAuth();
  const { GoogleAuthProvider, signInWithRedirect } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider);
}

/* No extra scopes: signing in needs only the public profile. */
export async function signInGitHub(): Promise<void> {
  const auth = await loadAuth();
  const { GithubAuthProvider, signInWithRedirect } = await import("firebase/auth");
  await signInWithRedirect(auth, new GithubAuthProvider());
}

/**
 * Call once on load to finish a sign-in that just came back from Google or
 * GitHub's redirect. Resolves to null on an ordinary page load (nothing
 * pending); `onUser`/`onAuthStateChanged` picks up the signed-in user
 * either way — this is for surfacing an error the redirect hit, such as the
 * email already using another provider.
 */
export async function consumeRedirectResult(): Promise<void> {
  const auth = await loadAuth();
  const { getRedirectResult } = await import("firebase/auth");
  await getRedirectResult(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = await loadAuth();
  const { sendPasswordResetEmail } = await import("firebase/auth");
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser(): Promise<void> {
  const auth = await loadAuth();
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

/**
 * Error codes to sentences a person can act on. Wrong password, unknown email
 * and "invalid credential" read the same on purpose: telling them apart would
 * let anyone test which addresses have accounts (account enumeration).
 */
export function friendlyError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "Email or password is incorrect.",
    "auth/invalid-email": "That doesn't look like an email address.",
    "auth/missing-password": "Enter your password.",
    "auth/weak-password": "Use at least 8 characters for your password.",
    "auth/email-already-in-use": "That email already has an account. Sign in instead.",
    "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/network-request-failed": "Couldn't reach the sign-in service. Check your connection.",
    "auth/popup-closed-by-user": "The sign-in window was closed before signing in.",
    "auth/cancelled-popup-request": "The sign-in window was closed before signing in.",
    "auth/popup-blocked": "Your browser blocked the sign-in window. Allow pop-ups for this site.",
    "auth/account-exists-with-different-credential":
      "This email already signs in another way. Use Google or your email and password instead.",
    "auth/unauthorized-domain": "Sign-in isn't enabled for this address yet.",
    "auth/operation-not-allowed": "This sign-in method is switched off.",
  };
  return messages[code] ?? "Something went wrong. Please try again.";
}

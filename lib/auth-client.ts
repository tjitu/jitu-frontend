"use client";

import { useSyncExternalStore } from 'react';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
  linkWithCredential,
  confirmPasswordReset,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
import { DEMO_MODE, DEMO_USER } from './demo-mode';

export type JituUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  role: string;
  target?: string | null;
  tokenBalance?: number;
  hasPassword?: boolean;
};

type AuthResult<T = unknown> = { data?: T; error?: { message: string } | null };
type AuthCallbacks<T = unknown> = {
  onSuccess?: (ctx: { data: T }) => void;
  onError?: (ctx: { error: { message: string } }) => void;
};

let originalFetch: typeof window.fetch | undefined;
const ensureAuthenticatedFetch = () => {
  if (typeof window === 'undefined' || originalFetch) return;
  originalFetch = window.fetch.bind(window);
  const nativeFetch = originalFetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl = new URL(
      input instanceof Request ? input.url : String(input),
      window.location.origin,
    );
    if (requestUrl.origin !== window.location.origin || !requestUrl.pathname.startsWith('/api/proxy/')) {
      return nativeFetch(input, init);
    }

    const auth = getFirebaseAuth();
    // Wait for Firebase to restore the persisted user (resolves instantly once known),
    // so requests fired from an optimistically-hydrated session still carry a token.
    await auth.authStateReady();
    const token = await auth.currentUser?.getIdToken();
    if (!token) return nativeFetch(input, init);
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    headers.set('Authorization', `Bearer ${token}`);
    return nativeFetch(input, { ...init, headers });
  };
};

const getAppUser = async (user: User): Promise<JituUser> => {
  ensureAuthenticatedFetch();
  const idToken = await user.getIdToken();
  const response = await (originalFetch ?? window.fetch.bind(window))(
    `${window.location.origin}/api/proxy/auth/me`,
    { headers: { Authorization: `Bearer ${idToken}` }, cache: 'no-store' },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'Akun belum siap digunakan. Periksa verifikasi email lalu masuk lagi.');
  }
  const payload = await response.json();
  return payload.user as JituUser;
};

const resultFrom = async <T>(
  operation: () => Promise<T>,
  callbacks?: AuthCallbacks<T>,
): Promise<AuthResult<T>> => {
  try {
    const data = await operation();
    callbacks?.onSuccess?.({ data });
    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Autentikasi gagal. Coba lagi.';
    callbacks?.onError?.({ error: { message } });
    return { error: { message } };
  }
};

/* -------------------------------------------------------------------------- */
/* Shared session store                                                       */
/* One Firebase listener + one /auth/me request for the whole app, instead of */
/* one per component. Last known user is cached in sessionStorage so pages    */
/* render instantly on navigation/reload while we revalidate in background.   */
/* -------------------------------------------------------------------------- */

type SessionSnapshot = { data: { user: JituUser } | null; isPending: boolean };

const SESSION_CACHE_KEY = 'jitu_session_user_v1';
const PENDING_SNAPSHOT: SessionSnapshot = { data: null, isPending: true };

let sessionSnapshot: SessionSnapshot = PENDING_SNAPSHOT;
let sessionStarted = false;
let currentFirebaseUser: User | null = null;
let sessionRevision = 0;
let lastSessionFetchAt = 0;
const SESSION_REVALIDATE_MS = 60_000;
const sessionListeners = new Set<() => void>();

const emitSession = (next: SessionSnapshot) => {
  sessionSnapshot = next;
  try {
    if (next.data?.user) sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(next.data.user));
    else if (!next.isPending) sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // storage unavailable
  }
  sessionListeners.forEach((listener) => listener());
};

const loadAppUser = async (firebaseUser: User) => {
  const revision = ++sessionRevision;
  lastSessionFetchAt = Date.now();
  try {
    const user = await getAppUser(firebaseUser);
    if (revision === sessionRevision) emitSession({ data: { user }, isPending: false });
  } catch {
    if (revision === sessionRevision) emitSession({ data: null, isPending: false });
  }
};

const startSession = () => {
  if (sessionStarted || typeof window === 'undefined') return;
  sessionStarted = true;

  if (DEMO_MODE) {
    sessionSnapshot = { data: { user: DEMO_USER }, isPending: false };
    return;
  }

  // Optimistic hydrate from last known user (revalidated below)
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (cached) sessionSnapshot = { data: { user: JSON.parse(cached) as JituUser }, isPending: false };
  } catch {
    // ignore
  }

  let auth: ReturnType<typeof getFirebaseAuth>;
  try {
    ensureAuthenticatedFetch();
    auth = getFirebaseAuth();
  } catch {
    sessionSnapshot = { data: null, isPending: false };
    return;
  }

  onAuthStateChanged(auth, (firebaseUser) => {
    const previousUid = currentFirebaseUser?.uid;
    currentFirebaseUser = firebaseUser;
    if (!firebaseUser) {
      sessionRevision++;
      emitSession({ data: null, isPending: false });
      return;
    }
    if (previousUid === firebaseUser.uid && sessionSnapshot.data) return;
    void loadAppUser(firebaseUser);
  });

  // Revalidate profile (token balance, name, etc.) when the tab regains focus
  document.addEventListener('visibilitychange', () => {
    if (
      document.visibilityState === 'visible' &&
      currentFirebaseUser &&
      Date.now() - lastSessionFetchAt > SESSION_REVALIDATE_MS
    ) {
      void loadAppUser(currentFirebaseUser);
    }
  });
};

const subscribeSession = (listener: () => void) => {
  startSession();
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
};

const getSessionSnapshot = () => {
  startSession();
  return sessionSnapshot;
};

const getServerSessionSnapshot = () => PENDING_SNAPSHOT;

/** Re-fetch /auth/me (e.g. after token balance or profile changes). */
export async function refreshSession() {
  if (DEMO_MODE || !currentFirebaseUser) return;
  await loadAppUser(currentFirebaseUser);
}

export function useSession() {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSessionSnapshot);
}

export const signIn = {
  email: async (input: { email: string; password: string }, callbacks?: AuthCallbacks<{ user: JituUser }>) =>
    resultFrom(async () => {
      if (DEMO_MODE) return { user: DEMO_USER };
      try {
        const credential = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          input.email.trim(),
          input.password
        );
        currentFirebaseUser = credential.user;
        const user = await getAppUser(credential.user);
        lastSessionFetchAt = Date.now();
        emitSession({ data: { user }, isPending: false });
        return { user };
      } catch (err: unknown) {
        const firebaseErr = err as { code?: string; message?: string };
        const code = firebaseErr?.code || '';

        // If user is not yet created in Firebase project, auto-provision with this password
        if (
          code === 'auth/user-not-found' ||
          code === 'auth/invalid-credential' ||
          code === 'auth/invalid-login-credentials'
        ) {
          try {
            const signupCred = await createUserWithEmailAndPassword(
              getFirebaseAuth(),
              input.email.trim(),
              input.password
            );
            currentFirebaseUser = signupCred.user;
            const user = await getAppUser(signupCred.user);
            lastSessionFetchAt = Date.now();
            emitSession({ data: { user }, isPending: false });
            return { user };
          } catch (signupErr: unknown) {
            const sErr = signupErr as { code?: string; message?: string };
            if (sErr?.code === 'auth/email-already-in-use') {
              throw new Error('Kata sandi salah. Silakan periksa kembali kata sandi akunmu.');
            }
            if (sErr?.code === 'auth/weak-password') {
              throw new Error('Kata sandi minimal 6 karakter.');
            }
            throw new Error(sErr?.message || 'Email atau kata sandi tidak sesuai.');
          }
        }
        if (code === 'auth/wrong-password') {
          throw new Error('Kata sandi salah. Silakan coba lagi.');
        }
        if (code === 'auth/too-many-requests') {
          throw new Error('Terlalu banyak percobaan masuk. Coba lagi dalam beberapa saat.');
        }
        throw new Error(firebaseErr?.message || 'Gagal masuk. Periksa kembali email dan kata sandi.');
      }
    }, callbacks),
};

export const signUp = {
  email: async (
    input: { email: string; password: string; name: string },
    callbacks?: AuthCallbacks<{ user: JituUser }>,
  ) =>
    resultFrom(async () => {
      if (DEMO_MODE) return { user: DEMO_USER };
      try {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          input.email.trim(),
          input.password
        );
        if (input.name) {
          await updateProfile(credential.user, { displayName: input.name });
        }
        // Send email verification in the background without blocking the user
        sendEmailVerification(credential.user, {
          url: `${window.location.origin}/login?emailVerified=1`,
        }).catch((e) => console.warn('Email verification send skipped:', e));

        currentFirebaseUser = credential.user;
        const user = await getAppUser(credential.user);
        lastSessionFetchAt = Date.now();
        emitSession({ data: { user }, isPending: false });
        return { user };
      } catch (err: unknown) {
        const firebaseErr = err as { code?: string; message?: string };
        if (firebaseErr?.code === 'auth/email-already-in-use') {
          throw new Error('Email ini sudah terdaftar. Silakan langsung masuk.');
        }
        if (firebaseErr?.code === 'auth/weak-password') {
          throw new Error('Kata sandi terlalu lemah. Gunakan minimal 8 karakter.');
        }
        throw new Error(firebaseErr?.message || 'Gagal mendaftar. Silakan coba lagi.');
      }
    }, callbacks),
};

export async function signOut(options?: { fetchOptions?: { onSuccess?: () => void } }) {
  if (!DEMO_MODE) await firebaseSignOut(getFirebaseAuth());
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // ignore
  }
  options?.fetchOptions?.onSuccess?.();
  return { data: null, error: null };
}

export async function changePassword(
  input: { currentPassword: string; newPassword: string },
  callbacks?: AuthCallbacks<null>,
) {
  return resultFrom(async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user?.email) throw new Error('Silakan masuk lagi sebelum mengubah kata sandi.');
    const credential = EmailAuthProvider.credential(user.email, input.currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, input.newPassword);
    return null;
  }, callbacks);
}

export async function setPassword(newPassword: string) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user?.email) throw new Error('Sesi masuk tidak ditemukan.');
  await linkWithCredential(user, EmailAuthProvider.credential(user.email, newPassword));
}

export async function requestPasswordReset(input: { email: string }) {
  return resultFrom(async () => {
    if (DEMO_MODE) return null;
    await sendPasswordResetEmail(getFirebaseAuth(), input.email);
    return null;
  });
}

export async function resetPassword(newPassword: string, actionCode: string) {
  await confirmPasswordReset(getFirebaseAuth(), actionCode, newPassword);
}

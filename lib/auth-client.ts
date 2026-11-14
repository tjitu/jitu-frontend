"use client";

import { useSyncExternalStore } from 'react';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
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

/* -------------------------------------------------------------------------- */
/* Shared session store & Inactivity timeout configuration                     */
/* -------------------------------------------------------------------------- */

type SessionSnapshot = { data: { user: JituUser } | null; isPending: boolean };

const SESSION_CACHE_KEY = 'jitu_session_user_v1';
const PENDING_SNAPSHOT: SessionSnapshot = { data: null, isPending: true };

// Inactivity timeout: 12 hours of inactivity
export const INACTIVITY_TIMEOUT_MS = 12 * 60 * 60 * 1000;
export const LAST_ACTIVITY_KEY = 'jitu_last_activity_v1';
export const INACTIVITY_LOGOUT_FLAG = 'jitu_inactivity_logout';

let sessionSnapshot: SessionSnapshot = PENDING_SNAPSHOT;
let sessionStarted = false;
let currentFirebaseUser: User | null = null;
let sessionRevision = 0;
let lastSessionFetchAt = 0;
let lastActivityRecordedAt = 0;
let isHandlingTimeout = false;
const SESSION_REVALIDATE_MS = 60_000;
const sessionListeners = new Set<() => void>();

export function emitSession(next: SessionSnapshot) {
  sessionSnapshot = next;
  try {
    if (next.data?.user) sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(next.data.user));
    else if (!next.isPending) sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // storage unavailable
  }
  sessionListeners.forEach((listener) => listener());
}

export function touchActivity(force = false) {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (!force && now - lastActivityRecordedAt < 30_000) return;
  lastActivityRecordedAt = now;
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  } catch {
    // ignore storage error
  }
}

export function getLastActivity(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLastActivity() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    // ignore
  }
}

export async function signOut(options?: { fetchOptions?: { onSuccess?: () => void } }) {
  if (!DEMO_MODE) {
    try {
      await firebaseSignOut(getFirebaseAuth());
    } catch {
      // ignore
    }
  }
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
    clearLastActivity();
  } catch {
    // ignore
  }
  currentFirebaseUser = null;
  emitSession({ data: null, isPending: false });
  options?.fetchOptions?.onSuccess?.();
  return { data: null, error: null };
}

export async function checkInactivityTimeout(): Promise<boolean> {
  if (typeof window === 'undefined' || DEMO_MODE || isHandlingTimeout) return false;

  let auth: ReturnType<typeof getFirebaseAuth>;
  try {
    auth = getFirebaseAuth();
  } catch {
    return false;
  }

  const hasUser = !!auth.currentUser || !!sessionSnapshot.data?.user;
  if (!hasUser) return false;

  const lastActive = getLastActivity();
  const now = Date.now();

  // If there is an existing session but no recorded activity yet,
  // initialize it now rather than immediately terminating the session.
  if (!lastActive) {
    touchActivity(true);
    return false;
  }

  if (now - lastActive > INACTIVITY_TIMEOUT_MS) {
    isHandlingTimeout = true;
    console.warn('[auth-client] Inactive session timeout exceeded (12h). Signing out...');
    try {
      sessionStorage.setItem(INACTIVITY_LOGOUT_FLAG, '1');
    } catch {
      // ignore
    }

    await signOut();
    isHandlingTimeout = false;

    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isPublic =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/blog') ||
        pathname.startsWith('/careers') ||
        pathname.startsWith('/open-hiring');
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return true;
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Authenticated fetch interception & App User resolution                     */
/* -------------------------------------------------------------------------- */

let originalFetch: typeof window.fetch | undefined;
export const ensureAuthenticatedFetch = () => {
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

    const timedOut = await checkInactivityTimeout();
    if (timedOut) {
      return new Response(JSON.stringify({ message: 'Sesi berakhir karena tidak aktif.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    touchActivity();

    const token = await auth.currentUser?.getIdToken();
    if (!token) return nativeFetch(input, init);
    const buildInitWithToken = (bearerToken: string): RequestInit => {
      const headers = new Headers(input instanceof Request ? input.headers : undefined);
      new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
      headers.set('Authorization', `Bearer ${bearerToken}`);
      return { ...init, headers };
    };
    const response = await nativeFetch(input, buildInitWithToken(token));
    if (response.status === 401 && auth.currentUser && !(input instanceof Request)) {
      const refreshedToken = await auth.currentUser.getIdToken(true).catch(() => null);
      if (refreshedToken && refreshedToken !== token) {
        return nativeFetch(input, buildInitWithToken(refreshedToken));
      }
    }
    return response;
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

  // Check if existing session has already timed out before hydrating
  const lastActive = getLastActivity();
  if (lastActive && Date.now() - lastActive > INACTIVITY_TIMEOUT_MS) {
    clearLastActivity();
    try {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
      sessionStorage.setItem(INACTIVITY_LOGOUT_FLAG, '1');
    } catch {
      // ignore
    }
    sessionSnapshot = { data: null, isPending: false };
    void signOut().then(() => {
      const pathname = window.location.pathname;
      const isPublic =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/blog') ||
        pathname.startsWith('/careers') ||
        pathname.startsWith('/open-hiring');
      if (!isPublic) {
        window.location.href = '/login';
      }
    });
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

  // Register user interaction listeners to record activity
  const onUserActivity = () => {
    if (currentFirebaseUser || sessionSnapshot.data?.user) {
      touchActivity();
    }
  };
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach((event) => {
    window.addEventListener(event, onUserActivity, { passive: true });
  });

  // Cross-tab sync for logout / activity
  window.addEventListener('storage', (event) => {
    if (event.key === LAST_ACTIVITY_KEY && !event.newValue) {
      if (sessionSnapshot.data?.user) {
        emitSession({ data: null, isPending: false });
      }
    }
  });

  // Periodic interval check (every 60s)
  setInterval(() => {
    void checkInactivityTimeout();
  }, 60_000);

  onAuthStateChanged(auth, (firebaseUser) => {
    const previousUid = currentFirebaseUser?.uid;
    currentFirebaseUser = firebaseUser;
    if (!firebaseUser) {
      sessionRevision++;
      emitSession({ data: null, isPending: false });
      return;
    }
    // Update activity timestamp if user is authenticated
    touchActivity();
    if (previousUid === firebaseUser.uid && sessionSnapshot.data) return;
    void loadAppUser(firebaseUser);
  });

  // Revalidate profile and check inactivity when tab regains focus
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void (async () => {
        const timedOut = await checkInactivityTimeout();
        if (timedOut) return;
        touchActivity();
        if (
          currentFirebaseUser &&
          Date.now() - lastSessionFetchAt > SESSION_REVALIDATE_MS
        ) {
          void loadAppUser(currentFirebaseUser);
        }
      })();
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
        touchActivity(true);
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
            touchActivity(true);
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
  google: async () =>
    resultFrom(async () => {
      if (DEMO_MODE) return { user: DEMO_USER };
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(getFirebaseAuth(), provider);
      currentFirebaseUser = credential.user;
      const user = await getAppUser(credential.user);
      lastSessionFetchAt = Date.now();
      touchActivity(true);
      emitSession({ data: { user }, isPending: false });
      return { user };
    }),
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
        touchActivity(true);
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

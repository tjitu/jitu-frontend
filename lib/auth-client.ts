"use client";

import { useEffect, useState } from 'react';
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

    const token = await getFirebaseAuth().currentUser?.getIdToken();
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

export function useSession() {
  const [data, setData] = useState<{ user: JituUser } | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setData({ user: DEMO_USER });
      setIsPending(false);
      return;
    }
    try {
      ensureAuthenticatedFetch();
    } catch {
      setIsPending(false);
      return;
    }
    let active = true;
    let revision = 0;
    let auth: ReturnType<typeof getFirebaseAuth>;
    try {
      auth = getFirebaseAuth();
    } catch {
      setIsPending(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const currentRevision = ++revision;
      if (!firebaseUser) {
        if (active) {
          setData(null);
          setIsPending(false);
        }
        return;
      }
      try {
        const user = await getAppUser(firebaseUser);
        if (active && currentRevision === revision) setData({ user });
      } catch {
        if (active && currentRevision === revision) setData(null);
      } finally {
        if (active && currentRevision === revision) setIsPending(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { data, isPending };
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
        return { user: await getAppUser(credential.user) };
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
            const user = await getAppUser(signupCred.user);
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

        const user = await getAppUser(credential.user);
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

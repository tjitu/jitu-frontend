import { createAuthClient } from "better-auth/react";

// Point to self (Vercel) so that requests go through the Next.js Proxy
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:5173",
});

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  changePassword,
  requestPasswordReset,
  resetPassword,
} = authClient;

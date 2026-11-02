import { betterAuth } from "better-auth";
import { getDbPool } from "./db";

const pool = getDbPool();

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  "http://localhost:5173";

const trustedOrigins = [
  "http://localhost:5173",
  "https://jituptn.com",
  "https://www.jituptn.com",
  "https://jitu-frontend.vercel.app",
  "https://jitu-frontend-teamatjitus-projects.vercel.app",
];

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

export const auth = betterAuth({
  database: pool,
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "jitu_better_auth_secret_dev_2026_super_secure_key",
  baseURL,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      enabled: Boolean(googleClientId && googleClientSecret),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
      target: {
        type: "string",
        required: false,
        defaultValue: "UTBK 2026",
        input: false,
      },
    },
  },
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
        },
      },
    },
  },
});

export type Auth = typeof auth;

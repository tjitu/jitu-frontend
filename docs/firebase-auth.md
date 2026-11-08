# Jitu Main Firebase Authentication

Jitu Main uses Firebase Authentication for email/password and Google sign-in. The frontend sends Firebase ID tokens to the Main backend as bearer tokens. The backend verifies each token and maps its Firebase UID to the existing PostgreSQL `user` record, retaining the app's current user ID, role, and related data.

## Firebase project

- Project: `jitu-ptn-main-auth-2026`
- Web app: `jitu-frontend`
- Provider config: `firebase.json`
- Project selection: `.firebaserc`

Auth providers are managed from the frontend repo with `firebase deploy --only auth`. The Firebase Authorized domains currently include `jituptn.com`, `www.jituptn.com`, `jitu-frontend.vercel.app`, and `localhost`. Add any additional production hostnames before using Google sign-in from them.

## Environment

Copy `.env.example` for local frontend work. Set the six `NEXT_PUBLIC_FIREBASE_*` values in Vercel Production, Preview, and Development environments. These are Firebase Web SDK configuration values and are public app configuration, not server credentials.

Set `FIREBASE_PROJECT_ID=jitu-ptn-main-auth-2026` in the Main backend. The backend verifies ID tokens using the project ID and Firebase's public signing certificates; it does not need a service-account key.

## Existing accounts

Firebase Auth starts with no imported Better Auth password credentials. On first Firebase sign-in, a user with a matching, verified email is connected to the existing Jitu database user. This preserves the Jitu user ID and existing tryout, payment, and token data. Email/password users must verify their email and set or reset their password in Firebase; Better Auth password hashes are not copied by this change. Unverified email claims cannot be used to attach an existing Jitu account.

Legacy Better Auth `session`, `account`, and `verification` tables remain in PostgreSQL for now. Firebase provider mappings are stored in the existing `account` table; no schema migration is needed.

## Email actions

Password-reset email links use Firebase's default hosted action handler. Verification emails use Firebase's default email verification handler. To use the app's custom reset form later, configure the Firebase email template action URL to point at `/reset-password`; that handler expects Firebase's `oobCode` query parameter.

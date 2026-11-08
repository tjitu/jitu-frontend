import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB_re9e2k6A3dlafDXyBrX0eMD6cX0UaKA',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'jitu-ptn-main-auth-2026.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'jitu-ptn-main-auth-2026',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:811970848019:web:18db6b31af6e776d37e6e6',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '811970848019',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'jitu-ptn-main-auth-2026.firebasestorage.app',
};

export const getFirebaseAuth = () => {
  const app = getApps().length ? getApp() : initializeApp(config);
  return getAuth(app);
};

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCF3GKM1Czbg1JpEu7DoUSxjngJAYUXBz0',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'jitu-ptn-main-auth.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'jitu-ptn-main-auth',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:816373128045:web:4bd76fbf22246898f81864',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '816373128045',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'jitu-ptn-main-auth.firebasestorage.app',
};

export const getFirebaseAuth = () => {
  const app = getApps().length ? getApp() : initializeApp(config);
  return getAuth(app);
};

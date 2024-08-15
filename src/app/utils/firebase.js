import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with custom domain
const auth = getAuth(app);
auth.useDeviceLanguage();

// Set custom auth domain if provided
if (process.env.NEXT_PUBLIC_AUTH_DOMAIN) {
  auth.config.authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN;
}

export { auth };
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
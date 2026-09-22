// Firebase initialization for FairShare.
//
// The config values are read from environment variables (see .env, which is
// gitignored). Copy .env.example to .env and paste your project's values there.
//
// Heads up: Firebase "web API keys" are NOT secrets. They ship inside the client
// bundle and are visible to anyone using the app — that's by design. Keeping them
// in .env just keeps them out of source control. Actual access control comes from
// Firestore security rules (added in later features), not from hiding this key.

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  // Optional; only present when Analytics is enabled. Firebase ignores it if blank.
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
}

// Friendly nudge in the console if any required value is missing (e.g. no .env yet).
const REQUIRED = ['apiKey', 'authDomain', 'projectId', 'appId']
if (REQUIRED.some((key) => !firebaseConfig[key])) {
  console.warn(
    '[FairShare] Firebase config is incomplete. ' +
      'Copy .env.example to .env and fill in your project values before signing in.',
  )
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Reused for the Google sign-in popup.
export const googleProvider = new GoogleAuthProvider()

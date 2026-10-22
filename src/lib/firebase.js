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
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai'

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

// ---- Optional AI summary (Firebase AI Logic → Gemini) ----------------------
//
// The fairness report writes its "smart summary" from pure local rules
// (src/lib/insights.js). This hooks up an OPTIONAL extra: a Gemini model that
// rephrases those same facts into a friendly paragraph. It's gated two ways so
// it can never surprise the live demo:
//   1. VITE_AI_SUMMARY must equal 'on' (otherwise the button never renders).
//   2. Even enabled, every call is wrapped in try/catch and falls back to the
//      rule-based text, so a disabled API or offline network just does nothing.
//
// It uses the GoogleAIBackend (the Gemini Developer API), which has a free tier
// on Firebase's Spark plan — no billing, no Cloud Functions. `firebase/ai` ships
// inside the firebase package we already depend on, so this adds no new library.
const AI_MODEL = 'gemini-2.5-flash'

/** True only when the AI summary has been explicitly turned on via env. */
export function isAiSummaryEnabled() {
  return env.VITE_AI_SUMMARY === 'on'
}

let cachedModel = null

/**
 * Lazily create (and cache) the Gemini model handle. Returns null if the SDK
 * can't be initialized for any reason, so callers can treat "no AI" uniformly.
 * @returns {import('firebase/ai').GenerativeModel | null}
 */
export function getAiModel() {
  if (cachedModel) return cachedModel
  try {
    const ai = getAI(app, { backend: new GoogleAIBackend() })
    cachedModel = getGenerativeModel(ai, { model: AI_MODEL })
    return cachedModel
  } catch {
    return null
  }
}

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth"

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)

/**
 * Sign in with Google.
 * Uses popup on web, redirect on Capacitor/Android (no popup support).
 */
export async function signInWithGoogle() {
  // Detect Capacitor environment
  const isCapacitor = typeof window !== "undefined" && !!(window as any).Capacitor

  if (isCapacitor) {
    // On Android/Capacitor, redirect flow is required
    await signInWithRedirect(auth, googleProvider)
    // getRedirectResult is handled in the auth page on mount
    return null
  }

  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

/**
 * Call this on app mount to handle the redirect result from Google sign-in on Capacitor.
 */
export async function handleGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth)
    return result?.user ?? null
  } catch {
    return null
  }
}

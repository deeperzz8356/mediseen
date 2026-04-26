import { Capacitor } from "@capacitor/core"
import { FirebaseAuthentication } from "@capacitor-firebase/authentication"
import { initializeApp, getApps, getApp } from "firebase/app"
import { indexedDBLocalPersistence, getAuth, getRedirectResult, GoogleAuthProvider, signInWithCredential, signInWithPopup, initializeAuth } from "firebase/auth"

export const googleProvider = new GoogleAuthProvider()

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)

const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null

function createAuth() {
  if (!app) return null

  if (Capacitor.isNativePlatform()) {
    try {
      return initializeAuth(app, { persistence: indexedDBLocalPersistence })
    } catch {
      return getAuth(app)
    }
  }

  return getAuth(app)
}

export const auth = createAuth()

/**
 * Sign in with Google.
 * Uses popup on web, redirect on Capacitor/Android (no popup support).
 */
export async function signInWithGoogle() {
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Firebase authentication is not configured")
  }

  if (Capacitor.isNativePlatform()) {
    try {
      console.log("Starting native Google Sign-In (Minimal Mode)...")
      const result = await FirebaseAuthentication.signInWithGoogle()
      console.log("Native Google Sign-In result received")
      
      const idToken = result.credential?.idToken
      if (!idToken) {
        console.error("Native Google Sign-In failed: Missing ID token", result)
        throw new Error("Missing Google ID token")
      }

      // Minimal approach: only link to Firebase JS SDK if we need local state persistence
      const credential = GoogleAuthProvider.credential(idToken)
      const userCredential = await signInWithCredential(auth, credential)
      
      return userCredential.user
    } catch (err: any) {
      console.error("Native Google Sign-In Exception:", JSON.stringify(err, Object.getOwnPropertyNames(err)))
      // Return a descriptive error if possible
      if (err.message?.includes("10")) {
        throw new Error("Google Sign-In Error (10): Ensure SHA-1 is registered in Firebase.")
      }
      throw err
    }
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (err: any) {
    console.error("Web Google Sign-In Error:", err)
    throw err
  }
}

/**
 * Compatibility helper for pages that expect redirect-based Google login.
 * Returns the authenticated user when a redirect result exists, otherwise null.
 */
export async function handleGoogleRedirectResult() {
  if (!auth || !isFirebaseConfigured) {
    return null
  }

  try {
    const result = await getRedirectResult(auth)
    return result?.user ?? null
  } catch {
    return null
  }
}

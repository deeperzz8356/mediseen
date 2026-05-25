import { Capacitor } from "@capacitor/core"
import { FirebaseAuthentication } from "@capacitor-firebase/authentication"
import { initializeApp, getApps, getApp } from "firebase/app"
import { indexedDBLocalPersistence, getAuth, getRedirectResult, GoogleAuthProvider, signInWithCredential, signInWithRedirect, signInWithPopup, initializeAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

export const googleProvider = new GoogleAuthProvider()

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// NOTE: If you see 400 errors from reCAPTCHA verification in browser console:
// 1. Go to Firebase Console > Your Project > Authentication > Settings
// 2. Under "App Verification" find "reCAPTCHA Enterprise"
// 3. Click the three-dot menu and "Disable" it
// 4. Your auth will continue working fine without it


export const admobConfig = {
  appId: process.env.NEXT_PUBLIC_ADMOB_APP_ID,
  bannerId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID,
  interstitialId: process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID,
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
export const db = app ? getFirestore(app) : null

/**
 * Sign in with Google - Works on every device!
 * Strategy:
 * 1. Native: Try Capacitor plugin first (for devices WITH Google Play Services)
 * 2. Fallback: If native fails, use web OAuth redirect (works on ANY device with browser)
 * 3. This makes Google Sign-In nearly universal across all devices
 */
export async function signInWithGoogle() {
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Firebase authentication is not configured")
  }

  if (Capacitor.isNativePlatform()) {
    try {
      console.log("Starting native Google Sign-In...")
      const result = await FirebaseAuthentication.signInWithGoogle()
      console.log("Native Google Sign-In successful")
      
      const idToken = result.credential?.idToken
      if (!idToken) {
        console.warn("Native Google Sign-In: Missing ID token, falling back to web OAuth...")
        throw new Error("Missing Google ID token")
      }

      const credential = GoogleAuthProvider.credential(idToken)
      const userCredential = await signInWithCredential(auth, credential)
      
      return userCredential.user
    } catch (err: any) {
      console.warn("Native Google Sign-In failed, falling back to web OAuth redirect:", err.message)
      // Fallback to web-based OAuth - works on devices without Google Play Services
      try {
        await signInWithRedirect(auth, googleProvider)
        return null // Page will redirect
      } catch (webErr: any) {
        console.error("Web OAuth fallback also failed:", webErr)
        throw new Error("Google Sign-In unavailable on this device. Please use email/password signup instead.")
      }
    }
  }

  try {
    // Web: Use OAuth popup (standard for modern web apps)
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (err: any) {
    if (err?.code === "auth/unauthorized-domain") {
      throw new Error(
        "Google Sign-In is blocked on this origin. Add this host to Firebase Authorized domains or run the app on https://localhost."
      )
    }
    if (err.code === "auth/popup-blocked") {
      // Fallback to redirect if popup is blocked
      await signInWithRedirect(auth, googleProvider)
      return null
    }
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

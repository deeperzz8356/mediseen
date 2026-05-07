"use client"

/**
 * FirebaseProvider.tsx – App-level initialization
 *
 * Handles:
 * 1. Firebase Analytics + Crashlytics setup (native only)
 * 2. Zustand store bootstrap (reads Preferences at app start)
 * 3. Firebase Auth listener → syncs auth state to Zustand
 */

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { FirebaseAnalytics } from "@capacitor-firebase/analytics"
import { FirebaseCrashlytics } from "@capacitor-firebase/crashlytics"
import { Capacitor } from "@capacitor/core"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAppStore } from "../store/useAppStore"

export default function FirebaseProvider() {
  const pathname = usePathname()
  const { bootstrap, setUser, setAuthLoaded } = useAppStore()

  // ── Bootstrap: load persisted Preferences on first mount ──────────
  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  // ── Auth: sync Firebase user to Zustand ────────────────────────────
  useEffect(() => {
    if (!auth) {
      setAuthLoaded(true)
      return
    }

    // Check for redirect result (important for web/fallback Google login)
    import("@/lib/firebase").then(({ handleGoogleRedirectResult }) => {
      handleGoogleRedirectResult().catch(() => null)
    })

    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setAuthLoaded(true)
    })
    return () => unsub()
  }, [setUser, setAuthLoaded])

  // ── Firebase SDK init (native only) ──────────────────────────────
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const initFirebase = async () => {
      try {
        await FirebaseAnalytics.setEnabled({ enabled: true })
        await FirebaseCrashlytics.setEnabled({ enabled: true })
      } catch (error) {
        console.error("[FirebaseProvider] SDK init error:", error)
      }
    }

    initFirebase()
  }, [])

  // ── Track screen views ────────────────────────────────────────────
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const trackScreen = async () => {
      try {
        await FirebaseAnalytics.setCurrentScreen({
          screenName: pathname,
          screenClassOverride: "NextJS_Page",
        })
      } catch {
        // Non-critical; swallow silently
      }
    }

    trackScreen()
  }, [pathname])

  return null
}

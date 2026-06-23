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

const PROFILE_COMPLETED_KEY = "mediseen_profile_completed"

function getProfileCompletedForUid(uid: string) {
  if (typeof window === "undefined") return false

  try {
    const scopedFlag = localStorage.getItem(`${PROFILE_COMPLETED_KEY}_${uid}`)
    const legacyFlag = localStorage.getItem(PROFILE_COMPLETED_KEY)
    return scopedFlag === "true" || legacyFlag === "true"
  } catch {
    return false
  }
}

export default function FirebaseProvider() {
  const pathname = usePathname()
  const { bootstrap, setUser, setAuthLoaded, setAuthStatus, ensureGuestSession, setHasProfile } = useAppStore()

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

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        setAuthStatus("authenticated")
        setHasProfile(getProfileCompletedForUid(user.uid))
        
        // Sync guest diagnosis history
        try {
          const localData = localStorage.getItem("guest_diagnosis_history")
          if (localData) {
            const records = JSON.parse(localData)
            if (records && records.length > 0) {
              const token = await user.getIdToken()
              import("../../config").then(({ API_BASE_URL }) => {
                fetch(`${API_BASE_URL}/diagnose/sync`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify(records)
                }).then(res => {
                  if (res.ok) {
                    localStorage.removeItem("guest_diagnosis_history")
                  }
                }).catch(e => console.error("Failed to sync guest history API", e))
              })
            }
          }
        } catch(e) {
          console.error("Failed to sync guest history", e)
        }
      } else {
        setUser(null)
        setAuthStatus("unauthenticated")
        setHasProfile(false)
        await ensureGuestSession().catch(() => null)
      }
      setAuthLoaded(true)
    })
    return () => unsub()
  }, [ensureGuestSession, setAuthLoaded, setAuthStatus, setHasProfile, setUser])

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

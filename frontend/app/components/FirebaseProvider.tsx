"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { FirebaseAnalytics } from "@capacitor-firebase/analytics"
import { FirebaseCrashlytics } from "@capacitor-firebase/crashlytics"
import { Capacitor } from "@capacitor/core"

export default function FirebaseProvider() {
  const pathname = usePathname()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const initFirebase = async () => {
      try {
        await FirebaseAnalytics.setCollectionEnabled({ enabled: true })
        console.log("Firebase Analytics initialized")
        
        await FirebaseCrashlytics.setCrashlyticsCollectionEnabled({ enabled: true })
        console.log("Firebase Crashlytics initialized")
      } catch (error) {
        console.error("Firebase init error:", error)
      }
    }

    initFirebase()
  }, [])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    // Track screen view on route change
    const trackScreenView = async () => {
      try {
        await FirebaseAnalytics.setCurrentScreen({
          screenName: pathname,
          screenClassOverride: "NextJS_Page"
        })
        console.log(`Tracked screen view: ${pathname}`)
      } catch (error) {
        console.error("Screen view tracking error:", error)
      }
    }

    trackScreenView()
  }, [pathname])

  return null
}

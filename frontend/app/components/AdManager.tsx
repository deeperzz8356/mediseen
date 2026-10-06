"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Capacitor } from "@capacitor/core"
import { initializeAdMob, showBanner, hideBanner } from "../../lib/admob"

// Routes that should NOT show the persistent bottom banner
const NO_BANNER_ROUTES = [
  "/",
  "/login",
  "/register",
  "/get-started",
  "/splash",
  "/diagnose",       // no banner during active scan
  "/profile",        // sensitive screen
  "/onboarding/notification",
]

export default function AdManager() {
  const pathname = usePathname()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    initializeAdMob().then(() => {
      const shouldHide = NO_BANNER_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      )

      if (shouldHide) {
        hideBanner()
      } else {
        showBanner()
      }
    })
  }, [pathname])

  return null
}

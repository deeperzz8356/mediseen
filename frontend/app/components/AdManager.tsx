"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Capacitor } from "@capacitor/core"
import { initializeAdMob, showBanner, showInterstitial, hideBanner } from "../../lib/admob"

export default function AdManager() {
  const pathname = usePathname()
  const [tapCount, setTapCount] = useState(0)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    // Initialize AdMob on mount
    initializeAdMob().then(() => {
      // Show banner ad if not on specific routes
      const hideBannerRoutes = ["/", "/login", "/register", "/get-started", "/splash"]
      const isHidden = hideBannerRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))
      
      if (!isHidden) {
        showBanner()
      } else {
        hideBanner()
      }
    })
  }, [pathname])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const handleTap = (e: MouseEvent) => {
      // Only count clicks on buttons, links, or interactive elements to avoid accidental counts
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, a, [role="button"], input, select, textarea')
      
      if (!isInteractive) return

      setTapCount((prev) => {
        const next = prev + 1
        console.log(`Tap count: ${next}`)
        if (next >= 4) {
          showInterstitial()
          return 0
        }
        return next
      })
    }

    window.addEventListener("click", handleTap)
    return () => window.removeEventListener("click", handleTap)
  }, [])

  return null
}

"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useProgressStore } from "../store/useProgressStore"

export default function NavigationTracker() {
  const pathname = usePathname()
  const router = useRouter()
  const { lastPath, setLastPath } = useProgressStore()
  const [hasRedirected, setHasRedirected] = useState(false)

  // On initial mount, redirect to lastPath if applicable
  useEffect(() => {
    if (!hasRedirected) {
      if (lastPath && lastPath !== "/" && pathname === "/") {
        // Basic check to not redirect to onboarding or login loops if handled elsewhere
        if (!lastPath.includes("/onboarding") && !lastPath.includes("/login")) {
          router.replace(lastPath)
        }
      }
      setHasRedirected(true)
    }
  }, [lastPath, pathname, router, hasRedirected])

  // Track path changes after initial redirect
  useEffect(() => {
    if (hasRedirected && pathname) {
      setLastPath(pathname)
    }
  }, [pathname, hasRedirected, setLastPath])

  return null
}

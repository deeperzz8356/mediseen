"use client"

/**
 * NavbarWrapper – Route-aware + auth-aware navbar visibility
 *
 * RULES:
 *  - Hidden during: splash (/), onboarding/*, login, /login, /register
 *  - Hidden if user is NOT authenticated (Zustand auth state)
 *  - Visible only on authenticated app pages
 */

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { App } from "@capacitor/app"
import Navbar from "./Navbar"
import { useAppStore } from "../store/useAppStore"

// Routes where navbar must NEVER appear (pre-auth / pre-onboarding)
const PRE_AUTH_ROUTES = [
  "/",
  "/login",
  "/register",
  "/onboarding",
  "/onboarding/language",
  "/onboarding/notification",
  "/onboarding/slides",
  "/privacy",
]

function isPreAuthRoute(pathname: string): boolean {
  return PRE_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith("/onboarding")
  )
}

export default function NavbarWrapper() {
  const pathname = usePathname()
  const router = useRouter()
  const { authStatus, authLoaded } = useAppStore()

  // Handle Android back button
  useEffect(() => {
    const backButtonHandler = App.addListener("backButton", ({ canGoBack }) => {
      if (pathname === "/home" || pathname === "/") {
        App.exitApp()
      } else if (canGoBack) {
        router.back()
      } else {
        router.push("/home")
      }
    })
    return () => {
      backButtonHandler.then((h) => h.remove())
    }
  }, [pathname, router])

  // 1. Always hide on pre-auth routes
  if (isPreAuthRoute(pathname)) return null

  // 2. Hide if auth not yet loaded (prevents flash)
  if (!authLoaded || authStatus === "initializing") return null

  return <Navbar />
}
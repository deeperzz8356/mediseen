"use client"

/**
 * AgentFABWrapper – Route-aware + auth-aware AI Agent visibility
 * 
 * Follows same visibility rules as Navbar:
 * - Hidden during: splash (/), onboarding/*, login, /login, /register
 * - Visible for authenticated users and guest sessions
 */

import { usePathname } from "next/navigation"
import AgentFAB from "./AgentFAB"
import { useAppStore } from "../store/useAppStore"

const PRE_AUTH_ROUTES = [
  "/",
  "/login",
  "/register",
  "/onboarding",
]

function isPreAuthRoute(pathname: string): boolean {
  return PRE_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith("/onboarding")
  )
}

export default function AgentFABWrapper() {
  const pathname = usePathname()
  const { authStatus, authLoaded } = useAppStore()

  // 1. Hide on pre-auth / onboarding routes
  if (isPreAuthRoute(pathname)) return null

  // 2. Hide if auth not yet loaded
  if (!authLoaded) return null

  // 3. Hide until auth state is known; guests can still use the assistant
  if (authStatus === "initializing") return null

  return <AgentFAB />
}

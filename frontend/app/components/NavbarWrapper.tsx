"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { App } from "@capacitor/app"
import Navbar from "./Navbar"

export default function NavbarWrapper() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Handle back button
    const backButtonHandler = App.addListener('backButton', ({ canGoBack }) => {
      if (pathname === '/home' || pathname === '/') {
        App.exitApp()
      } else if (canGoBack) {
        router.back()
      } else {
        router.push('/home')
      }
    })

    return () => {
      backButtonHandler.then(h => h.remove())
    }
  }, [pathname, router])

  const hideNavbarRoutes = ["/", "/login"]

  if (hideNavbarRoutes.includes(pathname)) return null

  return <Navbar />
}
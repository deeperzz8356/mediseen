"use client"

/**
 * app/page.tsx – Smart entry router
 *
 * ROUTING LOGIC:
 *   First launch:  / → /onboarding/language → /onboarding/notification → /onboarding/slides → /login
 *   Onboarding done, logged out: / → /login
 *   Logged in with profile: / → /home
 *   Logged in, no profile: / → /login?complete=1
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { motion } from "framer-motion"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { useAppStore } from "./store/useAppStore"
import { API_BASE_URL } from "./config"

export default function EntryPage() {
  const router = useRouter()
  const {
    bootstrap,
    setUser,
    setAuthLoaded,
    setHasProfile,
    authLoaded,
    onboardingLoaded,
    languageLoaded,
  } = useAppStore()

  const [showSplash, setShowSplash] = useState(true)

  // Step 1 – bootstrap persisted preferences + Artificial Timer
  useEffect(() => {
    bootstrap()
    
    // Ensure splash is visible for at least 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [bootstrap])

  // Step 2 – set up Firebase auth listener (only after prefs loaded)
  useEffect(() => {
    if (!onboardingLoaded || !languageLoaded) return

    if (!auth) {
      setAuthLoaded(true)
      return
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const token = await firebaseUser.getIdToken()
          const res = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            setHasProfile(data.has_profile ?? false)
          }
        } catch {
          // network error – proceed, home will guard
        }
      } else {
        setUser(null)
        setHasProfile(false)
      }
      setAuthLoaded(true)
    })

    return () => unsub()
  }, [onboardingLoaded, languageLoaded, setUser, setAuthLoaded, setHasProfile])

  // Step 3 – navigate once all state is loaded AND splash timer finished
  useEffect(() => {
    if (!authLoaded || !onboardingLoaded || !languageLoaded || showSplash) return

    const { onboardingDone, languageDone, notificationAsked, user, hasProfile } =
      useAppStore.getState()

    if (user && hasProfile) {
      router.replace("/home")
      return
    }

    if (user && !hasProfile) {
      router.replace("/login?complete=1")
      return
    }

    if (onboardingDone) {
      router.replace("/login")
      return
    }

    // First-launch flow
    if (!languageDone) {
      router.replace("/onboarding/language")
    } else if (!notificationAsked) {
      router.replace("/onboarding/notification")
    } else {
      router.replace("/onboarding/slides")
    }
  }, [authLoaded, onboardingLoaded, languageLoaded, showSplash, router])

  // Splash UI
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      <div className="flex flex-col items-center gap-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-24 h-24 rounded-[2.25rem] bg-white shadow-2xl shadow-slate-200 flex items-center justify-center overflow-hidden p-4 border border-slate-50"
        >
          <Image
            src="/logo2.png"
            alt="MediSeen"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-1.5"
        >
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            MediSeen
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.25em] pl-1">
            AI Clinical Studio
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex items-center gap-2 pt-4"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

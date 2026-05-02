"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import SplashScreen from "./components/SplashScreen"
import GetStarted from "./components/GetStarted"
import LanguageSelection from "./components/LanguageSelection"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { NotificationService } from "./services/NotificationService"

// Flow: splash → language → get-started → (redirect to /login)
type AppState = 'splash' | 'language' | 'get-started'

export default function LandingPage() {
  const [appState, setAppState] = useState<AppState>('splash')
  const router = useRouter()

  // Auto-advance from splash after 3s
  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(async () => {
        setAppState('language')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [appState])

  // If already signed in, skip to home
  useEffect(() => {
    if (!auth) return

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/home')
    })
    return () => unsub()
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">

        {/* PHASE 1: SPLASH */}
        {appState === 'splash' && <SplashScreen key="splash" />}

        {/* PHASE 2: LANGUAGE SELECTION */}
        {appState === 'language' && (
          <LanguageSelection key="language" onComplete={() => setAppState('get-started')} />
        )}

        {/* PHASE 3: GET STARTED */}
        {appState === 'get-started' && (
          <GetStarted key="get-started" onStart={() => router.push('/login')} />
        )}

      </AnimatePresence>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Brain, UploadCloud, Activity, Sparkles, ChevronRight, Menu, X } from "lucide-react"
import SplashScreen from "./components/SplashScreen"
import GetStarted from "./components/GetStarted"
import LanguageSelection from "./components/LanguageSelection"
import { useLocale } from "./i18n/LocaleContext"
import { signInWithGoogle, handleGoogleRedirectResult, auth } from "@/lib/firebase"
import { API_BASE_URL } from "./config"
import { onAuthStateChanged } from "firebase/auth"

// Flow: splash → language → get-started → auth → /home
type AppState = 'splash' | 'language' | 'get-started' | 'auth' | 'landing'

function AuthStep({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Handle redirect result on mount (Capacitor flow)
  useEffect(() => {
    handleGoogleRedirectResult().then(async (user) => {
      if (!user) return
      try {
        const token = await user.getIdToken()
        await fetch(`${API_BASE_URL}/auth/verify`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
        router.push("/home")
      } catch {
        setError("Verification failed. Please try again.")
      }
    })
  }, [])

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      const user = await signInWithGoogle()
      // null means redirect was triggered (Capacitor) — wait for redirect result
      if (!user) return
      const token = await user.getIdToken()
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Verification failed")
      router.push("/home")
    } catch (err: any) {
      setError(t.login.errors.googleFailed)
      setLoading(false)
    }
  }

  return (
    <motion.div
      key="auth"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-md w-full space-y-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pastel-pink to-pastel-violet flex items-center justify-center text-white shadow-xl">
            <Brain className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-slate-800">{t.auth.welcomeBack}</h2>
          <p className="text-slate-500 font-medium">{t.auth.subtitle}</p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 px-8 py-5 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-700 font-black text-lg shadow-sm hover:shadow-md hover:border-slate-200 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-slate-300 border-t-pastel-violet rounded-full animate-spin" />
            ) : (
              <img src="/logo2.png" className="w-6 h-6" alt="google" />
            )}
            {loading ? "Signing in..." : t.auth.signInGoogle}
          </motion.button>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative text-center uppercase text-xs font-black text-slate-300 tracking-widest bg-white px-4">
              {t.auth.or}
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full text-center py-4 text-slate-400 font-bold hover:text-pastel-violet transition-colors"
          >
            {t.auth.mailLogin}
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const [appState, setAppState] = useState<AppState>('splash')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Auto-advance from splash after 3s
  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => setAppState('language'), 3000)
      return () => clearTimeout(timer)
    }
  }, [appState])

  // If already signed in, skip to home
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/home')
    })
    return () => unsub()
  }, [])

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
          <GetStarted key="get-started" onStart={() => setAppState('auth')} />
        )}

        {/* PHASE 4: AUTH */}
        {appState === 'auth' && (
          <AuthStep key="auth" onSuccess={() => router.push('/home')} />
        )}

        {/* PHASE 5: LANDING (fallback for non-auth users browsing) */}
        {appState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 md:pt-12 pb-24 space-y-20 md:space-y-28"
          >
            {/* NAVBAR */}
            <nav className="relative w-full flex items-center justify-between px-6 md:px-8 py-4 md:py-5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm z-50">
              <Link href="/" className="flex items-center gap-3 text-xl font-black text-slate-800">
                <Brain className="w-6 h-6 text-pastel-violet" />
                <span>MediSeen</span>
              </Link>

              <div className="hidden md:flex items-center gap-4">
                <Link href="/login">
                  <button className="px-6 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pastel-pink to-pastel-violet text-white font-semibold shadow hover:opacity-90 transition">
                    Register
                  </button>
                </Link>
              </div>

              <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </nav>

            {/* HERO */}
            <section className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-16 bg-gradient-to-br from-pastel-pink via-white to-pastel-violet min-h-[520px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -mr-24 -mt-24"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
              <div className="relative z-10 max-w-2xl space-y-8">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white font-bold text-sm text-pastel-violet">
                  <Sparkles className="w-4 h-4" />
                  Your Smart Health Assistant
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black text-slate-800 leading-tight">
                  Clear Answers for <br />Your Health.
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-500 max-w-xl font-medium">
                  Get instant, easy-to-understand insights from your medical scans.
                </motion.p>
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Link href="/login" className="w-full sm:w-auto">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-full px-10 py-5 rounded-full bg-gradient-to-r from-pastel-pink to-pastel-violet text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-pastel-violet/20">
                      Check My Health <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-slate-800">AI Tools for Clinical Decision Making</h2>
                <p className="text-slate-400 max-w-xl mx-auto px-4">Mediseen combines deep learning and explainable AI to assist doctors in analyzing medical images faster and more accurately.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {[
                  { title: "Easy Image Scan", desc: "Upload a photo and get a checkup from your phone or computer.", icon: <UploadCloud />, color: "bg-pastel-pink" },
                  { title: "Complete Analysis", desc: "Our smart system checks your results with high precision.", icon: <Activity />, color: "bg-pastel-blue" },
                  { title: "See the Details", desc: "We show you exactly what the AI found with clear visuals.", icon: <Sparkles />, color: "bg-pastel-violet" }
                ].map((item) => (
                  <div key={item.title} className="p-8 md:p-10 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-6">
                    <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center text-white`}>{item.icon}</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{item.title}</h3>
                      <p className="text-slate-400 font-medium mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

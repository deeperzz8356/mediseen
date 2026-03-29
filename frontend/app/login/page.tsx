"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { HeartPulse, Mail, Lock, ChevronRight } from "lucide-react"
import { signInWithGoogle, handleGoogleRedirectResult } from "@/lib/firebase"
import { useLocale } from "../i18n/LocaleContext"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLocale()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Handle redirect result on mount (Capacitor)
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
        setError(t.login.errors.googleFailed)
      }
    })
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError("")
      const user = await signInWithGoogle()
      if (!user) return // redirect triggered on Capacitor
      const token = await user.getIdToken()

      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Verification failed")
      router.push("/home")
    } catch {
      setError(t.login.errors.googleFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    setError("")

    if (!email || !password) {
      setError(t.login.errors.emailPasswordRequired)
      return
    }

    try {
      setLoading(true)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()

      const verifyController = new AbortController()
      const verifyTimeoutId = setTimeout(() => verifyController.abort(), 15000)

      const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: verifyController.signal
      })

      clearTimeout(verifyTimeoutId)

      if (!verifyResponse.ok) throw new Error("Failed to verify authentication token")

      router.push("/home")
    } catch (err: any) {
      if (err.code === "auth/user-not-found") setError(t.login.errors.accountNotFound)
      else if (err.code === "auth/wrong-password") setError(t.login.errors.incorrectPassword)
      else if (err.code === "auth/invalid-email") setError(t.login.errors.invalidEmail)
      else setError(t.login.errors.loginFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-white to-pastel-violet px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl flo-card p-6 md:p-12 space-y-8 md:space-y-10 rounded-[2rem] md:rounded-[3rem]"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl bg-pastel-pink flex items-center justify-center text-white shadow-lg">
              <HeartPulse />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800">{t.login.welcomeBack}</h1>
          <p className="text-slate-400 font-medium">{t.login.subtitle}</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleLogin() }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">{t.login.emailLabel}</label>
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm hover:border-pastel-violet transition">
              <Mail className="w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder={t.login.emailPlaceholder}
                className="w-full outline-none text-slate-700 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">{t.login.passwordLabel}</label>
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm hover:border-pastel-violet transition">
              <Lock className="w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full outline-none text-slate-700 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-pastel-violet text-white font-bold shadow-md hover:shadow-xl transition-all"
          >
            {loading ? t.login.signingIn : t.login.signIn}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </form>

        {/* Google Sign-In */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative text-center uppercase text-xs font-black text-slate-300 tracking-widest bg-white px-4 w-fit mx-auto">{t.auth.or}</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-slate-100 bg-white text-slate-700 font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-pastel-violet rounded-full animate-spin" />
            ) : (
              <img src="/logo2.png" className="w-5 h-5" alt="google" />
            )}
            {t.auth.signInGoogle}
          </motion.button>
        </div>

        <p className="text-center text-slate-400 font-medium">
          {t.login.newToMediseen}{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-pastel-violet font-bold"
          >
            {t.login.createAccount}
          </button>
        </p>

        <p className="text-center text-[11px] text-slate-300 font-medium">
          <a
            href="https://sites.google.com/view/sapappsolutionmediseenpolicy/home"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-400 transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  )
}

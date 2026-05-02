"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import type { FirebaseError } from "firebase/app"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { HeartPulse, Mail, Lock, ChevronRight, User, Stethoscope } from "lucide-react"
import { useLocale } from "../i18n/LocaleContext"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLocale()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState("doctor")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!auth) return

    const checkRedirect = async () => {
      const { handleGoogleRedirectResult } = await import("@/lib/firebase")
      const user = await handleGoogleRedirectResult()
      if (user) {
        await verifyAndRedirect(user)
      }
    }

    checkRedirect()

    const unsub = onAuthStateChanged(auth, async (user) => {
      // Auto-redirect if already logged in and verified
      if (user && !loading) {
        // Optional: can check if verified here
      }
    })
    return () => unsub()
  }, [router])

  const verifyAndRedirect = async (user: any) => {
    try {
      setLoading(true)
      const token = await user.getIdToken()
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Verification failed")
      const data = await res.json()
      
      if (data.has_profile) {
        router.push("/home")
      } else {
        // If no profile, we stay here but in register mode or handle redirect to profile setup
        setMode('register')
        if (user.displayName) setName(user.displayName)
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError(t.login.errors.loginFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError("")
      const { signInWithGoogle } = await import("@/lib/firebase")
      const user = await signInWithGoogle()
      
      if (user) {
        await verifyAndRedirect(user)
      }
    } catch (err: any) {
      console.error("Google login error:", err)
      setError(t.login.errors.googleFailed)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError(t.login.errors.emailPasswordRequired)
      return
    }

    if (mode === 'register' && !name.trim()) {
      setError(t.register.errors.nameRequired)
      return
    }

    try {
      setLoading(true)

      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth!, email, password)
        await verifyAndRedirect(userCredential.user)
      } else {
        // 1. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth!, email, password)
        const token = await userCredential.user.getIdToken()

        // 2. Save user profile to backend
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            role: role,
          }),
        })

        if (!res.ok) throw new Error("Failed to complete registration")
        router.push("/home")
      }
    } catch (err: any) {
      const code = (err as FirebaseError).code
      if (code === "auth/user-not-found") setError(t.login.errors.accountNotFound)
      else if (code === "auth/wrong-password") setError(t.login.errors.incorrectPassword)
      else if (code === "auth/invalid-email") setError(t.login.errors.invalidEmail)
      else if (code === "auth/email-already-in-use") setError("Email already in use")
      else setError(err.message || t.login.errors.loginFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-white to-pastel-violet px-4 py-10 sm:px-6">
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl flo-card p-6 md:p-12 space-y-8 md:space-y-10 rounded-[2rem] md:rounded-[3rem] bg-white shadow-xl"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl bg-pastel-pink flex items-center justify-center text-white shadow-lg">
              <HeartPulse />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800">
            {mode === 'login' ? t.login.welcomeBack : t.register.createAccount}
          </h1>
          <p className="text-slate-400 font-medium">
            {mode === 'login' ? t.login.subtitle : t.register.subtitle}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-50 rounded-2xl p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all
              ${mode === 'login' ? "bg-white shadow text-slate-800" : "text-slate-400"}`}
          >
            {t.login.signIn}
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all
              ${mode === 'register' ? "bg-white shadow text-slate-800" : "text-slate-400"}`}
          >
            {t.register.createAccountBtn}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="flex bg-slate-50 rounded-2xl p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setRole("doctor")}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2
                      ${role === "doctor" ? "bg-white shadow text-slate-800" : "text-slate-400"}`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    {t.register.practitioner}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("patient")}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2
                      ${role === "patient" ? "bg-white shadow text-slate-800" : "text-slate-400"}`}
                  >
                    <User className="w-4 h-4" />
                    {t.register.patient}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">{t.register.fullName}</label>
                  <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm hover:border-pastel-violet transition">
                    <User className="w-5 h-5 text-slate-400" />
                    <input
                      placeholder={role === "doctor" ? "Dr. Sarah Chen" : "John Doe"}
                      className="w-full outline-none text-slate-700 font-medium"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
            {loading ? (mode === 'login' ? t.login.signingIn : t.register.creatingAccount) : (mode === 'login' ? t.login.signIn : t.register.createAccountBtn)}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </form>

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
              <Image src="/logo2.png" className="w-5 h-5" alt="google" width={20} height={20} />
            )}
            {t.auth.signInGoogle}
          </motion.button>
        </div>

        <div className="space-y-4">
          <p className="text-center text-[11px] text-slate-300 font-medium leading-relaxed px-4">
            By continuing, you agree to our{" "}
            <a href="https://sites.google.com/view/sapappsolutionmediseenterms/home" target="_blank" rel="noopener noreferrer" className="text-slate-400 font-bold underline">Terms</a> and <a href="https://sites.google.com/view/sapappsolutionmediseenpolicy/home" target="_blank" rel="noopener noreferrer" className="text-slate-400 font-bold underline">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

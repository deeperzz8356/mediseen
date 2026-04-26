"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import type { FirebaseError } from "firebase/app"
import { auth, signInWithGoogle } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { User, Mail, Lock, Stethoscope, ChevronRight } from "lucide-react"
import { useLocale } from "../i18n/LocaleContext"

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLocale()

  const [role, setRole] = useState("doctor")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleRegister = async () => {
    try {
      setLoading(true)
      setError("")
      const user = await signInWithGoogle()
      if (!user) return
      const token = await user.getIdToken()

      // For Google users, we use "patient" as default role if not specified,
      // but here we use the toggle state 'role' from the UI.
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.displayName || "Google User",
          role: role
        })
      })

      if (!res.ok) throw new Error("Registration failed")
      router.push("/home")
    } catch (err: any) {
      setError(err.message || t.login.errors.googleFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError("")

    if (!email || !password) {
      setError(t.register.errors.emailPasswordRequired)
      return
    }

    if (!name.trim()) {
      setError(t.register.errors.nameRequired)
      return
    }

    if (!auth) {
      setError("Authentication is not configured.")
      return
    }

    try {
      setLoading(true)

      // 1️⃣ Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()

      // 2️⃣ Save user profile to backend
      const registerController = new AbortController()
      const registerTimeoutId = setTimeout(() => registerController.abort(), 15000)

      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          role: role,
        }),
        signal: registerController.signal
      })

      clearTimeout(registerTimeoutId)

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => ({}))
        throw new Error(errorData.detail || "Failed to complete registration")
      }

      // 3️⃣ Verify token with backend
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
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(t.register.errors.timedOut)
      } else {
        setError(err instanceof Error ? err.message : (err as FirebaseError).message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-blue via-white to-pastel-violet px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl flo-card p-6 md:p-12 space-y-8 md:space-y-10 rounded-[2rem] md:rounded-[3rem]"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl bg-pastel-violet flex items-center justify-center text-white shadow-lg">
              <Stethoscope />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800">{t.register.createAccount}</h1>
          <p className="text-slate-400 font-medium">{t.register.subtitle}</p>
        </div>

        <div className="flex bg-slate-50 rounded-2xl p-1">
          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2
              ${role === "doctor" ? "bg-white shadow text-slate-800" : "text-slate-400"}`}
          >
            <Stethoscope className="w-4 h-4" />
            {t.register.practitioner}
          </button>
          <button
            onClick={() => setRole("patient")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2
              ${role === "patient" ? "bg-white shadow text-slate-800" : "text-slate-400"}`}
          >
            <User className="w-4 h-4" />
            {t.register.patient}
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">{t.register.fullName}</label>
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
              <User className="w-5 h-5 text-slate-400" />
              <input
                placeholder={role === "doctor" ? "Sarah Chen" : "John Doe"}
                className="w-full outline-none text-slate-700 font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">{t.register.emailLabel}</label>
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
              <Mail className="w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder={t.register.emailPlaceholder}
                className="w-full outline-none text-slate-700 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">{t.register.passwordLabel}</label>
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
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
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleRegister}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-pastel-blue text-white font-bold shadow-md hover:shadow-xl transition-all"
        >
          {loading ? t.register.creatingAccount : t.register.createAccountBtn}
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        {/* Google Sign-Up */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative text-center uppercase text-xs font-black text-slate-300 tracking-widest bg-white px-4 w-fit mx-auto">{t.auth.or}</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleRegister}
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

        <p className="text-center text-slate-400 font-medium">
          {t.register.alreadyRegistered}{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-pastel-violet font-bold"
          >
            {t.register.signIn}
          </button>
        </p>

        <p className="text-center text-[11px] text-slate-300 font-medium">
          By creating an account you agree to our{" "}
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

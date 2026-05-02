"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import type { FirebaseError } from "firebase/app"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { HeartPulse, Mail, Lock, ChevronRight, User, Shield, Loader2, ArrowLeft } from "lucide-react"
import { signInWithGoogle } from "@/lib/firebase"
import { useLocale } from "../i18n/LocaleContext"

type AuthView = 'login' | 'signup' | 'complete-profile'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLocale()

  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"patient" | "doctor">("patient")
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
      if (user && view === 'login') {
        await verifyAndRedirect(user)
      }
    })
    return () => unsub()
  }, [router])

  const verifyAndRedirect = async (user: any) => {
    try {
      setLoading(true)
      setError("")
      const token = await user.getIdToken()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) throw new Error("Verification failed")
      const data = await res.json()
      console.log("Auth verification result:", data)
      
      if (data.has_profile) {
        console.log("User has profile, routing to /home")
        router.push("/home")
      } else {
        console.log("User has no profile, showing complete-profile view")
        setView('complete-profile')
      }
    } catch (err: any) {
      console.error("Verification error:", err)
      if (err.name === 'AbortError') {
        setError("The server is taking a while to wake up. Please wait a few more seconds and try again.")
      } else {
        setError(t.login.errors.loginFailed)
      }
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
      // If native fails, fallback to web OAuth will auto-trigger
      const message = err.message || t.login.errors.googleFailed
      if (message.includes("unavailable")) {
        setError("Google Sign-In unavailable. Please use email/password signup instead.")
      } else {
        setError(t.login.errors.googleFailed)
      }
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    setError("")

    if (!email || !password) {
      setError(t.login.errors.emailPasswordRequired)
      return
    }

    if (!auth) {
      setError(t.login.errors.loginFailed)
      return
    }

    try {
      setLoading(true)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await verifyAndRedirect(userCredential.user)
    } catch (err: unknown) {
      const code = (err as FirebaseError).code
      if (code === "auth/user-not-found") setError(t.login.errors.accountNotFound)
      else if (code === "auth/wrong-password") setError(t.login.errors.incorrectPassword)
      else if (code === "auth/invalid-email") setError(t.login.errors.invalidEmail)
      else setError(t.login.errors.loginFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    setError("")

    if (!email || !password) {
      setError(t.login.errors.emailPasswordRequired)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!auth) {
      setError(t.login.errors.loginFailed)
      return
    }

    try {
      setLoading(true)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await verifyAndRedirect(userCredential.user)
    } catch (err: unknown) {
      const code = (err as FirebaseError).code
      if (code === "auth/email-already-in-use") setError("This email is already registered")
      else if (code === "auth/invalid-email") setError(t.login.errors.invalidEmail)
      else if (code === "auth/weak-password") setError("Password is too weak")
      else setError(t.login.errors.loginFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteProfile = async () => {
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    setLoading(true)
    setError("")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const user = auth?.currentUser
      if (!user) throw new Error("No user found")

      const token = await user.getIdToken()
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, role }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || "Registration failed")
      }
      
      router.push("/home")
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error("Profile update error:", err)
      if (err.name === 'AbortError') {
        setError("Connection timeout. The server might be waking up—please try one more time.")
      } else {
        setError(err.message || "Could not complete profile. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-white to-pastel-violet px-4 py-10 sm:px-6">
      <AnimatePresence mode="wait">
        {view === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl flo-card p-6 md:p-12 space-y-8 md:space-y-10 rounded-[2rem] md:rounded-[3rem]"
          >
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-50 flex items-center justify-center shadow-lg overflow-hidden p-2">
                  <Image src="/logo2.png" alt="logo" width={60} height={60} className="object-contain" />
                </div>
              </div>
              <h1 className="text-4xl font-black text-slate-800">{t.login.welcomeBack}</h1>
              <p className="text-slate-400 font-medium">{t.login.subtitle}</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="space-y-6">
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
                    suppressHydrationWarning
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
                    suppressHydrationWarning
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
            
            <p className="text-center text-[11px] text-slate-300 font-medium leading-relaxed px-4">
                By continuing, you agree to our{" "}
                <Link href="/privacy" className="text-pastel-violet font-bold hover:underline">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-pastel-violet font-bold hover:underline">Privacy Policy</Link>.
            </p>

            <p className="text-center text-sm text-slate-400 font-medium">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setEmail("")
                  setPassword("")
                  setError("")
                  setView("signup")
                }}
                className="text-pastel-violet font-bold hover:underline"
              >
                Sign up here
              </button>
            </p>
          </motion.div>
        ) : view === 'signup' ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl flo-card p-6 md:p-12 space-y-8 md:space-y-10 rounded-[2rem] md:rounded-[3rem]"
          >
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-50 flex items-center justify-center shadow-lg overflow-hidden p-2">
                  <Image src="/logo2.png" alt="logo" width={60} height={60} className="object-contain" />
                </div>
              </div>
              <h1 className="text-4xl font-black text-slate-800">Create Account</h1>
              <p className="text-slate-400 font-medium">Join us to get started with health insights</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSignup() }} className="space-y-6">
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
                    suppressHydrationWarning
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
                    suppressHydrationWarning
                  />
                </div>
                <p className="text-xs text-slate-400">Minimum 6 characters</p>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-pastel-pink text-white font-bold shadow-md hover:shadow-xl transition-all"
              >
                {loading ? "Creating account..." : "Create Account"}
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
            
            <p className="text-center text-[11px] text-slate-300 font-medium leading-relaxed px-4">
                By creating an account, you agree to our{" "}
                <Link href="/privacy" className="text-pastel-violet font-bold hover:underline">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-pastel-violet font-bold hover:underline">Privacy Policy</Link>.
            </p>

            <p className="text-center text-sm text-slate-400 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setEmail("")
                  setPassword("")
                  setError("")
                  setView("login")
                }}
                className="text-pastel-violet font-bold hover:underline"
              >
                Sign in here
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="complete-profile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl flo-card p-6 md:p-12 space-y-8 md:space-y-10 rounded-[2rem] md:rounded-[3rem]"
          >
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Complete Profile</h1>
              <p className="text-slate-400 font-medium text-sm">One last step to personalize your experience.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="flex items-center gap-4 bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100">
                  <User className="w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-transparent outline-none w-full font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRole("patient")}
                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      role === "patient" ? "border-pastel-pink bg-rose-50/50 text-pastel-pink" : "border-slate-50 bg-slate-50 text-slate-300"
                    }`}
                  >
                    <User className="w-6 h-6" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Patient</span>
                  </button>
                  <button
                    onClick={() => setRole("doctor")}
                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      role === "doctor" ? "border-pastel-violet bg-violet-50/50 text-pastel-violet" : "border-slate-50 bg-slate-50 text-slate-300"
                    }`}
                  >
                    <Shield className="w-6 h-6" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Healthcare</span>
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleCompleteProfile}
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finish <ChevronRight className="w-4 h-4" /></>}
              </motion.button>

              <p className="text-center text-[11px] text-slate-300 font-medium leading-relaxed px-4 pt-4">
                  By clicking Finish, you agree to our{" "}
                  <Link href="/privacy" className="text-pastel-violet font-bold hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-pastel-violet font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


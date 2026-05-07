"use client"

/**
 * /login – Authentication page
 *
 * Views:
 *  - login    → email + password sign-in + Google
 *  - signup   → email + password + name + age + gender + Google
 *  - profile  → standalone profile completion (if needed)
 */

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import type { FirebaseError } from "firebase/app"
import { auth, signInWithGoogle } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { Mail, Lock, ChevronRight, User, Loader2, ArrowLeft, Calendar, Users } from "lucide-react"
import { useAppStore, type GenderOption } from "../store/useAppStore"
import ProfileForm from "../components/ProfileForm"

type AuthView = "login" | "signup" | "profile"

const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

const InputField = ({
  icon: Icon, type, value, onChange, placeholder, label,
}: {
  icon: React.ElementType
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  label: string
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3.5 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
      <Icon className="w-5 h-5 text-slate-300 shrink-0" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300 text-sm"
      />
    </div>
  </div>
)

const GoogleButton = ({ 
  onClick, 
  disabled 
}: { 
  onClick: () => void; 
  disabled?: boolean; 
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 transition-all group"
  >
    <Image src="/google_icon.ico" alt="Google" width={20} height={20} />
    <span className="font-bold text-slate-700 text-sm">Continue with Google</span>
  </motion.button>
)

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { setUser, setHasProfile, setAuthLoaded } = useAppStore()

  const [view, setView] = useState<AuthView>(params.get("complete") === "1" ? "profile" : "login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  // Signup/Profile fields
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<GenderOption>("male")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await verifyAndRedirect(user)
      }
    })
    return () => unsub()
  }, [])

  const verifyAndRedirect = async (user: NonNullable<typeof auth>["currentUser"]) => {
    if (!user) return
    setLoading(true)
    setError("")
    try {
      const token = await user.getIdToken()
      
      let profileData = null;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          profileData = await res.json()
        }
      } catch (fetchErr) {
        console.error("Backend verification failed (CORS/network):", fetchErr);
        // Fallback: Assume no profile if backend is unreachable so they can complete it later.
      }

      setHasProfile(profileData?.has_profile ?? false)
      if (profileData?.has_profile) {
        router.replace("/home")
      } else {
        setView("profile")
      }
    } catch {
      setError("Couldn't verify your account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    setError("")
    if (!email || !password) { setError("Email and password are required."); return }
    if (!auth) { setError("Authentication not configured."); return }
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await verifyAndRedirect(cred.user)
    } catch (err) {
      const fbErr = err as FirebaseError
      const code = fbErr.code
      const message = fbErr.message
      console.error("Firebase Auth Error:", { code, message, customData: fbErr.customData })
      
      if (code === "auth/user-not-found" || code === "auth/invalid-credential")
        setError("No account found with these credentials.")
      else if (code === "auth/wrong-password") setError("Incorrect password.")
      else if (code === "auth/invalid-email") setError("Invalid email address.")
      else if (code === "auth/operation-not-allowed") setError("Email/password sign-in is not enabled. Contact support.")
      else setError(`Sign-in failed: ${message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      const user = await signInWithGoogle()
      if (user) await verifyAndRedirect(user)
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    setError("")
    if (!email || !password) { setError("Email and password are required."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    if (!name.trim()) { setError("Name is required."); return }
    if (!age || isNaN(parseInt(age))) { setError("Valid age is required."); return }
    if (!auth) { setError("Authentication not configured."); return }
    
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const user = cred.user

      // Immediately save profile
      const token = await user.getIdToken()
      
      let profileSaved = false;
      try {
        const regRes = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: name.trim(), age: parseInt(age), gender }),
        })
        profileSaved = regRes.ok;
      } catch (fetchErr) {
        console.error("Backend registration failed (possibly CORS or network):", fetchErr);
        // We do not throw here because Firebase account WAS created successfully.
        profileSaved = false;
      }

      if (!profileSaved) {
        // Even if register fails, user is created. They'll be prompted to complete profile later.
        setUser(user)
        setView("profile")
      } else {
        setUser(user)
        setHasProfile(true)
        setAuthLoaded(true)
        router.replace("/home")
      }
    } catch (err) {
      const fbErr = err as FirebaseError
      const code = fbErr.code
      const message = fbErr.message
      console.error("Firebase Auth Error:", { code, message, customData: fbErr.customData })
      
      if (code === "auth/email-already-in-use") setError("This email is already registered. Try logging in.")
      else if (code === "auth/invalid-email") setError("Invalid email address.")
      else if (code === "auth/weak-password") setError("Password is too weak.")
      else if (code === "auth/operation-not-allowed") setError("Email/password sign-up is not enabled. Contact support.")
      else setError(`Account creation failed: ${message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const cardClass = "w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 space-y-6"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50 px-4 py-10">
      <AnimatePresence mode="wait">
        {/* ── LOGIN ──────────────────────────────────────────────────── */}
        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cardClass}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center mx-auto overflow-hidden p-2 mb-2">
                <Image src="/logo2.png" alt="MediSeen" width={52} height={52} className="object-contain" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Welcome back</h1>
              <p className="text-slate-400 font-medium text-sm">Sign in to your account</p>
            </div>

            <div className="space-y-4">
              <GoogleButton onClick={handleGoogleLogin} disabled={loading} />
              
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Or email</span>
                <div className="flex-1 h-[1px] bg-slate-100" />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="space-y-4">
                <InputField icon={Mail} type="email" label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
                <InputField icon={Lock} type="password" label="Password" value={password} onChange={setPassword} placeholder="••••••••" />
                
                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-400 text-white font-bold shadow-lg shadow-violet-200 disabled:opacity-60 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ChevronRight className="w-5 h-5" /></>}
                </motion.button>
              </form>
            </div>

            <p className="text-center text-sm text-slate-400 font-medium pt-2">
              Don't have an account?{" "}
              <button onClick={() => { setError(""); setView("signup") }} className="text-violet-500 font-bold hover:underline">
                Sign up
              </button>
            </p>

            {/* DEBUG: Reset Flow */}
            <div className="pt-4 border-t border-slate-50 flex justify-center">
              <button 
                onClick={async () => {
                  const { setOnboardingDone, setLanguageDone, setNotificationPermission } = useAppStore.getState();
                  await setOnboardingDone(false);
                  await setLanguageDone(false);
                  await setNotificationPermission("not_asked");
                  window.location.href = "/";
                }}
                className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-violet-400 transition-colors"
              >
                Reset App Flow (Debug)
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SIGN UP ────────────────────────────────────────────────── */}
        {view === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cardClass}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setError(""); setView("login") }}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-900">Create Account</h1>
                <p className="text-xs text-slate-400 font-medium">Personalized for you</p>
              </div>
            </div>

            <div className="space-y-4">
              <GoogleButton onClick={handleGoogleLogin} disabled={loading} />

              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-[1px] bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Or details</span>
                <div className="flex-1 h-[1px] bg-slate-100" />
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 pb-2 scrollbar-hide">
                <InputField icon={User} type="text" label="Full Name" value={name} onChange={setName} placeholder="e.g. John Doe" />
                <InputField icon={Mail} type="email" label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
                <InputField icon={Lock} type="password" label="Password" value={password} onChange={setPassword} placeholder="Min. 6 chars" />
                
                <div className="grid grid-cols-2 gap-4">
                   <InputField icon={Calendar} type="number" label="Age" value={age} onChange={setAge} placeholder="Age" />
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Gender</label>
                     <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-100 px-3 py-3 focus-within:border-violet-300 transition-all">
                       <Users className="w-4 h-4 text-slate-300 shrink-0" />
                       <select 
                         value={gender} 
                         onChange={(e) => setGender(e.target.value as GenderOption)}
                         className="w-full bg-transparent outline-none text-slate-700 font-medium text-xs appearance-none"
                       >
                         {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                       </select>
                     </div>
                   </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-400 text-white font-bold shadow-lg transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Account</span><ChevronRight className="w-5 h-5" /></>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── PROFILE COMPLETION ────────────────────────────────────────── */}
        {view === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cardClass}
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                <User className="w-7 h-7 text-violet-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Complete Profile</h1>
              <p className="text-slate-400 font-medium text-sm">Finalize your details</p>
            </div>

            <ProfileForm 
              submitLabel="Finish Setup"
              onSaved={() => {
                const currentUser = auth?.currentUser
                if (currentUser) {
                  setUser(currentUser)
                  setHasProfile(true)
                  setAuthLoaded(true)
                  router.replace("/home")
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}

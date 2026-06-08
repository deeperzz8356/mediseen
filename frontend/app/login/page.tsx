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
import { useCallback, useEffect, useRef, useState, Suspense } from "react"
import { startTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import type { FirebaseError } from "firebase/app"
import { auth, signInWithGoogle } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { Mail, Lock, ChevronRight, User, Loader2, ArrowLeft, Calendar, Users } from "lucide-react"
import { useAppStore, type GenderOption, type UserProfile } from "../store/useAppStore"
import ProfileForm from "../components/ProfileForm"
import { useLocale } from "../i18n/LocaleContext"

type AuthView = "login" | "signup" | "profile"

const PROFILE_COMPLETED_KEY = "mediseen_profile_completed"

function getProfileCompletedForUid(uid: string) {
  if (typeof window === "undefined") return false
  try {
    const scopedFlag = localStorage.getItem(`${PROFILE_COMPLETED_KEY}_${uid}`)
    const legacyFlag = localStorage.getItem(PROFILE_COMPLETED_KEY)
    return scopedFlag === "true" || legacyFlag === "true"
  } catch {
    return false
  }
}

function setProfileCompletedForUid(uid: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PROFILE_COMPLETED_KEY, "true")
    localStorage.setItem(`${PROFILE_COMPLETED_KEY}_${uid}`, "true")
  } catch {
    // Ignore storage write failures.
  }
}

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
  disabled,
  loading,
}: { 
  onClick: () => void; 
  disabled?: boolean;
  loading?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 transition-all group"
  >
    {loading ? (
      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
    ) : (
      <Image src="/google_icon.ico" alt="Google" width={20} height={20} />
    )}
    <span className="font-bold text-slate-700 text-sm">Continue with Google</span>
  </button>
)

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useLocale()
  const { setUser, setHasProfile, setAuthLoaded, setAuthStatus, ensureGuestSession, setProfile } = useAppStore()

  const [view, setView] = useState<AuthView>(params.get("complete") === "1" ? "profile" : "login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  // Signup/Profile fields
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<GenderOption>("male")

  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState("")

  const authCheckInFlightRef = useRef(false)
  const authActionInFlightRef = useRef(false)
  const viewRef = useRef<AuthView>(view)

  useEffect(() => {
    viewRef.current = view
  }, [view])

  const verifyAndRedirect = useCallback(async (
    user: NonNullable<typeof auth>["currentUser"],
    options?: { navigate?: boolean }
  ) => {
    if (!user) return
    const navigate = options?.navigate ?? true
    if (!API_BASE_URL) {
      setError("Server configuration is missing. Please contact support.")
      return
    }

    setError("")
    try {
      const token = await user.getIdToken()
      setUser(user)
      
      let profileData: { has_profile?: boolean; profile?: UserProfile } | null = null
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          profileData = await res.json()
        }
      } catch (fetchErr) {
        console.error("Backend verification failed (CORS/network):", fetchErr)
        // Fallback: Assume no profile if backend is unreachable so they can complete it later.
      }

      const hasBackendProfile = Boolean(profileData?.has_profile)
      if (hasBackendProfile) {
        setProfileCompletedForUid(user.uid)
        if (profileData?.profile) {
          setProfile(profileData.profile)
        }
      }
      const hasCompletedProfile = hasBackendProfile || getProfileCompletedForUid(user.uid)

      setHasProfile(hasCompletedProfile)
      if (navigate && hasCompletedProfile) {
        startTransition(() => {
          router.replace("/home")
        })
      } else if (navigate) {
        if (viewRef.current !== "profile") {
          setView("profile")
        }
      }
    } catch {
      setError("Couldn't verify your account. Please try again.")
    }
  }, [router, setHasProfile, setUser, setProfile])

  useEffect(() => {
    if (!auth) return

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      if (viewRef.current === "profile") return
      if (authActionInFlightRef.current) return
      if (authCheckInFlightRef.current) return

      authCheckInFlightRef.current = true
      try {
        await verifyAndRedirect(user)
      } finally {
        authCheckInFlightRef.current = false
      }
    })

    return () => unsub()
  }, [verifyAndRedirect])

  const handleLogin = async () => {
    setError("")
    if (!email || !password) { setError("Email and password are required."); return }
    if (!auth) { setError("Authentication not configured."); return }
    setEmailLoading(true)
    authActionInFlightRef.current = true
    let backgroundSyncStarted = false
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const user = cred.user
      setUser(user)
      setHasProfile(true)
      setAuthLoaded(true)
      startTransition(() => {
        router.replace("/home")
      })

      backgroundSyncStarted = true
      void (async () => {
        try {
          await verifyAndRedirect(user, { navigate: false })
        } finally {
          authActionInFlightRef.current = false
        }
      })()
      return
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
    } finally {
      setEmailLoading(false)
      if (!backgroundSyncStarted) {
        authActionInFlightRef.current = false
      }
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setGoogleLoading(true)
    authActionInFlightRef.current = true
    let backgroundSyncStarted = false
    try {
      const user = await signInWithGoogle()
      if (user) {
        setUser(user)
        setHasProfile(true)
        setAuthLoaded(true)
        startTransition(() => {
          router.replace("/home")
        })

        backgroundSyncStarted = true
        void (async () => {
          try {
            await verifyAndRedirect(user, { navigate: false })
          } finally {
            authActionInFlightRef.current = false
          }
        })()
        return
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google Sign-In failed.")
    } finally {
      setGoogleLoading(false)
      if (!backgroundSyncStarted) {
        authActionInFlightRef.current = false
      }
    }
  }

  const handleSignup = async () => {
    setError("")
    if (!email || !password) { setError("Email and password are required."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    if (!name.trim()) { setError("Name is required."); return }
    if (!age || isNaN(parseInt(age))) { setError("Valid age is required."); return }
    if (!auth) { setError("Authentication not configured."); return }
    
    setEmailLoading(true)
    authActionInFlightRef.current = true
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const user = cred.user

      setProfileCompletedForUid(user.uid)
      setUser(user)
      setHasProfile(true)
      setProfile({
        uid: user.uid,
        name: name.trim(),
        email: user.email || email,
        age: parseInt(age, 10),
        gender,
        language: "en",
        onboarding_completed: true,
      })
      setAuthLoaded(true)

      startTransition(() => {
        router.replace("/home")
      })

      void (async () => {
        try {
          const token = await user.getIdToken()
          const regRes = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: name.trim(), age: parseInt(age, 10), gender }),
          })

          if (!regRes.ok) {
            const data = await regRes.json().catch(() => ({}))
            console.error("Backend registration failed:", data?.detail || regRes.statusText)
          }

          void updateProfile(user, { displayName: name.trim() }).catch((profileErr) => {
            console.error("Firebase profile update failed:", profileErr)
          })
        } catch (backgroundErr) {
          console.error("Background signup sync failed:", backgroundErr)
        }
      })()
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
      setEmailLoading(false)
      authActionInFlightRef.current = false
    }
  }

  const handleGuestBypassEntrance = async () => {
    setError("")
    setGuestLoading(true)

    try {
      await ensureGuestSession()
      setAuthStatus("guest")
      setAuthLoaded(true)
      startTransition(() => {
        router.replace("/home")
      })
    } catch (guestErr) {
      console.error("Guest session initialization failed:", guestErr)
      setError("Guest access is temporarily unavailable.")
    } finally {
      setGuestLoading(false)
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
              <div className="w-16 h-16 flex items-center justify-center mx-auto overflow-hidden mb-2">
                <Image src="/logo2.png" alt="MediSeen" width={64} height={64} className="object-contain" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">{t.login.welcomeBack}</h1>
              <p className="text-slate-400 font-medium text-sm">{t.login.subtitle}</p>
            </div>

            <div className="space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="space-y-4">
                <InputField icon={Mail} type="email" label={t.login.emailLabel} value={email} onChange={setEmail} placeholder={t.login.emailPlaceholder} />
                <InputField icon={Lock} type="password" label={t.login.passwordLabel} value={password} onChange={setPassword} placeholder="Min. 6 chars" />
                
                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={emailLoading || googleLoading || guestLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-400 text-white font-bold shadow-lg shadow-violet-200 disabled:opacity-60 transition-all"
                >
                  {emailLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>{t.login.signIn}</span><ChevronRight className="w-5 h-5" /></>}
                </button>
              </form>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.auth.or}</span>
                <div className="flex-1 h-[1px] bg-slate-100" />
              </div>

              <GoogleButton onClick={handleGoogleLogin} disabled={emailLoading || googleLoading || guestLoading} loading={googleLoading} />

              <button
                type="button"
                onClick={handleGuestBypassEntrance}
                disabled={emailLoading || googleLoading || guestLoading}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 disabled:opacity-60 transition-all"
              >
                Continue as Guest
              </button>
            </div>

            <div className="text-center text-sm text-slate-400 font-medium pt-2 space-y-2">
              <p>
              {t.login.newToMediseen}{" "}
              <button onClick={() => { setError(""); setView("signup") }} className="text-violet-500 font-bold hover:underline">
                {t.login.createAccount}
              </button>
              </p>
              <Link href="/privacy" className="block text-xs font-bold text-slate-300 uppercase tracking-widest hover:text-violet-500 transition-colors">
                Privacy Policy
              </Link>
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
                <h1 className="text-xl font-black text-slate-900">{t.register.createAccount}</h1>
                <p className="text-xs text-slate-400 font-medium">{t.register.subtitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSignup() }} className="space-y-4">
                <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 pb-2 scrollbar-hide">
                  <InputField icon={User} type="text" label={t.register.fullName} value={name} onChange={setName} placeholder="e.g. John Doe" />
                  <InputField icon={Mail} type="email" label={t.register.emailLabel} value={email} onChange={setEmail} placeholder={t.register.emailPlaceholder} />
                  <InputField icon={Lock} type="password" label={t.register.passwordLabel} value={password} onChange={setPassword} placeholder="Min. 6 chars" />
                  
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

                <button
                  type="submit"
                  disabled={emailLoading || googleLoading || guestLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-400 text-white font-bold shadow-lg transition-all"
                >
                    {emailLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>{t.register.createAccountBtn}</span><ChevronRight className="w-5 h-5" /></>}
                </button>
              </form>

              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-[1px] bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.auth.or}</span>
                <div className="flex-1 h-[1px] bg-slate-100" />
              </div>

              <GoogleButton onClick={handleGoogleLogin} disabled={emailLoading || googleLoading || guestLoading} loading={googleLoading} />

              <button
                type="button"
                onClick={handleGuestBypassEntrance}
                disabled={emailLoading || googleLoading || guestLoading}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 disabled:opacity-60 transition-all"
              >
                Continue as Guest
              </button>

              <Link href="/privacy" className="block text-center text-xs font-bold text-slate-300 uppercase tracking-widest hover:text-violet-500 transition-colors">
                Privacy Policy
              </Link>
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
              submitLabel={t.languageSelection.finish}
              onSaved={(data) => {
                const currentUser = auth?.currentUser
                if (currentUser) {
                  setProfileCompletedForUid(currentUser.uid)
                  setUser(currentUser)
                  setHasProfile(true)
                  setProfile({
                    uid: currentUser.uid,
                    name: data.name,
                    age: data.age,
                    gender: data.gender,
                    email: currentUser.email || "",
                    language: "en",
                    onboarding_completed: true
                  })
                  setAuthLoaded(true)
                  startTransition(() => {
                    router.replace("/home")
                  })
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
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50 px-4 py-10">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            <div className="flex items-center justify-center gap-2 text-slate-500 font-medium text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading authentication...</span>
            </div>
          </div>
        </div>
      )}
    >
      <LoginContent />
    </Suspense>
  )
}

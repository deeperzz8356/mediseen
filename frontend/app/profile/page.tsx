"use client"

/**
 * /profile – Settings & Profile page
 *
 * Sections:
 * 1. Profile Information (Name, Age, Gender) – uses <ProfileForm />
 * 2. Language – uses <LanguageSelector /> (same component as onboarding)
 * 3. Legal & Support
 * 4. Account Actions (Logout, Delete)
 */

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth"
import { Ban, LogOut, Languages, ChevronRight } from "lucide-react"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { useAppStore, type GenderOption } from "../store/useAppStore"
import { Preferences } from "@capacitor/preferences"
import ProfileForm from "../components/ProfileForm"
import { LANGUAGES } from "../components/LanguageSelector"
import { useLocale } from "../i18n/LocaleContext"

const PROFILE_STORAGE_KEY = "mediseen_patient_profile"
const PROFILE_COMPLETED_KEY = "mediseen_profile_completed"

type StoredProfile = {
  name?: string
  age?: string
  gender?: GenderOption
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

export default function ProfilePage() {
  const router = useRouter()
  const { authStatus, language, setLanguage, setOnboardingDone, setLanguageDone, setNotificationPermission, setHasProfile, setProfile, profile } = useAppStore()
  const { locale, t } = useLocale()

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  
  // Profile data fetched from global store / Firestore
  const [showProfileForm, setShowProfileForm] = useState(!profile?.name && !profile?.age)
  const [profileName, setProfileName] = useState(profile?.name || "")
  const [profileAge, setProfileAge] = useState<number | null>(profile?.age || null)
  const [profileGender, setProfileGender] = useState<GenderOption>(profile?.gender || "prefer_not_to_say")

  useEffect(() => {
    try {
      const localData = localStorage.getItem(PROFILE_STORAGE_KEY)
      if (!localData) return

      const parsed = JSON.parse(localData) as StoredProfile
      setProfileName(profile?.name || parsed.name || "")
      setProfileAge(profile?.age || (parsed.age ? Number.parseInt(parsed.age, 10) : null))
      setProfileGender(profile?.gender || parsed.gender || "prefer_not_to_say")
      setShowProfileForm(false)
    } catch {
      // Ignore malformed local profile data and fall back to backend/Firebase.
    }
  }, [profile])

  useEffect(() => {
    if (!auth) {
      setLoaded(true)
      return
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoaded(true)
      if (!u) {
        return
      }
      setCurrentUser(u)

      // Fetch profile from backend
      try {
        const token = await u.getIdToken()
        const res = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfileName(data.profile.name ?? "")
            setProfileAge(data.profile.age ?? null)
            setProfileGender(data.profile.gender ?? "prefer_not_to_say")
            setShowProfileForm(false)
            setHasProfile(true)
            setProfileCompletedForUid(u.uid)
            setProfile({
              uid: u.uid,
              name: data.profile.name ?? "",
              email: data.profile.email ?? u.email ?? "",
              age: data.profile.age ?? null,
              gender: data.profile.gender ?? "prefer_not_to_say",
              language: data.profile.language ?? "en",
              onboarding_completed: Boolean(data.profile.onboarding_completed ?? true),
            })

            if (data.profile.name && u.displayName !== data.profile.name) {
              void updateProfile(u, { displayName: data.profile.name }).catch(() => null)
            }
          }
        }
      } catch {
        // Use Firebase display name as fallback; do NOT extract from email
        setProfileName(u.displayName ?? "")
      }
    })
    return () => unsub()
  }, [router])

  const handleLogout = async () => {
    if (!auth) return
    setLoggingOut(true)
    try {
      await signOut(auth)
      router.replace("/login")
    } catch {
      setError("Unable to log out right now.")
    } finally {
      setLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!auth) return
    const currentUser = auth.currentUser
    if (!currentUser) return

    const confirmed = window.confirm(
      "PERMANENTLY DELETE your account and all saved data? This cannot be undone."
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      const token = await currentUser.getIdToken()
      const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.detail || "Unable to delete account right now.")
      }
      await signOut(auth)

      // Clear persisted onboarding/language/preferences so app restarts first-launch flow
      try {
        // Update in-memory store and persisted preferences
        await Promise.all([
          setOnboardingDone(false),
          setLanguageDone(false),
          setNotificationPermission("not_asked"),
          setLanguage("en"),
        ])
        // Remove persisted keys just in case
        await Preferences.remove({ key: "onboarding_done" })
        await Preferences.remove({ key: "language_done" })
        await Preferences.remove({ key: "notification_permission_asked" })
        await Preferences.remove({ key: "app_language" })

        // Reset in-memory profile/user
        setProfile(null)
        setCurrentUser(null)
      } catch (prefErr) {
        // Non-fatal; continue to route to entry
        console.warn("Failed to clear preferences after account deletion", prefErr)
      }

      // Navigate to root so the entry router shows splash + onboarding
      router.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete account.")
    } finally {
      setDeleting(false)
    }
  }

  const currentLanguageLabel =
    LANGUAGES.find((l) => l.code === locale || l.code === language)?.native ?? "English"

  if (!loaded) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-24 pb-28 space-y-5">

      {/* ── 1. Profile Information ──────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5"
      >
        <button
          type="button"
          onClick={() => setShowProfileForm((value) => !value)}
          className="w-full flex items-center justify-between gap-4 text-left"
        >
          <div>
            <h2 className="text-xl font-black text-slate-900">{t.profile.profileInfoTitle}</h2>
            <p className="text-slate-400 font-medium text-sm mt-1">
              {showProfileForm ? t.profile.profileInfoSubtitle : "Tap to change your profile details."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest">
              {showProfileForm ? "Hide" : "Change profile"}
            </span>
            <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${showProfileForm ? "rotate-90" : ""}`} />
          </div>
        </button>

        {showProfileForm ? (
          <ProfileForm
            initialName={profileName}
            initialAge={profileAge}
            initialGender={profileGender}
            submitLabel={t.profile.saveProfile}
            onSaved={(data) => {
              setProfileName(data.name)
              setProfileAge(data.age)
              setProfileGender(data.gender)
              const activeUser = auth?.currentUser ?? currentUser
              if (activeUser) {
                setCurrentUser(activeUser)
                setHasProfile(true)
                setProfileCompletedForUid(activeUser.uid)
                setProfile({
                  uid: activeUser.uid,
                  name: data.name,
                  email: activeUser.email ?? "",
                  age: data.age,
                  gender: data.gender,
                  language,
                  onboarding_completed: true,
                })
              }

              try {
                localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
                  name: data.name,
                  age: data.age?.toString() ?? "",
                  gender: data.gender,
                }))
              } catch {
                // Ignore persistence failures.
              }

              setShowProfileForm(false)
            }}
          />
        ) : (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800">{profileName || t.profile.profileInfoTitle}</p>
              <p className="text-xs text-slate-400 font-medium">
                {profileAge ? `${profileAge} years old` : "Open the dropdown to edit your profile."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowProfileForm(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest"
            >
              Change profile
            </button>
          </div>
        )}
      </motion.section>

      {/* ── 2. Language ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <button
          onClick={() => router.push("/onboarding/language?returnTo=/profile")}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Languages className="w-5 h-5 text-violet-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800">{t.profile.languageTitle}</p>
              <p className="text-xs text-slate-400 font-medium">{currentLanguageLabel}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      </motion.section>

      {/* ── 3. Legal & Support ──────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3"
      >
        <h2 className="text-base font-black text-slate-800 px-1">{t.profile.legalSupportTitle}</h2>
        {[
          { label: t.profile.termsLabel, desc: t.profile.termsDesc, href: "https://sites.google.com/view/sapappsolutionmediseenterms/home" },
          { label: t.profile.privacyLabel, desc: t.profile.privacyDesc, href: "https://sites.google.com/view/sapappsolutionmediseenpolicy/home" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-violet-200 transition-all group"
          >
            <div>
              <p className="font-bold text-slate-800 text-sm">{item.label}</p>
              <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-colors" />
          </a>
        ))}
      </motion.section>

      {authStatus === "guest" ? (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4"
        >
          <h2 className="text-xl font-black text-slate-900">{t.profile.accountTitle}</h2>
          <p className="text-slate-500 text-sm font-medium">{t.profile.guestAccountDesc}</p>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            {t.profile.loginSignup}
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-red-50/40 border border-red-100 rounded-3xl p-6 space-y-4"
        >
          <h2 className="text-xl font-black text-slate-900">{t.profile.accountTitle}</h2>
          <p className="text-slate-500 text-sm font-medium">{t.profile.signedInAccountDesc}</p>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              disabled={loggingOut || deleting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 text-white font-bold text-sm shadow-md disabled:opacity-60 transition-all"
            >
              {loggingOut ? t.profile.loggingOut : t.profile.logout}
              <LogOut className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDeleteAccount}
              disabled={deleting || loggingOut}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-md disabled:opacity-60 transition-all"
            >
              {deleting ? t.profile.deleting : t.profile.deleteAccount}
              <Ban className="w-4 h-4" />
            </motion.button>
          </div>

          <p className="text-[11px] text-slate-400">{t.profile.uidLabel}: {currentUser?.uid ?? "—"}</p>
        </motion.section>
      )}
    </div>
  )
}

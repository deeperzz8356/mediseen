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
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { Ban, LogOut, Languages, ChevronRight, ChevronDown } from "lucide-react"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { useAppStore, type GenderOption } from "../store/useAppStore"
import { Preferences } from "@capacitor/preferences"
import ProfileForm from "../components/ProfileForm"
import LanguageSelector, { LANGUAGES } from "../components/LanguageSelector"

export default function ProfilePage() {
  const router = useRouter()
  const { language, setLanguage, setOnboardingDone, setLanguageDone, setNotificationPermission, setProfile, setUser } = useAppStore()

  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  // Profile data fetched from Firestore
  const [profileName, setProfileName] = useState("")
  const [profileAge, setProfileAge] = useState<number | null>(null)
  const [profileGender, setProfileGender] = useState<GenderOption>("prefer_not_to_say")

  // Accordion states
  const [showLanguage, setShowLanguage] = useState(false)

  useEffect(() => {
    if (!auth) { setLoaded(true); return }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoaded(true)
      if (!u) { router.replace("/login"); return }
      setUser(u)

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
          }
        }
      } catch {
        // Use Firebase display name as fallback
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
        setUser(null)
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
    LANGUAGES.find((l) => l.code === language)?.native ?? "English"

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
        <div>
          <h2 className="text-xl font-black text-slate-900">Profile Information</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">
            Update your name, age, and gender.
          </p>
        </div>

        <ProfileForm
          initialName={profileName}
          initialAge={profileAge}
          initialGender={profileGender}
          submitLabel="Save Profile"
          onSaved={(data) => {
            setProfileName(data.name)
            setProfileAge(data.age)
            setProfileGender(data.gender)
          }}
        />
      </motion.section>

      {/* ── 2. Language ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        {/* Header row – tap to expand */}
        <button
          onClick={() => setShowLanguage((v) => !v)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Languages className="w-5 h-5 text-violet-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800">Language</p>
              <p className="text-xs text-slate-400 font-medium">{currentLanguageLabel}</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-300 transition-transform duration-200 ${showLanguage ? "rotate-180" : ""}`}
          />
        </button>

        {/* Expandable language selector – same component as onboarding */}
        <AnimatePresence>
          {showLanguage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-slate-100"
            >
              <LanguageSelector
                showNav={false}
                fullScreen={false}
                onConfirm={async (lang) => {
                  await setLanguage(lang)
                  setShowLanguage(false)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ── 3. Legal & Support ──────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3"
      >
        <h2 className="text-base font-black text-slate-800 px-1">Legal & Support</h2>
        {[
          { label: "Terms and Conditions", desc: "Read our service agreement", href: "https://sites.google.com/view/sapappsolutionmediseenterms/home" },
          { label: "Privacy Policy", desc: "How we handle your data", href: "https://sites.google.com/view/sapappsolutionmediseenpolicy/home" },
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

      {/* ── 4. Account Actions ──────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="bg-red-50/40 border border-red-100 rounded-3xl p-6 space-y-4"
      >
        <h2 className="text-xl font-black text-slate-900">Account</h2>
        <p className="text-slate-500 text-sm font-medium">
          Log out from this device or permanently delete your account.
        </p>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            disabled={loggingOut || deleting}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 text-white font-bold text-sm shadow-md disabled:opacity-60 transition-all"
          >
            {loggingOut ? "Logging Out…" : "Log Out"}
            <LogOut className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleDeleteAccount}
            disabled={deleting || loggingOut}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-md disabled:opacity-60 transition-all"
          >
            {deleting ? "Deleting…" : "Delete Account"}
            <Ban className="w-4 h-4" />
          </motion.button>
        </div>

        <p className="text-[11px] text-slate-400">UID: {user?.uid ?? "—"}</p>
      </motion.section>
    </div>
  )
}

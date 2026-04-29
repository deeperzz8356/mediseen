"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  onAuthStateChanged,
  signOut,
  updateEmail,
  updateProfile,
  User,
} from "firebase/auth"
import { Ban, LogOut, Mail, Save, UserRound, ChevronRight } from "lucide-react"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "../config"

function mapFirebaseError(code?: string): string {
  if (code === "auth/requires-recent-login") {
    return "For security reasons, please sign out and sign in again before updating this detail."
  }
  if (code === "auth/invalid-email") {
    return "Please enter a valid email address."
  }
  if (code === "auth/email-already-in-use") {
    return "That email is already in use by another account."
  }
  return "Unable to update account details right now."
}

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")

  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [status, setStatus] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!auth) {
      setLoaded(true)
      setError("Authentication is not configured.")
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoaded(true)

      if (!currentUser) {
        setUser(null)
        router.replace("/login")
        return
      }

      setUser(currentUser)
      setDisplayName(currentUser.displayName ?? "")
      setEmail(currentUser.email ?? "")
    })

    return () => unsubscribe()
  }, [router])

  const hasChanges = useMemo(() => {
    if (!user) return false
    return (
      displayName.trim() !== (user.displayName ?? "") ||
      email.trim() !== (user.email ?? "")
    )
  }, [displayName, email, user])

  const handleSaveChanges = async () => {
    setError("")
    setStatus("")

    if (!auth) {
      setError("Authentication is not configured.")
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      setError("You are not signed in.")
      router.replace("/login")
      return
    }

    const nextName = displayName.trim()
    const nextEmail = email.trim()
    const currentName = currentUser.displayName ?? ""
    const currentEmail = currentUser.email ?? ""

    if (!nextEmail) {
      setError("Email cannot be empty.")
      return
    }

    if (nextName === currentName && nextEmail === currentEmail) {
      setStatus("No changes to save.")
      return
    }

    try {
      setSaving(true)
      let updatedName = false
      let updatedEmail = false

      if (nextName !== currentName) {
        await updateProfile(currentUser, { displayName: nextName || null })
        updatedName = true
      }

      if (nextEmail !== currentEmail) {
        await updateEmail(currentUser, nextEmail)
        updatedEmail = true
      }

      const updatedLabels = [
        updatedName ? "name" : null,
        updatedEmail ? "email" : null,
      ]
        .filter(Boolean)
        .join(" and ")

      setStatus(`Account ${updatedLabels} updated successfully.`)
    } catch (err) {
      setError(mapFirebaseError((err as { code?: string }).code))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setError("")
    setStatus("")

    if (!auth) {
      setError("Authentication is not configured.")
      return
    }

    try {
      setLoggingOut(true)
      await signOut(auth)
      router.replace("/login")
    } catch {
      setError("Unable to log out right now.")
    } finally {
      setLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    setError("")
    setStatus("")

    if (!auth) {
      setError("Authentication is not configured.")
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      setError("You are not signed in.")
      router.replace("/login")
      return
    }

    const confirmed = window.confirm(
      "PERMANENTLY DELETE your account and all saved data? This cannot be undone. You will be able to sign up again with the same email if you wish."
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      const token = await currentUser.getIdToken()

      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        let detail = "Unable to delete account right now."
        try {
          const body = await response.json()
          detail = body?.detail || detail
        } catch {
          // Ignore
        }
        throw new Error(detail)
      }

      await signOut(auth)
      router.replace("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete account right now.")
    } finally {
      setDeleting(false)
    }
  }

  if (!loaded) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-24 space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flo-card p-8 md:p-10 rounded-[2rem]"
      >
        <h1 className="text-3xl md:text-4xl font-black text-slate-800">Profile Settings</h1>
        <p className="text-slate-500 mt-3 font-medium">
          Update your account details, log out, or delete your account.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flo-card p-8 md:p-10 rounded-[2rem] space-y-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500">Display Name</label>
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
            <UserRound className="w-5 h-5 text-slate-400" />
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full outline-none text-slate-700 font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500">Email Address</label>
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
            <Mail className="w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full outline-none text-slate-700 font-medium"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Note: Changing your email may require a recent sign-in for security.
        </p>

        {status && <p className="text-sm text-emerald-600 font-medium">{status}</p>}
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSaveChanges}
          disabled={saving || !hasChanges}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-pastel-violet text-white font-bold shadow-md hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? "Saving..." : "Save Changes"}
          <Save className="w-4 h-4" />
        </motion.button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flo-card p-8 md:p-10 rounded-[2rem] space-y-6"
      >
        <h2 className="text-xl font-black text-slate-800">Legal & Support</h2>
        <div className="grid gap-4">
          <a
            href="https://sites.google.com/view/sapappsolutionmediseenterms/home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-pastel-violet transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-pastel-violet transition-colors">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Terms and Conditions</p>
                <p className="text-xs text-slate-400 font-medium">Read our service agreement</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pastel-violet transition-all group-hover:translate-x-1" />
          </a>

          <a
            href="https://sites.google.com/view/sapappsolutionmediseenpolicy/home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-pastel-violet transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-pastel-violet transition-colors">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Privacy Policy</p>
                <p className="text-xs text-slate-400 font-medium">How we handle your data</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pastel-violet transition-all group-hover:translate-x-1" />
          </a>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flo-card p-8 md:p-10 rounded-[2rem] border border-red-100 bg-red-50/30"
      >
        <h2 className="text-2xl font-black text-slate-800">Account Actions</h2>
        <p className="text-slate-500 mt-2 font-medium">
          Log out from this device or permanently delete your account.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            disabled={loggingOut || deleting}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-700 text-white font-bold shadow-md hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loggingOut ? "Logging Out..." : "Log Out"}
            <LogOut className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleDeleteAccount}
            disabled={deleting || loggingOut}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-red-600 text-white font-bold shadow-md hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {deleting ? "Deleting..." : "Delete Account"}
            <Ban className="w-4 h-4" />
          </motion.button>
        </div>

        <p className="text-[11px] text-slate-400 mt-5">User ID: {user?.uid || "-"}</p>
      </motion.section>
    </div>
  )
}

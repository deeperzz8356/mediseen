"use client"

/**
 * ProfileForm.tsx – Reusable editable profile form
 *
 * Fields: Name, Age, Gender
 * Saves to backend → Firestore on submit.
 * Used in:
 *  - /profile (settings page)
 *  - /login (profile completion after signup)
 */

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { User, Calendar, Save, Loader2, CheckCircle2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { updateProfile } from "firebase/auth"
import { API_BASE_URL } from "../config"
import type { GenderOption } from "../store/useAppStore"

const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

interface ProfileFormProps {
  initialName?: string
  initialAge?: number | null
  initialGender?: GenderOption
  onSaved?: (data: { name: string; age: number; gender: GenderOption }) => void
  /** Label for submit button */
  submitLabel?: string
}

export default function ProfileForm({
  initialName = "",
  initialAge = null,
  initialGender = "male",
  onSaved,
  submitLabel = "Save Profile",
}: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [age, setAge] = useState(initialAge?.toString() ?? "")
  const [gender, setGender] = useState<GenderOption>(initialGender)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setName(initialName)
    setAge(initialAge?.toString() ?? "")
    setGender(initialGender)
  }, [initialAge, initialGender, initialName])

  const validate = (): string | null => {
    if (!name.trim()) return "Full name is required."
    const ageNum = parseInt(age, 10)
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120)
      return "Please enter a valid age (1–120)."
    return null
  }

  const handleSubmit = async () => {
    setError("")
    setSuccess(false)

    const validationError = validate()
    if (validationError) { setError(validationError); return }

    const user = auth?.currentUser
    if (!user) { setError("Session expired. Please sign in again."); return }

    setSaving(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), age: parseInt(age, 10), gender }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || "Failed to save profile.")
      }

      await updateProfile(user, { displayName: name.trim() })

      setSuccess(true)
      onSaved?.({ name: name.trim(), age: parseInt(age, 10), gender })

      // Auto-clear success after 3s
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError((err as Error).message || "Could not save profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          Full Name
        </label>
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3.5 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
          <User className="w-5 h-5 text-slate-300 shrink-0" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300 text-sm"
          />
        </div>
      </div>

      {/* Age */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          Age
        </label>
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3.5 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
          <Calendar className="w-5 h-5 text-slate-300 shrink-0" />
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 28"
            min={1}
            max={120}
            className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300 text-sm"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          Gender
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGender(opt.value)}
              className={`py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all text-left ${
                gender === opt.value
                  ? "border-violet-400 bg-violet-50 text-violet-700"
                  : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}
      {success && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Profile saved successfully!
        </div>
      )}

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-400 text-white font-bold shadow-lg shadow-violet-200 disabled:opacity-60 transition-all"
      >
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Save className="w-5 h-5" />
            {submitLabel}
          </>
        )}
      </motion.button>
    </div>
  )
}

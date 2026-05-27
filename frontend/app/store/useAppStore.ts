"use client"

import { create } from "zustand"
import { Preferences } from "@capacitor/preferences"
import type { User } from "firebase/auth"

// ─── Persistence keys ────────────────────────────────────────────
const PREF = {
  ONBOARDING_DONE: "onboarding_done",
  LANGUAGE_DONE: "language_done",
  NOTIFICATION_ASKED: "notification_permission_asked",
  LANGUAGE: "app_language",
  GUEST_UID: "mediseen_guest_uid",
} as const

// ─── Types ───────────────────────────────────────────────────────
export type NotificationPermissionState = "not_asked" | "granted" | "denied" | "skipped"
export type AppLanguage = "en" | "hi" | "es" | "fr" | "ar" | "te" | "de" | "ko" | "ja" | "zh"
export type AuthStatus = "initializing" | "unauthenticated" | "guest" | "authenticated"

export type GenderOption = "male" | "female" | "other" | "prefer_not_to_say"

const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ["en", "hi", "es", "fr", "ar", "te", "de", "ko", "ja", "zh"]

function isSupportedLanguage(value: string): value is AppLanguage {
  return SUPPORTED_LANGUAGES.includes(value as AppLanguage)
}

export interface UserProfile {
  uid: string
  name: string
  email: string
  age: number | null
  gender: GenderOption
  language: AppLanguage
  onboarding_completed: boolean
}

interface AppState {
  // ── Auth ─────────────────────────────────────────────────────
  user: User | null
  authStatus: AuthStatus
  authLoaded: boolean
  hasProfile: boolean
  profile: UserProfile | null
  guestUid: string

  // ── Onboarding ───────────────────────────────────────────────
  onboardingDone: boolean
  onboardingLoaded: boolean

  // ── Language selection (separate from onboarding) ─────────────
  languageDone: boolean
  languageLoaded: boolean

  // ── Notification ─────────────────────────────────────────────
  notificationPermission: NotificationPermissionState
  notificationAsked: boolean

  // ── Language ─────────────────────────────────────────────────
  language: AppLanguage

  // ── Actions ──────────────────────────────────────────────────
  setUser: (user: User | null) => void
  setAuthStatus: (status: AuthStatus) => void
  setAuthLoaded: (v: boolean) => void
  setHasProfile: (v: boolean) => void
  setProfile: (p: UserProfile | null) => void
  loadGuestIdentity: () => Promise<string>
  ensureGuestSession: () => Promise<UserProfile>

  setOnboardingDone: (done: boolean) => Promise<void>
  loadOnboardingState: () => Promise<void>

  setLanguageDone: (done: boolean) => Promise<void>
  loadLanguageDone: () => Promise<void>

  setNotificationPermission: (state: NotificationPermissionState) => Promise<void>
  loadNotificationState: () => Promise<void>

  setLanguage: (lang: AppLanguage) => Promise<void>
  loadLanguage: () => Promise<void>

  bootstrap: () => Promise<void>
}

function createGuestUid() {
  const randomSegment = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "")
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

  return `guest_${randomSegment}`
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  authStatus: "initializing",
  authLoaded: false,
  hasProfile: false,
  profile: null,
  guestUid: "",

  onboardingDone: false,
  onboardingLoaded: false,

  languageDone: false,
  languageLoaded: false,

  notificationPermission: "not_asked",
  notificationAsked: false,

  language: "en",

  // ── Auth ─────────────────────────────────────────────────────
  setUser: (user) => set({ user, authStatus: user ? "authenticated" : "unauthenticated" }),
  setAuthStatus: (authStatus) => set({ authStatus }),
  setAuthLoaded: (authLoaded) => set({ authLoaded }),
  setHasProfile: (hasProfile) => set({ hasProfile }),
  setProfile: (profile) => set({ profile }),
  loadGuestIdentity: async () => {
    const { value } = await Preferences.get({ key: PREF.GUEST_UID })
    const guestUid = value || createGuestUid()

    if (!value) {
      await Preferences.set({ key: PREF.GUEST_UID, value: guestUid })
    }

    set({ guestUid })
    return guestUid
  },
  ensureGuestSession: async () => {
    const guestUid = get().guestUid || (await get().loadGuestIdentity())
    const guestProfile: UserProfile = {
      uid: guestUid,
      name: "Guest",
      email: "",
      age: null,
      gender: "prefer_not_to_say",
      language: get().language,
      onboarding_completed: false,
    }

    set({
      user: null,
      authStatus: "guest",
      hasProfile: false,
      profile: guestProfile,
    })

    return guestProfile
  },

  // ── Onboarding ───────────────────────────────────────────────
  setOnboardingDone: async (done) => {
    await Preferences.set({ key: PREF.ONBOARDING_DONE, value: done ? "true" : "false" })
    set({ onboardingDone: done })
  },
  loadOnboardingState: async () => {
    const { value } = await Preferences.get({ key: PREF.ONBOARDING_DONE })
    set({ onboardingDone: value === "true", onboardingLoaded: true })
  },

  // ── Language done ─────────────────────────────────────────────
  setLanguageDone: async (done) => {
    await Preferences.set({ key: PREF.LANGUAGE_DONE, value: done ? "true" : "false" })
    set({ languageDone: done })
  },
  loadLanguageDone: async () => {
    const { value } = await Preferences.get({ key: PREF.LANGUAGE_DONE })
    set({ languageDone: value === "true", languageLoaded: true })
  },

  // ── Notification ─────────────────────────────────────────────
  setNotificationPermission: async (state) => {
    await Preferences.set({ key: PREF.NOTIFICATION_ASKED, value: state })
    set({ notificationPermission: state, notificationAsked: state !== "not_asked" })
  },
  loadNotificationState: async () => {
    const { value } = await Preferences.get({ key: PREF.NOTIFICATION_ASKED })
    const state = (value as NotificationPermissionState) || "not_asked"
    set({ notificationPermission: state, notificationAsked: state !== "not_asked" })
  },

  // ── Language ─────────────────────────────────────────────────
  setLanguage: async (lang) => {
    await Preferences.set({ key: PREF.LANGUAGE, value: lang })
    set({ language: lang })
  },
  loadLanguage: async () => {
    const { value } = await Preferences.get({ key: PREF.LANGUAGE })
    set({ language: value && isSupportedLanguage(value) ? value : "en" })
  },

  // ── Bootstrap ────────────────────────────────────────────────
  bootstrap: async () => {
    await Promise.all([
      get().loadOnboardingState(),
      get().loadLanguageDone(),
      get().loadNotificationState(),
      get().loadLanguage(),
      get().loadGuestIdentity(),
    ])
  },
}))

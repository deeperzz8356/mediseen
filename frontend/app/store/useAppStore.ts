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
} as const

// ─── Types ───────────────────────────────────────────────────────
export type NotificationPermissionState = "not_asked" | "granted" | "denied" | "skipped"
export type HealthSyncState = "unavailable" | "not_connected" | "connected" | "error"
export type AppLanguage = "en" | "hi" | "bn" | "ml" | "ta" | "es" | "fr" | "ar"

export type GenderOption = "male" | "female" | "other" | "prefer_not_to_say"

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
  authLoaded: boolean
  hasProfile: boolean
  profile: UserProfile | null

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

  // ── Health ───────────────────────────────────────────────────
  healthSyncState: HealthSyncState
  healthData: {
    steps: number
    caloriesBurned: number
    sleepHours: number
    heartRate: number
  } | null

  // ── Actions ──────────────────────────────────────────────────
  setUser: (user: User | null) => void
  setAuthLoaded: (v: boolean) => void
  setHasProfile: (v: boolean) => void
  setProfile: (p: UserProfile | null) => void

  setOnboardingDone: (done: boolean) => Promise<void>
  loadOnboardingState: () => Promise<void>

  setLanguageDone: (done: boolean) => Promise<void>
  loadLanguageDone: () => Promise<void>

  setNotificationPermission: (state: NotificationPermissionState) => Promise<void>
  loadNotificationState: () => Promise<void>

  setLanguage: (lang: AppLanguage) => Promise<void>
  loadLanguage: () => Promise<void>

  setHealthSyncState: (state: HealthSyncState) => void
  setHealthData: (data: AppState["healthData"]) => void

  bootstrap: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  authLoaded: false,
  hasProfile: false,
  profile: null,

  onboardingDone: false,
  onboardingLoaded: false,

  languageDone: false,
  languageLoaded: false,

  notificationPermission: "not_asked",
  notificationAsked: false,

  language: "en",

  healthSyncState: "not_connected",
  healthData: null,

  // ── Auth ─────────────────────────────────────────────────────
  setUser: (user) => set({ user }),
  setAuthLoaded: (authLoaded) => set({ authLoaded }),
  setHasProfile: (hasProfile) => set({ hasProfile }),
  setProfile: (profile) => set({ profile }),

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
    set({ language: (value as AppLanguage) || "en" })
  },

  // ── Health ───────────────────────────────────────────────────
  setHealthSyncState: (healthSyncState) => set({ healthSyncState }),
  setHealthData: (healthData) => set({ healthData }),

  // ── Bootstrap ────────────────────────────────────────────────
  bootstrap: async () => {
    await Promise.all([
      get().loadOnboardingState(),
      get().loadLanguageDone(),
      get().loadNotificationState(),
      get().loadLanguage(),
    ])
  },
}))

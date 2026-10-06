"use client"

import { create } from "zustand"
import { Preferences } from "@capacitor/preferences"
import { App } from "@capacitor/app"
import { Capacitor } from "@capacitor/core"
import {
  checkHealthConnected,
  connectHealth,
  isHealthAvailable,
  openHealthSettings,
  readTodayActiveCalories,
  readTodaySteps,
} from "../../lib/health"
import {
  getPersistedSensorSteps,
  isPedometerAvailable,
  isSensorPermissionGranted,
  requestSensorPermission,
  setSensorEnabledFlag,
  setSensorStepsListener,
  startSensorUpdates,
  stopSensorUpdates,
  wasSensorEnabled,
} from "../../lib/pedometer"

export type ActivitySource = "none" | "health_connect" | "phone_sensor" | "health_connect_and_sensor"

const PREF = {
  WATER_DAY: "activity_water_day",
  WATER_COUNT: "activity_water_count",
  WEIGHT_KG: "activity_weight_kg",
} as const

const STEP_GOAL = 10000
const CALORIE_GOAL = 500
const WATER_GOAL = 8
const DEFAULT_WEIGHT_KG = 70

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function estimateCalories(steps: number, weightKg: number): number {
  return Math.round(steps * 0.04 * (weightKg / 70))
}

function resolveSource(hc: boolean, sensor: boolean): ActivitySource {
  if (hc && sensor) return "health_connect_and_sensor"
  if (hc) return "health_connect"
  if (sensor) return "phone_sensor"
  return "none"
}

interface ActivityState {
  source: ActivitySource
  hcConnected: boolean
  hcAvailable: boolean
  sensorEnabled: boolean
  sensorAvailable: boolean
  steps: number
  hcSteps: number
  hcCalories: number
  caloriesBurned: number
  waterGlasses: number
  stepGoal: number
  calorieGoal: number
  waterGoal: number
  weightKg: number
  lastSyncedAt: number | null
  loading: boolean
  error: string | null
  nativeReady: boolean

  hydrateLocal: () => Promise<void>
  syncActivity: () => Promise<void>
  connectHealthConnect: () => Promise<boolean>
  enableSensor: () => Promise<boolean>
  openHealthConnectSettings: () => Promise<void>
  addWater: () => Promise<void>
  removeWater: () => Promise<void>
  setWeightKg: (kg: number) => Promise<void>
  startForegroundTracking: () => Promise<void>
  stopForegroundTracking: () => Promise<void>
}

let resumeListenerAttached = false

async function loadWater(): Promise<number> {
  const day = todayKey()
  const storedDay = (await Preferences.get({ key: PREF.WATER_DAY })).value
  if (storedDay !== day) {
    await Preferences.set({ key: PREF.WATER_DAY, value: day })
    await Preferences.set({ key: PREF.WATER_COUNT, value: "0" })
    return 0
  }
  return Math.max(0, Number.parseInt((await Preferences.get({ key: PREF.WATER_COUNT })).value || "0", 10) || 0)
}

async function saveWater(count: number): Promise<void> {
  await Preferences.set({ key: PREF.WATER_DAY, value: todayKey() })
  await Preferences.set({ key: PREF.WATER_COUNT, value: String(Math.max(0, count)) })
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  source: "none",
  hcConnected: false,
  hcAvailable: false,
  sensorEnabled: false,
  sensorAvailable: false,
  steps: 0,
  hcSteps: 0,
  hcCalories: 0,
  caloriesBurned: 0,
  waterGlasses: 0,
  stepGoal: STEP_GOAL,
  calorieGoal: CALORIE_GOAL,
  waterGoal: WATER_GOAL,
  weightKg: DEFAULT_WEIGHT_KG,
  lastSyncedAt: null,
  loading: false,
  error: null,
  nativeReady: Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android",

  hydrateLocal: async () => {
    const [water, weightRaw] = await Promise.all([
      loadWater(),
      Preferences.get({ key: PREF.WEIGHT_KG }),
    ])
    const weightKg = Number.parseFloat(weightRaw.value || "") || DEFAULT_WEIGHT_KG
    set({ waterGlasses: water, weightKg })

    if (!get().nativeReady) return

    const [hcAvailable, sensorAvailable, hcConnected, sensorGranted, sensorWanted] = await Promise.all([
      isHealthAvailable(),
      isPedometerAvailable(),
      checkHealthConnected(),
      isSensorPermissionGranted(),
      wasSensorEnabled(),
    ])

    const sensorEnabled = sensorGranted && sensorWanted
    set({
      hcAvailable,
      sensorAvailable,
      hcConnected,
      sensorEnabled,
      source: resolveSource(hcConnected, sensorEnabled),
    })
  },

  syncActivity: async () => {
    set({ loading: true, error: null })

    try {
      await get().hydrateLocal()

      let hcSteps = 0
      let hcCalories = 0
      let sensorSteps = 0

      if (get().hcConnected) {
        ;[hcSteps, hcCalories] = await Promise.all([
          readTodaySteps(),
          readTodayActiveCalories(),
        ])
      }

      if (get().sensorEnabled) {
        sensorSteps = await getPersistedSensorSteps()
      }

      const steps = Math.max(hcSteps, sensorSteps)
      const caloriesBurned =
        hcCalories > 0 ? hcCalories : estimateCalories(steps, get().weightKg)

      set({
        steps,
        hcSteps,
        hcCalories,
        caloriesBurned,
        source: resolveSource(get().hcConnected, get().sensorEnabled),
        lastSyncedAt: Date.now(),
        loading: false,
      })
    } catch (error) {
      console.error("Activity sync error:", error)
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Sync failed",
      })
    }
  },

  connectHealthConnect: async () => {
    set({ loading: true, error: null })
    const ok = await connectHealth()
    set({ hcConnected: ok, loading: false })
    if (ok) await get().syncActivity()
    else set({ error: "Health Connect permission was not granted." })
    return ok
  },

  enableSensor: async () => {
    set({ loading: true, error: null })
    const ok = await requestSensorPermission()
    set({ sensorEnabled: ok, loading: false })
    if (ok) {
      await get().startForegroundTracking()
      await get().syncActivity()
    } else {
      set({ error: "Physical activity permission was not granted." })
    }
    return ok
  },

  openHealthConnectSettings: async () => {
    await openHealthSettings()
  },

  addWater: async () => {
    const next = get().waterGlasses + 1
    await saveWater(next)
    set({ waterGlasses: next })
  },

  removeWater: async () => {
    const next = Math.max(0, get().waterGlasses - 1)
    await saveWater(next)
    set({ waterGlasses: next })
  },

  setWeightKg: async (kg: number) => {
    const weightKg = Math.max(30, Math.min(250, kg || DEFAULT_WEIGHT_KG))
    await Preferences.set({ key: PREF.WEIGHT_KG, value: String(weightKg) })
    set({ weightKg })
    await get().syncActivity()
  },

  startForegroundTracking: async () => {
    if (!get().nativeReady) return

    if (!resumeListenerAttached) {
      resumeListenerAttached = true
      App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) void get().syncActivity()
      }).catch(() => {
        resumeListenerAttached = false
      })
    }

    const enabled = get().sensorEnabled || (await wasSensorEnabled())
    const granted = await isSensorPermissionGranted()
    if (!enabled || !granted) return

    setSensorStepsListener((sensorSteps) => {
      const { hcConnected, hcSteps, hcCalories, weightKg } = get()
      const steps = Math.max(hcSteps, sensorSteps)
      const caloriesBurned = hcCalories > 0 ? hcCalories : estimateCalories(steps, weightKg)
      set({
        steps,
        caloriesBurned,
        sensorEnabled: true,
        source: resolveSource(hcConnected, true),
      })
    })

    const sensorSteps = await startSensorUpdates()
    set({
      sensorEnabled: true,
      steps: Math.max(get().hcSteps, get().steps, sensorSteps),
      source: resolveSource(get().hcConnected, true),
    })
    await setSensorEnabledFlag(true)
  },

  stopForegroundTracking: async () => {
    setSensorStepsListener(null)
    await stopSensorUpdates(true)
  },
}))

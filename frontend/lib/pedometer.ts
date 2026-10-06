import { Capacitor, type PluginListenerHandle } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"
import { CapacitorPedometer } from "@capgo/capacitor-pedometer"

const PREF = {
  DAY: "activity_sensor_day",
  STEPS: "activity_sensor_steps",
  ENABLED: "activity_sensor_enabled",
} as const

let measurementHandle: PluginListenerHandle | null = null
let sessionDelta = 0
/** Steps already counted today before the current sensor session. */
let dayBase = 0
let updatesActive = false
let onStepsCallback: ((steps: number) => void) | null = null

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"
}

function currentTotal(): number {
  return Math.max(0, dayBase + sessionDelta)
}

async function ensureDayBucket(): Promise<void> {
  const day = todayKey()
  const storedDay = (await Preferences.get({ key: PREF.DAY })).value
  if (storedDay !== day) {
    dayBase = 0
    sessionDelta = 0
    await Preferences.set({ key: PREF.DAY, value: day })
    await Preferences.set({ key: PREF.STEPS, value: "0" })
    return
  }
  if (!updatesActive) {
    const stepsRaw = (await Preferences.get({ key: PREF.STEPS })).value
    dayBase = Math.max(0, Number.parseInt(stepsRaw || "0", 10) || 0)
  }
}

async function persistTotal(): Promise<void> {
  await Preferences.set({ key: PREF.DAY, value: todayKey() })
  await Preferences.set({ key: PREF.STEPS, value: String(currentTotal()) })
}

export async function isPedometerAvailable(): Promise<boolean> {
  if (!isNativeAndroid()) return false
  try {
    const result = await CapacitorPedometer.isAvailable()
    return !!result.stepCounting
  } catch {
    return false
  }
}

export async function isSensorPermissionGranted(): Promise<boolean> {
  if (!(await isPedometerAvailable())) return false
  try {
    const status = await CapacitorPedometer.checkPermissions()
    return status.activityRecognition === "granted"
  } catch {
    return false
  }
}

export async function wasSensorEnabled(): Promise<boolean> {
  const value = (await Preferences.get({ key: PREF.ENABLED })).value
  return value === "true"
}

export async function setSensorEnabledFlag(enabled: boolean): Promise<void> {
  await Preferences.set({ key: PREF.ENABLED, value: enabled ? "true" : "false" })
}

export async function requestSensorPermission(): Promise<boolean> {
  if (!(await isPedometerAvailable())) return false
  try {
    const status = await CapacitorPedometer.requestPermissions()
    const granted = status.activityRecognition === "granted"
    if (granted) await setSensorEnabledFlag(true)
    return granted
  } catch (error) {
    console.error("Pedometer permission error:", error)
    return false
  }
}

export async function getPersistedSensorSteps(): Promise<number> {
  await ensureDayBucket()
  return currentTotal()
}

export function setSensorStepsListener(cb: ((steps: number) => void) | null): void {
  onStepsCallback = cb
}

export async function startSensorUpdates(): Promise<number> {
  if (!(await isSensorPermissionGranted())) return 0
  await ensureDayBucket()
  sessionDelta = 0

  if (measurementHandle) {
    await measurementHandle.remove()
    measurementHandle = null
  }

  measurementHandle = await CapacitorPedometer.addListener("measurement", (event) => {
    sessionDelta = Math.max(0, Math.round(event.numberOfSteps || 0))
    const total = currentTotal()
    onStepsCallback?.(total)
    void persistTotal()
  })

  try {
    await CapacitorPedometer.startMeasurementUpdates()
    updatesActive = true
  } catch (error) {
    console.error("Start pedometer error:", error)
    updatesActive = false
  }

  return currentTotal()
}

export async function stopSensorUpdates(flush = true): Promise<number> {
  const total = currentTotal()
  if (flush) {
    dayBase = total
    sessionDelta = 0
    await persistTotal()
  }

  try {
    await CapacitorPedometer.stopMeasurementUpdates()
  } catch {
    // ignore
  }

  updatesActive = false

  if (measurementHandle) {
    await measurementHandle.remove()
    measurementHandle = null
  }

  return dayBase
}

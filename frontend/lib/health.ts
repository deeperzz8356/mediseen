import { Capacitor } from "@capacitor/core"
import { Health } from "@capgo/capacitor-health"

const READ_TYPES = ["steps", "calories"] as const

function startOfTodayISO(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"
}

export async function isHealthAvailable(): Promise<boolean> {
  if (!isNativeAndroid()) return false
  try {
    const result = await Health.isAvailable()
    return !!result.available
  } catch {
    return false
  }
}

export async function checkHealthConnected(): Promise<boolean> {
  if (!(await isHealthAvailable())) return false
  try {
    const status = await Health.checkAuthorization({
      read: [...READ_TYPES],
    })
    return READ_TYPES.every((t) => status.readAuthorized.includes(t))
  } catch {
    return false
  }
}

export async function connectHealth(): Promise<boolean> {
  if (!(await isHealthAvailable())) return false
  try {
    const status = await Health.requestAuthorization({
      read: [...READ_TYPES],
    })
    return status.readAuthorized.includes("steps")
  } catch (error) {
    console.error("Health Connect authorization error:", error)
    return false
  }
}

export async function openHealthSettings(): Promise<void> {
  if (!isNativeAndroid()) return
  try {
    await Health.openHealthConnectSettings()
  } catch (error) {
    console.error("Open Health Connect settings error:", error)
  }
}

async function sumToday(dataType: "steps" | "calories"): Promise<number> {
  try {
    const { samples } = await Health.queryAggregated({
      dataType,
      startDate: startOfTodayISO(),
      endDate: new Date().toISOString(),
      bucket: "day",
      aggregation: "sum",
    })
    if (samples.length > 0) {
      return Math.round(samples.reduce((sum, s) => sum + (s.value || 0), 0))
    }
  } catch {
    // Fall through to sample sum
  }

  try {
    const { samples } = await Health.readSamples({
      dataType,
      startDate: startOfTodayISO(),
      endDate: new Date().toISOString(),
      limit: 5000,
      ascending: true,
    })
    return Math.round(samples.reduce((sum, s) => sum + (s.value || 0), 0))
  } catch (error) {
    console.error(`Health Connect read ${dataType} error:`, error)
    return 0
  }
}

export async function readTodaySteps(): Promise<number> {
  if (!(await checkHealthConnected())) return 0
  return sumToday("steps")
}

export async function readTodayActiveCalories(): Promise<number> {
  if (!(await checkHealthConnected())) return 0
  return sumToday("calories")
}

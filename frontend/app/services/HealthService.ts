"use client"

/**
 * HealthService.ts – Capacitor bridge for Health Connect
 *
 * Always checks availability before calling native methods.
 * Fails gracefully – never crashes, always returns a typed payload.
 */

import { Capacitor, registerPlugin } from "@capacitor/core"
import { useAppStore } from "../store/useAppStore"

// ─── Plugin interface ─────────────────────────────────────────────
interface HealthConnectPlugin {
  checkAvailability(): Promise<{ status: number; available: boolean; needsUpdate: boolean }>
  requestHealthPermissions(): Promise<{
    granted: boolean
    message?: string
    error?: string
  }>
  fetchHealthData(): Promise<{
    available: boolean
    steps: number
    caloriesBurned: number
    sleepHours: number
    error?: string
    message?: string
  }>
}

// Register the native plugin (no-op on web)
const HealthConnect = registerPlugin<HealthConnectPlugin>("HealthConnect")

// ─── Health Connect availability codes ───────────────────────────
// 0 = SDK_UNAVAILABLE, 1 = SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED, 2 = SDK_AVAILABLE
export const HC_STATUS = {
  UNAVAILABLE: 0,
  NEEDS_UPDATE: 1,
  AVAILABLE: 2,
} as const

// ─── Service ─────────────────────────────────────────────────────
export const HealthService = {
  /**
   * Check if Health Connect is available on this device.
   * Sets the global healthSyncState in Zustand accordingly.
   */
  async checkAvailability(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      useAppStore.getState().setHealthSyncState("unavailable")
      return false
    }

    try {
      const result = await HealthConnect.checkAvailability()
      if (!result.available) {
        useAppStore.getState().setHealthSyncState(
          result.needsUpdate ? "error" : "unavailable"
        )
        return false
      }
      return true
    } catch (error) {
      console.error("[HealthService] Availability check failed:", error)
      useAppStore.getState().setHealthSyncState("error")
      return false
    }
  },

  /**
   * Request Health Connect permissions.
   * Opens the Health Connect permissions screen.
   */
  async requestPermissions(): Promise<boolean> {
    const available = await this.checkAvailability()
    if (!available) return false

    try {
      const result = await HealthConnect.requestHealthPermissions()
      return result.granted
    } catch (error) {
      console.error("[HealthService] Permission request failed:", error)
      return false
    }
  },

  /**
   * Fetch health data for the last 24 hours.
   * Returns null if unavailable or on error.
   */
  async fetchData(): Promise<{
    steps: number
    caloriesBurned: number
    sleepHours: number
  } | null> {
    const available = await this.checkAvailability()
    if (!available) return null

    try {
      const data = await HealthConnect.fetchHealthData()

      if (!data.available) {
        useAppStore.getState().setHealthSyncState("unavailable")
        return null
      }

      const payload = {
        steps: data.steps || 0,
        caloriesBurned: data.caloriesBurned || 0,
        sleepHours: data.sleepHours || 0,
      }

      // Persist to Zustand
      useAppStore.getState().setHealthData({ ...payload, heartRate: 0 })
      useAppStore.getState().setHealthSyncState("connected")

      return payload
    } catch (error) {
      console.error("[HealthService] Fetch failed:", error)
      useAppStore.getState().setHealthSyncState("error")
      return null
    }
  },
}

"use client"

/**
 * permissions.ts – Unified, lazy permission utilities for MediSeen
 *
 * IMPORTANT RULES:
 * - Camera permission: only call when user taps Scan
 * - Storage/gallery permission: only call when user taps Upload
 * - Notification permission: only after explain-first UX on Android 13+
 * - Never request any permission at app startup
 *
 * Android compatibility:
 * - Android 8–12  (API 26–32): Runtime camera + READ_EXTERNAL_STORAGE for gallery access
 * - Android 13+   (API 33+):   READ_MEDIA_IMAGES or selected-photos access for gallery
 * - Android 14+   (API 34+):   System photo picker preferred (no permission needed)
 */

import { Capacitor } from "@capacitor/core"
import { Camera, CameraPermissionState } from "@capacitor/camera"
import { LocalNotifications } from "@capacitor/local-notifications"

// Filesystem is imported lazily inside helpers to avoid bundling issues on web

// ─── Types ─────────────────────────────────────────────────────────
export type PermissionResult = {
  granted: boolean
  permanentlyDenied: boolean
  error?: string
}

// ─── Helper: get Android API level from user agent ──────────────────
function getAndroidApiLevel(): number {
  if (typeof navigator === "undefined") return 0
  const ua = navigator.userAgent
  const match = ua.match(/Android\s+(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === "android"
}

export function isAndroid13Plus(): boolean {
  return isAndroid() && getAndroidApiLevel() >= 13
}

export function isAndroid14Plus(): boolean {
  return isAndroid() && getAndroidApiLevel() >= 14
}

// ─── Camera Permission ─────────────────────────────────────────────
/**
 * Request camera permission lazily (only when user triggers scan).
 * Returns PermissionResult so the caller can show appropriate UI.
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  if (!Capacitor.isNativePlatform()) {
    // Web: browsers handle permission inline, treat as granted
    return { granted: true, permanentlyDenied: false }
  }

  try {
    const status = await Camera.checkPermissions()

    if (status.camera === "granted") {
      return { granted: true, permanentlyDenied: false }
    }

    if (status.camera === "denied") {
      // Permanently denied – user must go to Settings
      return { granted: false, permanentlyDenied: true }
    }

    // prompt or prompt-with-rationale: request it
    const result = await Camera.requestPermissions({ permissions: ["camera"] })

    if (result.camera === "granted") {
      return { granted: true, permanentlyDenied: false }
    }

    const permanentlyDenied = result.camera === "denied"
    return { granted: false, permanentlyDenied }
  } catch (error) {
    console.error("[permissions] Camera permission error:", error)
    return { granted: false, permanentlyDenied: false, error: String(error) }
  }
}

// ─── Gallery Permission ───────────────────────────────────────────
/**
 * Request photo/gallery permission lazily before opening the upload picker.
 */
export async function requestGalleryPermission(): Promise<PermissionResult> {
  if (!Capacitor.isNativePlatform()) {
    return { granted: true, permanentlyDenied: false }
  }

  if (isAndroid14Plus()) {
    return { granted: true, permanentlyDenied: false }
  }

  try {
    const status = await Camera.checkPermissions()
    const currentPhotos = status.photos as CameraPermissionState

    if (currentPhotos === "granted" || currentPhotos === "limited") {
      return { granted: true, permanentlyDenied: false }
    }

    if (currentPhotos === "denied") {
      return { granted: false, permanentlyDenied: true }
    }

    const result = await Camera.requestPermissions({ permissions: ["photos"] })
    const photosResult = result.photos as CameraPermissionState

    if (photosResult === "granted" || photosResult === "limited") {
      return { granted: true, permanentlyDenied: false }
    }

    return { granted: false, permanentlyDenied: photosResult === "denied" }
  } catch (error) {
    console.error("[permissions] Gallery permission error:", error)
    return { granted: false, permanentlyDenied: false, error: String(error) }
  }
}

// ─── Notification Permission ──────────────────────────────────────
/**
 * Request notification permission.
 * Android 12 and below: skip silently (permission not required).
 * Android 13+: POST_NOTIFICATIONS runtime permission.
 *
 * MUST only be called after the user has seen the explain-first UI
 * and explicitly tapped "Allow".
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  if (!Capacitor.isNativePlatform()) {
    // Web – LocalNotifications API may work in some browsers
    try {
      const result = await LocalNotifications.requestPermissions()
      return { granted: result.display === "granted", permanentlyDenied: false }
    } catch {
      return { granted: false, permanentlyDenied: false }
    }
  }

  // Android 12 and below: permission not required at runtime, treat as granted
  if (isAndroid() && !isAndroid13Plus()) {
    return { granted: true, permanentlyDenied: false }
  }

  try {
    const current = await LocalNotifications.checkPermissions()
    if (current.display === "granted") {
      return { granted: true, permanentlyDenied: false }
    }

    const result = await LocalNotifications.requestPermissions()
    const granted = result.display === "granted"
    const permanentlyDenied = result.display === "denied"
    return { granted, permanentlyDenied }
  } catch (error) {
    console.error("[permissions] Notification permission error:", error)
    return { granted: false, permanentlyDenied: false, error: String(error) }
  }
}

// ─── Files / Generic Storage Permission ───────────────────────────
/**
 * Request permission to access files (images and documents) lazily.
 * Uses the Camera photos permission for images (Android 13+ uses READ_MEDIA_IMAGES),
 * and falls back to Filesystem permissions for generic file access on older Android.
 */
export async function requestFilesPermission(): Promise<PermissionResult> {
  if (!Capacitor.isNativePlatform()) {
    return { granted: true, permanentlyDenied: false }
  }

  // Android 14+: system picker, no runtime permission required
  if (isAndroid14Plus()) {
    return { granted: true, permanentlyDenied: false }
  }

  try {
    // Prefer the same flow as gallery (Camera photos permission) which maps to READ_MEDIA_IMAGES on Android 13+
    const gallery = await requestGalleryPermission()
    if (gallery.granted) return gallery

    // If gallery permission denied but Filesystem permission might help (older devices)
    try {
      const { Filesystem } = await import('@capacitor/filesystem')
      // checkPermissions may return { publicStorage: 'granted' } on some platforms
      if (typeof Filesystem.checkPermissions === 'function') {
        const fsStatus: any = await Filesystem.checkPermissions()
        if (fsStatus && fsStatus.publicStorage === 'granted') {
          return { granted: true, permanentlyDenied: false }
        }
        const req: any = await Filesystem.requestPermissions()
        if (req && req.publicStorage === 'granted') {
          return { granted: true, permanentlyDenied: false }
        }
        return { granted: false, permanentlyDenied: req && req.publicStorage === 'denied' }
      }
    } catch (fsErr) {
      console.warn('[permissions] Filesystem permission check failed', fsErr)
      return gallery
    }

    return { granted: false, permanentlyDenied: false }
  } catch (error) {
    console.error('[permissions] Files permission error:', error)
    return { granted: false, permanentlyDenied: false, error: String(error) }
  }
}

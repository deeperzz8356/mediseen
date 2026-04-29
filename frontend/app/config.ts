// On the Android Emulator, 10.0.2.2 is the address of the host machine (loopback)
const isDev = process.env.NODE_ENV === "development"
const HUGGING_FACE_SPACE_ORIGIN = "https://meediseen-meediseen.hf.space"
const DEFAULT_RENDER_API_URL = "https://mediseen.onrender.com"

function normalizeApiUrl(url: string) {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return ""
  }

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl
  }

  return trimmedUrl
}

function isNativeRuntime() {
  if (typeof window === "undefined") {
    return false
  }

  const protocol = window.location.protocol.toLowerCase()
  const hostname = window.location.hostname.toLowerCase()

  return (
    "Capacitor" in window ||
    protocol === "capacitor:" ||
    protocol === "file:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  )
}

function getApiBaseUrl() {
  const envApiUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL ?? "")
  const isCapacitor = isNativeRuntime()

  if (isCapacitor) {
    if (envApiUrl) {
      try {
        const parsedUrl = new URL(envApiUrl)
        const hostname = parsedUrl.hostname.toLowerCase()

        if (hostname !== "localhost" && hostname !== "127.0.0.1") {
          return envApiUrl
        }
      } catch {
        return envApiUrl
      }
    }

    return DEFAULT_RENDER_API_URL
  }

  if (envApiUrl) {
    return envApiUrl
  }

  if (isDev) {
    return "http://127.0.0.1:8000"
  }

  return "/api"
}

export const API_BASE_URL = getApiBaseUrl()

function getApiOrigin() {
  if (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://")) {
    return new URL(API_BASE_URL).origin
  }

  if (isNativeRuntime()) {
    return HUGGING_FACE_SPACE_ORIGIN
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return HUGGING_FACE_SPACE_ORIGIN
}

export function resolveBackendAssetUrl(path?: string) {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  const apiOrigin = getApiOrigin()
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${apiOrigin}${normalizedPath}`
}

if (!process.env.NEXT_PUBLIC_API_URL && !isDev && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_API_URL is not set. Using default: " + API_BASE_URL)
}

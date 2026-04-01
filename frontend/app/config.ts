// On the Android Emulator, 10.0.2.2 is the address of the host machine (loopback)
const isDev = process.env.NODE_ENV === "development"
const HUGGING_FACE_API_URL = "https://meediseen-meediseen.hf.space/api"

function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  if (isDev) {
    return "http://127.0.0.1:8000"
  }

  const isCapacitor = typeof window !== "undefined" && "Capacitor" in window
  return isCapacitor ? HUGGING_FACE_API_URL : "/api"
}

export const API_BASE_URL = getApiBaseUrl()

if (!process.env.NEXT_PUBLIC_API_URL && !isDev && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_API_URL is not set. Using default: " + API_BASE_URL)
}

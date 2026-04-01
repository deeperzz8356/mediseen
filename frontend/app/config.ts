// On the Android Emulator, 10.0.2.2 is the address of the host machine (loopback)
const isDev = process.env.NODE_ENV === "development"
const defaultUrl = isDev ? "http://127.0.0.1:8000" : "/api"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || defaultUrl

if (!process.env.NEXT_PUBLIC_API_URL && !isDev) {
	console.warn("⚠️ NEXT_PUBLIC_API_URL is not set. Using default: " + API_BASE_URL)
}

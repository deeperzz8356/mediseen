import en, { Translations } from "./translations/en"
import ar from "./translations/ar"
import fr from "./translations/fr"
import es from "./translations/es"
import hi from "./translations/hi"

export type Locale = "en" | "ar" | "fr" | "es" | "hi"

export const LOCALES: { code: Locale; name: string; flag: string; dir?: "rtl" }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
]

const translations: Record<Locale, Translations> = { en, ar, fr, es, hi }

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? en
}

export const LOCALE_STORAGE_KEY = "mediseen_locale"

export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "en"
  return (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale) ?? "en"
}

export function saveLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }
}

export type { Translations }

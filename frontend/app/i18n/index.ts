import en, { Translations } from "./translations/en"
import ar from "./translations/ar"
import fr from "./translations/fr"
import es from "./translations/es"
import hi from "./translations/hi"
import te from "./translations/te"
import de from "./translations/de"
import ko from "./translations/ko"
import ja from "./translations/ja"
import zh from "./translations/zh"

export type Locale = "en" | "ar" | "fr" | "es" | "hi" | "te" | "de" | "ko" | "ja" | "zh"

export const LOCALES: { code: Locale; name: string; flag: string; dir?: "rtl" }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", dir: "rtl" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "zh", name: "Mandarin (Chinese)", flag: "🇨🇳" },
]

const translations: Record<Locale, unknown> = { en, ar, fr, es, hi, te, de, ko, ja, zh }

function deepMergeTranslations(base: Translations, override: unknown): Translations {
  if (!override || typeof override !== "object") return base
  const result: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const baseValue = (base as Record<string, unknown>)[key]
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMergeTranslations(
        baseValue as Translations,
        value
      )
    } else if (value !== undefined) {
      result[key] = value
    }
  }
  return result as Translations
}

export function getTranslations(locale: Locale): Translations {
  if (locale === "en") return en
  return deepMergeTranslations(en, translations[locale])
}

export const LOCALE_STORAGE_KEY = "mediseen_locale"
export const GLOBAL_LOCALE_STORAGE_KEY = "mediseen_global_locale"

export function isLocale(value: string): value is Locale {
  return (LOCALES as { code: Locale }[]).some((locale) => locale.code === value)
}

export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "en"
  const storedLocale = localStorage.getItem(GLOBAL_LOCALE_STORAGE_KEY) ?? localStorage.getItem(LOCALE_STORAGE_KEY)
  return storedLocale && isLocale(storedLocale) ? storedLocale : "en"
}

function scheduleLocaleStorageWrite(langCode: string): void {
  if (typeof window === "undefined") return

  const writeLocale = () => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, langCode)
      localStorage.setItem(GLOBAL_LOCALE_STORAGE_KEY, langCode)

      if (typeof document !== "undefined") {
        document.documentElement.lang = langCode
        document.documentElement.dir = langCode === "ar" ? "rtl" : "ltr"
      }
    } catch {
      console.warn("Storage engine warning: fallback interface routing initiated.")
    }
  }

  if (typeof window.queueMicrotask === "function") {
    window.queueMicrotask(writeLocale)
    return
  }

  window.setTimeout(writeLocale, 0)
}

export function saveLocaleSafe(langCode: string): void {
  scheduleLocaleStorageWrite(langCode)
}

export function saveLocale(locale: Locale) {
  saveLocaleSafe(locale)
}

export type { Translations }

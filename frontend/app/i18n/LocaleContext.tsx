"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Locale, Translations, getTranslations, getSavedLocale, saveLocaleSafe, LOCALES } from "./index"

interface LocaleContextValue {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
  dir: "ltr" | "rtl"
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  t: getTranslations("en"),
  setLocale: () => {},
  dir: "ltr",
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getSavedLocale())

  const setLocale = (l: Locale) => {
    // Step 1: Force immediate, synchronous react tree state updates to free the UI thread
    setLocaleState(l)

    // Step 2: Defer heavier Disk I/O operations safely to prevent thread locking
    setTimeout(() => {
      try {
        saveLocaleSafe(l)
        const newDir = LOCALES.find((loc) => loc.code === l)?.dir === "rtl" ? "rtl" : "ltr"
        document.documentElement.lang = l
        document.documentElement.dir = newDir
      } catch (e) {
        console.warn("Storage write handled safely.", e)
      }
    }, 0)
  }

  const dir = LOCALES.find((l) => l.code === locale)?.dir === "rtl" ? "rtl" : "ltr"
  const t = getTranslations(locale)

  useEffect(() => {
    if (typeof document === "undefined") return

    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [dir, locale])

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale, dir }}>
      <div dir={dir}>{children}</div>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}

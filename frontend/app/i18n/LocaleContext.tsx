"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Locale, Translations, getTranslations, getSavedLocale, saveLocale, LOCALES } from "./index"

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
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const saved = getSavedLocale()
    setLocaleState(saved)
  }, [])

  const setLocale = (l: Locale) => {
    saveLocale(l)
    setLocaleState(l)
  }

  const dir = LOCALES.find((l) => l.code === locale)?.dir === "rtl" ? "rtl" : "ltr"
  const t = getTranslations(locale)

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale, dir }}>
      <div dir={dir}>{children}</div>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}

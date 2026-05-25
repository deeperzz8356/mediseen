"use client"

/**
 * LanguageSelector.tsx – Reusable language selection component with image icons
 */

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, ChevronLeft } from "lucide-react"
// Use a plain <img> for dynamic public/flags fallbacks
import { useAppStore, type AppLanguage } from "../store/useAppStore"
import { useLocale } from "../i18n/LocaleContext"
import { LOCALES } from "../i18n"

const syncableLocales = ["en", "hi", "es", "fr", "ar", "te", "de", "ko", "ja", "zh"] as const

function canSyncLocale(value: AppLanguage): value is (typeof syncableLocales)[number] {
  return syncableLocales.includes(value as (typeof syncableLocales)[number])
}

export const LANGUAGES: {
  code: AppLanguage
  name: string
  native: string
  flag?: string
}[] = LOCALES.map((locale) => ({
  code: locale.code,
  name: locale.name,
  native: locale.name,
  flag: locale.flag,
}))

interface LanguageSelectorProps {
  onConfirm?: (lang: AppLanguage) => void
  onBack?: () => void
  showNav?: boolean
  fullScreen?: boolean
}

export default function LanguageSelector({
  onConfirm,
  onBack,
  showNav = true,
  fullScreen = true,
}: LanguageSelectorProps) {
  const { language, setLanguage } = useAppStore()
  const { locale, setLocale, t } = useLocale()
  const [selected, setSelected] = useState<AppLanguage>(language)

  useEffect(() => {
    setSelected(locale)
  }, [locale])

  const handleConfirm = async () => {
    await setLanguage(selected)
    if (canSyncLocale(selected)) {
      setLocale(selected)
    }
    onConfirm?.(selected)
  }

  const container = fullScreen
    ? "fixed inset-0 z-50 bg-white flex flex-col"
    : "flex flex-col"

  return (
    <div className={container}>
      {/* Top navigation bar */}
      {showNav && (
        <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b border-slate-100">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            aria-label={t.onboarding.languageSelector.back}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-black text-slate-800">{t.onboarding.languageSelector.title}</h1>
          <div className="w-10 h-10" />
        </div>
      )}

      {/* Header text */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-black text-slate-900 leading-tight">
          {t.onboarding.languageSelector.title}
        </h2>
        <p className="text-slate-400 font-medium text-sm mt-1.5">
          {t.onboarding.languageSelector.subtitle}
        </p>
      </div>

      {/* Language list */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-2.5">
        {LANGUAGES.map((lang, i) => {
          const isSelected = selected === lang.code
          return (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(lang.code)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-100"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              {/* Flag image helper component - attempts SVG then PNG, falls back to nothing so emoji shows */}
              {/* Note: defined inside this file to avoid extra exports */}
              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 shrink-0 bg-slate-50 relative">
                <FlagImage code={lang.code} name={lang.name} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base leading-tight ${isSelected ? "text-violet-700" : "text-slate-800"}`}>
                  {lang.native}
                </p>
                <p className={`text-xs font-semibold mt-0.5 ${isSelected ? "text-violet-400" : "text-slate-400"}`}>
                  {lang.name}
                </p>
              </div>

              {/* Radio indicator */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-violet-500 bg-violet-500" : "border-slate-200 bg-white"}`}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-400 text-white font-bold text-base shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {t.onboarding.languageSelector.confirm}
        </motion.button>
      </div>
    </div>
  )
}

function FlagImage({ code, name }: { code: string; name: string }) {
  const [ext, setExt] = useState<"svg" | "png" | "">("svg")

  if (!ext) return null

  return (
    <img
      src={`/flags/${code}.${ext}`}
      alt={name}
      className="w-full h-full object-cover"
      onError={() => {
        if (ext === "svg") setExt("png")
        else setExt("")
      }}
    />
  )
}

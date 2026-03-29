"use client"

import { motion } from "framer-motion"
import { Languages, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { LOCALES, Locale } from "../i18n"
import { useLocale } from "../i18n/LocaleContext"

interface Props {
  onComplete: () => void
}

export default function LanguageSelection({ onComplete }: Props) {
  const { locale, setLocale, t } = useLocale()
  const [selected, setSelected] = useState<Locale>(locale)

  const handleFinish = () => {
    setLocale(selected)
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-slate-50">
      
      <div className="max-w-md w-full space-y-10 text-center">
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-3xl bg-pastel-violet/20 flex items-center justify-center mx-auto shadow-sm"
        >
          <Languages className="w-12 h-12 text-pastel-violet" />
        </motion.div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-800">{t.languageSelection.title}</h2>
          <p className="text-slate-500 font-medium tracking-wide">{t.languageSelection.subtitle}</p>
        </div>

        {/* LANGUAGE GRID */}
        <div className="grid grid-cols-2 gap-4">
          {LOCALES.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(lang.code)}
              className={`relative flex flex-col items-center gap-2 p-6 rounded-[2rem] border-2 transition-all duration-300
                ${selected === lang.code 
                  ? "bg-pastel-violet/10 border-pastel-violet shadow-lg shadow-pastel-violet/10" 
                  : "bg-white border-slate-100 shadow-sm"
                }
              `}
            >
              <span className="text-3xl mb-1">{lang.flag}</span>
              <span className={`font-black text-sm ${selected === lang.code ? "text-pastel-violet" : "text-slate-600"}`}>
                {lang.name}
              </span>
              {selected === lang.code && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-pastel-violet" />}
            </motion.button>
          ))}
        </div>

        <div className="pt-6">
          <motion.button
            onClick={handleFinish}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-pastel-pink to-pastel-violet text-white font-black text-xl shadow-xl shadow-pastel-violet/30"
          >
            {t.languageSelection.finish}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

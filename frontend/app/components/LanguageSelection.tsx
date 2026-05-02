"use client"

import { motion } from "framer-motion"
import { Languages, ChevronRight } from "lucide-react"

interface LanguageSelectionProps {
  onComplete: () => void
}

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' }
]

export default function LanguageSelection({ onComplete }: LanguageSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-40 bg-white px-6 py-12 flex flex-col"
    >
      <div className="flex-1 space-y-10 max-w-xl mx-auto w-full">
        <header className="space-y-4 pt-8">
          <div className="w-12 h-12 rounded-2xl bg-pastel-violet/10 flex items-center justify-center text-pastel-violet">
            <Languages className="w-6 h-6" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
            Choose your <br/><span className="text-pastel-violet">Language</span>
          </h2>
          <p className="text-slate-400 font-medium">Select your preferred language to continue with MediSeen.</p>
        </header>

        <div className="space-y-3">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={onComplete}
              className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-pastel-violet hover:shadow-xl hover:shadow-pastel-violet/5 transition-all group"
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest group-hover:text-pastel-violet transition-colors">{lang.name}</span>
                <span className="text-xl font-bold text-slate-800">{lang.native}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-pastel-violet group-hover:text-white group-hover:border-pastel-violet transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] py-8">
        MediSeen Universal Access
      </p>
    </motion.div>
  )
}

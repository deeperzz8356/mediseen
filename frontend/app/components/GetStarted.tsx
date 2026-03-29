"use client"

import { motion } from "framer-motion"
import { Brain, Sparkles, ChevronRight, Share2, ShieldCheck, Heart } from "lucide-react"
import { useLocale } from "../i18n/LocaleContext"

interface Props {
  onStart: () => void
}

export default function GetStarted({ onStart }: Props) {
  const { t } = useLocale()

  const features = [
    { label: t.getStarted.features.secureData, icon: <ShieldCheck className="text-pastel-pink" /> },
    { label: t.getStarted.features.fastResults, icon: <Sparkles className="text-pastel-blue" /> },
    { label: t.getStarted.features.aiPowered, icon: <Brain className="text-pastel-violet" /> },
    { label: t.getStarted.features.community, icon: <Share2 className="text-pastel-peach" /> },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col p-8 sm:p-12">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pastel-pink/10 rounded-full blur-[100px] -mr-[250px] -mt-[250px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pastel-violet/10 rounded-full blur-[100px] -ml-[250px] -mb-[250px]" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 text-xl font-black text-slate-800"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pastel-pink to-pastel-violet flex items-center justify-center text-white shadow-lg">
          <Brain className="w-6 h-6" />
        </div>
        <span>MediSeen</span>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center space-y-12 max-w-lg">
        
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pastel-violet/10 border border-pastel-violet/20 font-black text-sm text-pastel-violet"
          >
            <Sparkles className="w-4 h-4" />
            {t.getStarted.badge}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-7xl font-black text-slate-800 leading-tight whitespace-pre-line"
          >
            {t.getStarted.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-slate-400 font-medium"
          >
            {t.getStarted.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {features.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                {item.icon}
              </div>
              <span className="font-bold text-sm text-slate-600">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-auto space-y-6"
      >
        <button
          onClick={onStart}
          className="w-full sm:w-80 group relative overflow-hidden px-8 py-5 rounded-[2rem] bg-gradient-to-r from-pastel-pink to-pastel-violet text-white font-black text-xl flex items-center justify-between shadow-2xl shadow-pastel-violet/30 hover:shadow-pastel-violet/50 transition-all duration-300 transform active:scale-95"
        >
          <span className="relative z-10">{t.getStarted.cta}</span>
          <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-pastel-violet transition-all duration-300">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>

        <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
          {t.getStarted.terms} <Heart className="w-3 h-3 text-red-300" />
        </p>
      </motion.div>
    </div>
  )
}

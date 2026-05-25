"use client"

import { motion } from "framer-motion"
import { Sparkles, Activity, ShieldCheck, ChevronRight, ScanLine, BrainCircuit, Utensils } from "lucide-react"
import Image from "next/image"

import { useLocale } from "../i18n/LocaleContext"
import { NotificationService } from "../services/NotificationService"

interface GetStartedProps {
  onStart: () => void
}

export default function GetStarted({ onStart }: GetStartedProps) {
  const { t } = useLocale()

  const handleStart = async () => {
    // Attempt to request notifications as they start
    try {
      const granted = await NotificationService.requestPermissions()
      if (granted) {
        await NotificationService.scheduleRepeatingNotifications()
      }
    } catch (err) {
      console.error("Notification setup failed:", err)
    }
    onStart()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-40 bg-white flex flex-col overflow-y-auto"
    >
      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-12">
        
        {/* Hero Section */}
        <div className="relative h-80 w-full rounded-[3rem] overflow-hidden bg-gradient-to-br from-pastel-pink/10 to-pastel-violet/10 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center opacity-5"
          >
            <BrainCircuit className="w-64 h-64 text-pastel-violet" />
          </motion.div>
          
          <div className="relative z-10 text-center space-y-6">
             <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center mx-auto overflow-hidden p-3 border border-slate-50">
                <Image src="/logo2.png" alt="logo" width={80} height={80} className="object-contain" />
             </div>
             <div className="px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[10px] font-black text-pastel-violet uppercase tracking-[0.3em] inline-block shadow-sm">
               {t.getStarted.badge}
             </div>
          </div>
        </div>

        <div className="mt-12 space-y-8 flex-1">
          <header className="space-y-3">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
              {t.getStarted.headline.split("\n").map((line, index, lines) => (
                <span key={line}>
                  {line}
                  {index < lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              {t.getStarted.subtitle}
            </p>
          </header>

          <div className="grid gap-6">
            <FeatureItem 
              icon={<ScanLine className="w-5 h-5" />}
              title={t.getStarted.features.secureData}
              desc={t.getStarted.subtitle}
              color="bg-rose-50 text-rose-500"
            />
            <FeatureItem 
              icon={<Activity className="w-5 h-5" />}
              title={t.getStarted.features.fastResults}
              desc={t.getStarted.subtitle}
              color="bg-blue-50 text-blue-500"
            />
            <FeatureItem 
              icon={<BrainCircuit className="w-5 h-5" />}
              title={t.getStarted.features.aiPowered}
              desc={t.getStarted.subtitle}
              color="bg-violet-50 text-violet-500"
            />
            <FeatureItem 
              icon={<Utensils className="w-5 h-5" />}
              title={t.getStarted.features.community}
              desc={t.getStarted.subtitle}
              color="bg-emerald-50 text-emerald-500"
            />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStart}
            className="w-full py-6 rounded-3xl bg-slate-900 text-white font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 group"
          >
            {t.getStarted.cta}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <p className="mt-4 text-center text-[11px] font-medium text-slate-400">
            {t.getStarted.terms}
          </p>
        </div>
      </div>
    </motion.div>
  )
}


function FeatureItem({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="flex gap-5 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-800 group-hover:text-pastel-violet transition-colors">{title}</h4>
        <p className="text-sm text-slate-400 font-medium leading-snug">{desc}</p>
      </div>
    </div>
  )
}


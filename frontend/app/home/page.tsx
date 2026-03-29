"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

import {
  Plus,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Heart,
  Calendar,
  Activity
} from "lucide-react"

import { MedicalAssistanceIllustration } from "../components/Illustrations"
import { useLocale } from "../i18n/LocaleContext"

export default function Home() {
  const [username, setUsername] = useState("")
  const [mounted, setMounted] = useState(false)
  const { t } = useLocale()

  useEffect(() => {
    setMounted(true)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split("@")[0] || "there"
        setUsername(name)
      }
    })
    return () => unsubscribe()
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  const quickActions = [
    {
      title: t.home.quickActions.startDiagnosis,
      desc: t.home.quickActions.startDiagnosisDesc,
      icon: <Plus />,
      color: "bg-pastel-pink",
      link: "/diagnose"
    },
    {
      title: t.home.quickActions.learnExplore,
      desc: t.home.quickActions.learnExploreDesc,
      icon: <MessageCircle />,
      color: "bg-pastel-violet",
      link: "/disease-info"
    },
  ]

  const metrics = [
    { icon: <Heart className="text-pastel-pink" />, label: t.home.metrics.heartRate, value: "72 BPM", desc: t.home.metrics.heartRateDesc, bg: "bg-pastel-pink/5" },
    { icon: <Activity className="text-pastel-blue" />, label: t.home.metrics.oxygenLevel, value: "98%", desc: t.home.metrics.oxygenLevelDesc, bg: "bg-pastel-blue/5" },
    { icon: <Plus className="text-pastel-green" />, label: t.home.metrics.dailySteps, value: "8,432", desc: t.home.metrics.dailyStepsDesc, bg: "bg-pastel-green/5" },
    { icon: <Calendar className="text-pastel-violet" />, label: t.home.metrics.activityLogs, value: "45 Min", desc: t.home.metrics.activityLogsDesc, bg: "bg-pastel-violet/5" },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 space-y-24 pb-32">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[3rem] p-12 md:p-20 bg-gradient-to-br from-pastel-pink to-pastel-violet min-h-[450px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16"></div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/30 border border-white/40 text-sm font-bold text-white"
          >
            <Sparkles className="w-4 h-4" />
            {t.home.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white leading-[1.1]"
          >
            {t.home.greeting}<br />{username || "there"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-white/90 font-medium"
          >
            {t.home.subtitle}
          </motion.p>
        </div>

        <div className="absolute right-12 bottom-12 hidden md:block opacity-80 rotate-6">
          <MedicalAssistanceIllustration className="w-64 h-64" bgColor="#FFFFFF" />
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="space-y-10">
        <div className="flex items-end justify-between px-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800">{t.home.whatDoYouNeed}</h2>
            <p className="text-slate-400 font-medium">{t.home.chooseTool}</p>
          </div>
          <Link
            href="/diagnose"
            className="text-pastel-violet font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            {t.home.viewAllTools}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickActions.map((item, i) => (
            <Link key={item.title} href={item.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flo-card p-10 h-full flex flex-col justify-between cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-[1.5rem] ${item.color} flex items-center justify-center text-white shadow-inner mb-8`}>
                  <div className="scale-125">{item.icon}</div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-800">{item.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* LIVE METRICS */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between px-4 gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{t.home.liveMetrics}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t.home.connectedVia}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2.5 rounded-xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-pastel-pink" /> 
            {t.home.syncDevice}
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((item, i) => (
            <motion.div
              key={item.label}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-[2.5rem] border border-slate-100/50 flex flex-col gap-6 ${item.bg} hover:shadow-xl transition-all duration-300 group shadow-md shadow-black/5`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800">{item.value}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.desc}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  )
}

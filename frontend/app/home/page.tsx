"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

import {
  Plus,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Activity,
  Heart,
  BookOpen,
  Settings,
  X,
} from "lucide-react"

import { MedicalAssistanceIllustration } from "../components/Illustrations"
import { useLocale } from "../i18n/LocaleContext"

import { useAppStore } from "../store/useAppStore"

export default function Home() {
  const { t } = useLocale()
  const { authStatus, user, profile } = useAppStore()

  const username = useMemo(() => {
    if (authStatus !== "authenticated" || !user) return ""
    return profile?.name?.trim() || user.displayName?.trim() || ""
  }, [authStatus, profile?.name, user])

  const [showSetupBanner, setShowSetupBanner] = useState(false)
  useEffect(() => {
    if (authStatus === "authenticated") {
      const isComplete = localStorage.getItem('mediseen_setup_complete') === 'true'
      if (!isComplete) {
         setShowSetupBanner(true)
      }
    }
  }, [authStatus])


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
      link: "/library"
    },
  ]

  const allTools = [
    {
      title: t.home.quickActions.startDiagnosis,
      desc: t.home.quickActions.startDiagnosisDesc,
      icon: <Activity />,
      color: "bg-pastel-pink",
      link: "/diagnose",
    },
    {
      title: t.home.tools.dietSupport.title,
      desc: t.home.tools.dietSupport.desc,
      icon: <Heart />,
      color: "bg-pastel-violet",
      link: "/diet",
    },
    {
      title: t.home.tools.chatAssistant.title,
      desc: t.home.tools.chatAssistant.desc,
      icon: <MessageCircle />,
      color: "bg-sky-500",
      link: "/communication",
    },
    {
      title: t.home.quickActions.learnExplore,
      desc: t.home.quickActions.learnExploreDesc,
      icon: <BookOpen />,
      color: "bg-emerald-500",
      link: "/library",
    },
    {
      title: t.home.tools.accountSettings.title,
      desc: t.home.tools.accountSettings.desc,
      icon: <Settings />,
      color: "bg-slate-700",
      link: "/profile",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-20 md:pt-28 pb-28 md:pb-32 space-y-10 md:space-y-16 mobile-safe">

      {showSetupBanner && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed bottom-24 right-4 md:right-8 z-50 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 shadow-2xl shadow-blue-900/10 w-[calc(100%-2rem)] md:w-96 flex flex-col gap-4"
        >
          <button 
            onClick={() => setShowSetupBanner(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="pr-6">
            <h3 className="text-xl font-black text-slate-800">Complete Your Profile</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">Please finish setting up your account to bypass the onboarding flow entirely.</p>
          </div>
          <Link 
            href="/profile" 
            onClick={() => setShowSetupBanner(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest text-center hover:bg-blue-700 active:scale-95 transition-all"
          >
            Setup Now
          </Link>
        </motion.div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-16 lg:p-20 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 min-h-[350px] md:min-h-[450px] flex flex-col justify-center shadow-2xl shadow-violet-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="relative z-10 max-w-3xl space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-xs font-black text-white uppercase tracking-widest backdrop-blur-md w-fit"
          >
            <Sparkles className="w-4 h-4 text-pastel-pink" />
            {t.home.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight text-balance"
          >
            {t.home.greeting}
            {username ? (
              <>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-violet">
                  {username}
                </span>
              </>
            ) : null}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-xl lg:text-2xl text-white/70 font-bold max-w-xl leading-relaxed text-balance"
          >
            {t.home.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="pt-4 flex flex-wrap gap-4"
          >
            <Link
              href="/diagnose"
              className="px-8 py-4 rounded-xl bg-white text-slate-900 font-black text-xs md:text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              {t.home.quickActions.startDiagnosis}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        <div className="absolute right-10 bottom-10 hidden lg:block opacity-40 rotate-6 scale-125">
          <MedicalAssistanceIllustration className="w-64 h-64" bgColor="#FFFFFF" />
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="space-y-5 md:space-y-8">
        <div className="flex items-end justify-between px-1 md:px-3">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">{t.home.whatDoYouNeed}</h2>
            <p className="text-slate-500 text-sm md:text-base font-medium">{t.home.chooseTool}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('all-tools')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-violet-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
          >
            {t.home.viewAllTools}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {quickActions.map((item, i) => (
            <Link key={item.title} href={item.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flo-card p-5 md:p-8 h-full flex flex-col justify-between cursor-pointer"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-inner mb-4 md:mb-6`}>
                  <div className="scale-110">{item.icon}</div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800">{item.title}</h3>
                  <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <section id="all-tools" className="space-y-5 md:space-y-8">
        <div className="flex items-end justify-between px-1 md:px-3">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">{t.home.toolsTitle}</h2>
            <p className="text-slate-500 text-sm md:text-base font-medium">{t.home.toolsSubtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {allTools.map((item, i) => (
            <Link key={item.title} href={item.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flo-card p-5 md:p-7 h-full flex flex-col justify-between cursor-pointer"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-inner mb-4 md:mb-6`}>
                  <div className="scale-110">{item.icon}</div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800">{item.title}</h3>
                  <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}

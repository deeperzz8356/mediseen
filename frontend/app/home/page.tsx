"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"

import {
  Plus,
  MessageCircle,
  ChevronRight,
  Activity,
  Heart,
  BookOpen,
  Settings,
  X,
} from "lucide-react"

import DailyActivityStrip from "../components/DailyActivityStrip"
import MobileTopHeader from "../components/MobileTopHeader"
import { useLocale } from "../i18n/LocaleContext"

import { useAppStore } from "../store/useAppStore"

export default function Home() {
  const { t } = useLocale()
  const { authStatus, user, profile } = useAppStore()
  const reduceMotion = useReducedMotion()

  const username = useMemo(() => {
    if (authStatus !== "authenticated" || !user) return ""
    return profile?.name?.trim() || user.displayName?.trim() || ""
  }, [authStatus, profile?.name, user])

  const [showSetupBanner, setShowSetupBanner] = useState(false)
  useEffect(() => {
    if (authStatus === "authenticated" && user) {
      const isComplete = localStorage.getItem('mediseen_setup_complete') === 'true'
      const isGoogleSignIn = user.providerData.some(p => p.providerId === 'google.com');
      if (!isComplete && isGoogleSignIn) {
         setShowSetupBanner(true)
      }
    }
  }, [authStatus, user])


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

  const pageTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, duration: 0.45, bounce: 0 }

  const revealInitial = reduceMotion
    ? false
    : { opacity: 0, y: 12, filter: "blur(4px)" }

  const revealAnimate = reduceMotion
    ? { opacity: 1, y: 0, filter: "blur(0px)" }
    : { opacity: 1, y: 0, filter: "blur(0px)" }

  return (
    <motion.div
      initial={revealInitial}
      animate={revealAnimate}
      transition={pageTransition}
      className="relative max-w-6xl mx-auto px-4 md:px-6 pt-0 pb-28 md:pb-32 space-y-8 md:space-y-12 mobile-safe"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.08),transparent_30%)]" />

      {showSetupBanner && (
        <motion.div 
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98, filter: "blur(4px)" }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98, filter: "blur(4px)" }}
          transition={pageTransition}
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

      {/* Mobile Top Header */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ ...pageTransition, delay: reduceMotion ? 0 : 0.03 }}
        className="-mx-4 md:-mx-6"
      >
        <MobileTopHeader 
          greeting={t.home.greeting}
          title="Home"
          userName={username || t.home.badge}
        />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ ...pageTransition, delay: reduceMotion ? 0 : 0.08 }}
      >
        <DailyActivityStrip />
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ ...pageTransition, delay: reduceMotion ? 0 : 0.12 }}
        className="space-y-5 md:space-y-8"
      >
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
                initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(4px)" }}
                whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ ...pageTransition, delay: reduceMotion ? 0 : i * 0.08 }}
                whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                className="flo-card p-5 md:p-8 h-full flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl"
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
      </motion.section>

      <motion.section
        id="all-tools"
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ ...pageTransition, delay: reduceMotion ? 0 : 0.1 }}
        className="space-y-5 md:space-y-8"
      >
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
                initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(4px)" }}
                whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ ...pageTransition, delay: reduceMotion ? 0 : i * 0.06 }}
                whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                className="flo-card p-5 md:p-7 h-full flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl"
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
      </motion.section>

    </motion.div>
  )
}

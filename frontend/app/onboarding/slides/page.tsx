"use client"

/**
 * /onboarding/slides – 4-page interactive onboarding
 */

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ScanLine, Salad, Activity, BrainCircuit } from "lucide-react"
import { useAppStore } from "../../store/useAppStore"
import OnboardingCard from "../../components/OnboardingCard"
import { useLocale } from "../../i18n/LocaleContext"

type Direction = 1 | -1

const variants = {
  enter: (dir: Direction) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: Direction) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
}

export default function OnboardingSlidesPage() {
  const router = useRouter()
  const { setOnboardingDone } = useAppStore()
  const { t } = useLocale()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>(1)
  const touchStartX = useRef<number | null>(null)

  const SLIDES = [
    {
      id: "ai-detection",
      lottieSrc: "/animation_onboarding/Searching.lottie",
      gradient: "from-rose-400 to-pink-500",
      bgGradient: "from-rose-50 to-pink-50",
      accentColor: "text-rose-500",
      dotColor: "bg-rose-400",
      activeBtnGradient: "from-rose-400 to-pink-500",
      title: t.onboarding.slides.cards.aiDetection.title,
      subtitle: t.onboarding.slides.cards.aiDetection.subtitle,
      description: t.onboarding.slides.cards.aiDetection.description,
      features: t.onboarding.slides.cards.aiDetection.features,
    },
    {
      id: "diet",
      lottieSrc: "/animation_onboarding/Nutrition.lottie",
      gradient: "from-emerald-400 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      accentColor: "text-emerald-500",
      dotColor: "bg-emerald-400",
      activeBtnGradient: "from-emerald-400 to-teal-500",
      title: t.onboarding.slides.cards.diet.title,
      subtitle: t.onboarding.slides.cards.diet.subtitle,
      description: t.onboarding.slides.cards.diet.description,
      features: t.onboarding.slides.cards.diet.features,
    },
    {
      id: "reports",
      lottieSrc: "/animation_onboarding/Health.lottie",
      gradient: "from-blue-400 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      accentColor: "text-blue-500",
      dotColor: "bg-blue-400",
      activeBtnGradient: "from-blue-400 to-indigo-500",
      title: t.onboarding.slides.cards.reports.title,
      subtitle: t.onboarding.slides.cards.reports.subtitle,
      description: t.onboarding.slides.cards.reports.description,
      features: t.onboarding.slides.cards.reports.features,
    },
    {
      id: "assistant",
      lottieSrc: "/animation_onboarding/Artificial intelligence in healthcare.lottie",
      gradient: "from-violet-400 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
      accentColor: "text-violet-500",
      dotColor: "bg-violet-400",
      activeBtnGradient: "from-violet-400 to-purple-500",
      title: t.onboarding.slides.cards.assistant.title,
      subtitle: t.onboarding.slides.cards.assistant.subtitle,
      description: t.onboarding.slides.cards.assistant.description,
      features: t.onboarding.slides.cards.assistant.features,
    },
  ] as const

  const slide = SLIDES[currentIndex]
  const isLast = currentIndex === SLIDES.length - 1

  const navigate = (newIndex: number) => {
    setDirection(newIndex > currentIndex ? 1 : -1)
    setCurrentIndex(newIndex)
  }

  const finish = async () => {
    await setOnboardingDone(true)
    router.replace("/login")
  }

  const handleNext = () => (isLast ? finish() : navigate(currentIndex + 1))

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 50) return
    if (delta < 0 && !isLast) navigate(currentIndex + 1)
    else if (delta > 0 && currentIndex > 0) navigate(currentIndex - 1)
  }

  return (
    <div
      className="fixed inset-0 bg-white flex flex-col overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── TOP BAR: Pagination dots (left) + Skip (right) ─────────── */}
      <div className="flex items-center justify-between px-6 pb-3 z-10 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => navigate(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? `w-7 ${slide.dotColor}` : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>
        <button
          onClick={finish}
          className="text-slate-400 font-semibold text-sm px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
        >
          {t.onboarding.slides.skip}
        </button>
      </div>

      {/* ── SLIDE CONTENT ────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute inset-0 flex flex-col px-7 pt-0 pb-2"
          >
            <OnboardingCard
              icon={"icon" in slide ? (slide as any).icon : undefined}
              lottieSrc={"lottieSrc" in slide ? (slide as any).lottieSrc : undefined}
              title={slide.title}
              subtitle={slide.subtitle}
              description={slide.description}
              features={slide.features}
              gradient={slide.gradient}
              bgGradient={slide.bgGradient}
              accentColor={slide.accentColor}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM: Next / Get Started ──────────────────────────────── */}
      <div className="px-7 pt-4 pb-[calc(env(safe-area-inset-bottom)+2.5rem)]">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className={`w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-gradient-to-r ${slide.activeBtnGradient} text-white font-bold text-base shadow-lg transition-all`}
        >
          {isLast ? t.onboarding.slides.getStarted : t.onboarding.slides.next}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}

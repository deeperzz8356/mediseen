"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Droplets, Flame, Footprints, Minus, Plus, RefreshCw } from "lucide-react"
import { useLocale } from "../i18n/LocaleContext"
import { useActivityStore, type ActivitySource } from "../store/useActivityStore"

function sourceLabel(source: ActivitySource, t: ReturnType<typeof useLocale>["t"]): string {
  switch (source) {
    case "health_connect_and_sensor":
      return t.home.activity.sourceBoth
    case "health_connect":
      return t.home.activity.sourceHealthConnect
    case "phone_sensor":
      return t.home.activity.sourceSensor
    default:
      return t.home.activity.sourceNone
  }
}

function progressColor(accent: "indigo" | "orange" | "emerald"): string {
  if (accent === "orange") return "#f97316"
  if (accent === "emerald") return "#10b981"
  return "#6366f1"
}

function MetricTile({
  icon,
  label,
  value,
  suffix,
  progress,
  accent,
  children,
}: {
  icon: ReactNode
  label: string
  value: string
  suffix: string
  progress: number
  accent: "indigo" | "orange" | "emerald"
  children?: ReactNode
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)))
  const chip =
    accent === "orange"
      ? "bg-orange-50 text-orange-500"
      : accent === "emerald"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-indigo-50 text-indigo-600"

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3 min-h-[140px]">
      <div className="flex items-center justify-between gap-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${chip}`}>
          {icon}
        </div>
        {children}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-tight">
          {value}
          <span className="text-xs font-bold text-slate-400 ml-1">{suffix}</span>
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: progressColor(accent) }}
        />
      </div>
    </div>
  )
}

export default function DailyActivityStrip() {
  const { t } = useLocale()
  const reduceMotion = useReducedMotion()
  const {
    nativeReady,
    source,
    steps,
    caloriesBurned,
    waterGlasses,
    stepGoal,
    calorieGoal,
    waterGoal,
    loading,
    lastSyncedAt,
    hcConnected,
    sensorEnabled,
    syncActivity,
    connectHealthConnect,
    enableSensor,
    addWater,
    removeWater,
    startForegroundTracking,
    stopForegroundTracking,
  } = useActivityStore()

  useEffect(() => {
    void (async () => {
      await syncActivity()
      await startForegroundTracking()
    })()
    return () => {
      void stopForegroundTracking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncedText = lastSyncedAt
    ? t.home.activity.syncedJustNow
    : t.home.activity.notSynced

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.45, bounce: 0 }}
      className="space-y-4"
    >
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">{t.home.activity.title}</h2>
          <p className="text-slate-500 text-sm font-medium">{t.home.activity.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => void syncActivity()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "motion-safe:animate-spin motion-reduce:animate-none" : ""}`} />
          {t.home.activity.refresh}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
          whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.45, bounce: 0 }}
          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
        >
          <MetricTile
            icon={<Footprints className="w-4 h-4" />}
            label={t.home.activity.steps}
            value={steps.toLocaleString()}
            suffix={`/ ${stepGoal.toLocaleString()}`}
            progress={steps / stepGoal}
            accent="indigo"
          />
        </motion.div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
          whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.45, bounce: 0, delay: 0.04 }}
          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
        >
          <MetricTile
            icon={<Flame className="w-4 h-4" />}
            label={t.home.activity.calories}
            value={caloriesBurned.toLocaleString()}
            suffix={t.home.activity.kcal}
            progress={caloriesBurned / calorieGoal}
            accent="orange"
          />
        </motion.div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
          whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.45, bounce: 0, delay: 0.08 }}
          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
        >
          <MetricTile
            icon={<Droplets className="w-4 h-4" />}
            label={t.home.activity.water}
            value={String(waterGlasses)}
            suffix={`/ ${waterGoal} ${t.home.activity.glasses}`}
            progress={waterGlasses / waterGoal}
            accent="emerald"
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void removeWater()}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95"
                aria-label={t.home.activity.waterMinus}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => void addWater()}
                className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center active:scale-95"
                aria-label={t.home.activity.waterPlus}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </MetricTile>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <p className="text-xs font-bold text-slate-400">
          {t.home.activity.sourceLabel}: {sourceLabel(source, t)}
          {" · "}
          {syncedText}
        </p>

        {!nativeReady ? (
          <p className="text-xs font-bold text-slate-400">{t.home.activity.androidOnly}</p>
        ) : !hcConnected && !sensorEnabled ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void connectHealthConnect()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              {t.home.activity.connectHealth}
            </button>
            <button
              type="button"
              onClick={() => void enableSensor()}
              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              {t.home.activity.enableSensor}
            </button>
          </div>
        ) : (
          <Link
            href="/profile"
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600"
          >
            {t.home.activity.manageInProfile}
          </Link>
        )}
      </div>
    </motion.section>
  )
}

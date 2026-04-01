"use client"

import { motion } from "framer-motion"
import Link from "next/link"

import { conditions } from "./data"
import { useLocale } from "../i18n/LocaleContext"

export default function WellnessPage() {
  const { t } = useLocale()
  return (
    <div className="max-w-7xl mx-auto px-6 space-y-16 pb-32 pt-12">
      {/* Page Header */}
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight uppercase">
          {t.wellness.title} <span className="text-pastel-green underline decoration-pastel-green/10">{t.wellness.titleHighlight}</span>
        </h1>
        <p className="text-xl text-slate-500 font-bold max-w-3xl leading-relaxed">
          {t.wellness.subtitle}
        </p>
      </header>

      {/* Conditions Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {conditions.map((idx, i) => (
          <Link key={idx.id} href={`/wellness/${idx.id}`} className="group block h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 h-full rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 border-2 bg-white text-black border-black/5 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-inner ${idx.color}`}>
                {idx.icon}
              </div>
              <span className="font-black text-xs uppercase tracking-widest text-center">{idx.name}</span>
            </motion.div>
          </Link>
        ))}
      </section>
    </div>
  )
}

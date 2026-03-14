"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  HeartPulse, 
  Sun, 
  Activity, 
  Shield, 
  Smile
} from "lucide-react"

export const conditions = [
  { id: "pneumonia", name: "Pneumonia", icon: <Activity />, color: "bg-pastel-blue" },
  { id: "eczema", name: "Eczema (Atopic Dermatitis)", icon: <Smile />, color: "bg-pastel-pink" },
  { id: "psoriasis", name: "Psoriasis", icon: <Shield />, color: "bg-pastel-violet" },
  { id: "melanoma", name: "Melanoma", icon: <Sun />, color: "bg-pastel-yellow" },
  { id: "ringworm", name: "Ringworm", icon: <HeartPulse />, color: "bg-pastel-green" },
  { id: "warts", name: "Warts", icon: <Shield />, color: "bg-pastel-blue" },
  { id: "molluscum-contagiosum", name: "Molluscum Contagiosum", icon: <Smile />, color: "bg-pastel-pink" },
  { id: "acne", name: "Acne", icon: <Smile />, color: "bg-pastel-violet" },
  { id: "rosacea", name: "Rosacea", icon: <Smile />, color: "bg-pastel-yellow" },
  { id: "vitiligo", name: "Vitiligo", icon: <Sun />, color: "bg-pastel-green" },
  { id: "impetigo", name: "Impetigo", icon: <Shield />, color: "bg-pastel-blue" },
  { id: "contact-dermatitis", name: "Contact Dermatitis", icon: <Smile />, color: "bg-pastel-pink" },
]

export default function WellnessPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 space-y-16 pb-32 pt-12">
      {/* Page Header */}
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-black tracking-tight uppercase">
          Recovery & <span className="text-pastel-green underline decoration-black/10">Wellness</span> Guide
        </h1>
        <p className="text-xl text-black font-bold max-w-3xl opacity-80">
          Evidence-based lifestyle and diet support for skin and respiratory health.
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

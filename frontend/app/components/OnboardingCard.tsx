"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

interface OnboardingCardProps {
  icon?: LucideIcon
  lottieSrc?: string
  title: string
  subtitle: string
  description: string
  features: readonly string[]
  gradient: string
  bgGradient: string
  accentColor: string
}

export default function OnboardingCard({
  icon: Icon,
  lottieSrc,
  title,
  subtitle,
  description,
  features,
  gradient,
  bgGradient,
  accentColor,
}: OnboardingCardProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Illustration */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-[220px] overflow-hidden"
      >
        
        {lottieSrc ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <DotLottieReact
              src={lottieSrc}
              loop
              autoplay
              className="w-full h-full object-cover"
            />
          </div>
        ) : Icon ? (
          <div
            className={`w-28 h-28 rounded-[2rem] bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}
          >
            <Icon className="w-14 h-14 text-white" strokeWidth={1.5} />
          </div>
        ) : null}
      </div>

      {/* Text */}
      <div className="space-y-2.5 mb-5">
        <p className={`text-xs font-bold uppercase tracking-widest ${accentColor}`}>
          {subtitle}
        </p>
        <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
          {title}
        </h2>
        <p className="text-slate-500 font-medium leading-relaxed text-sm">
          {description}
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2">
        {features.map((f) => (
          <span
            key={f}
            className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

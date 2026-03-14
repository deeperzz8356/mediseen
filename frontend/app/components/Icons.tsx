"use client"

import React from "react"
import { Wind, Thermometer, AlertCircle, Activity, Frown, Sparkles } from "lucide-react"

// For the UI, icons in rounded pastel boxes are extremely common in healthcare apps like Flo.
// These wrappers build exactly that structure around Lucide icons for semantic accuracy.

interface IconProps {
  className?: string; // Optional passing of custom sizing/margins
  size?: number; // Icon size
  color?: "mint" | "blue" | "rose" | "teal" | "amber";
}

const colorMap = {
  mint: { bg: "bg-emerald-900/30", text: "text-[#6EE7B7]", border: "border-emerald-500/20" },
  blue: { bg: "bg-sky-900/30", text: "text-[#7DD3FC]", border: "border-sky-500/20" },
  rose: { bg: "bg-rose-900/30", text: "text-rose-400", border: "border-rose-500/20" },
  teal: { bg: "bg-teal-900/30", text: "text-[#2DD4BF]", border: "border-teal-500/20" },
  amber: { bg: "bg-amber-900/30", text: "text-amber-400", border: "border-amber-500/20" }
}

const IconWrapper = ({ children, color = "blue", className = "" }: { children: React.ReactNode, color?: keyof typeof colorMap, className?: string }) => {
  const styles = colorMap[color]
  return (
    <div className={`flex items-center justify-center p-3 rounded-2xl border backdrop-blur-sm shadow-inner transition-transform hover:scale-105 ${styles.bg} ${styles.text} ${styles.border} ${className}`}>
      {children}
    </div>
  )
}

// 1. Lungs Breathing Icon
export const LungsIcon = ({ size = 24, className, color = "teal" }: IconProps) => (
  <IconWrapper color={color} className={className}>
    <Wind size={size} strokeWidth={2.5} />
  </IconWrapper>
)

// 2. Cough / Respiratory Icon
export const CoughIcon = ({ size = 24, className, color = "amber" }: IconProps) => (
  <IconWrapper color={color} className={className}>
    <AlertCircle size={size} strokeWidth={2.5} />
  </IconWrapper>
)

// 3. Thermometer Fever Icon
export const FeverIcon = ({ size = 24, className, color = "rose" }: IconProps) => (
  <IconWrapper color={color} className={className}>
    <Thermometer size={size} strokeWidth={2.5} />
  </IconWrapper>
)

// 4. Skin Rash Icon
export const RashIcon = ({ size = 24, className, color = "rose" }: IconProps) => (
  <IconWrapper color={color} className={className}>
    <Activity size={size} strokeWidth={2.5} />
  </IconWrapper>
)

// 5. Itch / Irritation Icon
export const ItchingIcon = ({ size = 24, className, color = "mint" }: IconProps) => (
  <IconWrapper color={color} className={className}>
    <Sparkles size={size} strokeWidth={2.5} />
  </IconWrapper>
)

// 6. Fatigue / Low Energy Icon
export const FatigueIcon = ({ size = 24, className, color = "blue" }: IconProps) => (
  <IconWrapper color={color} className={className}>
    <Frown size={size} strokeWidth={2.5} />
  </IconWrapper>
)

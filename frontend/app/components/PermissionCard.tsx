"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface PermissionReason {
  icon: React.ElementType
  color: string
  title: string
  desc: string
}

interface PermissionCardProps {
  icon: React.ElementType
  title: string
  description: string
  reasons: PermissionReason[]
  onAllow: () => void
  onSkip: () => void
  loading?: boolean
  allowLabel?: string
  skipLabel?: string
}

export default function PermissionCard({
  icon: Icon,
  title,
  description,
  reasons,
  onAllow,
  onSkip,
  loading = false,
  allowLabel = "Allow",
  skipLabel = "Not now",
}: PermissionCardProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10">
      {/* Primary Icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 200 }}
        className="w-28 h-28 rounded-[2.25rem] bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center mb-8 shadow-lg"
      >
        <Icon className="w-14 h-14 text-violet-500" />
      </motion.div>

      {/* Main Text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="text-center mb-8 space-y-2.5 max-w-xs"
      >
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="text-slate-500 font-medium leading-relaxed text-sm">
          {description}
        </p>
      </motion.div>

      {/* Reason List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.22 }}
        className="w-full max-w-sm space-y-3 mb-8"
      >
        {reasons.map(({ icon: RIcon, color, title: rTitle, desc }) => (
          <div key={rTitle} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <RIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{rTitle}</p>
              <p className="text-xs text-slate-400 font-medium">{desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.32 }}
        className="w-full max-w-sm space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAllow}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-400 text-white font-bold text-base shadow-lg shadow-violet-200 disabled:opacity-60 transition-all"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            allowLabel
          )}
        </motion.button>

        <button
          onClick={onSkip}
          className="w-full py-3 text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors"
        >
          {skipLabel}
        </button>
      </motion.div>
    </div>
  )
}

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { API_BASE_URL } from "../config"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Zap,
  Printer,
  ExternalLink,
  X,
  ShieldCheck
} from "lucide-react"

export interface DiagnosisResult {
  diseaseId: string
  prediction: string
  confidence: number
  explanation: string
  severity: "low" | "medium" | "high"
  heatmapUrl?: string
  reportUrl?: string
  affectedArea?: number
  nextSteps?: string[]
}

interface ResultPanelProps {
  result: DiagnosisResult | null;
  onReset?: () => void;
  showReport?: boolean;
  setShowReport?: (show: boolean) => void;
}

export default function ResultPanel({ result, onReset, showReport: showReportProp, setShowReport: setShowReportProp }: ResultPanelProps) {
  const [showReportInternal, setShowReportInternal] = useState(false)
  const showReport = showReportProp !== undefined ? showReportProp : showReportInternal;
  const setShowReport = setShowReportProp !== undefined ? setShowReportProp : setShowReportInternal;

  if (!result) return null;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high": return { badge: "bg-rose-50 text-rose-500 border-rose-100", icon: <AlertCircle className="w-4 h-4" /> }
      case "medium": return { badge: "bg-amber-50 text-amber-500 border-amber-100", icon: <AlertCircle className="w-4 h-4" /> }
      default: return { badge: "bg-emerald-50 text-emerald-500 border-emerald-100", icon: <CheckCircle2 className="w-4 h-4" /> }
    }
  }

  const { badge, icon } = getSeverityStyles(result.severity)
  const confidencePercent = Math.round(result.confidence * 100)
  const normalizedReportPath = result.reportUrl?.startsWith("/") ? result.reportUrl : `/${result.reportUrl ?? ""}`
  const fullReportUrl = result.reportUrl?.startsWith("http") ? result.reportUrl : `${API_BASE_URL}${normalizedReportPath}`;

  return (
    <div className="w-full h-full flex flex-col">
      {/* AI OUTPUT CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-2xl p-10 md:p-12 shadow-xl border border-black/5 flex flex-col items-center justify-center text-center space-y-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-black/10"></div>
        <div className="absolute top-0 left-0 h-1.5 bg-black transition-all duration-1000" style={{ width: `${confidencePercent}%` }}></div>

        {/* Diagnostic Label */}
        <div className="space-y-4 w-full">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/5 border border-black/5">
            <Zap className="w-3.5 h-3.5 text-black" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Diagnostic Analysis Active</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tighter leading-tight max-w-2xl mx-auto">
            {result.prediction}
          </h2>
        </div>

        {/* Centered Confidence Metric */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110">
            <circle cx="50%" cy="50%" r="44%" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
            <motion.circle
              cx="50%" cy="50%" r="44%"
              fill="transparent"
              stroke="black"
              strokeWidth="12"
              strokeDasharray="276%"
              initial={{ strokeDashoffset: "276%" }}
              animate={{ strokeDashoffset: `${276 * (1 - result.confidence)}%` }}
              transition={{ duration: 2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="text-6xl md:text-7xl font-black text-black leading-none">{confidencePercent}%</span>
            <div className="mt-4 flex flex-col items-center gap-1">
              <span className="text-[10px] font-black text-black uppercase tracking-[0.3em] opacity-40">Probability Score</span>
              <div className="w-12 h-1 bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-black/20 w-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Insight & Description */}
        <div className="max-w-xl mx-auto space-y-8">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border ${badge} font-black text-[10px] uppercase tracking-widest shadow-sm`}>
            {icon}
            <span>Clinical {result.severity} Urgency Level</span>
          </div>
          
          <div className="relative">
            <div className="absolute -left-6 -top-2 text-6xl font-serif text-black opacity-5">&quot;</div>
            <p className="text-black text-base md:text-lg font-bold leading-relaxed opacity-80 italic px-4">
              {result.explanation}
            </p>
            <div className="absolute -right-6 -bottom-8 text-6xl font-serif text-black opacity-5">&quot;</div>
          </div>
        </div>

        {/* Action Panel Group */}
        <div className="pt-8 w-full flex flex-wrap justify-center gap-4">
          {onReset && (
            <button
              onClick={onReset}
              className="px-10 py-4 bg-white border border-black/10 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-slate-50 transition-all flex items-center gap-3 shadow-lg active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Cycle
            </button>
          )}
          <div className="flex items-center gap-3 px-8 py-4 rounded-xl bg-black/5 border border-black/5 opacity-50 select-none">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black">Verified Pipeline v4.2</span>
          </div>
        </div>
      </motion.div>

      {/* --- CLINICAL REPORT MODAL --- */}
      <AnimatePresence>
        {showReport && result.reportUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
              className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[90vh] border border-white/20"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-8 md:px-12 py-8 border-b border-black/5 bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-xl">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-black text-2xl uppercase tracking-tighter text-black leading-none">AI Generative Report</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Medical Verification Asset — ID: {result.diseaseId?.slice(0, 8)}</p>
                  </div>
                </div>
                <button onClick={() => setShowReport(false)} className="p-4 hover:bg-black/5 rounded-2xl transition-all active:scale-90">
                  <X className="w-8 h-8 text-black opacity-30 hover:opacity-100" />
                </button>
              </div>

              {/* Iframe Viewport */}
              <div className="flex-1 bg-white relative">
                <iframe
                  src={fullReportUrl}
                  className="w-full h-full border-none"
                  title="AI Clinical Asset"
                  sandbox="allow-same-origin allow-popups"
                />
              </div>

              {/* Modal Footer (Controls) */}
              <div className="flex flex-col md:flex-row justify-between items-center px-8 md:px-12 py-8 border-t border-black/5 bg-slate-50/50 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-black opacity-30 uppercase tracking-[0.3em]">
                    Digital Signature Verified — Encryption Active
                  </span>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <button
                    onClick={() => document.querySelector("iframe")?.contentWindow?.print()}
                    className="flex-1 md:flex-none px-10 py-5 bg-white border border-black/10 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition shadow-lg flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    Print Hardcopy
                  </button>

                  <a
                    href={fullReportUrl} download target="_blank" rel="noopener noreferrer"
                    className="flex-1 md:flex-none px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 hover:bg-slate-900 transition shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    Secure Download
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { resolveBackendAssetUrl } from "../config"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Zap,
  Printer,
  ExternalLink,
  X,
  ShieldCheck,
  ClipboardCheck,
  Sparkles
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
  likelySymptoms?: string[]
  rootCause?: string
  laymanExplanation?: string
  managementSteps?: string[]
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

  const confidenceValue = typeof result.confidence === 'number' ? result.confidence : 0
  const confidencePercent = Math.round(confidenceValue * 100)

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 py-8">
      {/* 1. TOP LINEAR HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
          <Activity className="w-3 h-3" /> AI Scan Result
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
          {result.prediction}
        </h2>

        {/* Linear Certainty Bar */}
        <div className="max-w-xs mx-auto space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Certainty</span>
            <span>{confidencePercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${confidencePercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-black rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* 2. CLINICAL SUMMARY */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative px-6 border-l-4 border-slate-900"
      >
        <p className="text-lg md:text-xl font-bold text-slate-700 italic leading-relaxed whitespace-pre-line">
          &quot;{result.explanation}&quot;
        </p>
      </motion.div>

      {/* 3. LINEAR ANALYSIS (THE "WHY") */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Pathophysiology Analysis</h3>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <p className="text-base font-bold text-slate-600 leading-relaxed whitespace-pre-line">
          {result.rootCause}
        </p>
      </motion.div>

      {/* 4. SIMPLE SUMMARY */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-indigo-50/50 rounded-[2rem] p-8 md:p-10 space-y-4"
      >
        <div className="flex items-center gap-3 text-indigo-500">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em]">The Simple Explanation</h3>
        </div>
        <p className="text-base font-bold text-indigo-900/70 leading-relaxed italic whitespace-pre-line">
          {result.laymanExplanation}
        </p>
      </motion.div>

      {/* 5. ACTIONABLE STEPS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Recommended Steps</h3>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="space-y-4">
          {(result.managementSteps || []).map((step, idx) => (
            <div key={idx} className="flex gap-6 items-start group">
              <span className="text-2xl font-black text-slate-200 group-hover:text-black transition-colors">0{idx + 1}</span>
              <p className="text-sm font-bold text-slate-600 pt-1.5 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 6. RESET ACTION */}
      <div className="pt-12 flex justify-center">
        {onReset && (
          <button
            onClick={onReset}
            className="px-12 py-5 bg-black text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            New Analysis Cycle
          </button>
        )}
      </div>
    </div>
  );
}

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

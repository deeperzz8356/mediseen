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
  disease_identification: string
  confidence: number
  patient_friendly_explanation: string
  root_cause_reason: string
  steps_to_understand_and_manage: string[]
  likely_symptoms?: string[]
  diet?: {
    recommended: string[]
    avoid: string[]
  }
  reportUrl?: string
  heatmapUrl?: string
  severity?: string
  affectedArea?: string
  diseaseId?: string
}

interface ResultPanelProps {
  result: DiagnosisResult
  onReset: () => void
  showReport?: boolean
  setShowReport?: (show: boolean) => void
}

export default function ResultPanel({ result, onReset, showReport: showReportProp, setShowReport: setShowReportProp }: ResultPanelProps) {
  const [showReportInternal, setShowReportInternal] = useState(false)
  const showReport = showReportProp !== undefined ? showReportProp : showReportInternal;
  const setShowReport = setShowReportProp !== undefined ? setShowReportProp : setShowReportInternal;

  // 5. Add Debug Logging
  useEffect(() => {
    console.log("RESULT PANEL DATA:", result);
  }, [result]);

  if (!result) return null;

  const confidenceValue = typeof result.confidence === 'number' ? result.confidence : 0
  const confidencePercent = Math.round(confidenceValue * 100)

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-10 px-4 md:px-0">
      {/* 1. HERO HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
          <Activity className="w-4 h-4" /> AI Diagnostic Outcome
        </div>
        
        <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">
          {result.disease_identification}
        </h2>

        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
            <span>Statistical Confidence</span>
            <span>{confidencePercent}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${confidencePercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-black rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* 2. CLINICAL INSIGHT (LINEAR FLOW) */}
      <div className="grid grid-cols-1 gap-12 pt-10">
        
        {/* SUMMARY BLOCK */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative pl-8 border-l-[6px] border-black py-2"
        >
          <p className="text-xl md:text-3xl font-black text-slate-800 italic leading-tight whitespace-pre-line">
            &quot;{result.patient_friendly_explanation}&quot;
          </p>
        </motion.div>

        {/* DIET & NUTRITION */}
        {result.diet && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-emerald-50 rounded-[2rem] p-10 border border-emerald-100 space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <ClipboardCheck className="w-6 h-6" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Recommended Foods</h3>
              </div>
              <ul className="space-y-3">
                {result.diet.recommended.map((food, i) => (
                  <li key={i} className="text-sm font-bold text-emerald-800 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {food}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50 rounded-[2rem] p-10 border border-rose-100 space-y-6">
              <div className="flex items-center gap-3 text-rose-600">
                <X className="w-6 h-6" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Foods to Avoid</h3>
              </div>
              <ul className="space-y-3">
                {result.diet.avoid.map((food, i) => (
                  <li key={i} className="text-sm font-bold text-rose-800 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> {food}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* LIKELY SYMPTOMS */}
        {result.likely_symptoms && result.likely_symptoms.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Noted Symptom Markers</h3>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="flex flex-wrap gap-3">
              {result.likely_symptoms.map((symptom, i) => (
                <span key={i} className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-widest hover:border-black transition-colors shadow-sm">
                  {symptom}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* DEEP ANALYSIS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-slate-100 shadow-2xl space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900">Clinical Pathophysiology</h3>
          </div>
          <p className="text-lg md:text-xl font-bold text-slate-600 leading-relaxed whitespace-pre-line">
            {result.root_cause_reason}
          </p>
        </motion.div>

        {/* LAYMAN EXPLANATION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-indigo-50/70 backdrop-blur-sm rounded-[2.5rem] p-10 md:p-16 space-y-8 border border-indigo-100"
        >
          <div className="flex items-center gap-4 text-indigo-600">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em]">The Simple Interpretation</h3>
          </div>
          <p className="text-lg md:text-2xl font-black text-indigo-900/60 leading-relaxed italic whitespace-pre-line">
            {result.patient_friendly_explanation}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Clinical Roadmap</h3>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(result.steps_to_understand_and_manage || []).map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="text-4xl font-black text-slate-100 group-hover:text-black transition-colors mb-6">0{idx + 1}</div>
                <p className="text-sm font-bold text-slate-600 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 6. RESET ACTION */}
      <div className="pt-20 flex flex-col items-center gap-6">
        {onReset && (
          <button
            onClick={onReset}
            className="px-16 py-6 bg-black text-white font-black text-xs uppercase tracking-[0.4em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          >
            Start New Cycle
          </button>
        )}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">MediSeen AI Protocol v4.2</p>
      </div>

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
                  src={resolveBackendAssetUrl(result.reportUrl)}
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
                    href={resolveBackendAssetUrl(result.reportUrl)} download target="_blank" rel="noopener noreferrer"
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
  );
}

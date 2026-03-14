"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UploadPanel from "../components/UploadPanel"
import ResultPanel, { DiagnosisResult } from "../components/ResultPanel"
import HeatmapViewer from "../components/HeatmapViewer"
import { FileText, Eye, ClipboardCheck, LayoutDashboard, ChevronRight, Activity } from "lucide-react"

export default function DiagnosePage() {
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const handleReset = () => {
    setAnalysisResult(null)
    setUploadedImage(null)
    setShowHeatmap(false)
    setShowReport(false)
  }

  const handleAnalysisComplete = (res: DiagnosisResult) => {
    setAnalysisResult(res)
    setTimeout(() => {
      document.getElementById('results-section-header')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-12 pb-32 pt-12">
      {/* --- PAGE HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-black/5 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest">
            <LayoutDashboard className="w-3 h-3" /> System v4.2.0
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tighter uppercase leading-none">
            Clinical <span className="opacity-40">Intelligence</span>
          </h1>
          <p className="text-base md:text-lg text-black font-bold max-w-xl opacity-70 leading-tight">
            High-precision neural diagnostics for dermatology and radiology scans.
          </p>
        </div>

        {/* Dynamic Workflow Tracker */}
        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-black/5 shadow-sm">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                (step === 1 && !analysisResult) || (step === 2 && analysisResult && !showHeatmap && !showReport) || (step === 3 && (showHeatmap || showReport))
                ? "bg-black text-white shadow-lg scale-110" 
                : "bg-black/5 text-black/20"
              }`}>
                {step}
              </div>
              {step < 3 && <ChevronRight className="w-4 h-4 opacity-10" />}
            </div>
          ))}
          <div className="ml-3 hidden lg:block border-l border-black/5 pl-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black opacity-30">Current Stage</p>
            <p className="text-xs font-black text-black uppercase tracking-tight">
              {!analysisResult ? "Data Input" : (showHeatmap || showReport ? "Clinical Audit" : "AI Validation")}
            </p>
          </div>
        </div>
      </header>

      {/* --- MAIN WORKFLOW GRID --- */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left Col: Workflow Input */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <UploadPanel
            onAnalysisComplete={handleAnalysisComplete}
            onImageUpload={(img) => setUploadedImage(img)}
          />
        </div>

        {/* Right Col: AI Output */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
          {analysisResult ? (
            <ResultPanel 
              result={analysisResult} 
              onReset={handleReset} 
              showReport={showReport}
              setShowReport={setShowReport}
            />
          ) : (
            <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-black/5 shadow-xl flex flex-col items-center justify-center text-center p-12 space-y-8">
              <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center animate-pulse">
                <ClipboardCheck className="w-12 h-12 text-black/10" />
              </div>
              <div className="space-y-4 max-w-xs">
                <h3 className="text-2xl font-black text-black uppercase tracking-widest opacity-20">Awaiting AI Pulse</h3>
                <p className="text-black font-bold text-sm opacity-20 uppercase tracking-tight leading-relaxed">
                  Complete clinical input on the left to initialize diagnostic evaluation.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- ADVANCED VISUALIZATION --- */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pt-12 border-t border-black/5"
          >
            {/* Section Header */}
            <div id="results-section-header" className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Activity className="w-3.5 h-3.5" /> Stage 3: Clinical Verification
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter">Diagnostic Analytics</h2>
                <p className="text-base font-bold text-black opacity-60 uppercase tracking-tight">
                  Exploration of neural focus distribution and generated clinical pathways.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${
                    showHeatmap ? 'bg-black text-white' : 'bg-white text-black border border-black/10'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {showHeatmap ? 'Hide Heatmap' : 'View Heatmap'}
                </button>

                <button
                  onClick={() => setShowReport(!showReport)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${
                    showReport ? 'bg-black text-white' : 'bg-white text-black border border-black/10'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {showReport ? 'Hide Report' : 'Full Report'}
                </button>
              </div>
            </div>

            {/* Dynamic Content Panel */}
            <div className="space-y-12">
              <AnimatePresence mode="wait">
                {showHeatmap && uploadedImage && (
                  <motion.section
                    key="heatmap"
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    className="w-full"
                  >
                    <HeatmapViewer
                      originalImage={uploadedImage}
                      heatmapImage={analysisResult.heatmapUrl}
                      severity={analysisResult.severity}
                      affectedArea={analysisResult.affectedArea}
                    />
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pt-24 border-t border-black/5 text-center">
        <p className="text-[10px] font-black text-black opacity-20 uppercase tracking-[0.5em]">Clinical Decision Support System © 2026</p>
      </footer>
    </div>
  )
}

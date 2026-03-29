"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UploadPanel from "../components/UploadPanel"
import ResultPanel, { DiagnosisResult } from "../components/ResultPanel"
import HeatmapViewer from "../components/HeatmapViewer"
import { FileText, Eye, ClipboardCheck, ChevronRight, Activity, Sparkles, Camera, X } from "lucide-react"
import { useLocale } from "../i18n/LocaleContext"

export default function DiagnosePage() {
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const { t } = useLocale()

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
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-violet text-white text-[10px] font-black uppercase tracking-widest shadow-lg"
          >
            <Sparkles className="w-3 h-3" /> {t.diagnose.badge}
          </motion.div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {t.diagnose.title} <span className="text-pastel-pink">{t.diagnose.titleHighlight}</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-bold max-w-xl leading-tight">
            {t.diagnose.subtitle}
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCameraOpen(true)}
              className="px-8 py-4 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl"
            >
              <Camera className="w-4 h-4" />
              {t.diagnose.scanReport}
            </motion.button>
            <button className="px-8 py-4 rounded-2xl border border-black/10 font-black text-xs uppercase tracking-widest text-slate-400">
              {t.diagnose.browseHistory}
            </button>
          </div>
        </div>

        {/* Camera Modal Simulation */}
        <AnimatePresence>
          {isCameraOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center p-6"
            >
              <div className="relative w-full max-w-lg aspect-[3/4] bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl">
                {/* Mock Camera View */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-white/30 rounded-3xl" />
                  <p className="absolute bottom-20 text-white/50 font-bold text-xs uppercase tracking-[0.2em]">{t.diagnose.camera.alignFrame}</p>
                </div>
                
                {/* HUD */}
                <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                  <button onClick={() => setIsCameraOpen(false)} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <X className="w-6 h-6" />
                  </button>
                  <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                    {t.diagnose.camera.aiScanning}
                  </div>
                </div>

                <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                  <button 
                    onClick={() => {
                      setIsCameraOpen(false)
                      // Simulate a scan result logic here
                    }}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white group-active:scale-90 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="ml-3 hidden lg:block border-l border-slate-100 pl-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{t.diagnose.steps.currentStep}</p>
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
              {!analysisResult ? t.diagnose.steps.uploadScan : (showHeatmap || showReport ? t.diagnose.steps.results : t.diagnose.steps.aiAnalysis)}
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
            <div className="flex-1 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-12 space-y-8">
              <div className="w-24 h-24 rounded-full bg-pastel-blue/10 flex items-center justify-center">
                <ClipboardCheck className="w-12 h-12 text-pastel-blue/40" />
              </div>
              <div className="space-y-4 max-w-xs">
                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">{t.diagnose.waiting.title}</h3>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-tight leading-relaxed">
                  {t.diagnose.waiting.subtitle}
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pastel-green text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Activity className="w-3.5 h-3.5" /> {t.diagnose.results.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter">{t.diagnose.results.title}</h2>
                <p className="text-base font-bold text-slate-400 uppercase tracking-tight">
                  {t.diagnose.results.subtitle}
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
                  {showHeatmap ? t.diagnose.results.hideHeatmap : t.diagnose.results.viewHeatmap}
                </button>

                <button
                  onClick={() => setShowReport(!showReport)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${
                    showReport ? 'bg-black text-white' : 'bg-white text-black border border-black/10'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {showReport ? t.diagnose.results.hideReport : t.diagnose.results.fullReport}
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
        <p className="text-[10px] font-black text-black opacity-20 uppercase tracking-[0.5em]">{t.diagnose.footer}</p>
      </footer>
    </div>
  )
}

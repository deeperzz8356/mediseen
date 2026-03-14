"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import {
  Eye,
  EyeOff,
  SlidersHorizontal,
  ImageIcon,
  Activity,
  Info,
  Maximize2
} from "lucide-react"

interface HeatmapViewerProps {
  originalImage: string
  heatmapImage?: string
  severity?: "low" | "medium" | "high"
  affectedArea?: number
}

export default function HeatmapViewer({
  originalImage,
  heatmapImage,
  severity,
  affectedArea
}: HeatmapViewerProps) {
  const [opacity, setOpacity] = useState(70)
  const [showHeatmap, setShowHeatmap] = useState(true)

  const getAbsoluteUrl = (path: string) => {
    if (path?.startsWith("http://") || path?.startsWith("https://")) {
      return path;
    }
    return `http://127.0.0.1:8000${path}`;
  };

  const severityColor =
    severity === "high"
      ? "bg-rose-500"
      : severity === "medium"
      ? "bg-amber-400"
      : severity === "low"
      ? "bg-emerald-400"
      : "bg-slate-500"

  const fullHeatmapUrl = heatmapImage ? getAbsoluteUrl(heatmapImage) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-br from-white to-slate-50 rounded-3xl p-10 md:p-12 shadow-xl border border-black/5 overflow-hidden flex flex-col space-y-12"
    >
      {/* 1. SECTION HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 border-b border-black/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/5 text-black text-[10px] font-black uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" /> Neural Explainability Engine
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter leading-none italic">
            Focus <span className="opacity-30">Distribution</span>
          </h3>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">
            Grad-CAM heatmap overlay for morphological variance detection
          </p>
        </div>

        {/* Unified Controls Panel */}
        <div className="flex flex-wrap items-center gap-6 bg-white p-4 px-8 rounded-2xl border border-black/5 shadow-inner w-full lg:w-auto">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 ${
              showHeatmap 
                ? "bg-black text-white" 
                : "bg-black/5 text-black/30 hover:bg-black/10"
            }`}
          >
            {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showHeatmap ? "Overlay Active" : "Overlay Hidden"}
          </button>

          <div className="w-px h-10 bg-black/5 mx-2 hidden sm:block"></div>

          <div className="flex items-center gap-6 flex-1 sm:min-w-[250px]">
            <SlidersHorizontal className={`w-4 h-4 ${showHeatmap ? "text-black" : "text-black/10"}`} />
            <div className="flex-1 space-y-2">
              <input
                type="range" min="0" max="100" value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                disabled={!showHeatmap}
                className="w-full h-2 accent-black cursor-pointer disabled:opacity-20 bg-slate-200 rounded-full appearance-none"
              />
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-20">
                <span>0% Alpha</span>
                <span>100% Alpha</span>
              </div>
            </div>
            <span className="text-[10px] font-black text-black w-12 text-right tabular-nums">
              {showHeatmap ? `${opacity}%` : "0%"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. VISUALIZER BLOCK */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Main Viewport */}
        <div className="xl:col-span-9">
          <div className="relative group bg-slate-100 rounded-[2rem] overflow-hidden border border-black/5 shadow-2xl aspect-[16/10] w-full flex items-center justify-center">
            {/* Layer 1: Base Clinical Image */}
            <img src={originalImage} alt="Clinical scan" className="w-full h-full object-contain" />

            {/* Layer 2: AI Heatmap Overlay */}
            <AnimatePresence>
              {fullHeatmapUrl && showHeatmap && (
                <motion.img
                  src={fullHeatmapUrl} alt="AI analysis heatmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: opacity / 100 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-contain mix-blend-multiply pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Viewport Labels */}
            <div className="absolute top-8 left-8 flex flex-col gap-4 pointer-events-none">
              <div className="bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-xl border border-black/5 flex items-center gap-3 shadow-lg">
                <ImageIcon className="w-3.5 h-3.5 text-black/40" />
                <span className="text-[10px] text-black font-black uppercase tracking-widest">Clinical Source</span>
              </div>

              {showHeatmap && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-2xl"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest font-black italic">Focus Mapping Engine</span>
                </motion.div>
              )}
            </div>

            <div className="absolute bottom-8 right-8">
              <div className="p-3 bg-white/80 backdrop-blur-md rounded-xl border border-black/5 text-black/20 shadow-lg">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>
            
            {!fullHeatmapUrl && showHeatmap && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md text-center p-12">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-8" />
                <p className="text-2xl font-black text-black uppercase tracking-tighter">Synthesizing Focus Layers</p>
                <p className="text-black/40 text-[10px] mt-3 uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                  Mapping feature importance vectors across diagnostic morphology
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. DIAGNOSTIC DATA BLOCK */}
        <div className="xl:col-span-3 space-y-8 flex flex-col">
          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-inner flex-1 flex flex-col justify-between space-y-12">
            <div className="space-y-10">
              

              <div className="space-y-4 border-t border-black/5 pt-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black opacity-30">Urgency Assessment</p>
                <div className={`text-4xl font-black uppercase tracking-tighter leading-none ${
                  severity === 'high' ? 'text-rose-500' : severity === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {severity || "N/A"}
                </div>
                <p className="text-[10px] font-bold text-black opacity-40 leading-relaxed italic uppercase tracking-tight">
                  Derived from neural variance indexing against clinical control datasets.
                </p>
              </div>
            </div>

            <div className="pt-10 border-t border-black/5">
              <div className="flex flex-col items-center gap-4 text-black/20">
                <Info className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-center">Precise Decision Support Asset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
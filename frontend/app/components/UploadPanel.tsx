"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles, X, CheckCircle2, MessageSquare } from "lucide-react"
import { DiagnosisResult } from "./ResultPanel"
import { API_BASE_URL } from "../config"
import { auth } from "@/lib/firebase"

interface UploadPanelProps {
  onAnalysisComplete?: (result: DiagnosisResult) => void
  onImageUpload?: (imageUrl: string) => void
  externalPreview?: string | null
}

export default function UploadPanel({ onAnalysisComplete, onImageUpload, externalPreview }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [symptoms, setSymptoms] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync with external preview (e.g. from native camera)
  useEffect(() => {
    if (externalPreview) {
      setPreview(externalPreview)
      // Convert base64 to File object if possible
      fetch(externalPreview)
        .then(res => res.blob())
        .then(blob => {
          const f = new File([blob], "camera_capture.jpg", { type: "image/jpeg" })
          setFile(f)
        })
    }
  }, [externalPreview])

  const handleFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile)
      setResult(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        const resultUrl = reader.result as string
        setPreview(resultUrl)
        if (onImageUpload) onImageUpload(resultUrl)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const runAnalysis = async () => {
    if (!file) return
    setIsAnalyzing(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("symptoms", symptoms || "No symptoms provided")

      if (!auth) {
        throw new Error("Authentication is not configured")
      }

      const user = auth.currentUser
      if (!user) {
        throw new Error("Please sign in before running diagnosis")
      }

      const token = await user.getIdToken()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(`${API_BASE_URL}/diagnose`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Client-Platform": "web",
        },
        body: formData,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Diagnosis request failed")
      }

      const apiResult = await response.json()
      const res: DiagnosisResult = {
        diseaseId: apiResult.session_id,
        prediction: apiResult.diagnosis,
        confidence: apiResult.confidence,
        explanation: apiResult.explanation,
        severity: apiResult.severity || "medium",
        heatmapUrl: apiResult.heatmap_url,
        reportUrl: apiResult.report_url,
        affectedArea: apiResult.affectedArea,
        nextSteps: apiResult.next_steps || [
          "Consult specialist for confirmation",
          "Monitor area for changes",
          "Follow clinical pathway"
        ]
      }
      setResult(`Analysis complete. AI detected: ${apiResult.diagnosis}`)
      if (onAnalysisComplete) onAnalysisComplete(res)
    } catch (error) {
      console.error("Backend fetch failed:", error)
      if (error instanceof DOMException && error.name === "AbortError") {
        setResult("Diagnosis timed out. Please try again.")
      } else if (error instanceof Error) {
        setResult(error.message)
      } else {
        setResult("Diagnosis failed. Please check backend connection.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-slate-50 rounded-2xl p-10 md:p-12 shadow-xl border border-black/5 flex flex-col space-y-10">
      {/* 1. SECTION HEADER */}
      <div className="flex items-center gap-5 border-b border-black/5 pb-8">
        <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-black shadow-xl shrink-0">1</div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">Clinical Intake</h2>
          <p className="text-[10px] font-bold text-black opacity-40 uppercase tracking-[0.2em]">Diagnostic Source & Observation</p>
        </div>
      </div>

      <div className="flex-1 space-y-10">
        {/* 2. ENLARGED DROP ZONE */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black opacity-50 flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5" /> Clinical Imaging Input (Scan)
          </label>
          <div
            onClick={() => !file && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[280px] flex flex-col items-center justify-center gap-6 cursor-pointer overflow-hidden group
              ${isDragging ? "border-black bg-slate-100 scale-[1.01]" : preview ? "border-black/5 bg-white" : "border-black/10 bg-white hover:border-black/20 hover:shadow-inner"}`}
          >
            {preview ? (
              <div className="relative w-full h-full flex flex-col items-center p-6 bg-slate-50">
                <div className="relative group/img max-w-full">
                  <Image src={preview} alt="Scan preview" width={320} height={180} unoptimized className="max-h-[180px] rounded-xl shadow-2xl object-contain border-4 border-white transition-transform group-hover/img:scale-105" />
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="absolute -top-3 -right-3 p-2.5 bg-black text-white rounded-full hover:bg-slate-800 transition shadow-2xl opacity-0 group-hover/img:opacity-100 scale-90 group-hover/img:scale-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981] flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Data Ready for Analysis
                  </span>
                  <p className="text-[9px] font-bold text-black/30 uppercase tracking-tight">Click image to replace source</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-10 flex flex-col items-center max-w-xs scale-110">
                <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-black opacity-20" />
                </div>
                <p className="text-base font-black text-black leading-tight">Drag and drop scan or <span className="underline decoration-black/20 decoration-2">browse filesystem</span></p>
                <p className="text-[10px] font-bold text-black/40 mt-3 uppercase tracking-widest">DICOM Compatible (PNG, JPG, HEIC)</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        </div>

        {/* 3. REFINED TEXTAREA */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black opacity-50 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Clinical Observations
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Clinical notes: morphologic variance, patient discomfort, duration of lesions..."
            className="w-full h-36 p-6 rounded-xl bg-white border border-black/10 text-black font-bold text-sm focus:ring-8 focus:ring-black/5 focus:border-black transition-all resize-none shadow-sm placeholder:opacity-30 placeholder:italic leading-relaxed"
          ></textarea>
        </div>

        {/* 4. CLINICAL ACTION */}
        <div className="pt-6">
          <button
            onClick={runAnalysis}
            disabled={!preview || isAnalyzing}
            className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95
              ${preview && !isAnalyzing ? "bg-black text-white hover:bg-slate-900" : "bg-slate-100 text-black/20 cursor-not-allowed"}`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Core Analysis...</span>
              </>
            ) : (
              <span>Initiate Diagnostic Cycle</span>
            )}
          </button>
          {result && (
            <p className="mt-4 text-sm font-bold text-black/70">{result}</p>
          )}
        </div>
      </div>
    </div>
  )
}

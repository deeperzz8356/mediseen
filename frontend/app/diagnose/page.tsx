"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"
import { FileText, Eye, ChevronRight, Activity, Sparkles, Camera as CameraIcon, Lock } from "lucide-react"
import { useLocale } from "../i18n/LocaleContext"
import UploadPanel from "../components/UploadPanel"
import ResultPanel, { DiagnosisResult } from "../components/ResultPanel"
import HeatmapViewer from "../components/HeatmapViewer"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore"
import { resolveBackendAssetUrl } from "../config"
import { useAppStore } from "../store/useAppStore"

type ScanActivity = {
  id: string
  diagnosis: string
  confidence: number | null
  symptoms: string[]
  timestamp: string
  summary: string
  reportUrl?: string
  heatmapUrl?: string
}

export default function DiagnosePage() {
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState("")
  const [activityItems, setActivityItems] = useState<ScanActivity[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)
  const [guestPromptSource, setGuestPromptSource] = useState<"activity" | null>(null)
  const { t } = useLocale()
  const { authStatus } = useAppStore()

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (authStatus !== "guest") {
      setShowGuestPrompt(false)
      setGuestPromptSource(null)
    }
  }, [authStatus])

  const requireLoginForHistory = () => {
    if (authStatus === "guest") {
      setGuestPromptSource("activity")
      setShowGuestPrompt(true)
      return true
    }

    return false
  }

  const loadActivityHistory = useCallback(async () => {
    if (!db || !currentUser) {
      setActivityItems([])
      return
    }

    setActivityLoading(true)
    setActivityError("")

    try {
      const recordsRef = collection(db, "diagnosis_records")
      const activityQuery = query(recordsRef, where("uid", "==", currentUser.uid))
      const snapshot = await getDocs(activityQuery)

      setActivityItems(
        snapshot.docs
          .map((doc) => {
          const data = doc.data() as Record<string, unknown>
          const deepKnowledge = (data.deep_knowledge as Record<string, unknown> | undefined) ?? {}
          const confidence = typeof data.confidence === "number" ? data.confidence : null
          const symptoms = Array.isArray(data.symptoms)
            ? data.symptoms.filter((item): item is string => typeof item === "string")
            : []

          return {
            id: doc.id,
            diagnosis: String(data.diagnosis ?? "Unknown result"),
            confidence,
            symptoms,
            timestamp: String(data.timestamp ?? ""),
            summary: String(deepKnowledge.simple_explanation ?? deepKnowledge.reason ?? "Scan completed."),
            reportUrl: typeof data.report_url === "string" ? data.report_url : undefined,
            heatmapUrl: typeof data.heatmap_url === "string" ? data.heatmap_url : undefined,
          }
          })
          .sort((left, right) => {
            return String(right.timestamp).localeCompare(String(left.timestamp))
          })
          .slice(0, 6)
      )
    } catch (error) {
      console.error("Failed to load activity history:", error)
      setActivityError(t.diagnose.activity.error)
    } finally {
      setActivityLoading(false)
    }
  }, [currentUser, t.diagnose.activity.error])

  useEffect(() => {
    if (showActivity) {
      void loadActivityHistory()
    }
  }, [showActivity, loadActivityHistory])

  const handleReset = () => {
    setAnalysisResult(null)
    setUploadedImage(null)
    setShowHeatmap(false)
    setShowReport(false)
  }

  const takePhoto = async () => {
    try {
      const permissions = await Camera.checkPermissions();
      
      if (permissions.camera !== 'granted') {
        const request = await Camera.requestPermissions({ permissions: ['camera'] });
        if (request.camera !== 'granted') {
          alert(t.diagnose.upload.cameraPermissionRequired);
          return;
        }
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      })

      if (image.base64String) {
        setUploadedImage(`data:image/jpeg;base64,${image.base64String}`)
      }
    } catch (error) {
      console.error("Camera error:", error)
      // Only show error if it's not a user cancellation
      if (error instanceof Error && !error.message.includes("User cancelled")) {
        alert(t.diagnose.upload.cameraAccessFailed);
      }
    }
  }

  const handleAnalysisComplete = (res: DiagnosisResult) => {
    setAnalysisResult(res)
    if (showActivity) {
      void loadActivityHistory()
    }
    setTimeout(() => {
      document.getElementById('results-section-header')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8 md:space-y-12 pb-32 pt-8 md:pt-12">
      {/* --- PAGE HEADER --- */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10 border-b border-black/5 pb-8 md:pb-12">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-violet text-white text-[10px] font-black uppercase tracking-widest shadow-lg"
          >
            <Sparkles className="w-3 h-3" /> {t.diagnose.badge}
          </motion.div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tighter uppercase leading-tight md:leading-none">
            {t.diagnose.title} <span className="text-pastel-pink">{t.diagnose.titleHighlight}</span>
          </h1>
          <p className="text-sm md:text-lg text-slate-500 font-bold max-w-xl leading-snug md:leading-tight">
            {t.diagnose.subtitle}
          </p>
          <div className="pt-2 md:pt-4 flex flex-wrap gap-3 md:gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={takePhoto}
              className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl bg-black text-white font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
            >
              <CameraIcon className="w-4 h-4" />
              {t.diagnose.scanReport}
            </motion.button>
            <button
              onClick={() => {
                if (requireLoginForHistory()) return
                setShowActivity((value) => !value)
              }}
              className={`flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                showActivity
                  ? "border-black bg-black text-white shadow-xl"
                  : "border-black/10 text-slate-400 hover:text-slate-600 hover:border-black/20"
              }`}
            >
              <Activity className="w-4 h-4 inline-block mr-2" />
              {t.diagnose.browseHistory}
            </button>
          </div>
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
          <div className="ml-3 hidden lg:block border-l border-slate-100 pl-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{t.diagnose.steps.currentStep}</p>
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
              {!analysisResult ? t.diagnose.steps.uploadScan : (showHeatmap || showReport ? t.diagnose.steps.results : t.diagnose.steps.aiAnalysis)}
            </p>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showActivity && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="max-w-5xl mx-auto rounded-[2rem] border border-black/5 bg-white shadow-sm p-6 md:p-8 space-y-5"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{t.diagnose.activity.title}</p>
                <h2 className="text-2xl font-black text-slate-900">{t.diagnose.activity.recentScans}</h2>
              </div>
              <button
                onClick={loadActivityHistory}
                className="self-start md:self-auto px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-60"
                disabled={activityLoading}
              >
                {activityLoading ? t.diagnose.activity.refreshing : t.diagnose.activity.refresh}
              </button>
            </div>

            {activityError && <p className="text-sm font-medium text-rose-500">{activityError}</p>}

            <div className="grid gap-4">
              {activityLoading && activityItems.length === 0 ? (
                <p className="text-sm font-medium text-slate-400">{t.diagnose.activity.loadingHistory}</p>
              ) : activityItems.length === 0 ? (
                <p className="text-sm font-medium text-slate-400">{t.diagnose.activity.noHistory}</p>
              ) : (
                activityItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 md:p-5 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-slate-900">{item.diagnosis}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : t.diagnose.activity.unknownTime}
                        </p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                        {item.confidence !== null
                          ? `${Math.round(item.confidence * 100)}% ${t.diagnose.activity.confidence}`
                          : t.diagnose.activity.savedResult}
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-600">{item.summary}</p>

                    {item.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.symptoms.slice(0, 4).map((symptom) => (
                          <span key={symptom} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {item.reportUrl && (
                        <a
                          href={resolveBackendAssetUrl(item.reportUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl bg-black text-white"
                        >
                          {t.diagnose.activity.openReport}
                        </a>
                      )}
                      {item.heatmapUrl && (
                        <a
                          href={resolveBackendAssetUrl(item.heatmapUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-500"
                        >
                          {t.diagnose.activity.openHeatmap}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- MAIN WORKFLOW --- */}
      <main className="space-y-12">
        <AnimatePresence mode="wait">
          {!analysisResult ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto w-full"
            >
              <UploadPanel
                onAnalysisComplete={handleAnalysisComplete}
                onImageUpload={(img) => setUploadedImage(img)}
                externalPreview={uploadedImage}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <ResultPanel 
                result={analysisResult} 
                onReset={handleReset} 
                showReport={showReport}
                setShowReport={setShowReport}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showGuestPrompt && guestPromptSource === "activity" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm flex items-start justify-center px-4 pt-[calc(5rem+env(safe-area-inset-top,0px)+1rem)]"
          >
            <motion.div
              initial={{ y: 24, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, scale: 0.96 }}
              className="w-full max-w-md rounded-[2rem] bg-white shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 md:p-8 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Login required</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Please log in to store your scan history and records.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg"
                  >
                    Login now
                  </Link>
                  <button
                    onClick={() => setShowGuestPrompt(false)}
                    className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest"
                  >
                    Continue as guest
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

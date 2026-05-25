"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { UploadCloud, Loader2, AlertTriangle, Settings } from "lucide-react"
import { Camera } from "@capacitor/camera"
import { motion, AnimatePresence } from "framer-motion"
import { DiagnosisResult } from "./ResultPanel"
import { API_BASE_URL } from "../config"
import { auth } from "@/lib/firebase"
import { useAppStore } from "../store/useAppStore"
import { useLocale } from "../i18n/LocaleContext"
import { requestCameraPermission, requestGalleryPermission } from "../lib/permissions"

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
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [showGalleryPrompt, setShowGalleryPrompt] = useState(false)
  const [requestingGalleryPermission, setRequestingGalleryPermission] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { authStatus, profile } = useAppStore()
  const { locale, t } = useLocale()

  const getRequestDebugContext = () => {
    if (typeof window === "undefined") {
      return {
        apiUrl: `${API_BASE_URL}/diagnose`,
        platform: "server-side render",
        online: "unknown",
        origin: "unknown",
      }
    }

    const isCapacitor = "Capacitor" in window

    return {
      apiUrl: `${API_BASE_URL}/diagnose`,
      platform: isCapacitor ? "capacitor/android" : "web",
      online: navigator.onLine ? "online" : "offline",
      origin: window.location.origin,
    }
  }

  const buildDetailedErrorMessage = (error: unknown) => {
    const context = getRequestDebugContext()

    if (error instanceof DOMException && error.name === "AbortError") {
      return [
        "Diagnosis timed out after 30 seconds.",
        `API: ${context.apiUrl}`,
        `Platform: ${context.platform}`,
        `Network: ${context.online}`,
        `Origin: ${context.origin}`,
      ].join("\n")
    }

    if (error instanceof Error) {
      const lowerMessage = error.message.toLowerCase()
      const likelyNetworkFailure =
        lowerMessage.includes("failed to fetch") ||
        lowerMessage.includes("networkerror") ||
        lowerMessage.includes("network request failed")

      if (likelyNetworkFailure) {
        return [
          "Backend request failed before the server returned a response.",
          `Error: ${error.message}`,
          `API: ${context.apiUrl}`,
          `Platform: ${context.platform}`,
          `Network: ${context.online}`,
          `Origin: ${context.origin}`,
          "Likely causes: CORS blocked the request, the backend is offline, the device has no internet, or the API URL is wrong.",
        ].join("\n")
      }

      return [
        error.message,
        `API: ${context.apiUrl}`,
        `Platform: ${context.platform}`,
        `Network: ${context.online}`,
        `Origin: ${context.origin}`,
      ].join("\n")
    }

    return [
      "Diagnosis failed. Please check backend connection.",
      `API: ${context.apiUrl}`,
      `Platform: ${context.platform}`,
      `Network: ${context.online}`,
      `Origin: ${context.origin}`,
    ].join("\n")
  }

  // Sync with external preview (e.g. from native camera)
  useEffect(() => {
    if (externalPreview && externalPreview !== preview) {
      setPreview(externalPreview)
      
      // Convert base64 to File object more robustly
      if (externalPreview.startsWith('data:')) {
        try {
          const parts = externalPreview.split(',');
          const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const f = new File([u8arr], "upload.jpg", { type: mime });
          setFile(f);
        } catch (e) {
          console.error("Failed to convert base64 to file:", e);
        }
      }
    }
  }, [externalPreview, preview])

  const handleFile = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        const resultUrl = reader.result as string
        if (resultUrl !== preview) {
          setPreview(resultUrl)
          if (onImageUpload) onImageUpload(resultUrl)
        }
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // Removed redundant handleDiagnose to consolidate logic in runAnalysis

  const runAnalysis = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("symptoms", symptoms || "No symptoms provided")
      formData.append("locale", locale)

      let token = ""
      const user = auth?.currentUser
      if (user) {
        token = await user.getIdToken()
      } else if (authStatus === "guest" && profile?.uid) {
        token = profile.uid
      } else {
        throw new Error("Please sign in before running diagnosis")
      }
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      console.log("SENDING REQUEST TO:", `${API_BASE_URL}/diagnose`);
      const response = await fetch(`${API_BASE_URL}/diagnose`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Client-Platform": getRequestDebugContext().platform,
        },
        body: formData,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const text = await response.text().catch(() => null)
        console.error("Diagnosis API error:", response.status, text);
        throw new Error(`Backend Error ${response.status}: ${text || "Unknown"}`);
      }

      const apiResult = await response.json()
      console.log("API RESPONSE RECEIVED:", apiResult);
      
      // 7. Verify Field Mapping
      const res: DiagnosisResult = {
        disease_identification: apiResult.disease_identification || "Unknown Condition",
        confidence: typeof apiResult.confidence === 'number' ? apiResult.confidence : 0,
        patient_friendly_explanation: apiResult.patient_friendly_explanation || "Analysis completed.",
        root_cause_reason: apiResult.root_cause_reason || "Visual inspection of report data.",
        steps_to_understand_and_manage: apiResult.steps_to_understand_and_manage || apiResult.management_steps || [],
        likely_symptoms: apiResult.likely_symptoms || [],
        diet: apiResult.diet,
        heatmapUrl: apiResult.heatmap_url,
        reportUrl: apiResult.report_url,
        diseaseId: apiResult.session_id || `session_${Date.now()}`
      }

      console.log("MAPPED DATA STATE:", res);
      setResult(`${t.diagnose.upload.analysisCompletePrefix} ${res.disease_identification}`)
      if (onAnalysisComplete) onAnalysisComplete(res)
    } catch (error) {
      console.error("DIAGNOSIS PIPELINE FAILURE:", error)
      setResult(buildDetailedErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const [permissionDenied, setPermissionDenied] = useState(false)
  const [permissionPermanent, setPermissionPermanent] = useState(false)

  const openGalleryPrompt = () => {
    setPermissionDenied(false)
    setPermissionPermanent(false)
    setShowGalleryPrompt(true)
  }

  /** Gallery / Upload – asks for explain-first permission prompt on tap */
  const openGalleryPicker = async () => {
    // Prefer native photo picker when running on device; fallback to file input for documents or browser
    try {
      if ((window as any)?.Capacitor && (window as any).Capacitor.isNativePlatform && (window as any).Capacitor.isNativePlatform()) {
        const { CameraSource, CameraResultType } = await import("@capacitor/camera")
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos,
        })

        if (image.base64String) {
          const base64Url = `data:image/jpeg;base64,${image.base64String}`
          setPreview(base64Url)
          if (onImageUpload) onImageUpload(base64Url)
          const bstr = atob(image.base64String)
          let n = bstr.length
          const u8arr = new Uint8Array(n)
          while (n--) u8arr[n] = bstr.charCodeAt(n)
          setFile(new File([u8arr], "gallery_upload.jpg", { type: "image/jpeg" }))
          return
        }
      }

      // If native picker not available or didn't return an image, open the hidden file input to support PDFs and images
      fileInputRef.current?.click()
    } catch (err) {
      console.warn("Gallery picker failed, falling back to file input", err)
      fileInputRef.current?.click()
    }
  }

  const allowGalleryAccess = async () => {
    setRequestingGalleryPermission(true)
    setShowGalleryPrompt(false)
    try {
      setPermissionDenied(false)
      setPermissionPermanent(false)
      const perm = await requestGalleryPermission()
      if (!perm.granted) {
        setPermissionDenied(true)
        setPermissionPermanent(perm.permanentlyDenied)
        return
      }

      await openGalleryPicker()
    } finally {
      setRequestingGalleryPermission(false)
    }
  }

  // Hidden file input handler for web/native fallback (images + documents)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    // reset value to allow selecting the same file again
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  /** Camera / Scan – only requests permission on user tap */
  const handleScan = async () => {
    setPermissionDenied(false)
    setPermissionPermanent(false)

    const perm = await requestCameraPermission()
    if (!perm.granted) {
      setPermissionDenied(true)
      setPermissionPermanent(perm.permanentlyDenied)
      return
    }

    try {
      const { CameraSource, CameraResultType } = await import("@capacitor/camera")
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      })
      if (image.base64String) {
        const base64Url = `data:image/jpeg;base64,${image.base64String}`
        setPreview(base64Url)
        if (onImageUpload) onImageUpload(base64Url)
        const bstr = atob(image.base64String)
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) u8arr[n] = bstr.charCodeAt(n)
        setFile(new File([u8arr], "camera_capture.jpg", { type: "image/jpeg" }))
      }
    } catch (err) {
      console.warn("Camera failed:", err)
    }
  }

  return (
    <div className="w-full h-full bg-white rounded-3xl p-8 md:p-10 border border-black/5 flex flex-col space-y-8">
      {/* 1. SIMPLE HEADER */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.diagnose.upload.stepTitle}</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.diagnose.upload.stepSubtitle}</p>
      </div>

      <div className="flex-1 space-y-8">
        {/* 2. IMAGE DROP ZONE */}
        {/* Permission denied banner */}
        {permissionDenied && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-700">
                {permissionPermanent ? t.diagnose.upload.permissionPermanent : t.diagnose.upload.permissionRequired}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {permissionPermanent
                  ? t.diagnose.upload.permissionPermanentDesc
                  : t.diagnose.upload.permissionRequiredDesc}
              </p>
            </div>
            {permissionPermanent && (
              <Settings className="w-4 h-4 text-amber-500 shrink-0" />
            )}
          </div>
        )}

        <div
          onClick={openGalleryPrompt}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 min-h-[240px] flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden
            ${isDragging ? "border-black bg-slate-50" : preview ? "border-black/5 bg-slate-50" : "border-slate-100 bg-slate-50/30 hover:border-slate-200"}`}
        >
          {preview ? (
            <div className="relative w-full h-full flex flex-col items-center p-6">
              <Image src={preview} alt="Scan preview" width={280} height={160} unoptimized className="max-h-[160px] rounded-2xl shadow-lg object-contain border-4 border-white" />
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="mt-4 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">
                {t.diagnose.upload.changeImage}
              </button>
            </div>
          ) : (
            <div className="text-center p-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                <UploadCloud className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-600">{t.diagnose.upload.tapToBrowse}</p>
              <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">{t.diagnose.upload.fileTypes}</p>
            </div>
          )}
        </div>

        {/* Hidden file input for fallback (images, PDFs) */}
        <input
          ref={fileInputRef}
          onChange={handleFileInputChange}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
        />

        <AnimatePresence>
          {showGalleryPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-start justify-center px-4 pt-[calc(5rem+env(safe-area-inset-top,0px)+1rem)]"
            >
              <motion.div
                initial={{ y: 20, scale: 0.97 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0.97 }}
                className="w-full max-w-md rounded-[2rem] bg-white shadow-2xl border border-slate-100 overflow-hidden"
              >
                <div className="p-6 md:p-8 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Allow photo access</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      MediSeen needs photo access only when you upload a scan or report, so it can analyze and save your record safely.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowGalleryPrompt(false)}
                      className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest"
                      disabled={requestingGalleryPermission}
                    >
                      Not now
                    </button>
                    <button
                      onClick={() => void allowGalleryAccess()}
                      className="flex-1 px-5 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-60"
                      disabled={requestingGalleryPermission}
                    >
                      {requestingGalleryPermission ? "Requesting..." : "Allow"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. SYMPTOMS */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.diagnose.upload.symptomsLabel}</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t.diagnose.upload.symptomsPlaceholder}
            className="w-full h-32 p-6 rounded-2xl bg-slate-50 border-none text-slate-700 font-bold text-sm focus:ring-4 focus:ring-slate-100 transition-all resize-none placeholder:text-slate-300"
          ></textarea>
        </div>

        {/* 4. ACTION */}
        <div className="pt-4">
          <button
            onClick={runAnalysis}
            disabled={!preview || loading}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4
              ${preview && !loading ? "bg-black text-white" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.diagnose.upload.analyzingReport}</span>
              </>
            ) : (
              <span>{t.diagnose.upload.startAnalysis}</span>
            )}
          </button>
          {result && (
            <p className="mt-4 p-4 text-xs font-bold text-slate-400 bg-slate-50 rounded-xl">
              {result}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

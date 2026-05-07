"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { UploadCloud, Loader2, AlertTriangle, Settings } from "lucide-react"
import { Camera } from "@capacitor/camera"
import { DiagnosisResult } from "./ResultPanel"
import { API_BASE_URL } from "../config"
import { auth } from "@/lib/firebase"
import { requestCameraPermission, requestGalleryPermission, requestFilesPermission } from "../lib/permissions"

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

  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setResult(`Analysis complete: ${res.disease_identification}`)
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

  /** Gallery / Upload – only requests permission on user tap */
  const handleBrowse = async () => {
    setPermissionDenied(false)
    setPermissionPermanent(false)
    // Step 1: Request files/photos permission lazily
    const perm = await requestFilesPermission()
    if (!perm.granted) {
      setPermissionDenied(true)
      setPermissionPermanent(perm.permanentlyDenied)
      return
    }

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
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">1. Upload Report</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select your medical image or scan</p>
      </div>

      <div className="flex-1 space-y-8">
        {/* 2. IMAGE DROP ZONE */}
        {/* Permission denied banner */}
        {permissionDenied && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-700">
                {permissionPermanent ? "Permission permanently denied" : "Permission required"}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {permissionPermanent
                  ? "Open device Settings to enable access."
                  : "Please allow access when prompted."}
              </p>
            </div>
            {permissionPermanent && (
              <Settings className="w-4 h-4 text-amber-500 shrink-0" />
            )}
          </div>
        )}

        <div
          onClick={handleBrowse}
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
                Change Image
              </button>
            </div>
          ) : (
            <div className="text-center p-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                <UploadCloud className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-600">Tap to browse or take a photo</p>
              <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">PNG, JPG or HEIC</p>
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

        {/* 3. SYMPTOMS */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">2. Describe Symptoms</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Type your symptoms here (e.g. heartache, dizziness...)"
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
                <span>Analyzing Report...</span>
              </>
            ) : (
              <span>Start AI Analysis</span>
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

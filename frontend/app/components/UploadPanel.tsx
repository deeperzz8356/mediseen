"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles, X, CheckCircle2, MessageSquare } from "lucide-react"
import { Camera } from "@capacitor/camera"
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

  const handleDiagnose = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Upload to Cloudinary first
      const formData = new FormData();
      const blob = await (await fetch(preview)).blob();
      formData.append("file", blob);
      formData.append("upload_preset", "mediseen_uploads");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();

      if (!uploadData.secure_url) throw new Error("Upload failed");

      // 2. Call our unified backend pipeline
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: uploadData.secure_url,
          user_symptoms: symptoms
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      
      const result = await response.json();
      
      // Pass the clean, merged JSON to the parent
      onAnalysisComplete?.({
        prediction: result.disease_identification,
        confidence: result.confidence,
        explanation: result.patient_friendly_explanation,
        rootCause: result.root_cause_reason,
        laymanExplanation: result.patient_friendly_explanation,
        managementSteps: result.steps_to_understand_and_manage,
        likelySymptoms: result.likely_symptoms,
        diet: result.diet, // Pass the new diet data
        reportUrl: result.report_url || "",
        heatmapUrl: result.heatmap_url || "",
        diseaseId: result.disease_id || ""
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
          "X-Client-Platform": getRequestDebugContext().platform,
        },
        body: formData,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const text = await response.text().catch(() => null)
        let errorDetail: string | undefined
        try {
          const parsed = text ? JSON.parse(text) : {}
          errorDetail = parsed.detail || parsed.message
        } catch (_) {
          // response was not JSON
        }
        console.error("Diagnosis API error:", {
          status: response.status,
          statusText: response.statusText,
          body: text,
          url: `${API_BASE_URL}/diagnose`,
        })
        throw new Error(
          errorDetail
            ? `Backend returned ${response.status} ${response.statusText || "Error"}: ${errorDetail}`
            : `Backend returned ${response.status} ${response.statusText || "Error"}${text ? `: ${text.slice(0, 400)}` : ""}`
        )
      }

      const apiResult = await response.json()
      
      // Ensure we always have a numeric confidence
      const rawConfidence = apiResult.confidence || apiResult.confidence_score || 0
      const confidence = typeof rawConfidence === 'number' ? rawConfidence : parseFloat(rawConfidence) || 0

      const res: DiagnosisResult = {
        diseaseId: apiResult.session_id || `session_${Date.now()}`,
        prediction: apiResult.diagnosis || apiResult.prediction || "Analysis Complete",
        confidence: confidence,
        explanation: apiResult.explanation || apiResult.patient_friendly_explanation || "No detailed explanation available.",
        severity: apiResult.severity || "medium",
        heatmapUrl: apiResult.heatmap_url,
        reportUrl: apiResult.report_url,
        affectedArea: apiResult.affectedArea,
        likelySymptoms: apiResult.likely_symptoms,
        rootCause: apiResult.root_cause_reason,
        laymanExplanation: apiResult.patient_friendly_explanation,
        managementSteps: apiResult.management_steps || apiResult.next_steps || [
          "Consult specialist for confirmation",
          "Monitor area for changes",
          "Follow clinical pathway"
        ]
      }
      setResult(`Analysis complete. AI detected: ${res.prediction}`)
      if (onAnalysisComplete) onAnalysisComplete(res)
    } catch (error) {
      console.error("Backend fetch failed:", error)
      setResult(buildDetailedErrorMessage(error))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleBrowse = async () => {
    try {
      const { CameraSource, CameraResultType } = await import("@capacitor/camera")
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos // Force use of native gallery picker
      })

      if (image.base64String) {
        const base64Url = `data:image/jpeg;base64,${image.base64String}`
        setPreview(base64Url)
        if (onImageUpload) onImageUpload(base64Url)
        
        // Convert to File for the upload
        const bstr = atob(image.base64String)
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        const f = new File([u8arr], "gallery_upload.jpg", { type: "image/jpeg" })
        setFile(f)
      }
    } catch (err) {
      console.warn("Native gallery picker failed, falling back to web input", err)
      fileInputRef.current?.click()
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-3xl p-8 md:p-10 border border-black/5 flex flex-col space-y-8">
      {/* 1. SIMPLE HEADER */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">1. Upload Report</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select your medical image or scan</p>
      </div>

      <div className="flex-1 space-y-8">
        {/* 2. IMAGE DROP ZONE */}
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
            disabled={!preview || isAnalyzing}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4
              ${preview && !isAnalyzing ? "bg-black text-white" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
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

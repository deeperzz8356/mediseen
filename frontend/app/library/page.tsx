"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Book, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  Stethoscope,
  ChevronRight,
  X
} from "lucide-react"
import { API_BASE_URL } from "../config"

interface MedicalContext {
  disease: string
  symptoms: string[]
  precautions: string[]
  diet: {
    recommended: string[]
    avoid: string[]
    plan: string
  }
}

export default function LibraryPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MedicalContext | null>(null)
  const [error, setError] = useState("")
  const [showDetails, setShowDetails] = useState(false)

  const shortcuts = [
    { name: "Diabetes", icon: "🩸", color: "bg-rose-50", text: "text-rose-600" },
    { name: "PCOS", icon: "🧬", color: "bg-purple-50", text: "text-purple-600" },
    { name: "Hypertension", icon: "💓", color: "bg-orange-50", text: "text-orange-600" },
    { name: "Acidity", icon: "🍋", color: "bg-yellow-50", text: "text-yellow-600" },
    { name: "Anemia", icon: "🍎", color: "bg-red-50", text: "text-red-600" },
    { name: "Obesity", icon: "⚖️", color: "bg-emerald-50", text: "text-emerald-600" },
    { name: "Thyroid", icon: "🦋", color: "bg-indigo-50", text: "text-indigo-600" },
    { name: "IBS", icon: "🍃", color: "bg-teal-50", text: "text-teal-600" },
  ]

  const fetchKnowledge = async (diseaseName?: string) => {
    const searchTarget = diseaseName || query
    if (!searchTarget.trim()) return
    
    if (diseaseName) setQuery(diseaseName)
    
    setLoading(true)
    setError("")
    setData(null)
    setShowDetails(false)

    try {
      const res = await fetch(`${API_BASE_URL}/medical/context?disease=${encodeURIComponent(searchTarget)}`)
      if (!res.ok) throw new Error("Failed to fetch medical context")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError("Information for this condition is not currently in our library.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-24 space-y-12">
      <header className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[10px] font-black text-violet-600 uppercase tracking-widest">
          <Book className="w-3.5 h-3.5" />
          Clinical Knowledge Base
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight">MediSeen Library</h1>
        <p className="text-xl text-slate-500 font-bold max-w-2xl leading-relaxed">
          Search thousands of conditions or use our quick-access clinical shortcuts.
        </p>
      </header>

      {/* Search Section */}
      <div className="relative group">
        <div className="flex items-center gap-4 bg-white border-2 border-slate-100 rounded-[2.5rem] px-8 py-5 shadow-2xl shadow-slate-200/50 focus-within:border-violet-400 transition-all">
          <Search className="w-7 h-7 text-slate-300 group-focus-within:text-violet-500 transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchKnowledge()}
            placeholder="Search symptoms, diseases, or precautions..."
            className="w-full bg-transparent outline-none text-xl font-bold text-slate-700 placeholder:text-slate-300"
          />
          <button 
            onClick={() => fetchKnowledge()}
            className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Explore"}
          </button>
        </div>
      </div>

      {/* Shortcuts Grid */}
      {!data && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Clinical Shortcuts</h3>
            <span className="text-[10px] font-bold text-slate-300 uppercase">8 Curated Conditions</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {shortcuts.map((s, i) => (
              <motion.button
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => fetchKnowledge(s.name)}
                className="group relative overflow-hidden text-left p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-violet-200 hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <h4 className="text-lg font-black text-slate-800">{s.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1 mt-1 group-hover:text-violet-500">
                  View Data <ChevronRight className="w-3 h-3" />
                </p>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Querying clinical database...</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[2.5rem] bg-rose-50 border border-rose-100 text-rose-500 flex items-center gap-4"
          >
            <AlertCircle className="w-8 h-8 shrink-0" />
            <p className="font-bold">{error}</p>
          </motion.div>
        )}

        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Result Preview Card */}
            <div className="flo-card p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-violet-950 text-white shadow-2xl shadow-violet-900/20 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest text-violet-200">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Medical Record Found
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black">{data.disease}</h2>
                  <p className="text-violet-200/70 font-bold text-lg max-w-xl">
                    Validated symptoms and precautions for {data.disease} are now available for review.
                  </p>
                </div>
                <button 
                  onClick={() => setShowDetails(true)}
                  className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3"
                >
                  Explore Detailed Analysis <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <Book className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
            </div>

            {/* Detailed Content Modal/Overlay */}
            <AnimatePresence>
              {showDetails && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col"
                  >
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
                          <Book className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">{data.disease}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Details</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowDetails(false)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Symptoms */}
                        <div className="space-y-6">
                          <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            Symptoms
                          </h4>
                          <div className="grid gap-3">
                            {data.symptoms.map((s, i) => (
                              <div key={i} className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100/50 text-sm font-bold text-slate-700 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Precautions */}
                        <div className="space-y-6">
                          <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            Precautions
                          </h4>
                          <div className="grid gap-3">
                            {data.precautions.map((p, i) => (
                              <div key={i} className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 text-sm font-bold text-slate-700 flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Summary Section */}
                      <div className="p-10 rounded-[2.5rem] bg-violet-50/50 border border-violet-100/50 space-y-4">
                        <h4 className="text-xl font-black text-violet-700 flex items-center gap-3">
                          <Info className="w-6 h-6" />
                          Nutrition Logic
                        </h4>
                        <p className="text-slate-600 font-bold leading-relaxed">
                          For {data.disease}, the recommended clinical approach focuses on: {data.diet.recommended.join(", ")}. 
                          It is strictly advised to avoid: {data.diet.avoid.join(", ")}.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

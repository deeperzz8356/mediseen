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
            className="space-y-12"
          >
            {/* Header / Condition Title */}
            <div className="relative p-10 md:p-16 rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-pastel-pink/20 rounded-full blur-[100px] -ml-48 -mb-48" />
              
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Clinical Data
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">{data.disease}</h2>
                <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                  Comprehensive therapeutic overview and management protocols for <span className="text-white">{data.disease}</span>.
                </p>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Symptoms & Precautions */}
              <div className="space-y-8">
                {/* Symptoms Card */}
                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Clinical Symptoms</h3>
                  </div>
                  <div className="grid gap-3">
                    {data.symptoms.map((s, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 group hover:bg-white hover:border-amber-200 transition-all"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-150 transition-transform" />
                        <span className="font-bold text-slate-600">{s}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Precautions Card */}
                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Precautions</h3>
                  </div>
                  <div className="grid gap-3">
                    {data.precautions.map((p, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50 group hover:bg-white hover:border-emerald-300 transition-all"
                      >
                        <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <ChevronRight className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="font-bold text-slate-600 leading-snug">{p}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Nutrition Intelligence */}
              <div className="space-y-8">
                <div className="h-full p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-2xl shadow-indigo-900/20 space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                  
                  <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center text-white">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black">Nutrition Strategy</h3>
                      <p className="text-indigo-100 font-medium leading-relaxed">
                        Precision dietary guidance optimized for <span className="text-white font-bold">{data.disease}</span> management.
                      </p>
                    </div>

                    {/* Recommended */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Therapeutic Favorites</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.diet.recommended.map((item, i) => (
                          <span key={i} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-bold backdrop-blur-md">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Avoid */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-rose-300">Strictly Avoid</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.diet.avoid.map((item, i) => (
                          <span key={i} className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-100 text-sm font-bold backdrop-blur-md">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-6">
                      <button 
                        onClick={() => window.location.href = "/diet"}
                        className="w-full py-5 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                      >
                        Generate Personalized Diet Plan
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Reset */}
            <div className="pt-10 flex justify-center">
              <button 
                onClick={() => { setData(null); setQuery(""); }}
                className="px-8 py-3 rounded-xl bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Clear Results & Search Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

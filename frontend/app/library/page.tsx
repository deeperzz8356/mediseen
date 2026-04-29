"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Book, AlertTriangle, ShieldCheck, Info, Loader2, AlertCircle } from "lucide-react"
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

  const commonDiseases = [
    "Pneumonia", "Eczema", "Psoriasis", "Melanoma", "Ringworm", "Acne", "Rosacea", "Vitiligo"
  ]

  const fetchKnowledge = async (diseaseName?: string) => {
    const searchTarget = diseaseName || query
    if (!searchTarget.trim()) return
    
    if (diseaseName) setQuery(diseaseName)
    
    setLoading(true)
    setError("")
    setData(null)

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
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-24 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Medical Library</h1>
        <p className="text-xl text-slate-500 font-bold max-w-2xl">
          Comprehensive clinical knowledge system for symptoms and precautions.
        </p>
      </header>

      {/* Search Bar & Suggestions */}
      <div className="space-y-6">
        <div className="flo-card p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 bg-white/80 backdrop-blur-sm">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus-within:bg-white focus-within:border-pastel-violet focus-within:shadow-lg transition-all">
              <Search className="w-6 h-6 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchKnowledge()}
                placeholder="Search diseases (e.g. Psoriasis, Pneumonia)..."
                className="w-full bg-transparent outline-none text-lg font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>
            <button
              onClick={() => fetchKnowledge()}
              disabled={loading}
              className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Search"}
            </button>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {commonDiseases.map((d) => (
                <button
                  key={d}
                  onClick={() => fetchKnowledge(d)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-xs font-bold text-slate-600 hover:border-pastel-violet hover:text-pastel-violet transition-all shadow-sm"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 text-red-500 rounded-[2rem] flex items-center gap-4 font-bold shadow-sm">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Book className="w-8 h-8" />
            </div>
            <p className="font-bold text-slate-400">Enter a disease name above to explore clinical information.</p>
          </div>
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Info className="w-8 h-8" />
            </div>
            <p className="font-bold text-slate-400">Our library uses the same validated clinical database as our AI scanner.</p>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-8 pb-10">
          {/* Disease Info Section */}
          <section className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flo-card p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/50"
            >
              <h2 className="text-3xl font-black text-slate-900 mb-4">{data.disease}</h2>
              <p className="text-slate-600 font-bold leading-relaxed text-lg">
                Clinical overview and evidence-based guidance for managing this condition.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Symptoms Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flo-card p-8 rounded-[2rem] space-y-6"
              >
                <div className="flex items-center gap-3 text-amber-600">
                  <AlertTriangle className="w-7 h-7" />
                  <h3 className="text-2xl font-black">Common Symptoms</h3>
                </div>
                <div className="space-y-3">
                  {data.symptoms.map((s, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                      <span className="text-slate-700 font-bold leading-tight">{s}</span>
                    </div>
                  ))}
                  {data.symptoms.length === 0 && <p className="text-slate-400 italic">No symptoms listed.</p>}
                </div>
              </motion.div>

              {/* Precautions Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flo-card p-8 rounded-[2rem] space-y-6"
              >
                <div className="flex items-center gap-3 text-emerald-600">
                  <ShieldCheck className="w-7 h-7" />
                  <h3 className="text-2xl font-black">Precautions</h3>
                </div>
                <div className="space-y-3">
                  {data.precautions.map((p, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-slate-700 font-bold leading-tight">{p}</span>
                    </div>
                  ))}
                  {data.precautions.length === 0 && <p className="text-slate-400 italic">Standard hygiene precautions apply.</p>}
                </div>
              </motion.div>
            </div>
          </section>

          <footer className="text-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">
              Medical Disclaimer: This information is for educational purposes only. Always consult a physician.
            </p>
          </footer>
        </div>
      )}
    </div>
  )
}

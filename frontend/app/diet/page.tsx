"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Apple, Ban, ClipboardList, Scale, Target, Search, AlertCircle, Loader2 } from "lucide-react"
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

export default function DietPage() {
  const [activeTab, setActiveTab] = useState<"disease" | "personal">("disease")

  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-24 space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-slate-800">Dietary Guide</h1>
        <p className="text-slate-500 font-bold">Actionable nutrition plans based on your health needs.</p>
      </header>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-fit">
        <button
          onClick={() => setActiveTab("disease")}
          className={`flex-1 md:w-40 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeTab === "disease" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Disease-based
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 md:w-40 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeTab === "personal" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Personalized
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "disease" ? (
          <motion.div
            key="disease"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <DiseaseDietSection />
          </motion.div>
        ) : (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <PersonalDietSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DiseaseDietSection() {
  const [disease, setDisease] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MedicalContext | null>(null)
  const [error, setError] = useState("")

  const fetchDiet = async () => {
    if (!disease.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE_URL}/medical/context?disease=${encodeURIComponent(disease)}`)
      if (!res.ok) throw new Error("Failed to fetch medical context")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError("Could not find diet data for this condition.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flo-card p-8 rounded-[2rem] space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Search Disease</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm focus-within:border-pastel-green transition-all">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchDiet()}
                placeholder="e.g. Pneumonia, Eczema..."
                className="w-full outline-none text-slate-700 font-bold"
              />
            </div>
            <button
              onClick={fetchDiet}
              disabled={loading}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Diet"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-500 rounded-xl flex items-center gap-3 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flo-card p-8 rounded-[2rem] bg-emerald-50/30 border-emerald-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <Apple className="w-6 h-6" />
              <h3 className="text-xl font-black">Foods to Eat</h3>
            </div>
            <ul className="space-y-2">
              {data.diet.recommended.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
              {data.diet.recommended.length === 0 && <li className="text-slate-400">No specific recommendations.</li>}
            </ul>
          </div>

          <div className="flo-card p-8 rounded-[2rem] bg-rose-50/30 border-rose-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Ban className="w-6 h-6" />
              <h3 className="text-xl font-black">Foods to Avoid</h3>
            </div>
            <ul className="space-y-2">
              {data.diet.avoid.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  {item}
                </li>
              ))}
              {data.diet.avoid.length === 0 && <li className="text-slate-400">No specific restrictions.</li>}
            </ul>
          </div>

          <div className="md:col-span-2 flo-card p-8 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-3 text-slate-800">
              <ClipboardList className="w-6 h-6" />
              <h3 className="text-xl font-black">Nutrition Strategy</h3>
            </div>
            <p className="text-slate-600 font-bold leading-relaxed whitespace-pre-wrap">
              {data.diet.plan}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function PersonalDietSection() {
  const [weight, setWeight] = useState("")
  const [goal, setGoal] = useState<"cutting" | "bulking" | "maintenance">("maintenance")

  return (
    <div className="flo-card p-8 md:p-10 rounded-[2rem] space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Scale className="w-4 h-4" /> Current Weight (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 75"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xl font-black text-slate-800 outline-none focus:border-pastel-blue transition-all"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-4 h-4" /> Fitness Goal
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["cutting", "maintenance", "bulking"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                  goal === g ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-4">
        <h4 className="text-blue-600 font-black uppercase tracking-widest text-xs">Estimated Daily Intake</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
            <p className="text-[10px] font-black text-slate-400 uppercase">Calories</p>
            <p className="text-2xl font-black text-slate-800">
              {weight ? (goal === "cutting" ? Math.round(Number(weight) * 25) : goal === "bulking" ? Math.round(Number(weight) * 35) : Math.round(Number(weight) * 30)) : "0"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
            <p className="text-[10px] font-black text-slate-400 uppercase">Protein</p>
            <p className="text-2xl font-black text-slate-800">{weight ? Math.round(Number(weight) * 1.8) : "0"}g</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
            <p className="text-[10px] font-black text-slate-400 uppercase">Carbs</p>
            <p className="text-2xl font-black text-slate-800">{weight ? Math.round(Number(weight) * 3) : "0"}g</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
            <p className="text-[10px] font-black text-slate-400 uppercase">Fats</p>
            <p className="text-2xl font-black text-slate-800">{weight ? Math.round(Number(weight) * 0.8) : "0"}g</p>
          </div>
        </div>
      </div>
    </div>
  )
}

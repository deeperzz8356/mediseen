"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Apple, 
  Ban, 
  ClipboardList, 
  Scale, 
  Target, 
  Search, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
  ChevronRight,
  Info
} from "lucide-react"
import { API_BASE_URL } from "../config"
import { auth } from "@/lib/firebase"

interface MealItem {
  meal: string
  items: string[]
  calories: number
}

interface DietPlan {
  calories: number
  macros: {
    protein: number
    carbs: number
    fats: number
  }
  meals: MealItem[]
  avoid: string[]
  recommended: string[]
}

export default function DietPage() {
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate")

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-24 space-y-10">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          Clinical Nutrition Engine
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Disease-Aware Diet</h1>
        <p className="text-slate-500 font-bold text-lg max-w-2xl leading-relaxed">
          Dynamic Medical Nutrition Therapy (MNT) tailored to your condition and biometrics.
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl w-full md:w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex-1 md:w-48 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "generate" ? "bg-white text-slate-900 shadow-md border border-slate-100" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Generate Plan
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 md:w-48 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "history" ? "bg-white text-slate-900 shadow-md border border-slate-100" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Progress & Feedback
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "generate" ? (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SmartDietGenerator />
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ProgressTracker />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SmartDietGenerator() {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<DietPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Profile State
  const [disease, setDisease] = useState("")
  const [weight, setWeight] = useState("70")
  const [height, setHeight] = useState("170")
  const [age, setAge] = useState("25")
  const [gender, setGender] = useState("male")
  const [activity, setActivity] = useState(1.2)
  const [goal, setGoal] = useState("maintenance")
  const [dietType, setDietType] = useState("veg")
  const [budget, setBudget] = useState("medium")

  const generatePlan = async () => {
    if (!disease.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/diet/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: auth?.currentUser?.uid || "anonymous",
          disease,
          weight: Number(weight),
          height: Number(height),
          age: Number(age),
          gender,
          activity_level: activity,
          goal,
          diet_type: dietType,
          budget
        })
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const detail = Array.isArray(data?.detail)
          ? data.detail.map((item: { msg?: string; loc?: Array<string | number> }) => item.msg || JSON.stringify(item)).join("; ")
          : data?.detail || data?.message || `Diet request failed with status ${res.status}`
        throw new Error(detail)
      }

      setPlan(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate diet plan"
      console.error("Diet plan generation failed:", err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = async (item: string) => {
    // Mock swap logic for UI demonstration
    alert(`Swapping ${item} for a similar alternative...`)
  }

  return (
    <div className="space-y-12">
      <div className="flo-card p-8 md:p-12 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/40 space-y-10">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Section 1: Clinical Info */}
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Search className="w-3 h-3" /> Targeted Disease
              </label>
              <input
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                placeholder="e.g. Pneumonia, Diabetes, Psoriasis..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Height (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 font-bold" />
              </div>
            </div>
          </div>

          {/* Section 2: Lifestyle Preferences */}
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dietary Preferences</label>
              <div className="flex gap-4">
                <button onClick={() => setDietType("veg")} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${dietType === "veg" ? "bg-emerald-50 border-emerald-400 text-emerald-600 shadow-lg shadow-emerald-400/10" : "bg-white border-slate-100 text-slate-400"}`}>Veg Only</button>
                <button onClick={() => setDietType("non-veg")} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${dietType === "non-veg" ? "bg-rose-50 border-rose-400 text-rose-600 shadow-lg shadow-rose-400/10" : "bg-white border-slate-100 text-slate-400"}`}>Non-Veg</button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Level</label>
              <div className="flex gap-3">
                {["low", "medium", "high"].map((b) => (
                  <button key={b} onClick={() => setBudget(b)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${budget === b ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"}`}>{b}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={loading || !disease}
          className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><RefreshCcw className="w-6 h-6" /> Create My Plan</>}
        </button>
      </div>

      {plan && (
        <div className="space-y-12 pb-20">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-2 shadow-xl shadow-slate-900/20">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Target</p>
              <p className="text-4xl font-black">{plan.calories} <span className="text-sm font-bold text-slate-500">kcal</span></p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white border border-slate-100 space-y-2 shadow-lg shadow-slate-100">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Protein</p>
              <p className="text-4xl font-black text-slate-800">{plan.macros.protein}g</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white border border-slate-100 space-y-2 shadow-lg shadow-slate-100">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Carbs</p>
              <p className="text-4xl font-black text-slate-800">{plan.macros.carbs}g</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white border border-slate-100 space-y-2 shadow-lg shadow-slate-100">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Fats</p>
              <p className="text-4xl font-black text-slate-800">{plan.macros.fats}g</p>
            </div>
          </div>

          {/* Meals Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Apple className="w-7 h-7 text-emerald-500" /> Daily Meal Schedule
              </h3>
              <button className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:gap-3 transition-all">
                <ShoppingCart className="w-4 h-4" /> Get Grocery List <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plan.meals.map((meal, i) => (
                <motion.div
                  key={meal.meal}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flo-card p-8 rounded-[2.5rem] space-y-6 border border-slate-100 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time: {i === 0 ? "8:00 AM" : i === 1 ? "1:30 PM" : i === 2 ? "5:00 PM" : "8:30 PM"}</span>
                      <h4 className="text-2xl font-black text-slate-800">{meal.meal}</h4>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500">{Math.round(meal.calories)} kcal</div>
                  </div>
                  <div className="space-y-3">
                    {meal.items.map((item) => (
                      <div key={item} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 font-bold text-slate-700">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          {item}
                        </div>
                        <button 
                          onClick={() => handleSwap(item)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <RefreshCcw className="w-3 h-3" /> Swap
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Clinical Guardrails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 rounded-[3rem] bg-emerald-50/30 border border-emerald-100 space-y-6">
              <h4 className="text-xl font-black text-emerald-700 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" /> Clinical Recommendations
              </h4>
              <div className="flex flex-wrap gap-2">
                {plan.recommended.map(r => (
                  <span key={r} className="px-4 py-2 bg-white border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600 shadow-sm">{r}</span>
                ))}
              </div>
            </div>
            <div className="p-10 rounded-[3rem] bg-rose-50/30 border border-rose-100 space-y-6">
              <h4 className="text-xl font-black text-rose-700 flex items-center gap-3">
                <Ban className="w-6 h-6" /> Strictly Avoid
              </h4>
              <div className="flex flex-wrap gap-2">
                {plan.avoid.map(a => (
                  <span key={a} className="px-4 py-2 bg-white border border-rose-100 rounded-xl text-xs font-bold text-rose-600 shadow-sm">{a}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressTracker() {
  const [adherence, setAdherence] = useState(80)
  const [weight, setWeight] = useState("69.5")

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flo-card p-8 rounded-[2.5rem] bg-white border border-slate-100 space-y-6">
          <TrendingUp className="w-10 h-10 text-emerald-500" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Adherence</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">{adherence}%</span>
              <span className="text-xs font-bold text-emerald-500">+5% this week</span>
            </div>
          </div>
        </div>
        <div className="flo-card p-8 rounded-[2.5rem] bg-white border border-slate-100 space-y-6">
          <Scale className="w-10 h-10 text-indigo-500" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Weight</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">{weight} <span className="text-lg">kg</span></span>
              <span className="text-xs font-bold text-indigo-500">-0.5kg change</span>
            </div>
          </div>
        </div>
        <div className="flo-card p-8 rounded-[2.5rem] bg-indigo-600 text-white space-y-6 shadow-xl shadow-indigo-600/20">
          <Info className="w-10 h-10 text-indigo-200" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">AI Status</p>
            <h4 className="text-xl font-black">Plan Re-calibration</h4>
            <p className="text-xs font-medium text-indigo-100/70">Scheduled for Sunday Morning</p>
          </div>
        </div>
      </div>

      <div className="flo-card p-10 rounded-[3rem] bg-white border border-slate-100 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800">Weekly Feedback</h3>
          <p className="text-slate-500 font-bold">Help MediSeen fine-tune your nutrition logic.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700">How would you rate your adherence?</label>
              <input type="range" min="0" max="100" value={adherence} onChange={(e) => setAdherence(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Difficult</span>
                <span>Perfect</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700">Any new symptoms?</label>
              <textarea placeholder="e.g. Bloating, low energy..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-indigo-400 transition-all" rows={4} />
            </div>
          </div>
          
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <RefreshCcw className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-800">Submit for AI Review</h4>
            <p className="text-xs font-bold text-slate-500 max-w-xs leading-relaxed">Our clinical engine will analyze your feedback and adjust your macro targets and food selection for next week.</p>
            <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

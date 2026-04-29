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

  const commonDiseases = [
    "Pneumonia", "Eczema", "Psoriasis", "Melanoma", "Ringworm", "Acne", "Rosacea", "Vitiligo"
  ]

  const fetchDiet = async (diseaseName?: string) => {
    const searchTarget = diseaseName || disease
    if (!searchTarget.trim()) return
    
    if (diseaseName) setDisease(searchTarget)
    
    setLoading(true)
    setError("")
    setData(null)

    try {
      const res = await fetch(`${API_BASE_URL}/medical/context?disease=${encodeURIComponent(searchTarget)}`)
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
              onClick={() => fetchDiet()}
              disabled={loading}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Diet"}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Popular Conditions</p>
          <div className="flex flex-wrap gap-2">
            {commonDiseases.map((d) => (
              <button
                key={d}
                onClick={() => fetchDiet(d)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-xs font-bold text-slate-600 hover:border-pastel-green hover:text-pastel-green transition-all shadow-sm"
              >
                {d}
              </button>
            ))}
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
  const [height, setHeight] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [activity, setActivity] = useState<number>(1.2)
  const [goal, setGoal] = useState<"cutting" | "bulking" | "maintenance">("maintenance")
  const [allergies, setAllergies] = useState<string[]>([])
  const [allergyInput, setAllergyInput] = useState("")

  const activityOptions = [
    { label: "Sedentary", value: 1.2, desc: "Little/no exercise" },
    { label: "Light", value: 1.375, desc: "1-3 days/week" },
    { label: "Moderate", value: 1.55, desc: "3-5 days/week" },
    { label: "Active", value: 1.725, desc: "6-7 days/week" },
  ]

  const calculateResults = () => {
    const w = Number(weight)
    const h = Number(height)
    const a = Number(age)
    if (!w || !h || !a) return null

    // Mifflin-St Jeor Equation
    let bmr = (10 * w) + (6.25 * h) - (5 * a)
    bmr = gender === "male" ? bmr + 5 : bmr - 161

    const tdee = bmr * activity
    
    let targetCalories = tdee
    if (goal === "cutting") targetCalories -= 500
    if (goal === "bulking") targetCalories += 400

    const protein = w * 1.8 // g/kg
    const fats = (targetCalories * 0.25) / 9
    const carbs = (targetCalories - (protein * 4) - (fats * 9)) / 4

    return {
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats)
    }
  }

  const results = calculateResults()

  const addAllergy = () => {
    if (allergyInput && !allergies.includes(allergyInput)) {
      setAllergies([...allergies, allergyInput])
      setAllergyInput("")
    }
  }

  const removeAllergy = (tag: string) => {
    setAllergies(allergies.filter(a => a !== tag))
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flo-card p-8 md:p-10 rounded-[2.5rem] space-y-10 border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gender & Age */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
              <div className="flex p-1 bg-slate-50 rounded-xl">
                <button
                  onClick={() => setGender("male")}
                  className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${gender === "male" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender("female")}
                  className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${gender === "female" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
                >
                  Female
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-lg font-bold outline-none focus:bg-white focus:border-pastel-blue transition-all"
              />
            </div>
          </div>

          {/* Weight & Height */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 75"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-lg font-bold outline-none focus:bg-white focus:border-pastel-blue transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 175"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-lg font-bold outline-none focus:bg-white focus:border-pastel-blue transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-slate-50">
          {/* Activity Level */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Level</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activityOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setActivity(opt.value)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left space-y-1 ${activity === opt.value ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"}`}
                >
                  <p className="text-xs font-black uppercase tracking-tight">{opt.label}</p>
                  <p className={`text-[10px] font-bold ${activity === opt.value ? "text-slate-400" : "text-slate-400"}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Goal & Allergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fitness Goal</label>
              <div className="flex gap-2">
                {(["cutting", "maintenance", "bulking"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${goal === g ? "bg-pastel-pink/10 border-pastel-pink text-pastel-pink" : "bg-white border-slate-100 text-slate-400"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allergies / Restrictions</label>
              <div className="flex gap-2">
                <input
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                  placeholder="e.g. Peanuts, Dairy..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                />
                <button onClick={addAllergy} className="px-4 py-2 bg-slate-100 rounded-xl font-black text-xs uppercase hover:bg-slate-200">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergies.map(a => (
                  <span key={a} className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-500 rounded-lg text-xs font-bold border border-rose-100">
                    {a} <button onClick={() => removeAllergy(a)}><Ban className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 md:p-12 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/30 space-y-10"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-3xl font-black">Your Personalized Plan</h3>
              <p className="text-indigo-200 font-bold">Scientifically calculated daily targets.</p>
            </div>
            <Target className="w-12 h-12 text-pastel-pink opacity-50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-2">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Daily Calories</p>
              <p className="text-4xl font-black">{results.calories} <span className="text-sm text-indigo-300">kcal</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-2">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Protein</p>
              <p className="text-4xl font-black">{results.protein} <span className="text-sm text-indigo-300">g</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-2">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Carbohydrates</p>
              <p className="text-4xl font-black">{results.carbs} <span className="text-sm text-indigo-300">g</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-2">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Fats</p>
              <p className="text-4xl font-black">{results.fats} <span className="text-sm text-indigo-300">g</span></p>
            </div>
          </div>

          {allergies.length > 0 && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
              <p className="text-sm font-bold text-rose-200">
                Warning: Your plan excludes {allergies.join(", ")}. Ensure you find safe high-protein alternatives for these restrictions.
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-pastel-green/20 flex items-center justify-center text-pastel-green">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-xs text-white/60 font-medium max-w-xs">
                This plan uses the <b>Mifflin-St Jeor</b> clinical formula with a 1.8g/kg protein ratio.
              </p>
            </div>
            <button className="w-full md:w-auto px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
              Download Full PDF
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

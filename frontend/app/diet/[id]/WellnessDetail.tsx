"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Salad, Moon, Droplets, Sun, Activity, Shield, Smile, BrainCircuit,
  ArrowLeft, UploadCloud, Stethoscope
} from "lucide-react"

const dietRecommendations: Record<string, string[]> = {
  pneumonia: [
    "High-protein foods such as eggs, fish, beans, and lean meats to support tissue repair.",
    "Vitamin-rich fruits and vegetables like citrus fruits, berries, spinach, and broccoli.",
    "Adequate hydration including water, soups, and herbal teas.",
    "Foods rich in zinc and vitamin C that support immune function.",
    "Warm liquids that may help soothe the respiratory tract."
  ],
  eczema: [
    "Anti-inflammatory foods such as leafy greens, berries, and fatty fish (omega-3).",
    "Whole grains and legumes.",
    "Foods rich in vitamin E and antioxidants.",
    "Identify and avoid possible food triggers such as dairy, nuts, or gluten if recommended by a healthcare professional."
  ],
  psoriasis: [
    "Anti-inflammatory Mediterranean-style diet including fish, nuts, olive oil, and vegetables.",
    "Limit processed foods, excessive sugar, and alcohol.",
    "Maintain healthy body weight to reduce inflammation."
  ],
  melanoma: [
    "Antioxidant-rich fruits and vegetables.",
    "Foods containing vitamin A, C, E, and selenium.",
    "Balanced diet supporting immune health during treatment."
  ],
  ringworm: [
    "Maintain balanced nutrition supporting immune response.",
    "Reduce excessive refined sugar which may promote fungal growth.",
    "Include probiotic foods like yogurt or fermented foods."
  ],
  warts: [
    "Foods supporting immunity such as garlic, citrus fruits, yogurt, and leafy greens."
  ],
  "molluscum-contagiosum": [
    "Balanced diet with immune-supportive nutrients.",
    "Maintain hydration and nutrient diversity."
  ],
  acne: [
    "Emphasize whole foods, vegetables, fruits, healthy fats, and hydration.",
    "Reduce excessive processed foods and high-glycemic foods when appropriate."
  ],
  rosacea: [
    "Emphasize whole foods, vegetables, fruits, healthy fats, and hydration.",
    "Limit highly spicy foods or hot beverages that may trigger flushing.",
    "Reduce excessive processed foods when appropriate."
  ],
  vitiligo: [
    "Emphasize whole foods, vegetables, fruits, healthy fats, and hydration.",
    "Incorporate antioxidant-rich foods to protect skin cells."
  ],
  impetigo: [
    "Emphasize whole foods, vegetables, fruits, healthy fats, and hydration.",
    "Include immune-boosting foods like citrus and zinc-rich seeds."
  ],
  "contact-dermatitis": [
    "Emphasize whole foods, vegetables, fruits, healthy fats, and hydration.",
    "Avoid known dietary triggers if linked to skin reactions."
  ]
}

const lifestyleGuidance = [
  {
    title: "Sleep", icon: <Moon className="w-5 h-5" />,
    tips: [ "Maintain 7–9 hours of quality sleep per night for immune function and skin repair." ]
  },
  {
    title: "Hydration", icon: <Droplets className="w-5 h-5" />,
    tips: [ "Drink adequate water daily to maintain skin and systemic health." ]
  },
  {
    title: "Bathing and Skin Care", icon: <Droplets className="w-5 h-5" />,
    tips: [
      "Use lukewarm water rather than hot showers.",
      "Use gentle fragrance-free cleansers.",
      "Moisturize skin regularly after bathing."
    ]
  },
  {
    title: "Oral Hygiene", icon: <Smile className="w-5 h-5" />,
    tips: [ "Brush teeth twice daily and maintain oral health to prevent systemic inflammation." ]
  },
  {
    title: "Exercise", icon: <Activity className="w-5 h-5" />,
    tips: [ "Moderate physical activity such as walking, yoga, or cycling supports immunity." ]
  },
  {
    title: "Sun Protection", icon: <Sun className="w-5 h-5" />,
    tips: [ "Use sunscreen and protective clothing to reduce skin damage and melanoma risk." ]
  },
  {
    title: "Stress Management", icon: <BrainCircuit className="w-5 h-5" />,
    tips: [ "Meditation, breathing exercises, and relaxation help reduce inflammatory responses." ]
  },
  {
    title: "Hygiene Practices", icon: <Shield className="w-5 h-5" />,
    tips: [
      "Avoid sharing towels when dealing with contagious infections.",
      "Maintain clean bedding and clothing."
    ]
  }
];

interface DietPlan {
  recommended: string[];
  limit: string[];
  hydration: string;
  goals: string;
  mealPlan: { meal: string; idea: string; }[];
}

interface WellnessCondition {
  name: string
  icon: ReactNode
  color: string
}

function InputLabel({ txt }: { txt: string }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-widest text-black/60 mb-2">{txt}</label>
  )
}

const InputStyle = "w-full px-4 py-3 bg-white border border-black/10 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-pastel-violet/50 shadow-inner block"

function CheckboxLabel({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
        checked ? "bg-black border-black text-white" : "bg-white border-black/20 group-hover:border-black/40"
      }`}>
        {checked && <Shield className="w-3 h-3" />}
      </div>
      <span className="text-sm font-bold text-black">{label}</span>
    </label>
  )
}

export default function WellnessDetail({ condition, id }: { condition: WellnessCondition, id: string }) {
  const diets = dietRecommendations[id] || dietRecommendations.acne

  const [formData, setFormData] = useState({
    age: "", gender: "", height: "", weight: "",
    duration: "", severity: "",
    activity: "", occupation: "", sleep: "",
    preference: "", foodAllergies: "", intolerances: "",
    diabetes: false, highBP: false, thyroid: false, heartDisease: false,
    cancer: false, stroke: false, kidney: false, liver: false,
    latestPrescription: "", currentMeds: "",
    allergies: "", smokingAlcohol: "", stressLevel: "", hydrationHabits: ""
  })

  const [generating, setGenerating] = useState(false)
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)

  const handleGenerateDiet = (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setTimeout(() => {
      setDietPlan({
        recommended: ["Wild-caught salmon", "Spinach and kale", "Avocado", "Berries and citrus", "Walnuts"],
        limit: ["Processed sugars", "Refined carbohydrates", "Fried foods", "Excessive dairy"],
        hydration: "Aim for 2.5 - 3 liters of water daily. Green tea recommended.",
        goals: "Maintain a caloric deficit while prioritizing anti-inflammatory micronutrients.",
        mealPlan: [
          { meal: "Breakfast", idea: "Oatmeal with berries, chia seeds, and green tea." },
          { meal: "Lunch", idea: "Mixed greens salad with grilled chicken/tofu, olive oil, and avocado." },
          { meal: "Dinner", idea: "Baked salmon/tempeh, roasted sweet potato, and steamed broccoli." },
          { meal: "Snacks", idea: "Handful of almonds or sliced cucumber with hummus." }
        ]
      })
      setGenerating(false)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-12 md:space-y-16 pb-32 pt-12">
      <header className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/diet" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex-1 h-px bg-black/5 hidden md:block"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-black/20 hidden md:block">Reference: {id.replace("-", " ")}</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
           <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2rem] flex items-center justify-center shadow-2xl flex-shrink-0 ${condition.color} border-4 border-white`}>
             <div className="scale-[2] md:scale-[2.5]">{condition.icon}</div>
           </div>
           <div className="space-y-3">
             <h1 className="text-4xl md:text-7xl font-black text-black tracking-tight uppercase leading-none">
               {condition.name}
             </h1>
             <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <span className="px-4 py-1.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest">Clinical Protocol</span>
               <span className="px-4 py-1.5 rounded-full bg-white border border-black/10 text-black/60 text-[10px] font-black uppercase tracking-widest">Wellness Profile</span>
             </div>
           </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-white to-slate-50 rounded-[2rem] p-8 md:p-10 border border-black/5 shadow-xl">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-pastel-green/20 flex items-center justify-center text-pastel-green">
              <Salad className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">Diet Recommendations</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">General nutrition advice</p>
            </div>
         </div>
         <ul className="space-y-4">
            {diets.map((rec, i) => (
              <li key={i} className="flex items-start gap-4">
                 <span className="w-2 h-2 rounded bg-pastel-green mt-2 flex-shrink-0" />
                 <span className="text-black font-bold text-base leading-relaxed">{rec}</span>
              </li>
            ))}
         </ul>
      </section>

      <section className="bg-gradient-to-br from-white to-slate-50 rounded-[2rem] p-8 md:p-10 border border-black/5 shadow-xl">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-pastel-blue/20 flex items-center justify-center text-pastel-blue">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">Lifestyle Guidance</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Healthy Practices</p>
            </div>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {lifestyleGuidance.map((guide, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-black/5 shadow-sm space-y-3">
                 <div className="flex items-center gap-3 text-pastel-blue">
                   {guide.icon}
                   <h3 className="font-black text-xs uppercase tracking-widest text-black">{guide.title}</h3>
                 </div>
                 <ul className="space-y-2">
                   {guide.tips.map((tip, j) => (
                     <li key={j} className="text-black font-semibold text-sm leading-snug opacity-80">
                       • {tip}
                     </li>
                   ))}
                 </ul>
              </div>
            ))}
         </div>
      </section>

      <section className="bg-gradient-to-br from-white to-slate-50 rounded-[2rem] p-8 md:p-10 border border-black/5 shadow-xl">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-pastel-violet/20 flex items-center justify-center text-pastel-violet">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">Generate Personalized Diet Plan</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">AI Powered Tailored Nutrition</p>
            </div>
         </div>

         <form onSubmit={handleGenerateDiet} className="space-y-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pastel-violet border-b border-black/5 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><InputLabel txt="Age"/><input required type="number" className={InputStyle} value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} /></div>
                <div>
                  <InputLabel txt="Gender"/>
                  <select required className={InputStyle} value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div><InputLabel txt="Height (cm)"/><input required type="number" className={InputStyle} value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} /></div>
                <div><InputLabel txt="Weight (kg)"/><input required type="number" className={InputStyle} value={formData.weight} onChange={e=>setFormData({...formData, weight: e.target.value})} /></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pastel-violet border-b border-black/5 pb-2">Health Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <InputLabel txt="Selected Disease/Condition"/>
                  <input readOnly value={condition.name} className={`${InputStyle} bg-slate-100 text-black/50 cursor-not-allowed`} />
                </div>
                <div><InputLabel txt="Condition Duration"/><input placeholder="e.g. 2 months" required className={InputStyle} value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} /></div>
                <div>
                  <InputLabel txt="Symptom Severity"/>
                  <select required className={InputStyle} value={formData.severity} onChange={e=>setFormData({...formData, severity: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pastel-violet border-b border-black/5 pb-2">Lifestyle Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <InputLabel txt="Activity Level"/>
                  <select required className={InputStyle} value={formData.activity} onChange={e=>setFormData({...formData, activity: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div><InputLabel txt="Occupation/Job Type"/><input placeholder="e.g. Desk job" required className={InputStyle} value={formData.occupation} onChange={e=>setFormData({...formData, occupation: e.target.value})} /></div>
                <div><InputLabel txt="Sleep Schedule"/><input placeholder="e.g. 6 hours at night" required className={InputStyle} value={formData.sleep} onChange={e=>setFormData({...formData, sleep: e.target.value})} /></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pastel-violet border-b border-black/5 pb-2">Dietary Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <InputLabel txt="Dietary Preference"/>
                  <select required className={InputStyle} value={formData.preference} onChange={e=>setFormData({...formData, preference: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
                <div><InputLabel txt="Food Allergies"/><input placeholder="e.g. Peanuts" className={InputStyle} value={formData.foodAllergies} onChange={e=>setFormData({...formData, foodAllergies: e.target.value})} /></div>
                <div><InputLabel txt="Food Intolerances"/><input placeholder="e.g. Lactose" className={InputStyle} value={formData.intolerances} onChange={e=>setFormData({...formData, intolerances: e.target.value})} /></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pastel-violet border-b border-black/5 pb-2">Medical Information</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Existing Conditions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <CheckboxLabel label="Diabetes" checked={formData.diabetes} onChange={c => setFormData({...formData, diabetes: c})} />
                 <CheckboxLabel label="High Blood Pressure" checked={formData.highBP} onChange={c => setFormData({...formData, highBP: c})} />
                 <CheckboxLabel label="Thyroid Disorders" checked={formData.thyroid} onChange={c => setFormData({...formData, thyroid: c})} />
                 <CheckboxLabel label="Heart Disease" checked={formData.heartDisease} onChange={c => setFormData({...formData, heartDisease: c})} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-black/60 pt-4">Previous Major Illnesses</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <CheckboxLabel label="Cancer" checked={formData.cancer} onChange={c => setFormData({...formData, cancer: c})} />
                 <CheckboxLabel label="Stroke" checked={formData.stroke} onChange={c => setFormData({...formData, stroke: c})} />
                 <CheckboxLabel label="Kidney Disease" checked={formData.kidney} onChange={c => setFormData({...formData, kidney: c})} />
                 <CheckboxLabel label="Liver Disease" checked={formData.liver} onChange={c => setFormData({...formData, liver: c})} />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pastel-violet border-b border-black/5 pb-2">Medications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><InputLabel txt="Latest Doctor Prescription"/><textarea rows={3} className={InputStyle} value={formData.latestPrescription} onChange={e=>setFormData({...formData, latestPrescription: e.target.value})} /></div>
                <div><InputLabel txt="Current Medications"/><textarea rows={3} className={InputStyle} value={formData.currentMeds} onChange={e=>setFormData({...formData, currentMeds: e.target.value})} /></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pastel-violet border-b border-black/5 pb-2">Medical Reports</h3>
              <div className="p-8 border-2 border-dashed border-black/10 rounded-2xl bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors group">
                 <UploadCloud className="w-10 h-10 text-black/20 group-hover:text-pastel-violet transition-colors" />
                 <p className="text-xs font-black text-black uppercase tracking-widest text-center leading-relaxed">Click to upload Blood, Lab, or Diagnostic reports</p>
                 <input type="file" multiple className="hidden" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pastel-violet border-b border-black/5 pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><InputLabel txt="Known Allergies (Medications/Environmental)"/><input className={InputStyle} value={formData.allergies} onChange={e=>setFormData({...formData, allergies: e.target.value})} /></div>
                <div><InputLabel txt="Smoking or Alcohol Habits"/><input className={InputStyle} value={formData.smokingAlcohol} onChange={e=>setFormData({...formData, smokingAlcohol: e.target.value})} /></div>
                <div><InputLabel txt="Stress Level"/><input placeholder="e.g. High, Moderate, Low" className={InputStyle} value={formData.stressLevel} onChange={e=>setFormData({...formData, stressLevel: e.target.value})} /></div>
                <div><InputLabel txt="Hydration Habits"/><input placeholder="e.g. 1L per day" className={InputStyle} value={formData.hydrationHabits} onChange={e=>setFormData({...formData, hydrationHabits: e.target.value})} /></div>
              </div>
            </div>

            <button type="submit" disabled={generating} className="w-full py-8 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3">
               {generating ? "Analyzing Medical Data..." : "Generate Personalized Diet Plan"}
            </button>
         </form>

         <AnimatePresence>
            {dietPlan && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-16 border-t-4 border-black/5 pt-16 space-y-8"
              >
                <div className="flex items-center gap-4 border-b-2 border-black pb-8 text-center md:text-left flex-col md:flex-row">
                  <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white">
                    <Stethoscope />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-black italic">MediSeen Diet Report</h3>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-black/40">Customized Nutrition & Hydration</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-pastel-green">Recommended Foods</h4>
                     <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                       {dietPlan.recommended.map((f, i) => (
                         <span key={i} className="px-4 py-2 bg-slate-100 border border-black/5 text-black font-bold text-xs rounded-lg">{f}</span>
                       ))}
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-pastel-pink">Foods to Avoid</h4>
                     <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                       {dietPlan.limit.map((f, i) => (
                         <span key={i} className="px-4 py-2 bg-slate-100 border border-black/5 text-black font-bold text-xs rounded-lg">{f}</span>
                       ))}
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-8 bg-pastel-blue/10 rounded-2xl border border-pastel-blue/20">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-pastel-blue mb-2">Hydration Guidance</h4>
                     <p className="text-black font-black text-xl">{dietPlan.hydration}</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-2xl border border-black/5">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Daily Nutrition Goals</h4>
                     <p className="text-black font-bold text-lg">{dietPlan.goals}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-black/5">
                   <h4 className="text-sm font-black uppercase tracking-tight text-black flex items-center gap-2 justify-center md:justify-start"><Salad className="w-4 h-4"/> Sample Meal Plan</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {dietPlan.mealPlan.map((m, i) => (
                       <div key={i} className="p-6 bg-white border border-black/10 rounded-xl shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-pastel-violet block mb-2">{m.meal}</span>
                          <span className="text-black font-bold text-sm leading-snug">{m.idea}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </section>
    </div>
  )
}

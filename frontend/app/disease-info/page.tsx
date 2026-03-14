"use client"

import { useState, useEffect } from "react"
import { motion as fm, AnimatePresence } from "framer-motion"
import {
  Wind,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
  Stethoscope,
  Microscope,
  ArrowRight,
  ChevronDown,
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const skinConditions = [
  {
    id: "eczema",
    name: "Eczema (Atopic Dermatitis)",
    color: "bg-pastel-violet",
    textColor: "text-black",
    image: "/images/skin-conditions/eczema.png",
    description: "Eczema is a chronic inflammatory skin condition that causes dry, itchy, and irritated skin.",
    symptoms: ["Red or brownish patches", "Severe itching", "Dry, scaly skin", "Cracked or thickened skin", "Sometimes oozing or crusting"],
    causes: ["Genetic predisposition", "Allergies or asthma", "Irritants (soap, detergents, fabrics)", "Stress or weather changes"],
    treatment: ["Moisturizers and emollients", "Corticosteroid creams", "Antihistamines", "Avoiding triggers"]
  },
  {
    id: "psoriasis",
    name: "Psoriasis",
    color: "bg-pastel-blue",
    textColor: "text-black",
    image: "/images/skin-conditions/psoriasis.png",
    description: "Psoriasis is an autoimmune disease where skin cells grow too quickly, causing thick patches.",
    symptoms: ["Thick red patches", "Silvery-white scales", "Dry cracked skin", "Itching or burning", "Nail changes"],
    types: ["Plaque psoriasis", "Guttate psoriasis", "Inverse psoriasis", "Pustular psoriasis"],
    treatment: ["Topical creams", "Phototherapy", "Immunosuppressant medicines"]
  },
  {
    id: "melanoma",
    name: "Melanoma",
    color: "bg-pastel-pink",
    textColor: "text-black",
    image: "/images/skin-conditions/melanoma.png",
    description: "Melanoma is the most dangerous type of skin cancer. Early detection is key.",
    warningSigns: ["A – Asymmetry", "B – Border irregularity", "C – Color variation", "D – Diameter larger than 6 mm", "E – Evolving mole"],
    riskFactors: ["Excess UV exposure", "Fair skin", "Family history", "Many moles"],
    treatment: ["Surgical removal", "Immunotherapy", "Targeted therapy", "Radiation in advanced cases"]
  },
  {
    id: "ringworm",
    name: "Ringworm",
    color: "bg-pastel-peach",
    textColor: "text-black",
    image: "/images/skin-conditions/ringworm.png",
    description: "A fungal infection, not a worm.",
    symptoms: ["Circular red rash", "Raised edges", "Clear center", "Itching and scaling"],
    treatment: ["Antifungal creams", "Oral antifungal medication"]
  },
  {
    id: "warts",
    name: "Warts",
    color: "bg-pastel-green",
    textColor: "text-black",
    image: "/images/skin-conditions/warts.png",
    description: "Warts are small, rough growths caused by HPV infection.",
    treatment: ["Salicylic acid", "Cryotherapy", "Laser treatment", "Surgical removal"]
  },
  {
    id: "molluscum",
    name: "Molluscum Contagiosum",
    color: "bg-pastel-yellow",
    textColor: "text-black",
    image: "/images/skin-conditions/molluscum contagiosum.png",
    description: "A viral infection causing small raised bumps.",
    treatment: ["Often resolves on its own", "Cryotherapy", "Curettage", "Topical medicines"]
  }
]

const otherConditions = [
  { name: "Acne", desc: "Caused by clogged pores and bacteria." },
  { name: "Rosacea", desc: "Chronic redness and visible blood vessels." },
  { name: "Vitiligo", desc: "Loss of pigment leading to white skin patches." },
  { name: "Impetigo", desc: "Bacterial infection causing honey-colored crusts." },
  { name: "Contact Dermatitis", desc: "Allergic reaction from chemicals or plants." }
]

export default function EducationPage() {
  const [selectedCondition, setSelectedCondition] = useState<typeof skinConditions[0] | null>(null)

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-24 pb-40">

      {/* 1. Page Header */}
      <section className="text-center space-y-6 pt-10">
        <fm.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black text-black tracking-tight"
        >
          Clinical <span className="text-pastel-violet underline decoration-black/10">Education</span>
        </fm.h1>
        <p className="text-xl text-black font-bold max-w-2xl mx-auto leading-relaxed">
          MediSeen's curated clinical guides for respiratory and dermatological conditions.
        </p>
      </section>

      {/* 2. Respiratory Section (Pneumonia) */}
      <section id="pneumonia" className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-12 md:p-20 shadow-xl shadow-black/[0.05] border border-black/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pastel-blue/10 rounded-full -mr-40 -mt-40"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-pastel-blue/10 text-pastel-blue text-xs font-black uppercase tracking-widest border border-pastel-blue/20">
              <Wind className="w-4 h-4" />
              Respiratory Disease Guide
            </div>

            <div className="space-y-6">
              <h2 className="text-5xl font-black text-black leading-tight">Understanding <br /> Pneumonia</h2>
              <p className="text-lg text-black font-bold leading-relaxed">
                Pneumonia is an infection that inflathes the air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm or pus, fever, chills, and difficulty breathing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-3">
                <Thermometer className="w-6 h-6 text-pastel-pink" />
                <h4 className="font-black text-black">Key Symptoms</h4>
                <ul className="text-sm text-black font-bold space-y-1.5">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> High Fever</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Chest Pain</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Short Breath</li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-3">
                <Stethoscope className="w-6 h-6 text-pastel-green" />
                <h4 className="font-black text-black">AI Logic</h4>
                <p className="text-xs text-black font-bold leading-relaxed">
                  Detection based on opacities, consolidation patterns, and pleural effusion marking.
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-pastel-blue/20 rounded-2xl group-hover:scale-105 transition-transform duration-700"></div>
            <div className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800"
                alt="Pneumonia Visualization"
                width={800} height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Skin Problems Interactive Section */}
      <section id="skin-problems" className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-black">Skin Problems</h2>
            <p className="text-xl text-black font-bold">Comprehensive guide to common dermatological conditions</p>
          </div>
          <div className="bg-white px-8 py-4 rounded-xl shadow-sm border border-black/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pastel-pink/20 flex items-center justify-center text-pastel-pink">
              <Microscope className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-black uppercase tracking-widest">Clinical Visuals</span>
          </div>
        </div>

        {/* Category Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skinConditions.map((condition) => (
            <fm.button
              key={condition.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCondition(condition)}
              className={`p-10 rounded-2xl ${condition.color} ${condition.textColor} shadow-lg shadow-black/[0.08] transition-all text-left relative overflow-hidden group min-h-[220px] flex flex-col justify-between border border-white/20`}
            >
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full group-hover:scale-110 transition-transform"></div>
              <h3 className="text-3xl font-black leading-tight relative z-10">{condition.name}</h3>
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-80 relative z-10 bg-white/30 w-fit px-6 py-3 rounded-lg backdrop-blur-sm mt-4 border border-white/20 shadow-sm">
                View Details <ArrowRight className="w-4 h-4" />
              </div>
            </fm.button>
          ))}
        </div>

        {/* Other Similar Skin Conditions quick grid */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-12 md:p-16 space-y-10 border border-black/5 shadow-sm">
          <h3 className="text-3xl font-black text-black font-black uppercase tracking-tight">Other Clinical Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherConditions.map((item) => (
              <div key={item.name} className="bg-white p-8 rounded-xl border border-black/5 shadow-sm space-y-2 hover:shadow-md transition-all">
                <h4 className="text-xl font-black text-black">{item.name}</h4>
                <p className="text-sm text-black font-bold leading-relaxed opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Overlay Detail Section */}
      <AnimatePresence>
        {selectedCondition && (
          <fm.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <fm.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col border border-black/10"
            >
              {/* Header Close */}
              <button
                onClick={() => setSelectedCondition(null)}
                className="absolute right-8 top-8 z-10 w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left: Image & Title */}
                  <div className={`p-12 md:p-20 ${selectedCondition.color} ${selectedCondition.textColor} flex flex-col justify-center gap-8 bg-gradient-to-br from-current to-white/20`}>
                    <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl bg-white/20 p-4 border-2 border-white/30">
                      {selectedCondition.image ? (
                        <Image src={selectedCondition.image} alt={selectedCondition.name} width={600} height={600} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Microscope className="w-24 h-24 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-5xl font-black tracking-tight">{selectedCondition.name}</h2>
                      <p className="text-lg font-bold opacity-90 leading-relaxed">{selectedCondition.description}</p>
                    </div>
                  </div>

                  {/* Right: Detailed Tabs */}
                  <div className="p-12 md:p-20 space-y-12 bg-white text-black">
                    {selectedCondition.symptoms && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black">Primary Symptoms</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedCondition.symptoms.map(s => (
                            <span key={s} className="px-5 py-2 rounded-lg bg-white border border-black/5 shadow-sm text-sm font-bold text-black flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-pastel-pink" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCondition.causes && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black">Causes / Triggers</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {selectedCondition.causes.map(c => (
                            <div key={c} className="flex items-start gap-4 p-5 rounded-xl bg-pastel-yellow/5 border border-pastel-yellow/20 shadow-sm">
                              <Info className="w-5 h-5 text-pastel-yellow mt-0.5 flex-shrink-0" />
                              <span className="text-sm font-bold text-black leading-relaxed">{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCondition.types && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black">Condition Types</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedCondition.types.map(t => (
                            <span key={t} className="px-5 py-2 rounded-lg bg-pastel-blue/20 text-black text-xs font-black border border-pastel-blue/30 shadow-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black">Treatment Plan</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedCondition.treatment.map(t => (
                          <div key={t} className="flex items-center gap-4 p-5 rounded-xl bg-pastel-green/5 border border-pastel-green/20 shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-pastel-green" />
                            <span className="text-sm font-bold text-black">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-8 border-t border-black/5 flex items-center justify-between bg-slate-50/30">
                <p className="text-xs text-black/60 font-black max-w-sm uppercase tracking-wider">Clinical Awareness Guide • Consult specialists for diagnosis.</p>
                <Link href="/diagnose" className="flex items-center gap-3 px-10 py-4 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                  Start Diagnosis <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </fm.div>
          </fm.div>
        )}
      </AnimatePresence>

    </div>
  )
}

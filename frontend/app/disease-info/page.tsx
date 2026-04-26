"use client"

import { useState } from "react"
import { motion as fm, AnimatePresence } from "framer-motion"
import {
  Wind,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  Info,
  Stethoscope,
  Microscope,
  ArrowRight,
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLocale } from "../i18n/LocaleContext"

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
  const { t } = useLocale()

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12 md:space-y-24 pb-40">

      {/* 1. Page Header */}
      <section className="text-center space-y-4 md:space-y-6 pt-10 px-4">
        <fm.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-8xl font-black text-slate-800 tracking-tight text-balance leading-tight"
        >
          {t.diseaseInfo.title} <span className="text-pastel-violet underline decoration-pastel-violet/10">{t.diseaseInfo.titleHighlight}</span>
        </fm.h1>
        <p className="text-base md:text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
          {t.diseaseInfo.subtitle}
        </p>
      </section>

      {/* 2. Respiratory Section (Pneumonia) */}
      <section id="pneumonia" className="bg-gradient-to-br from-white to-slate-50 rounded-[2rem] p-8 md:p-20 shadow-xl shadow-black/[0.05] border border-black/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pastel-blue/10 rounded-full -mr-40 -mt-40 hidden md:block"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-8 md:space-y-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-pastel-blue/10 text-pastel-blue text-[10px] md:text-xs font-black uppercase tracking-widest border border-pastel-blue/20 w-fit">
              <Wind className="w-4 h-4" />
              {t.diseaseInfo.pneumonia.badge}
            </div>

            <div className="space-y-4 md:space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black leading-tight text-balance">{t.diseaseInfo.pneumonia.title}</h2>
              <p className="text-base md:text-lg text-black font-bold leading-relaxed opacity-80">
                {t.diseaseInfo.pneumonia.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="p-6 md:p-8 rounded-2xl bg-white border border-black/5 shadow-sm space-y-3">
                <Thermometer className="w-6 h-6 text-pastel-pink" />
                <h4 className="font-black text-black uppercase tracking-tight">{t.diseaseInfo.pneumonia.symptoms.title}</h4>
                <ul className="text-sm text-black font-bold space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-pastel-green shrink-0 mt-0.5" /> {t.diseaseInfo.pneumonia.symptoms.highFever}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-pastel-green shrink-0 mt-0.5" /> {t.diseaseInfo.pneumonia.symptoms.chestPain}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-pastel-green shrink-0 mt-0.5" /> {t.diseaseInfo.pneumonia.symptoms.shortBreath}</li>
                </ul>
              </div>
              <div className="p-6 md:p-8 rounded-2xl bg-white border border-black/5 shadow-sm space-y-3">
                <Stethoscope className="w-6 h-6 text-pastel-green" />
                <h4 className="font-black text-black uppercase tracking-tight">{t.diseaseInfo.pneumonia.howWeCheck.title}</h4>
                <p className="text-xs text-black font-bold leading-relaxed opacity-70">
                  {t.diseaseInfo.pneumonia.howWeCheck.desc}
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-pastel-blue/20 rounded-2xl group-hover:scale-105 transition-transform duration-700 hidden md:block"></div>
            <div className="relative rounded-[2rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl aspect-[4/3] sm:aspect-video lg:aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800"
                alt="Pneumonia Visualization"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Skin Problems Interactive Section */}
      <section id="skin-problems" className="space-y-10 md:space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 md:px-4">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight">{t.diseaseInfo.skinHealth.title}</h2>
            <p className="text-lg md:text-xl text-slate-500 font-bold">{t.diseaseInfo.skinHealth.subtitle}</p>
          </div>
          <div className="bg-white px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-sm border border-black/5 flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-lg bg-pastel-pink/20 flex items-center justify-center text-pastel-pink">
              <Microscope className="w-5 h-5" />
            </div>
            <span className="text-[10px] md:text-sm font-black text-black uppercase tracking-widest">{t.diseaseInfo.skinHealth.clinicalVisuals}</span>
          </div>
        </div>

        {/* Category Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {skinConditions.map((condition) => (
            <fm.button
              key={condition.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCondition(condition)}
              className={`p-8 md:p-10 rounded-[2rem] ${condition.color} ${condition.textColor} shadow-lg shadow-black/[0.08] transition-all text-left relative overflow-hidden group min-h-[200px] md:min-h-[220px] flex flex-col justify-between border border-white/20`}
            >
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full group-hover:scale-110 transition-transform"></div>
              <h3 className="text-2xl md:text-3xl font-black leading-tight relative z-10 text-balance">{condition.name}</h3>
              <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest opacity-80 relative z-10 bg-white/30 w-fit px-5 py-3 rounded-xl backdrop-blur-sm mt-6 border border-white/20 shadow-sm">
                {t.diseaseInfo.skinHealth.viewDetails} <ArrowRight className="w-4 h-4" />
              </div>
            </fm.button>
          ))}
        </div>

        {/* Other Similar Skin Conditions quick grid */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-[2rem] p-8 md:p-16 space-y-10 border border-black/5 shadow-sm">
          <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">{t.diseaseInfo.skinHealth.otherConditions}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {otherConditions.map((item) => (
              <div key={item.name} className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-sm space-y-2 hover:shadow-md transition-all">
                <h4 className="text-lg md:text-xl font-black text-black">{item.name}</h4>
                <p className="text-xs md:text-sm text-black font-bold leading-relaxed opacity-60">{item.desc}</p>
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
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <fm.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-[2rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col border border-black/10"
            >
              {/* Header Close */}
              <button
                onClick={() => setSelectedCondition(null)}
                className="absolute right-4 top-4 md:right-8 md:top-8 z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left: Image & Title */}
                  <div className={`p-8 md:p-20 ${selectedCondition.color} ${selectedCondition.textColor} flex flex-col justify-center gap-6 md:gap-8 bg-gradient-to-br from-current to-white/20`}>
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white/20 p-3 md:p-4 border-2 border-white/30 max-w-[300px] mx-auto md:max-w-none w-full">
                      {selectedCondition.image ? (
                        <Image src={selectedCondition.image} alt={selectedCondition.name} fill className="object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Microscope className="w-16 md:w-24 h-16 md:h-24 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4 text-center md:text-left">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{selectedCondition.name}</h2>
                      <p className="text-base md:text-lg font-bold opacity-90 leading-relaxed">{selectedCondition.description}</p>
                    </div>
                  </div>

                  {/* Right: Detailed Tabs */}
                  <div className="p-8 md:p-20 space-y-10 md:space-y-12 bg-white text-black">
                    {selectedCondition.symptoms && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.diseaseInfo.overlay.whatItFeels}</h4>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {selectedCondition.symptoms.map(s => (
                            <span key={s} className="px-4 py-2 rounded-lg bg-white border border-black/5 shadow-sm text-xs md:text-sm font-bold text-black flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-pastel-pink" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCondition.causes && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.diseaseInfo.overlay.whyItHappens}</h4>
                        <div className="grid grid-cols-1 gap-2 md:gap-3">
                          {selectedCondition.causes.map(c => (
                            <div key={c} className="flex items-start gap-4 p-4 md:p-5 rounded-xl bg-pastel-yellow/5 border border-pastel-yellow/20 shadow-sm">
                              <Info className="w-5 h-5 text-pastel-yellow mt-0.5 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-bold text-black leading-relaxed">{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.diseaseInfo.overlay.howToBetter}</h4>
                      <div className="grid grid-cols-1 gap-2 md:gap-3">
                        {selectedCondition.treatment.map(t => (
                          <div key={t} className="flex items-center gap-4 p-4 md:p-5 rounded-xl bg-pastel-green/5 border border-pastel-green/20 shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-pastel-green shrink-0" />
                            <span className="text-xs md:text-sm font-bold text-black">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-6 md:p-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between bg-slate-50/30 gap-4">
                <p className="text-[9px] md:text-xs text-black/60 font-black max-w-sm uppercase tracking-wider text-center md:text-left">{t.diseaseInfo.overlay.disclaimer}</p>
                <Link href="/diagnose" className="flex items-center gap-3 px-8 md:px-10 py-4 bg-black text-white rounded-xl font-black text-xs md:text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl w-full md:w-auto justify-center">
                  {t.diseaseInfo.overlay.startDiagnosis} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </fm.div>
          </fm.div>
        )}
      </AnimatePresence>

    </div>
  )
}

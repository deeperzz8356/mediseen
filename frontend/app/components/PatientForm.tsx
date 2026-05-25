"use client"

import { useEffect, useState } from "react"
import { User, Calendar, Fingerprint, Activity, ClipboardList } from "lucide-react"

import { useLocale } from "../i18n/LocaleContext"

const PATIENT_FORM_STORAGE_KEY = "mediseen_patient_form_draft"

export default function PatientForm() {
  const { t } = useLocale()
  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("")
  const [caseId, setCaseId] = useState("")
  const [studyType, setStudyType] = useState(t.patientForm.studyTypes.chestXrayPaView)
  const [symptoms, setSymptoms] = useState("")

  useEffect(() => {
    try {
      const storedDraft = localStorage.getItem(PATIENT_FORM_STORAGE_KEY)
      if (!storedDraft) return

      const parsed = JSON.parse(storedDraft) as {
        fullName?: string
        age?: string
        caseId?: string
        studyType?: string
        symptoms?: string
      }

      setFullName(parsed.fullName ?? "")
      setAge(parsed.age ?? "")
      setCaseId(parsed.caseId ?? "")
      setStudyType(parsed.studyType ?? t.patientForm.studyTypes.chestXrayPaView)
      setSymptoms(parsed.symptoms ?? "")
    } catch {
      // Ignore draft recovery failures and keep the form usable.
    }
  }, [t.patientForm.studyTypes.chestXrayPaView])

  useEffect(() => {
    try {
      localStorage.setItem(
        PATIENT_FORM_STORAGE_KEY,
        JSON.stringify({ fullName, age, caseId, studyType, symptoms }),
      )
    } catch {
      // Ignore storage failures in constrained WebViews.
    }
  }, [age, caseId, fullName, studyType, symptoms])

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-10 shadow-xl shadow-black/[0.05] border border-black/5 h-full">
      <div className="flex items-center gap-3 border-b border-black/5 pb-6 mb-10">
        <div className="w-12 h-12 rounded-xl bg-pastel-blue/10 flex items-center justify-center text-pastel-blue shadow-sm">
            <ClipboardList className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-3xl font-black text-black">{t.patientForm.title}</h2>
            <p className="text-black font-bold opacity-80">{t.patientForm.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-pastel-pink" />
            {t.patientForm.fullName}
          </label>
          <input 
            type="text" 
            placeholder={t.patientForm.placeholders.fullName}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-pink/10 focus:border-pastel-pink transition-all shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-pastel-blue" />
            {t.patientForm.age}
          </label>
          <input 
            type="number" 
            placeholder={t.patientForm.placeholders.age}
            value={age}
            onChange={(event) => setAge(event.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-blue/10 focus:border-pastel-blue transition-all shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2 flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5 text-pastel-violet" />
            {t.patientForm.caseId}
          </label>
          <input 
            type="text" 
            placeholder={t.patientForm.placeholders.caseId}
            value={caseId}
            onChange={(event) => setCaseId(event.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-violet/10 focus:border-pastel-violet transition-all shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-pastel-green" />
            {t.patientForm.studyType}
          </label>
          <select 
            value={studyType}
            onChange={(event) => setStudyType(event.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-green/10 focus:border-pastel-green transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option>{t.patientForm.studyTypes.chestXrayPaView}</option>
            <option>{t.patientForm.studyTypes.dermatoscopicScan}</option>
            <option>{t.patientForm.studyTypes.mriHeadScan}</option>
            <option>{t.patientForm.studyTypes.ctThorax}</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2">{t.patientForm.symptoms}</label>
          <textarea 
            rows={4}
            placeholder={t.patientForm.placeholders.symptoms}
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            className="w-full px-6 py-5 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-pink/10 focus:border-pastel-pink transition-all resize-none shadow-sm"
          ></textarea>
        </div>
      </div>
    </div>
  )
}

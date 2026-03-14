"use client"

import { motion } from "framer-motion"
import { User, Calendar, Fingerprint, Activity, ClipboardList } from "lucide-react"

export default function PatientForm() {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-10 shadow-xl shadow-black/[0.05] border border-black/5 h-full">
      <div className="flex items-center gap-3 border-b border-black/5 pb-6 mb-10">
        <div className="w-12 h-12 rounded-xl bg-pastel-blue/10 flex items-center justify-center text-pastel-blue shadow-sm">
            <ClipboardList className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-3xl font-black text-black">Patient Profile</h2>
            <p className="text-black font-bold opacity-80">Capture clinical records for AI analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-pastel-pink" />
            Full Name
          </label>
          <input 
            type="text" 
            placeholder="e.g. John Doe"
            className="w-full px-6 py-4 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-pink/10 focus:border-pastel-pink transition-all shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-pastel-blue" />
            Age
          </label>
          <input 
            type="number" 
            placeholder="e.g. 45"
            className="w-full px-6 py-4 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-blue/10 focus:border-pastel-blue transition-all shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2 flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5 text-pastel-violet" />
            Case ID
          </label>
          <input 
            type="text" 
            placeholder="e.g. #MS-2026-001"
            className="w-full px-6 py-4 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-violet/10 focus:border-pastel-violet transition-all shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-pastel-green" />
            Study Type
          </label>
          <select 
            className="w-full px-6 py-4 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-green/10 focus:border-pastel-green transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option>Chest X-Ray (PA View)</option>
            <option>Dermatoscopic Scan</option>
            <option>MRI Head Scan</option>
            <option>CT Thorax</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black px-2">Clinical Symptoms & Notes</label>
          <textarea 
            rows={4}
            placeholder="Describe symptoms, duration, and patient history..."
            className="w-full px-6 py-5 rounded-xl bg-white border border-black/10 text-black font-bold focus:outline-none focus:ring-4 focus:ring-pastel-pink/10 focus:border-pastel-pink transition-all resize-none shadow-sm"
          ></textarea>
        </div>
      </div>
    </div>
  )
}

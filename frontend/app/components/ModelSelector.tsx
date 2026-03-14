"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Cpu, Zap, Target, BarChart3, BrainCircuit, ShieldCheck } from "lucide-react"

const models = [
  { id: "densenet", name: "Highest Accuracy", tag: "DenseNet121", icon: <Target className="w-5 h-5" />, color: "text-pastel-pink", border: "border-pastel-pink", bg: "bg-pastel-pink/5" },
  { id: "resnet", name: "Best Recall", tag: "ResNet50", icon: <BarChart3 className="w-5 h-5" />, color: "text-pastel-blue", border: "border-pastel-blue", bg: "bg-pastel-blue/5" },
  { id: "efficientnet", name: "Fast Inference", tag: "EfficientNet", icon: <Zap className="w-5 h-5" />, color: "text-pastel-green", border: "border-pastel-green", bg: "bg-pastel-green/5" },
]

export default function ModelSelector() {
  const [selected, setSelected] = useState("densenet")
  const [isOpen, setIsOpen] = useState(false)

  const selectedModel = models.find(m => m.id === selected)

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-10 shadow-xl shadow-black/[0.05] border border-black/5 h-full flex flex-col space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pastel-violet/10 flex items-center justify-center text-pastel-violet shadow-sm">
                <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-black">Diagnostic Engine</h2>
                <p className="text-black font-bold opacity-80">Select the clinical intelligence core.</p>
            </div>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-6 rounded-xl border transition-all duration-300 flex items-center justify-between text-left shadow-sm hover:shadow-md ${
            selectedModel ? `${selectedModel.border} ${selectedModel.bg} bg-white` : "border-slate-50 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center ${selectedModel?.color}`}>
              {selectedModel?.icon}
            </div>
            <div>
              <p className="text-lg font-black text-black">{selectedModel?.name}</p>
              <p className="text-xs font-black text-black uppercase tracking-widest opacity-60">{selectedModel?.tag}</p>
            </div>
          </div>
          <ChevronDown className={`w-6 h-6 text-black transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 top-full left-0 right-0 mt-3 p-3 bg-white rounded-xl border border-black/10 shadow-2xl overflow-hidden"
            >
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelected(model.id)
                    setIsOpen(false)
                  }}
                  className={`w-full p-5 rounded-lg transition-all flex items-center gap-5 hover:bg-slate-50 text-left ${
                    selected === model.id ? "bg-slate-50 border-pastel-violet/20" : ""
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center ${model.color}`}>
                    {model.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-black text-sm">{model.name}</p>
                    <p className="text-[10px] font-bold text-black uppercase tracking-widest opacity-40">{model.tag}</p>
                  </div>
                  {selected === model.id && (
                     <div className={`w-3 h-3 rounded-md ${model.color.replace('text', 'bg')} shadow-sm`} />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-auto p-6 bg-white rounded-xl border border-black/5 flex items-start gap-4 shadow-sm">
        <ShieldCheck className="w-6 h-6 text-emerald-500 mt-1 flex-shrink-0" />
        <p className="text-black font-bold text-xs leading-relaxed">
          Proprietary <span className="text-pastel-blue font-black underline decoration-black/10">MediSeen</span> clinical engines are optimized for high-resolution imagery and HIPAA-compliant data routing.
        </p>
      </div>
    </div>
  )
}

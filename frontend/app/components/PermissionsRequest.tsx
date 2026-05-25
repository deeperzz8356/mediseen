"use client"

import { motion } from "framer-motion"
import { Camera, Image as ImageIcon, ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface Props {
  onComplete: () => void
}

export default function PermissionsRequest({ onComplete }: Props) {
  const [granted, setGranted] = useState<{ camera?: boolean, storage?: boolean }>({})

  const requestPermission = (type: 'camera' | 'storage') => {
    // Mocking the native permission request overlay
    setGranted(prev => ({ ...prev, [type]: true }))
  }

  const allGranted = granted.camera && granted.storage

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-slate-50">
      
      <div className="max-w-md w-full space-y-10 text-center">
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-3xl bg-pastel-blue/20 flex items-center justify-center mx-auto shadow-sm"
        >
          <ShieldCheck className="w-12 h-12 text-pastel-blue" />
        </motion.div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-800">Permission Required</h2>
          <p className="text-slate-500 font-medium">To provide accurate diagnostics, MediSeen needs access to your device sensors.</p>
        </div>

        <div className="space-y-4">
          {/* CAMERA PERMISSION */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => requestPermission('camera')}
            className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300
            ${granted.camera 
              ? "bg-pastel-green/10 border-pastel-green shadow-lg shadow-pastel-green/5" 
              : "bg-white border-slate-100 shadow-sm hover:border-pastel-blue hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                ${granted.camera ? "bg-pastel-green/20 text-pastel-green" : "bg-slate-50 text-slate-400"}
              `}>
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-slate-800">Camera Access</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Necessary for scanning</p>
              </div>
            </div>
            {granted.camera ? <CheckCircle2 className="w-6 h-6 text-pastel-green" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
          </motion.button>

          {/* STORAGE PERMISSION */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => requestPermission('storage')}
            className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300
            ${granted.storage 
              ? "bg-pastel-blue/10 border-pastel-blue shadow-lg shadow-pastel-blue/5" 
              : "bg-white border-slate-100 shadow-sm hover:border-pastel-blue hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                ${granted.storage ? "bg-pastel-blue/20 text-pastel-blue" : "bg-slate-50 text-slate-400"}
              `}>
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-black text-slate-800">Media & Files</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">necessary for uploads</p>
              </div>
            </div>
            {granted.storage ? <CheckCircle2 className="w-6 h-6 text-pastel-blue" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
          </motion.button>
        </div>

        <div className="pt-6">
          <motion.button
            disabled={!allGranted}
            onClick={onComplete}
            whileHover={allGranted ? { scale: 1.05 } : {}}
            whileTap={allGranted ? { scale: 0.98 } : {}}
            className={`w-full py-5 rounded-[2rem] font-black text-xl transition-all duration-500 shadow-xl
              ${allGranted 
                ? "bg-gradient-to-r from-pastel-pink to-pastel-violet text-white shadow-pastel-violet/30" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              }
            `}
          >
            Continue to App
          </motion.button>
          {!allGranted && (
            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Please grant all permissions to proceed</p>
          )}
        </div>
      </div>
    </div>
  )
}

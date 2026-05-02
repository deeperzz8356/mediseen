"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.05, 1],
          opacity: 1 
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-56 h-28 rounded-[2rem] bg-white flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-50/50 overflow-hidden p-6">
          <Image 
            src="/logo2.png" 
            alt="MediSeen Logo" 
            width={180} 
            height={60} 
            className="object-contain"
            priority
          />
        </div>
        
        {/* Subtle Glow */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-[2.5rem] bg-pastel-violet blur-2xl -z-10"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10 text-center space-y-2"
      >
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
          Medi<span className="text-pastel-pink">Seen</span>
        </h1>
        <div className="flex items-center justify-center gap-2">
           <div className="h-[1px] w-4 bg-slate-200" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
             Vision Intelligence
           </p>
           <div className="h-[1px] w-4 bg-slate-200" />
        </div>
      </motion.div>
    </motion.div>
  )
}


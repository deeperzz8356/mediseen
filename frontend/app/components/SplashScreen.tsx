"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useLocale } from "../i18n/LocaleContext"

export default function SplashScreen() {
  const { t } = useLocale()

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <Image src="/logo2.png" alt="MediSeen Logo" width={156} height={156} className="rounded-3xl shadow-2xl" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">MediSeen</h1>
          <p className="text-slate-400 font-bold mt-2 tracking-widest uppercase text-xs">{t.splash.tagline}</p>
        </motion.div>
      </motion.div>

      <motion.div 
        className="absolute bottom-12 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="w-48 h-1 rounded-full bg-slate-100 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-pastel-violet"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.2, ease: "linear" }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

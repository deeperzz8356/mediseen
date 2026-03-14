"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Brain, UploadCloud, Activity, Sparkles, ShieldCheck, ChevronRight } from "lucide-react"

export default function LandingPage() {
return ( <div className="w-full max-w-[1400px] mx-auto px-6 pt-12 pb-24 space-y-28">

  {/* NAVBAR */}
  <nav className="w-full flex items-center justify-between px-8 py-5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm">

    {/* LOGO */}
    <Link href="/" className="flex items-center gap-3 text-xl font-black text-slate-800">
      <Brain className="w-6 h-6 text-pastel-violet" />
      MediSeen
    </Link>

    {/* CENTER LINKS */}
    <div className="hidden md:flex items-center gap-10 font-semibold text-slate-600">
      <Link href="/" className="hover:text-slate-900 transition">
        Home
      </Link>

      <Link href="#features" className="hover:text-slate-900 transition">
        Features
      </Link>

      <Link href="#workflow" className="hover:text-slate-900 transition">
        Workflow
      </Link>
    </div>

    {/* AUTH BUTTONS */}
    <div className="flex items-center gap-4">
      <Link href="/login">
        <button className="px-6 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition">
          Login
        </button>
      </Link>

      <Link href="/register">
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pastel-pink to-pastel-violet text-white font-semibold shadow">
          Register
        </button>
      </Link>
    </div>

  </nav>


  {/* HERO */}
  <section className="relative overflow-hidden rounded-[2.5rem] p-16 bg-gradient-to-br from-pastel-pink via-white to-pastel-violet min-h-[520px] flex flex-col justify-center">

    <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -mr-24 -mt-24"></div>
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/20 rounded-full blur-3xl -ml-24 -mb-24"></div>

    <div className="relative z-10 max-w-2xl space-y-8">

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white font-bold text-sm">
        <Brain className="w-4 h-4" />
        Explainable Medical AI
      </div>

      <h1 className="text-5xl md:text-6xl font-black text-slate-800 leading-tight">
        Faster Diagnosis
        <br />
        with Explainable AI
      </h1>

      <p className="text-lg text-slate-500 max-w-xl">
        Analyze medical scans using AI and understand exactly why the
        model made its prediction through interpretable heatmaps.
      </p>

      {/* BADGES */}
      <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
        <span className="px-4 py-2 rounded-full bg-white border border-slate-200">
          ResNet50 Model
        </span>

        <span className="px-4 py-2 rounded-full bg-white border border-slate-200">
          Grad-CAM Explainability
        </span>

        <span className="px-4 py-2 rounded-full bg-white border border-slate-200">
          Medical Imaging AI
        </span>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 pt-4">

        <Link href="/login">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-pastel-pink to-pastel-violet text-white font-bold flex items-center gap-2 shadow-lg"
          >
            Start Diagnosis
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </Link>

        <Link href="/register">
          <button className="px-8 py-4 rounded-full bg-white border border-slate-200 font-bold text-slate-700">
            Create Account
          </button>
        </Link>

      </div>

    </div>

  </section>


  {/* FEATURES */}
  <section id="features" className="space-y-12">

    <div className="text-center space-y-4">
      <h2 className="text-3xl font-black text-slate-800">
        AI Tools for Clinical Decision Making
      </h2>

      <p className="text-slate-400 max-w-xl mx-auto">
        Mediseen combines deep learning and explainable AI to assist doctors
        in analyzing medical images faster and more accurately.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">

      {[
        {
          title: "Upload Medical Images",
          desc: "Upload X-rays or dermatology scans for instant AI analysis.",
          icon: <UploadCloud />,
          color: "bg-pastel-pink"
        },
        {
          title: "Multi-Model Diagnosis",
          desc: "Multiple neural networks analyze scans for higher accuracy.",
          icon: <Activity />,
          color: "bg-pastel-blue"
        },
        {
          title: "Explainable AI Heatmaps",
          desc: "Visualize exactly which regions influenced AI predictions.",
          icon: <Sparkles />,
          color: "bg-pastel-violet"
        }
      ].map((item) => (
        <div
          key={item.title}
          className="p-10 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-6"
        >

          <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center text-white`}>
            {item.icon}
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-800">
              {item.title}
            </h3>

            <p className="text-slate-400 font-medium mt-2">
              {item.desc}
            </p>
          </div>

        </div>
      ))}

    </div>

  </section>


  {/* WORKFLOW */}
  <section id="workflow" className="space-y-12">

    <div className="text-center">
      <h2 className="text-3xl font-black text-slate-800">
        How Mediseen Works
      </h2>
    </div>

    <div className="grid md:grid-cols-4 gap-6">

      {[
        { step: "Upload Scan", icon: <UploadCloud /> },
        { step: "AI Analysis", icon: <Brain /> },
        { step: "Heatmap Explanation", icon: <Sparkles /> },
        { step: "Clinical Insight", icon: <ShieldCheck /> }
      ].map((item) => (
        <div
          key={item.step}
          className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center gap-4"
        >

          <div className="w-12 h-12 rounded-xl bg-pastel-blue/20 flex items-center justify-center">
            {item.icon}
          </div>

          <p className="font-semibold text-slate-700">
            {item.step}
          </p>

        </div>
      ))}

    </div>

  </section>

</div>


)
}

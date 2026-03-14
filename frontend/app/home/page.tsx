"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

import {
  Plus,
  Search,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Heart,
  Calendar,
  ShieldCheck
} from "lucide-react"

import {
  LungsIllustration,
  SkinRashArmIllustration,
  MedicalAssistanceIllustration
} from "../components/Illustrations"

export default function Home() {

  const [username, setUsername] = useState("Doctor")

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {

      if (user) {

        const name =
          user.displayName ||
          user.email?.split("@")[0] ||
          "Doctor"

        setUsername(name)

      }

    })

    return () => unsubscribe()

  }, [])

  const quickActions = [
    {
      title: "New Diagnosis",
      desc: "Upload an X-ray or skin scan for AI analysis",
      icon: <Plus />,
      color: "bg-pastel-pink",
      link: "/diagnose"
    },
    {
      title: "Education",
      desc: "Explore medical guides and disease knowledge",
      icon: <MessageCircle />,
      color: "bg-pastel-violet",
      link: "/disease-info"
    },
  ]

  return (

    <div className="max-w-6xl mx-auto px-6 pt-28 space-y-24 pb-32">

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[3rem] p-12 md:p-20 bg-gradient-to-br from-pastel-pink to-pastel-violet min-h-[450px] flex flex-col justify-center">

        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16"></div>

        <div className="relative z-10 max-w-2xl space-y-6">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/30 border border-white/40 text-sm font-bold text-white"
          >
            <Sparkles className="w-4 h-4" />
            Empowering Your Clinical Decisions
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white leading-[1.1]"
          >
            Hello,<br />Dr. {username}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-white/90 font-medium"
          >
            The HackMatrix AI assistant is ready to help you analyze
            medical imagery and manage patient cases with ease.
          </motion.p>

        </div>

        <div className="absolute right-12 bottom-12 hidden md:block opacity-80 rotate-6">
          <MedicalAssistanceIllustration className="w-64 h-64" bgColor="#FFFFFF" />
        </div>

      </section>


      {/* QUICK ACTIONS */}

      <section className="space-y-10">

        <div className="flex items-end justify-between px-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800">Quick Actions</h2>
            <p className="text-slate-400 font-medium">
              Tools to streamline your daily workflow
            </p>
          </div>

          <Link
            href="/diagnose"
            className="text-pastel-violet font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all tools
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {quickActions.map((item, i) => (

            <Link key={item.title} href={item.link}>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flo-card p-10 h-full flex flex-col justify-between cursor-pointer"
              >

                <div className={`w-16 h-16 rounded-[1.5rem] ${item.color} flex items-center justify-center text-white shadow-inner mb-8`}>
                  <div className="scale-125">{item.icon}</div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-800">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

              </motion.div>

            </Link>

          ))}

        </div>

      </section>


      {/* STATS */}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {[
          { icon: <Heart className="text-pastel-pink" />, label: "Clinician Pulse", value: "Normal", bg: "bg-pastel-pink/5" },
          { icon: <Calendar className="text-pastel-blue" />, label: "Case Load", value: "+12 Today", bg: "bg-pastel-blue/5" },
          { icon: <ShieldCheck className="text-pastel-green" />, label: "AI Safety", value: "Verified", bg: "bg-pastel-green/5" },
          { icon: <Sparkles className="text-pastel-violet" />, label: "AI Accuracy", value: "98.4%", bg: "bg-pastel-violet/5" },
        ].map((item, i) => (

          <motion.div
            key={item.label}
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-[2rem] border border-slate-50 flex items-center gap-4 ${item.bg}`}
          >

            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              {item.icon}
            </div>

            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">
                {item.label}
              </p>
              <p className="text-slate-800 text-xl font-black">
                {item.value}
              </p>
            </div>

          </motion.div>

        ))}

      </section>

    </div>

  )

}
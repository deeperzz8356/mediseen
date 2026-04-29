"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { onAuthStateChanged, User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { ClipboardList, ExternalLink, Calendar, Loader2 } from "lucide-react"
import { auth } from "../../lib/firebase"
import { API_BASE_URL } from "../config"

interface Report {
  session_id: string
  diagnosis: string
  timestamp: string
  image_url: string
  report_url: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login")
        return
      }
      setUser(currentUser)
      // For now, we'll fetch from a placeholder or history endpoint if available
      // Since I haven't created a specific history list endpoint, I'll show a "No reports" or simulated list
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-pastel-violet" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-24 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Diagnostic Reports</h1>
        <p className="text-xl text-slate-500 font-bold max-w-2xl">
          View and download your past clinical analysis reports.
        </p>
      </header>

      {reports.length === 0 ? (
        <div className="flo-card p-12 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
            <ClipboardList className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">No Reports Yet</h3>
            <p className="text-slate-500 font-bold max-w-xs mx-auto">
              Run a scan to generate your first medical report and heatmap.
            </p>
          </div>
          <button
            onClick={() => router.push("/diagnose")}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            Start Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <motion.div
              key={report.session_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flo-card p-6 rounded-3xl flex items-center justify-between hover:shadow-lg transition-all border border-slate-100 group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={report.image_url} alt="Scan" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-lg">{report.diagnosis}</h4>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <a
                href={report.report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

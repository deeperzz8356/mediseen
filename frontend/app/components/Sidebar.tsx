"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  FlaskConical, 
  BookHeart, 
  FileText 
} from "lucide-react"

const menuItems = [
  { name: "Overview", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: "Diagnostics", path: "/diagnostics", icon: <Activity className="w-5 h-5" /> },
  { name: "Patients", path: "/patients", icon: <Users className="w-5 h-5" /> },
  { name: "Research", path: "/research", icon: <FlaskConical className="w-5 h-5" /> },
  { name: "Disease Knowledge", path: "/disease-info", icon: <BookHeart className="w-5 h-5" /> },
  { name: "Reports", path: "/reports", icon: <FileText className="w-5 h-5" /> },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen bg-[#1E293B] border-r border-slate-800 flex flex-col justify-between py-8 px-4 sticky top-0 hidden md:flex">
      <div>
        <div className="mb-10 px-4">
          <Link href="/home" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-20 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-1">
              <Image src="/logo2.png" alt="logo" width={64} height={24} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter text-white leading-none">
                Medi<span className="text-pastel-pink">Seen</span>
              </span>
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Vision Intelligence</span>
            </div>
          </Link>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            // Determine active state, considering exact match for root `/` and partial for others
            const isActive = item.path === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.path)
            
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                  isActive 
                    ? "text-[#6EE7B7] bg-[#6EE7B7]/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 rounded-2xl border border-[#6EE7B7]/20 bg-[#6EE7B7]/5"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10">{item.icon}</div>
                <span className="relative z-10">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="px-4">
        <div className="bg-gradient-to-r from-[#7DD3FC]/10 to-[#6EE7B7]/10 border border-[#6EE7B7]/20 rounded-2xl p-4">
          <p className="text-xs text-slate-300 mb-2">MediSeen AI System</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse"></div>
            <span className="text-xs font-semibold text-[#6EE7B7]">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}

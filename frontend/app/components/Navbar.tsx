"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, Heart, BookOpen, LineChart } from "lucide-react"

export default function Navbar() {

  const pathname = usePathname()

  const navItems = [
    { name: "HOME", href: "/home", icon: <Home className="w-4 h-4" /> },
    { name: "DIAGNOSIS", href: "/diagnose", icon: <Activity className="w-4 h-4" /> },
    { name: "WELLNESS", href: "/wellness", icon: <Heart className="w-4 h-4" /> },
    { name: "EDUCATION", href: "/disease-info", icon: <BookOpen className="w-4 h-4" /> },
  ]

  return (
    <div className="sticky top-6 z-50 flex justify-center">

      <div className="w-[92%] max-w-6xl h-[72px] flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5">

        {/* LOGO */}
        <Link href="/home" className="flex items-center gap-3 font-black text-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pastel-pink to-pastel-violet flex items-center justify-center text-white">
            ◉
          </div>
          MediSeen
        </Link>

        {/* NAVIGATION */}
        <div className="flex items-center gap-8">

          {navItems.map((item) => {

            const active = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-bold tracking-wide transition-all
                ${
                  active
                    ? "text-black bg-pastel-violet/10 px-4 py-2 rounded-xl shadow-sm"
                    : "text-black/50 hover:text-black"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}

        </div>

        {/* PROFILE */}
        <div className="w-10 h-10 rounded-xl bg-blue-200 flex items-center justify-center font-bold text-sm">
          SP
        </div>

      </div>

    </div>
  )
}

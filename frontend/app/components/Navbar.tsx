"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, Heart, BookOpen, Menu, X, Languages } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "../../lib/firebase"
import { useLocale } from "../i18n/LocaleContext"
import { LOCALES, Locale } from "../i18n"

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const { t, locale, setLocale } = useLocale()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsubscribe()
  }, [])

  const getInitials = (u: User) => {
    if (u.displayName) {
      return u.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }
    return u.email ? u.email[0].toUpperCase() : "?"
  }

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Guest"

  const navItems = [
    { name: t.navbar.home, href: "/home", icon: <Home className="w-4 h-4" /> },
    { name: t.navbar.checkup, href: "/diagnose", icon: <Activity className="w-4 h-4" /> },
    { name: t.navbar.health, href: "/wellness", icon: <Heart className="w-4 h-4" /> },
    { name: t.navbar.library, href: "/disease-info", icon: <BookOpen className="w-4 h-4" /> },
  ]

  return (
    <div className="sticky top-4 md:top-6 z-50 flex justify-center px-4">
      <div className="w-full max-w-6xl py-3 md:h-[72px] flex items-center justify-between px-6 md:px-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5">
        
        {/* LOGO */}
        <Link href="/home" className="flex items-center gap-3 font-black text-lg">
          <Image src="/logo2.png" alt="MediSeen Logo" width={60} height={60} className="rounded-xl" />
          <span>MediSeen</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
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

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 transition text-xs font-black uppercase tracking-widest"
            >
              <Languages className="w-3.5 h-3.5" />
              {LOCALES.find(l => l.code === locale)?.flag}
            </button>
            <AnimatePresence>
              {langOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80]"
                    onClick={() => setLangOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[90] min-w-[160px]"
                  >
                    {LOCALES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLocale(lang.code as Locale); setLangOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                          ${locale === lang.code ? 'bg-pastel-violet/10 text-pastel-violet' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="w-10 h-10 rounded-xl bg-blue-200 flex items-center justify-center font-bold text-sm" title={displayName}>
            {user ? getInitials(user) : "?"}
          </div>
          
          <button 
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white/90 backdrop-blur-2xl shadow-2xl z-[70] md:hidden flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-10">
                <Link href="/home" className="flex items-center gap-3 font-black text-lg" onClick={() => setIsOpen(false)}>
                  <Image src="/logo2.png" alt="MediSeen Logo" width={40} height={40} className="rounded-xl" />
                  <span>MediSeen</span>
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {navItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-2xl text-base font-bold transition-all
                      ${
                        active
                          ? "bg-pastel-violet text-white shadow-lg shadow-pastel-violet/20"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`${active ? "text-white" : "text-pastel-violet"}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-200 flex items-center justify-center font-bold text-sm">
                    {user ? getInitials(user) : "?"}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{displayName}</p>
                    <p className="text-xs text-slate-500">{user?.email || t.navbar.notSignedIn}</p>
                  </div>
                </div>
                <a
                  href="https://sites.google.com/view/sapappsolutionmediseenpolicy/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-[11px] text-slate-300 hover:text-slate-400 transition-colors mt-3"
                >
                  Privacy Policy
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, BookOpen, Heart, Home, Settings, Menu, X } from "lucide-react"

import { auth } from "../../lib/firebase"
import { useLocale } from "../i18n/LocaleContext"

type NavItem = {
	name: string
	shortName: string
	href: string
	icon: typeof Home
}

export default function Navbar() {
	const pathname = usePathname()
	const [user, setUser] = useState<User | null>(null)
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const { t } = useLocale()

	useEffect(() => {
		if (!auth) return

		const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser))
		return () => unsubscribe()
	}, [])

	const navItems: NavItem[] = [
		{ name: t.navbar.home, shortName: "Home", href: "/home", icon: Home },
		{ name: t.navbar.checkup, shortName: "Scan", href: "/diagnose", icon: Activity },
		{ name: t.navbar.health, shortName: "Health", href: "/wellness", icon: Heart },
		{ name: t.navbar.library, shortName: "Library", href: "/disease-info", icon: BookOpen },
		{ name: "Profile", shortName: "Profile", href: "/profile", icon: Settings },
	]

	const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
	const currentUserName = user?.displayName || user?.email?.split("@")[0] || "Guest"

	const getInitials = (currentUser: User) => {
		if (currentUser.displayName) {
			return currentUser.displayName
				.split(" ")
				.map((name) => name[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		}

		return currentUser.email ? currentUser.email[0].toUpperCase() : "?"
	}

	return (
		<>
			{/* Mobile Menu Button - Top Left */}
			<button
				onClick={() => setIsMenuOpen(true)}
				className="fixed top-4 left-4 z-[80] md:hidden w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 active:scale-95"
				aria-label="Open menu"
			>
				<Menu className="w-5 h-5" />
			</button>

			<Link
				href="/profile"
				className="fixed top-4 right-4 md:top-6 md:right-6 z-[70] w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-lg shadow-slate-900/10 flex items-center justify-center overflow-hidden"
				aria-label="Open profile"
				title={currentUserName}
			>
				{user ? (
					<div className="w-full h-full bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700 flex items-center justify-center font-black text-sm">
						{getInitials(user)}
					</div>
				) : (
					<Image src="/logo2.png" alt="MediSeen account" width={44} height={44} className="rounded-2xl" />
				)}
			</Link>

			{/* Left Side Drawer - Mobile Only */}
			<AnimatePresence>
				{isMenuOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsMenuOpen(false)}
							className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm md:hidden"
						/>
						<motion.aside
							initial={{ x: "-100%" }}
							animate={{ x: 0 }}
							exit={{ x: "-100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed top-0 left-0 bottom-0 z-[110] w-[280px] bg-white shadow-2xl border-r border-slate-100 md:hidden flex flex-col"
						>
							<div className="p-6 border-b border-slate-50 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
										<Image src="/logo2.png" alt="MediSeen" width={24} height={24} />
									</div>
									<span className="font-black text-lg tracking-tighter uppercase italic text-black">MediSeen</span>
								</div>
								<button 
									onClick={() => setIsMenuOpen(false)}
									className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
								>
									<X className="w-5 h-5 text-slate-400" />
								</button>
							</div>

							<nav className="flex-1 p-4 space-y-2">
								{navItems.map((item) => {
									const active = isActiveRoute(item.href)
									const Icon = item.icon

									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={() => setIsMenuOpen(false)}
											className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
												active 
													? "bg-slate-900 text-white shadow-lg" 
													: "text-slate-500 hover:bg-slate-50"
											}`}
										>
											<Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
											<span className="font-bold text-sm tracking-tight">{item.name}</span>
										</Link>
									)
								})}
							</nav>

							<div className="p-6 border-t border-slate-50 bg-slate-50/50">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700 flex items-center justify-center font-black text-xs">
										{user ? getInitials(user) : "G"}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-black text-slate-800 truncate">{currentUserName}</p>
										<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user ? "Active Professional" : "Guest Mode"}</p>
									</div>
								</div>
							</div>
						</motion.aside>
					</>
				)}
			</AnimatePresence>

			{/* Desktop Sidebar */}
			<nav className="fixed hidden md:flex left-3 bottom-3 top-3 w-20 z-[70] app-glass rounded-3xl shadow-2xl shadow-slate-900/20 py-8 border border-white/70 flex-col items-center justify-between">
				<div className="flex flex-col gap-6">
					<div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4">
						<Image src="/logo2.png" alt="MediSeen" width={32} height={32} />
					</div>
					{navItems.map((item) => {
						const active = isActiveRoute(item.href)
						const Icon = item.icon

						return (
							<Link
								key={item.href}
								href={item.href}
								title={item.name}
								className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
									active ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-white"
								}`}
							>
								<Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
							</Link>
						)
					})}
				</div>
				<Link href="/profile" className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
					<Settings className="w-5 h-5" />
				</Link>
			</nav>

			{/* Mobile Bottom Bar (Fallback/Alternative) */}
			<nav className="fixed md:hidden left-3 right-3 bottom-3 z-[70] app-glass rounded-2xl shadow-2xl shadow-slate-900/20 px-2 py-2 border border-white/70">
				<div className="grid grid-cols-5 gap-1">
					{navItems.map((item) => {
						const active = isActiveRoute(item.href)
						const Icon = item.icon

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all ${
									active ? "bg-gradient-to-r from-pastel-pink to-pastel-violet text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
								}`}
							>
								<Icon className={`w-4 h-4 ${active ? "scale-110" : ""}`} />
								<span className="text-[10px] font-bold leading-none tracking-tight">{item.shortName}</span>
							</Link>
						)
					})}
				</div>
			</nav>
		</>
	)
}

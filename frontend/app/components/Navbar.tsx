"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, BookOpen, Heart, Home, Settings, Languages } from "lucide-react"

import { auth } from "../../lib/firebase"
import { useLocale } from "../i18n/LocaleContext"
import { LOCALES } from "../i18n"
import { useAppStore } from "../store/useAppStore"

type NavItem = {
	label: string
	path: string
	icon: typeof Home
}

export default function Navbar() {
	const pathname = usePathname()
	const router = useRouter()
	const [user, setUser] = useState<User | null>(null)
	const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
	const { t, locale, setLocale } = useLocale()
	const { authStatus, setLanguage, profile } = useAppStore()

	useEffect(() => {
		if (!auth) return

		const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser))
		return () => unsubscribe()
	}, [])

	const navItems: NavItem[] = [
		{ path: "/home", label: t.navbar.home, icon: Home },
		{ path: "/diet", label: t.navbar.diet, icon: Heart },
		{ path: "/diagnose", label: t.navbar.checkup, icon: Activity },
		{ path: "/library", label: t.navbar.library, icon: BookOpen },
	]

	const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
	const isProfileActive = isActiveRoute("/profile")

	const getInitials = (currentUser: User) => {
		// Prefer the profile name set via the form; then Firebase displayName.
		const nameSource = profile?.name || currentUser.displayName || null
		if (nameSource) {
			return nameSource
				.split(" ")
				.map((name) => name[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		}

		// Do not derive name from email; show placeholder
		return "?"
	}

	return (
		<>
			{/* Top Bar - Branding and Actions */}
			<div 
				className="fixed top-0 left-0 right-0 z-[80] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 md:px-8 flex items-center justify-between transition-all duration-300"
				style={{
					height: `calc(4.5rem + env(safe-area-inset-top, 0px))`,
					paddingTop: `env(safe-area-inset-top, 0px)`
				}}
			>
				{/* Branding */}
				<Link href="/home" className="flex items-center gap-4 active:scale-95 transition-transform">
					<div className="w-12 h-12 flex items-center justify-center overflow-hidden">
						<Image 
							src="/logo2.png" 
							alt="MediSeen Logo" 
							width={48} 
							height={48} 
							className="object-contain"
						/>
					</div>
					<div className="flex flex-col">
						<span className="font-black text-xl tracking-tighter text-slate-900 leading-none">
							Medi<span className="text-pastel-pink">Seen</span>
						</span>
						<span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">AI Health Assistance</span>
					</div>
				</Link>

				{/* Top Right Actions */}
				<div className="flex items-center gap-3">
					{/* Language Switcher */}
					<div className="relative">
						<button
							onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
							className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
							aria-label="Change Language"
						>
							<Languages className="w-5 h-5" />
						</button>

						<AnimatePresence>
							{showLanguageDropdown && (
								<>
									<motion.div 
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										onClick={() => setShowLanguageDropdown(false)}
										className="fixed inset-0 z-[-1]"
									/>
									<motion.div
										initial={{ opacity: 0, y: 10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 10, scale: 0.95 }}
										className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
									>
										<div className="p-2 space-y-1">
											{LOCALES.map((lang) => (
												<button
													key={lang.code}
													onClick={() => {
														void setLanguage(lang.code)
														setLocale(lang.code)
														setShowLanguageDropdown(false)
													}}
													className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
														locale === lang.code 
															? "bg-slate-900 text-white" 
															: "text-slate-600 hover:bg-slate-50"
													}`}
												>
													<span className="flex items-center gap-3">
														<span className="text-lg">{lang.flag}</span>
														{lang.name}
													</span>
													{locale === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-pastel-pink" />}
												</button>
											))}
										</div>
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</div>

					{/* Profile Button (link to profile settings) */}
					<Link
						href="/profile"
						className={`w-10 h-10 rounded-xl border shadow-sm flex items-center justify-center overflow-hidden active:scale-90 transition-all ${
							isProfileActive ? "border-slate-900 bg-slate-900 text-white" : "bg-white border-slate-100"
						}`}
						aria-label="Profile"
					>
						{user ? (
							<div className="w-full h-full bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700 flex items-center justify-center font-black text-xs">
								{getInitials(user)}
							</div>
						) : (
							<Image src="/logo2.png" alt="Profile" width={24} height={24} className="object-contain" />
						)}
					</Link>
				</div>
			</div>

			{/* Desktop Sidebar - Left side */}
			<nav className="fixed hidden md:flex left-4 bottom-4 top-[5.5rem] w-20 z-[70] bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/10 py-8 border border-slate-100 flex-col items-center justify-between">
				<div className="flex flex-col gap-6">
					{navItems.map((item) => {
						const active = isActiveRoute(item.path)
						const Icon = item.icon

						return (
							<Link
								key={item.path}
								href={item.path}
								title={item.label}
								className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
									active 
										? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
										: "text-slate-400 hover:bg-slate-50"
								}`}
							>
								<Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
							</Link>
						)
					})}
					</div>
					<Link
						href="/profile"
						className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
							isProfileActive ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-900"
						}`}
						title={t.navbar.profile}
					>
						<Settings className="w-5 h-5" />
					</Link>
			</nav>

			{/* Mobile Bottom Bar - Navigation */}
			<nav className="fixed md:hidden left-0 right-0 z-[70] bg-white/80 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-100"
				style={{ bottom: 0 }}
			>
				<div className="px-1 py-2" style={{
					paddingBottom: `max(0.5rem, env(safe-area-inset-bottom, 0.5rem))`
				}}>
					<div className="grid grid-cols-5 gap-1">
						{navItems.map((item) => {
							const active = isActiveRoute(item.path)
							const Icon = item.icon

							return (
								<Link
									key={item.path}
									href={item.path}
									className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 min-h-[64px] transition-all ${
										active 
											? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
											: "text-slate-500 active:bg-slate-50"
									}`}
								>
									<Icon className={`w-5 h-5 flex-shrink-0 ${active ? "scale-110" : ""}`} />
									<span className="text-[9px] font-black leading-tight tracking-tight uppercase">{item.label}</span>
								</Link>
							)
						})}
						<Link
							href="/profile"
							className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 min-h-[64px] transition-all ${
								isProfileActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 active:bg-slate-50"
							}`}
							title={t.navbar.profile}
						>
							<Settings className={`w-5 h-5 flex-shrink-0 ${isProfileActive ? "scale-110" : ""}`} />
							<span className="text-[9px] font-black leading-tight tracking-tight uppercase">{t.navbar.profile}</span>
						</Link>
					</div>
				</div>
			</nav>
		</>
	)
}

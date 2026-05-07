"use client"

/**
 * /onboarding/notification – Explain-first notification permission screen
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Pill, BrainCircuit, Activity, ChevronLeft } from "lucide-react"
import { requestNotificationPermission, isAndroid13Plus, isAndroid } from "../../lib/permissions"
import { useAppStore } from "../../store/useAppStore"
import { NotificationService } from "../../services/NotificationService"
import PermissionCard from "../../components/PermissionCard"

export default function NotificationPermissionPage() {
  const router = useRouter()
  const { setNotificationPermission } = useAppStore()
  const [loading, setLoading] = useState(false)

  const needsRuntimePermission = !isAndroid() || isAndroid13Plus()

  const handleAllow = async () => {
    setLoading(true)
    try {
      const result = await requestNotificationPermission()
      await setNotificationPermission(result.granted ? "granted" : result.permanentlyDenied ? "denied" : "skipped")
      if (result.granted) {
        try { await NotificationService.scheduleRepeatingNotifications() } catch { /* no-op */ }
      }
    } catch {
      await setNotificationPermission("skipped")
    } finally {
      setLoading(false)
      router.replace("/onboarding/slides")
    }
  }

  const handleSkip = async () => {
    await setNotificationPermission("skipped")
    router.replace("/onboarding/slides")
  }

  const reasons = [
    { icon: Pill, color: "bg-rose-100 text-rose-500", title: "Medicine Reminders", desc: "Never miss a dose with timely reminders" },
    { icon: BrainCircuit, color: "bg-violet-100 text-violet-500", title: "AI Health Alerts", desc: "Get notified about important health insights" },
    { icon: Activity, color: "bg-blue-100 text-blue-500", title: "Daily Health Tips", desc: "Bite-sized tips to improve your well-being" },
  ]

  return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-2 z-10">
        <button
          onClick={() => router.replace("/onboarding/language")}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleSkip}
          className="text-slate-400 font-semibold text-sm px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
        >
          Skip
        </button>
      </div>

      <PermissionCard
        icon={Bell}
        title="Stay on top of<br /> <span className='text-violet-500'>your health</span>"
        description={needsRuntimePermission
          ? "Enable notifications to get timely health reminders and alerts."
          : "We'll send you helpful health reminders to keep you on track."}
        reasons={reasons}
        onAllow={handleAllow}
        onSkip={handleSkip}
        loading={loading}
        allowLabel={needsRuntimePermission ? "Allow Notifications" : "Continue"}
      />
    </div>
  )
}

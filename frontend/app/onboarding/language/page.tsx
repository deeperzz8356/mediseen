"use client"

/**
 * /onboarding/language – Language selection during first launch
 * Uses the shared <LanguageSelector /> component.
 */

import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useAppStore } from "../../store/useAppStore"
import LanguageSelector from "../../components/LanguageSelector"
import type { AppLanguage } from "../../store/useAppStore"

export default function LanguagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LanguagePageContent />
    </Suspense>
  )
}

function LanguagePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setLanguageDone } = useAppStore()
  const returnTo = searchParams.get("returnTo")

  const handleConfirm = async (lang: AppLanguage) => {
    // Mark language step as done (separate from full onboarding)
    await setLanguageDone(true)
    router.replace(returnTo || "/onboarding/notification")
  }

  const handleBack = () => {
    router.replace(returnTo || "/profile")
  }

  return (
    <LanguageSelector
      onConfirm={handleConfirm}
      onBack={handleBack}
      showNav={true}
      fullScreen={true}
    />
  )
}

"use client"

/**
 * /onboarding/language – Language selection during first launch
 * Uses the shared <LanguageSelector /> component.
 */

import { useRouter } from "next/navigation"
import { useAppStore } from "../../store/useAppStore"
import LanguageSelector from "../../components/LanguageSelector"
import type { AppLanguage } from "../../store/useAppStore"

export default function LanguagePage() {
  const router = useRouter()
  const { setLanguageDone } = useAppStore()

  const handleConfirm = async (lang: AppLanguage) => {
    // Mark language step as done (separate from full onboarding)
    await setLanguageDone(true)
    router.replace("/onboarding/notification")
  }

  // No back on the very first screen – nothing before it
  const handleBack = () => {
    // no-op: first screen in flow
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

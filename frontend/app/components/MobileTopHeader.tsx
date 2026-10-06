"use client"

import { Globe, Settings } from "lucide-react"
import { useLocale } from "../i18n/LocaleContext"
import { LOCALES } from "../i18n"

interface MobileTopHeaderProps {
  greeting?: string
  title?: string
  userName?: string
  onLanguageClick?: () => void
  onSettingsClick?: () => void
  currentLanguage?: string
}

export default function MobileTopHeader({
  greeting = "Good morning",
  title = "Home",
  userName = "Deep",
  onLanguageClick,
  onSettingsClick,
  currentLanguage = "EN"
}: MobileTopHeaderProps) {
  const { locale } = useLocale()

  // Get current language display name
  const langDisplay = LOCALES.find(l => l.code === locale)?.code.toUpperCase() || currentLanguage

  return (
    <div className="w-full bg-white px-4 py-4 md:px-6 md:py-6">
      {/* Container with space-between layout */}
      <div className="flex items-center justify-between">
        {/* Left Side - Greeting and Title Stack */}
        <div className="flex flex-col gap-1">
          {/* Muted Greeting Text */}
          <p className="text-sm font-medium text-gray-500">
            {greeting}, {userName}
          </p>

          {/* Large Bold Title */}
          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>
        </div>

        {/* Right Side - Language and Settings Buttons */}
        <div className="flex items-center gap-3">
          {/* Language Button - Rounded Pill */}
          <button
            onClick={onLanguageClick}
            className="rounded-full px-3 py-1.5 bg-gray-100 text-sm font-medium flex items-center gap-1.5 hover:bg-gray-200 active:scale-95 transition-all text-gray-700"
            aria-label="Change Language"
          >
            <Globe className="w-4 h-4" />
            <span>{langDisplay}</span>
          </button>

          {/* Settings Button - Circular Icon Button */}
          <button
            onClick={onSettingsClick}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all text-gray-600"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

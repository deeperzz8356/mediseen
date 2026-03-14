"use client"

import React from "react"

// Reusable SVG definitions for gradients
const Defs = () => (
  <defs>
    <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#D1EAFF" />
      <stop offset="100%" stopColor="#A5B4FC" />
    </linearGradient>
    <linearGradient id="grad-mint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#D4F4E2" />
      <stop offset="100%" stopColor="#B2E2D2" />
    </linearGradient>
    <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFD1DC" />
      <stop offset="100%" stopColor="#FFB7C5" />
    </linearGradient>
    <linearGradient id="grad-violet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E0BBE4" />
      <stop offset="100%" stopColor="#957DAD" />
    </linearGradient>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.05" />
    </filter>
  </defs>
)

interface IllustrationProps {
  className?: string;
  bgColor?: string;
}

export const LungsIllustration = ({ className = "w-32 h-32", bgColor = "#D1EAFF" }: IllustrationProps) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <Defs />
    <circle cx="60" cy="60" r="56" fill={bgColor} opacity="0.3" />
    <circle cx="60" cy="60" r="48" fill="white" fillOpacity="0.6" />
    <g filter="url(#soft-shadow)">
      {/* Trachea */}
      <path d="M60 25 V45" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
      {/* Bronchi */}
      <path d="M60 45 L45 55 M60 45 L75 55" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
      {/* Left Lung */}
      <path d="M30 60 C30 40, 48 45, 52 55 C52 75, 50 90, 35 90 C20 90, 30 70, 30 60" fill="url(#grad-blue)" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* Right Lung */}
      <path d="M90 60 C90 40, 72 45, 68 55 C68 75, 70 90, 85 90 C100 90, 90 70, 90 60" fill="url(#grad-mint)" stroke="#FFFFFF" strokeWidth="2.5" />
    </g>
  </svg>
)

export const SkinRashArmIllustration = ({ className = "w-32 h-32", bgColor = "#FFD1DC" }: IllustrationProps) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <Defs />
    <circle cx="60" cy="60" r="56" fill={bgColor} opacity="0.3" />
    <circle cx="60" cy="60" r="48" fill="white" fillOpacity="0.6" />
    <g filter="url(#soft-shadow)">
      <path d="M30 80 Q60 100 90 40 L100 50 Q70 110 35 95 Z" fill="#FFE0B2" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="75" cy="60" r="5" fill="url(#grad-pink)" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="65" cy="70" r="3" fill="url(#grad-pink)" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="85" cy="50" r="4" fill="url(#grad-pink)" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M80 35 L82 40 L87 42 L82 44 L80 49 L78 44 L73 42 L78 40 Z" fill="#FFB7C5" />
    </g>
  </svg>
)

export const MedicalAssistanceIllustration = ({ className = "w-32 h-32", bgColor = "#E0BBE4" }: IllustrationProps) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <Defs />
    <circle cx="60" cy="60" r="56" fill={bgColor} opacity="0.3" />
    <circle cx="60" cy="60" r="48" fill="white" fillOpacity="0.6" />
    <g filter="url(#soft-shadow)">
      {/* Simple Cross Icon / Shield */}
      <rect x="45" y="40" width="30" height="40" rx="4" fill="url(#grad-violet)" stroke="white" strokeWidth="2" />
      <rect x="40" y="50" width="40" height="20" rx="4" fill="url(#grad-violet)" stroke="white" strokeWidth="2" />
      {/* Stethoscope loop */}
      <path d="M30 30 Q60 10 90 30 V60 Q60 90 30 60 Z" stroke="#94A3B8" strokeWidth="3" fill="none" strokeDasharray="4 4" />
    </g>
  </svg>
)

export const ScratchingHandIllustration = ({ className = "w-32 h-32" }: IllustrationProps) => (
  <SkinRashArmIllustration className={className} />
)

export const ApplyingCreamIllustration = ({ className = "w-32 h-32" }: IllustrationProps) => (
  <MedicalAssistanceIllustration className={className} />
)

export const MediSeenEyeLogo = ({ className = "w-12 h-12" }: IllustrationProps) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="white" fillOpacity="0.4" />
    <path d="M40 100C40 100 70 60 100 60C130 60 160 100 160 100C160 100 130 140 100 140C70 140 40 100 40 100Z" stroke="#E0BBE4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="100" cy="100" r="25" fill="#A5B4FC" stroke="#E0BBE4" strokeWidth="4" />
    <circle cx="105" cy="95" r="8" fill="white" fillOpacity="0.6" />
    <path d="M100 40C120 40 140 50 155 65" stroke="#FFD1DC" strokeWidth="6" strokeLinecap="round" />
    <path d="M45 135C60 150 80 160 100 160" stroke="#FFD1DC" strokeWidth="6" strokeLinecap="round" />
  </svg>
)


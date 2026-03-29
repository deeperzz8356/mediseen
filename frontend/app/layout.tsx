import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import NavbarWrapper from "./components/NavbarWrapper"
import AgentFAB from "./components/AgentFAB"
import { LocaleProvider } from "./i18n/LocaleContext"
import "./globals.css"

const geistSans = Geist({
variable: "--font-geist-sans",
subsets: ["latin"],
})

const geistMono = Geist_Mono({
variable: "--font-geist-mono",
subsets: ["latin"],
})

export const metadata: Metadata = {
title: "MediSeen Clinical Studio",
description: "Advanced AI-powered clinical workspace for medical professionals",
}

export const viewport: Viewport = {
width: "device-width",
initialScale: 1,
viewportFit: "cover",
}

export default function RootLayout({
children,
}: {
children: React.ReactNode
}) {
return ( <html lang="en">
<body
className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
>
  <LocaleProvider>
    <NavbarWrapper />
    
    <main className="flex-1 w-full relative">
      {children}
    </main>

    {/* AI Agent FAB */}
    <AgentFAB />
  </LocaleProvider>
  </body>
</html>


)
}

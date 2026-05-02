import type { Metadata, Viewport } from "next"
import NavbarWrapper from "./components/NavbarWrapper"
import AgentFAB from "./components/AgentFAB"
import AdManager from "./components/AdManager"
import FirebaseProvider from "./components/FirebaseProvider"
import { LocaleProvider } from "./i18n/LocaleContext"
import "./globals.css"

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
className="antialiased bg-background text-foreground min-h-screen flex flex-col"
>
  <LocaleProvider>
    <FirebaseProvider />
    <AdManager />
    <NavbarWrapper />
    
    <main className="flex-1 w-full relative pt-14 md:pt-0 pb-24 md:pb-0">
      {children}
    </main>

    {/* AI Agent FAB */}
    <AgentFAB />
  </LocaleProvider>
  </body>
</html>


)
}

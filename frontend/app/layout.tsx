import type { Metadata, Viewport } from "next"
import NavbarWrapper from "./components/NavbarWrapper"
import AgentFABWrapper from "./components/AgentFABWrapper"
import AdManager from "./components/AdManager"
import FirebaseProvider from "./components/FirebaseProvider"
import NavigationTracker from "./components/NavigationTracker"
import { LocaleProvider } from "./i18n/LocaleContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mediseen AI health assistant",
  description: "Explainable AI medical diagnostics, dynamic nutrition synthesis, and automated grocery mapping.",
  icons: {
    icon: "/logo2.png",
    apple: "/logo2.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo2.png" />
        <link rel="apple-touch-icon" href="/logo2.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <LocaleProvider>
          {/* Firebase + Zustand bootstrap */}
          <FirebaseProvider />

          {/* AdMob (no-op on web) */}
          <AdManager />

          {/* Navigation persistence */}
          <NavigationTracker />

          {/* Navbar: hidden until authenticated */}
          <NavbarWrapper />

          <main className="flex-1 w-full relative pt-14 md:pt-0 pb-24 md:pb-0">
            {children}
          </main>

          {/* AI Agent FAB: auth-aware wrapper */}
          <AgentFABWrapper />
        </LocaleProvider>
      </body>
    </html>
  )
}

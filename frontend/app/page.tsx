"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    if (!auth) return

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/home')
      } else {
        router.push('/login')
      }
    })
    return () => unsub()
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pastel-pink border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Always redirect to hero page for wallet-based auth
    router.push("/hero")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-olive-green/10 to-sage-green/20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green mx-auto mb-4"></div>
        <p className="text-sage-green font-medium">Loading...</p>
      </div>
    </div>
  )
}

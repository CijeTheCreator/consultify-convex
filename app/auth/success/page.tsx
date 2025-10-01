"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import OnboardingFlow from '@/components/onboarding/onboarding-flow'
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function AuthSuccess() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Use Convex to check if user exists
  const userProfile = useQuery(api.users.getUserByEmail, 
    user?.email ? { email: user.email } : "skip"
  )

  useEffect(() => {
    if (loading || userProfile === undefined) return

    if (!user) {
      router.push('/')
      return
    }

    if (userProfile === null) {
      // User not found in database, needs onboarding
      setShowOnboarding(true)
    } else {
      // User exists in database, redirect to appropriate dashboard
      if (userProfile.type === 'DOCTOR') {
        router.push('/doctor-dashboard')
      } else {
        router.push('/patient-dashboard')
      }
    }
  }, [user, loading, userProfile])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    // The onboarding flow already handles navigation
  }

  if (loading || userProfile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <OnboardingFlow
            userEmail={user?.email || ''}
            userName={user?.name || user?.email?.split('@')[0] || ''}
            onComplete={handleOnboardingComplete}
          />
        </div>
      </div>
    )
  }

  return null
}

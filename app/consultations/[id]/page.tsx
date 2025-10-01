"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import ConsultationChat from "@/components/consultation-chat"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { User } from "@/lib/interfaces"

export default function ConsultationPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const consultationId = params.id as string

  // Use Convex to get user profile
  const userProfile = useQuery(api.users.getUserByEmail, 
    user?.email ? { email: user.email } : "skip"
  )

  useEffect(() => {
    if (loading || userProfile === undefined) return

    if (!user) {
      // No authenticated user, redirect to login
      router.push('/auth')
      return
    }

    if (userProfile === null) {
      // User not found in Convex, redirect to auth
      router.push('/auth')
      return
    }

    // Transform to match User interface
    const transformedUser: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      type: userProfile.type,
      language: userProfile.language,
      specialty: userProfile.specialty
    }

    setCurrentUser(transformedUser)
  }, [user, loading, userProfile, router])

  const handleBack = () => {
    router.push("/consultations")
  }

  if (loading || userProfile === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultation...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access this consultation.</p>
          <Button
            onClick={() => router.push('/auth')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ConsultationChat
      consultationId={consultationId}
      currentUser={currentUser}
      onBack={handleBack}
    />
  )
}

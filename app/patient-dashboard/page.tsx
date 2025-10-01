"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import PatientLandingPage from "@/components/patient-landing-page"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { PatientUser, PatientUserData } from "@/lib/interfaces"
import type { Id } from "@/convex/_generated/dataModel"

export default function PatientDashboard() {
  const { user: authUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<PatientUser | null>(null)
  const [userData, setUserData] = useState<PatientUserData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Convex queries and mutations
  const userProfile = useQuery(api.users.getUserByEmail, 
    authUser?.email ? { email: authUser.email } : "skip"
  )
  const createConsultation = useMutation(api.consultations.createConsultation)

  useEffect(() => {
    console.log('Patient Dashboard useEffect:', { authLoading, authUser: !!authUser, userProfile })
    
    if (authLoading) return

    if (!authUser) {
      console.log('No auth user, redirecting to hero')
      router.push('/hero')
      return
    }

    if (userProfile === undefined) return // Still loading

    if (userProfile === null) {
      console.log('User not found in Convex, redirecting to auth/success for onboarding')
      router.push('/auth/success')
      return
    }

    if (userProfile.type !== 'PATIENT') {
      setError('Access denied: This page is for patients only')
      return
    }

    // Transform to match existing interfaces
    const patientUser: PatientUser = {
      id: userProfile.id,
      name: userProfile.name,
      language: userProfile.language
    }

    const patientUserData: PatientUserData = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      type: userProfile.type,
      language: userProfile.language,
      createdAt: new Date(userProfile.createdAt).toISOString(),
      updatedAt: new Date(userProfile.updatedAt).toISOString()
    }

    setUser(patientUser)
    setUserData(patientUserData)
  }, [authUser, authLoading, userProfile])

  const handleStartConsultation = async () => {
    if (!userData?.id) {
      setError('User data not available')
      return
    }

    try {
      const consultationId = await createConsultation({
        patientId: userData.id as Id<"users">,
        state: "CLERKING"
      })
      
      router.push(`/consultations/${consultationId}`)
    } catch (err) {
      console.error('Error creating consultation:', err)
      setError(err instanceof Error ? err.message : 'Failed to create consultation')
    }
  }

  const handleViewConsultations = () => {
    router.push('/consultations')
  }

  if (authLoading || userProfile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => router.push('/hero')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <PatientLandingPage
      user={user}
      onStartConsultation={handleStartConsultation}
      onViewConsultations={handleViewConsultations}
    />
  )
}

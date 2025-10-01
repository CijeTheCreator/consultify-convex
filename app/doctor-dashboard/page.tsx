"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import DoctorLandingPage from "@/components/doctor-landing-page"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { DoctorUser, DoctorUserData } from "@/lib/interfaces"

export default function DoctorDashboard() {
  const { user: authUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<DoctorUser | null>(null)
  const [userData, setUserData] = useState<DoctorUserData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Convex query
  const userProfile = useQuery(api.users.getUserByEmail, 
    authUser?.email ? { email: authUser.email } : "skip"
  )

  useEffect(() => {
    console.log('Doctor Dashboard useEffect:', { authLoading, authUser: !!authUser, userProfile })
    
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

    if (userProfile.type !== 'DOCTOR') {
      setError('Access denied: This page is for doctors only')
      return
    }

    // Transform to match existing interfaces
    const doctorUser: DoctorUser = {
      id: userProfile.id,
      name: userProfile.name,
      language: userProfile.language,
      specialization: userProfile.specialty || 'General Medicine'
    }

    const doctorUserData: DoctorUserData = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      type: userProfile.type,
      specialty: userProfile.specialty,
      language: userProfile.language,
      createdAt: new Date(userProfile.createdAt).toISOString(),
      updatedAt: new Date(userProfile.updatedAt).toISOString()
    }

    setUser(doctorUser)
    setUserData(doctorUserData)
  }, [authUser, authLoading, userProfile])


  const handleViewConsultations = () => {
    router.push('/consultations')
  }

  if (authLoading || userProfile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading your practice dashboard...</p>
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
    <DoctorLandingPage
      user={user}
      onViewConsultations={handleViewConsultations}
    />
  )
}

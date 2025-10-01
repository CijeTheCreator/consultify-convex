"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { User, Consultation } from "@/lib/interfaces"
import type { Id } from "@/convex/_generated/dataModel"


export default function ConsultationsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { user: authUser } = useAuth()

  // Convex queries
  const userProfile = useQuery(api.users.getUserByEmail, 
    authUser?.email ? { email: authUser.email } : "skip"
  )
  
  const consultationsData = useQuery(api.consultations.getConsultationsByUser,
    userProfile ? { userId: userProfile.id as Id<"users">, userType: userProfile.type } : "skip"
  )

  useEffect(() => {
    if (!userProfile) return

    // Transform to match existing User interface
    const user: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      type: userProfile.type,
      language: userProfile.language,
      specialty: userProfile.specialty
    }

    setCurrentUser(user)
  }, [userProfile])

  const loading = userProfile === undefined || consultationsData === undefined
  const consultations = consultationsData || []

  const getStatusColor = (state: string | undefined) => {
    if (!state) return "bg-gray-100 text-gray-800"

    switch (state) {
      case "CONSULTING":
        return "bg-green-100 text-green-800"
      case "CLERKING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (state: string | undefined) => {
    if (!state) return "Unknown"

    switch (state) {
      case "CONSULTING":
        return "Active"
      case "CLERKING":
        return "Triage"
      default:
        return state
    }
  }

  const getOtherParticipantName = (consultation: any) => {
    if (!currentUser) return "Unknown"
    return currentUser.type === "PATIENT"
      ? consultation.doctor?.name || "AI Assistant"
      : consultation.patient?.name || "Patient"
  }

  const handleConsultationClick = (consultationId: string) => {
    window.location.href = `/consultation/${consultationId}`
  }

  const handleBack = () => {
    const dashboardPath = currentUser?.type === 'PATIENT' ? '/patient-dashboard' : '/doctor-dashboard'
    window.location.href = dashboardPath
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultations...</p>
        </div>
      </div>
    )
  }

  if (!currentUser && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Please sign in to view consultations</p>
          <button
            onClick={() => window.location.href = '/hero'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentUser.type === "PATIENT" ? "Your Consultations" : "Patient Consultations"}
            </h1>
            <p className="text-gray-600">
              {consultations.length} consultation{consultations.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Consultations List */}
        {consultations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No consultations yet</h3>
              <p className="text-gray-600">
                {currentUser.type === "PATIENT"
                  ? "Start your first consultation to connect with a doctor"
                  : "No patient consultations assigned yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => {
              if (!consultation) return null
              const otherParticipantName = getOtherParticipantName(consultation)
              return (
                <Card
                  key={consultation.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleConsultationClick(consultation.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {otherParticipantName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Consultation
                            </h3>
                            <Badge className={getStatusColor(consultation.state)}>{getStatusLabel(consultation.state)}</Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <span>
                                {currentUser.type === "PATIENT" && consultation.doctor ? "Dr. " : ""}
                                {otherParticipantName}
                              </span>
                              {currentUser.type === "PATIENT" && consultation.doctor?.specialty && (
                                <>
                                  <span>•</span>
                                  <span>{consultation.doctor.specialty}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Started {new Date(consultation.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

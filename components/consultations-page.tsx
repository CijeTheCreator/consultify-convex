"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, Clock } from "lucide-react"

interface ConsultationsPageProps {
  user: any
  onBack: () => void
  onSelectConsultation: (consultationId: string) => void
}

export default function ConsultationsPage({ user, onBack, onSelectConsultation }: ConsultationsPageProps) {
  const [consultations, setConsultations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      // Get data from localStorage (passed from dashboard)
      const storedData = localStorage.getItem('consultationsData')
      if (storedData) {
        const data = JSON.parse(storedData)
        let transformedConsultations = []

        if (user.role === 'doctor') {
          // For doctors: data is an array of consultation IDs
          if (Array.isArray(data)) {
            transformedConsultations = data.map((consultationId: string) => ({
              id: consultationId,
              consultation_id: consultationId,
              patient_id: null,
              doctor_id: user.id,
              title: `Consultation ${consultationId.slice(0, 8)}...`,
              status: "active",
              created_at: new Date().toISOString(),
              patient: { name: "Patient", id: "patient-id" },
              doctor: null
            }))
          }
        } else {
          // For patients: data is an array of consultation objects
          if (Array.isArray(data)) {
            transformedConsultations = data.map((consultation: any) => ({
              id: consultation.consultation_id,
              consultation_id: consultation.consultation_id,
              patient_id: consultation.patient_id,
              doctor_id: consultation.doctor_id,
              title: `Consultation ${consultation.consultation_id.slice(0, 8)}...`,
              status: consultation.doctor_id ? "active" : "pending",
              created_at: new Date().toISOString(),
              patient: null,
              doctor: consultation.doctor_id ? { name: "Doctor", id: consultation.doctor_id, specialization: "General Medicine" } : null
            }))
          }
        }

        setConsultations(transformedConsultations)
        // Clear the stored data
        localStorage.removeItem('consultationsData')
      }
    } catch (error) {
      console.error("Failed to load consultations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOtherParticipant = (consultation: any) => {
    return user.role === "patient" ? consultation.doctor : consultation.patient
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === "patient" ? "Your Consultations" : "Patient Consultations"}
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
                {user.role === "patient"
                  ? "Start your first consultation to connect with a doctor"
                  : "No patient consultations assigned yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => {
              const otherParticipant = getOtherParticipant(consultation)
              return (
                <Card
                  key={consultation.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectConsultation(consultation.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{otherParticipant?.name?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{consultation.title}</h3>
                            <Badge className={getStatusColor(consultation.status)}>{consultation.status}</Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <span>
                                {user.role === "patient" ? "Dr. " : ""}
                                {otherParticipant?.name}
                              </span>
                            </div>
                            {user.role === "patient" && otherParticipant?.specialization && (
                              <div className="flex items-center space-x-1">
                                <span>•</span>
                                <span>{otherParticipant.specialization}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Started {new Date(consultation.created_at).toLocaleDateString()}</span>
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

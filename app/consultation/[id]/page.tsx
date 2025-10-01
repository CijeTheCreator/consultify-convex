"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function ConsultationRedirect() {
  const params = useParams()
  const consultationId = params.id as string

  useEffect(() => {
    // Redirect to the correct consultations path
    window.location.href = `/consultations/${consultationId}`
  }, [consultationId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to consultation...</p>
      </div>
    </div>
  )
}
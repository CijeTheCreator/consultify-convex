"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Calendar, Clock, Shield, Heart, Zap, Languages, Bot, User } from "lucide-react"
import { AuroraText } from "@/components/magicui/aurora-text"
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Pointer } from "@/components/magicui/pointer"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { PatientUser, PatientStats } from "@/lib/interfaces"
import type { Id } from "@/convex/_generated/dataModel"

interface PatientLandingPageProps {
  user: PatientUser
  onStartConsultation: () => void
  onViewConsultations: () => void
}

export default function PatientLandingPage({
  user,
  onStartConsultation,
  onViewConsultations,
}: PatientLandingPageProps) {
  // Use Convex query for patient stats
  const stats = useQuery(api.users.getPatientStats, 
    user?.id ? { userId: user.id as Id<"users"> } : "skip"
  )

  const loading = stats === undefined

  const getConsultationIcon = (consultationType: string) => {
    return consultationType === "AI_TRIAGE" ? (
      <Bot className="w-4 h-4 text-blue-600" />
    ) : (
      <User className="w-4 h-4 text-green-600" />
    )
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800"
    
    switch (status.toLowerCase()) {
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

  const colors = ["#2EFF5D", "#A9FF9C", "#FFF6B0", "#FFFFFF"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFAE0" }}>

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: "#0A400C" }}>
        <InteractiveGridPattern
          className="absolute inset-0 opacity-20"
          width={80}
          height={80}
          squares={[24, 24]}
          squaresClassName="fill-white/10"
        />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="mb-6 text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              Welcome,
              <AuroraText
                className="ml-4 text-3xl sm:text-5xl font-bold mb-4 leading-tight"
                colors={colors}
              >
                {" "} {user?.name}
              </AuroraText>
            </div>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90 font-medium">
              Ready to consult with a doctor? Tell us what's concerning you today, and we'll find the perfect specialist who speaks your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RainbowButton
                size="lg"
                className="text-lg px-8 py-4 h-auto font-semibold"
                onClick={onStartConsultation}
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Start a consultation
              </RainbowButton>
              <RainbowButton
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto font-semibold"
                onClick={onViewConsultations}
              >
                <Calendar className="mr-2 w-5 h-5" />
                Previous consultations
              </RainbowButton>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-16" style={{ backgroundColor: "#FEFAE0" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Continue your health journey</h2>
            <p className="text-lg font-medium" style={{ color: "#819067" }}>Pick up where you left off, {user?.name}</p>
          </div>

          <div className="grid gap-8">
            {/* Recent consultations */}
            {stats && stats.recentConsultations.length > 0 && (
              <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
                <BorderBeam
                  colorFrom="#0A400C"
                  colorTo="#819067"
                  size={50}
                  duration={10}
                />
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: "#0A400C" }}>
                    <Clock className="w-5 h-5 mr-2" style={{ color: "#819067" }} />
                    Recent consultations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.recentConsultations.map((consultation) => (
                    <div key={consultation.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "#F8F9FA" }}>
                      <div className="flex items-center space-x-3">
                        {getConsultationIcon(consultation.consultationType)}
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#0A400C" }}>
                            {consultation.consultationType === "DOCTOR" ? "Doctor Consultation" : "AI Triage"}
                          </p>
                          <p className="text-xs" style={{ color: "#819067" }}>
                            {new Date(consultation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* User preferences */}
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#819067"
                size={50}
                duration={8}
              />
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "#0A400C" }}>
                  <Languages className="w-5 h-5 mr-2" style={{ color: "#819067" }} />
                  Your preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Preferred language</p>
                  <Badge style={{ backgroundColor: "#819067", color: "#FEFAE0" }}>
                    {user?.language === "fr" ? "French" : user?.language === "en" ? "English" : user?.language}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Account type</p>
                  <Badge style={{ backgroundColor: "#0A400C", color: "#FEFAE0" }}>Patient</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Available services</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• AI health triage</div>
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• Medical consultations</div>
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• Prescription management</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Quick access to care, {user?.name}</h2>
            <p className="text-lg font-medium" style={{ color: "#819067" }}>
              Skip the wait – connect with specialists who understand your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              style={{ borderColor: "#819067" }}
              onClick={onStartConsultation}
            >
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#819067"
                size={40}
                duration={4}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#0A400C" }}>
                  <Zap className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Instant consultation</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Start talking to our AI agent about new symptoms</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#819067"
                colorTo="#B1AB86"
                size={40}
                duration={5}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#819067" }}>
                  <Heart className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Health tracking</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Monitor your symptoms and treatment progress</p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              style={{ borderColor: "#819067" }}
              onClick={onViewConsultations}
            >
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#0A400C"
                size={40}
                duration={6}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#B1AB86" }}>
                  <Calendar className="w-8 h-8" style={{ color: "#0A400C" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Consultation history</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>View your past consultations and treatments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#B1AB86"
                size={40}
                duration={7}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#0A400C" }}>
                  <Shield className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Emergency assistance</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>24/7 access to urgent care specialists</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  )
}

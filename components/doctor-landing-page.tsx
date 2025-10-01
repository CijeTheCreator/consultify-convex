"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Stethoscope, MessageCircle, Users, Activity, FileText, TrendingUp, Bot, UserIcon } from "lucide-react"
import { AuroraText } from "@/components/magicui/aurora-text"
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Pointer } from "@/components/magicui/pointer"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { DoctorUser, DoctorStats } from "@/lib/interfaces"
import type { Id } from "@/convex/_generated/dataModel"

interface DoctorLandingPageProps {
  user: DoctorUser
  onViewConsultations: () => void
}

export default function DoctorLandingPage({
  user,
  onViewConsultations
}: DoctorLandingPageProps) {
  // Use Convex query for doctor stats
  const stats = useQuery(api.users.getDoctorStats, 
    user?.id ? { userId: user.id as Id<"users"> } : "skip"
  )

  const loading = stats === undefined

  const getConsultationIcon = (consultationType: string) => {
    return consultationType === "AI_TRIAGE" ? (
      <Bot className="w-4 h-4 text-blue-600" />
    ) : (
      <UserIcon className="w-4 h-4 text-green-600" />
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
                {" "} Dr. {user?.name}
              </AuroraText>
            </div>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90 font-medium">
              Your patients are waiting. Manage consultations, review cases, and provide expert care through our multilingual platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RainbowButton
                size="lg"
                className="text-lg px-8 py-4 h-auto font-semibold"
                onClick={onViewConsultations}
              >
                <MessageCircle className="mr-2 w-5 h-5" />
View Patient Consultations
              </RainbowButton>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Overview */}
      <section className="py-16" style={{ backgroundColor: "#FEFAE0" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Your Practice Dashboard</h2>
            <p className="text-lg font-medium" style={{ color: "#819067" }}>
              Specialized in {user?.specialization} • Serving patients worldwide
            </p>
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
                    <Activity className="w-5 h-5 mr-2" style={{ color: "#819067" }} />
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
                            Patient Consultation
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

            {/* Doctor Profile */}
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#0A400C"
                size={50}
                duration={8}
              />
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "#0A400C" }}>
                  <Stethoscope className="w-5 h-5 mr-2" style={{ color: "#819067" }} />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Specialization</p>
                  <Badge style={{ backgroundColor: "#819067", color: "#FEFAE0" }}>{user?.specialization}</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Language</p>
                  <Badge style={{ backgroundColor: "#0A400C", color: "#FEFAE0" }}>
                    {user?.language === "en" ? "English" : user?.language === "fr" ? "French" : user?.language}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Account Type</p>
                  <Badge style={{ backgroundColor: "#B1AB86", color: "#0A400C" }}>Medical Professional</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Available Features</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• Patient Consultations</div>
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• Prescription Management</div>
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• AI Triage Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Practice Tools */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Practice Management Tools</h2>
            <p className="text-lg font-medium" style={{ color: "#819067" }}>Everything you need to provide excellent patient care</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              style={{ borderColor: "#819067" }}
              onClick={onViewConsultations}
            >
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#819067"
                size={40}
                duration={4}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#0A400C" }}>
                  <MessageCircle className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Active Consultations</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Manage ongoing patient conversations</p>
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
                  <FileText className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Prescriptions</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Create and manage patient prescriptions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#0A400C"
                size={40}
                duration={6}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#B1AB86" }}>
                  <TrendingUp className="w-8 h-8" style={{ color: "#0A400C" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Analytics</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Track your practice performance</p>
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
                  <Bot className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>AI Triage Review</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Review AI-processed patient cases</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Practice Stats */}
    </div>
  )
}

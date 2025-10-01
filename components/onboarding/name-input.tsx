"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NameInputProps {
  onNext: (name: string, specialization?: string) => void
  userType: "doctor" | "patient" | ""
  isLoading?: boolean
}

const specializations = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Surgery",
  "Urology",
]

export default function NameInput({ onNext, userType, isLoading = false }: NameInputProps) {
  const [name, setName] = useState("")
  const [specialization, setSpecialization] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && (userType !== "doctor" || specialization)) {
      onNext(name.trim(), specialization)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 pt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {userType === "doctor" ? "Tell us about yourself" : "What do we call you?"}
        </h1>
        <p className="text-xl text-gray-600">
          {userType === "doctor" ? "Help patients find the right specialist" : "Let's personalize your experience"}
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6"
      >
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What would you like use to call you?"
            className="text-center text-lg py-6"
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-2">
            Note: Your name will only be used for display purposes in this app and will not be sent to the blockchain process.
          </p>
        </div>

        {userType === "doctor" && (
          <div>
            <Label htmlFor="specialization" className="text-sm font-medium text-gray-700 mb-2 block">
              Medical Specialization
            </Label>
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger className="text-lg py-6">
                <SelectValue placeholder="Select your specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          type="submit"
          disabled={!name.trim() || (userType === "doctor" && !specialization) || isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? "Registering..." : "Continue"}
        </Button>
      </motion.form>
    </motion.div>
  )
}

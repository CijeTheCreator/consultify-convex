"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProgressBar from "./progress-bar"
import LanguageSelection from "./language-selection"
import UserTypeSelection from "./user-type-selection"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface OnboardingFlowProps {
  userEmail: string
  userName: string
  onComplete: () => void
}

export default function OnboardingFlow({ userEmail, userName, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isRegistering, setIsRegistering] = useState(false)
  const router = useRouter()
  const [onboardingData, setOnboardingData] = useState({
    language: "",
    userType: "" as "doctor" | "patient" | "",
    specialization: "",
  })

  // Convex mutation
  const createUser = useMutation(api.users.createUser)

  const totalSteps = 2

  const handleLanguageNext = (language: string) => {
    setOnboardingData((prev) => ({ ...prev, language }))
    setCurrentStep(2)
  }

  const handleUserTypeNext = async (userType: "doctor" | "patient", specialization?: string) => {
    const finalData = { ...onboardingData, userType, specialization: specialization || "" }
    setIsRegistering(true)

    try {
      const userId = await createUser({
        email: userEmail,
        name: userName,
        type: finalData.userType.toUpperCase(),
        specialty: finalData.specialization || undefined,
        language: finalData.language,
      })

      console.log('User created successfully in Convex with ID:', userId)
      toast.success('Account created successfully!')

      // Navigate to appropriate landing page
      if (finalData.userType === 'doctor') {
        router.push('/doctor-dashboard')
      } else {
        router.push('/patient-dashboard')
      }
      onComplete()
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsRegistering(false)
    }
  }


  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  }

  return (
    <div className="relative">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="language"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <LanguageSelection onNext={handleLanguageNext} />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="usertype"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <UserTypeSelection onNext={handleUserTypeNext} isLoading={isRegistering} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import GradientWrapper from "./gradientwrapper"
import NavLink from "./navlink"
import AuthModal from "./auth-modal"
import { useAuth } from "@/contexts/auth-context"

const Hero = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Don't show hero if user is logged in - let the auth/success page handle routing
  if (!loading && user) {
    return null
  }

  return (
    <section className="min-h-screen flex items-center justify-center">
      <GradientWrapper wrapperClassName="inset-0" className="custom-screen text-gray-600 w-full">
        <div className="space-y-5 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl text-gray-800 font-extrabold mx-auto sm:text-6xl">
            Connect with doctors, no matter the <span className=" bg-clip-text text-transparent bg-gradient-to-r from-[#9867F0] to-[#ED4E50]">language</span>
          </h1>
          <p className="max-w-xl mx-auto">Professional healthcare consultations with seamless AI-powered translation services</p>

          <div className="flex items-center justify-center gap-x-3 font-medium text-sm">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-x-2 text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 py-2.5 px-4 text-center rounded-full duration-150"
            >
              Sign In / Sign Up
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      </GradientWrapper>
    </section>
  )
}

export default Hero

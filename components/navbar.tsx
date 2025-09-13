"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Github, Pill } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import type { User } from "@/lib/types"

interface NavbarProps {
  user?: User | null
  onSignOut?: () => void
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
]

export default function Navbar({ user, onSignOut }: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState(user?.language || "en")

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up or at top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === selectedLanguage) || languages[0]
  }

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    // TODO: Implement actual language switching functionality
    console.log("Language changed to:", languageCode)
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-forest-green/95 backdrop-blur-md border-b border-sage-green/20 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left side - Logo, Separator, Language Selector */}
                <div className="flex items-center space-x-4">
                  {/* Logo */}
                  <Link href={user?.type === 'DOCTOR' ? '/doctor-dashboard' : '/patient-dashboard'} className="flex items-center">
                    <Image
                      src="/consultify-logo.svg"
                      alt="Consultify"
                      width={140}
                      height={32}
                      className="h-8 w-auto cursor-pointer"
                      priority
                    />
                  </Link>

                </div>

                {/* Right side - GitHub Link, User Avatar */}
                <div className="flex items-center space-x-4">
                  {/* GitHub Link */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-cream hover:bg-sage-green/20 hover:text-cream p-2"
                    onClick={() => window.open("https://github.com/CijeTheCreator/consultify-convex", "_blank")}
                  >
                    <Github className="w-5 h-5" />
                  </Button>


                  {/* Prescriptions Button - Only for Patients */}
                  {user && user.type === 'PATIENT' && (
                    <Link href="/prescriptions">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cream hover:bg-sage-green/20 hover:text-cream p-2"
                      >
                        <Pill className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}


                  {/* User Avatar with Dropdown or Wallet Connection */}
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-sage-green/20 p-0">
                          <Avatar className="h-9 w-9 border-2 border-sage-green/30">
                            <AvatarFallback className="bg-olive-green text-cream font-semibold">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80 bg-white border-sage-green/20 shadow-lg">
                        <div className="px-3 py-2 border-b border-sage-green/20">
                          <p className="text-sm font-medium text-forest-green">{user.name}</p>
                          <p className="text-xs text-sage-green">{user.email}</p>
                          <p className="text-xs text-olive-green capitalize">{user.type.toLowerCase()}</p>
                        </div>

                        <DropdownMenuSeparator className="bg-sage-green/20" />
                        <DropdownMenuItem
                          onClick={onSignOut}
                          className="hover:bg-red-50 focus:bg-red-50 text-red-600 cursor-pointer"
                        >
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/sign-in">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-sage-green/30 text-cream hover:bg-sage-green/20 hover:text-cream bg-transparent"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

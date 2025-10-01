"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface LanguageSelectionProps {
  onNext: (language: string) => void
}

const languages = [
  { code: "en", name: "English", greeting: "Hello" },
  { code: "es", name: "Español", greeting: "Hola" },
  { code: "fr", name: "Français", greeting: "Bonjour" },
  { code: "de", name: "Deutsch", greeting: "Hallo" },
  { code: "it", name: "Italiano", greeting: "Ciao" },
  { code: "pt", name: "Português", greeting: "Olá" },
  { code: "zh", name: "中文", greeting: "你好" },
  { code: "ja", name: "日本語", greeting: "こんにちは" },
]

export default function LanguageSelection({ onNext }: LanguageSelectionProps) {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % languages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-olive-green/10 to-sage-green/20 flex flex-col items-center justify-center p-4 pt-20">
      <div className="text-center mb-12">
        <div className="h-32 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentGreeting}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-6xl font-light text-forest-green"
            >
              {languages[currentGreeting].greeting}
            </motion.h1>
          </AnimatePresence>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-sage-green mb-8 font-semibold"
        >
          Welcome to Consultify
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="w-full max-w-md"
      >
        <div className="grid grid-cols-2 gap-3 mb-8">
          {languages.map((language) => (
            <motion.button
              key={language.code}
              onClick={() => setSelectedLanguage(language.code)}
              className={`p-3 rounded-lg border-2 transition-all font-medium ${selectedLanguage === language.code
                  ? "border-forest-green bg-forest-green/10 text-forest-green"
                  : "border-sage-green/30 bg-white text-sage-green hover:border-sage-green"
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-semibold">{language.name}</div>
              <div className="text-xs opacity-70">{language.greeting}</div>
            </motion.button>
          ))}
        </div>

        <Button
          onClick={() => onNext(selectedLanguage)}
          className="w-full bg-forest-green hover:bg-sage-green text-cream font-semibold transition-all duration-300"
          size="lg"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  )
}

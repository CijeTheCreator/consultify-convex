"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithEmail, signUpWithEmail } from "@/lib/auth"

interface AuthFormProps {
  onAuthSuccess: () => void
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = isSignUp ? await signUpWithEmail(email, password, name) : await signInWithEmail(email, password)

      if (error) {
        setError(error.message)
      } else {
        onAuthSuccess()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-olive-green/10 to-sage-green/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-sage-green/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-forest-green">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-sage-green font-medium">{isSignUp ? "Join Consultify today" : "Sign in to your account"}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-forest-green mb-1">Full Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="border-sage-green/30 focus:border-forest-green focus:ring-forest-green"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-forest-green mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="border-sage-green/30 focus:border-forest-green focus:ring-forest-green"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-green mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                className="border-sage-green/30 focus:border-forest-green focus:ring-forest-green"
              />
            </div>

            {error && <div className="text-red-600 text-sm text-center font-medium">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-forest-green hover:bg-sage-green text-cream font-semibold transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sage-green hover:text-forest-green text-sm font-medium transition-colors"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

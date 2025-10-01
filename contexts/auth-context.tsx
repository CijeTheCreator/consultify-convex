"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  session: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const session = await authClient.getSession()
        console.log('Initial session:', session)
        setSession(session.data)
        setUser(session.data?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    let unsubscribeFunction: (() => void) | null = null
    
    const setupListener = async () => {
      try {
        unsubscribeFunction = await authClient.onSessionChange((session) => {
          console.log('Session changed:', session)
          setSession(session)
          setUser(session?.user ?? null)
        })
      } catch (error) {
        console.error('Error setting up session listener:', error)
      }
    }
    
    setupListener()

    return () => {
      if (unsubscribeFunction && typeof unsubscribeFunction === 'function') {
        unsubscribeFunction()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('Signing in with email:', email)
    const { data, error } = await authClient.signIn.email({
      email,
      password
    })
    
    if (error) {
      console.error('Sign in error:', error)
      throw new Error(error.message)
    }
    
    console.log('Sign in successful:', data)
    
    // Update local state immediately with the returned user
    if (data?.user) {
      setUser(data.user)
      setSession(data.session)
      
      // Redirect only after successful sign in
      router.push('/auth/success')
    }
    
    return data
  }

  const signUp = async (email: string, password: string, name?: string) => {
    console.log('Signing up with email:', email)
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name
    })
    
    if (error) {
      console.error('Sign up error:', error)
      throw new Error(error.message)
    }
    
    console.log('Sign up successful:', data)
    
    // Update local state and redirect if user is immediately logged in
    if (data?.user) {
      setUser(data.user)
      setSession(data.session)
      
      // Redirect only after successful sign up
      router.push('/auth/success')
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await authClient.signOut()
    if (error) throw new Error(error.message)
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
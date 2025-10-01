"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import Navbar from "./navbar"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { User } from "@/lib/types"

export default function NavbarWrapper() {
  const [dbUser, setDbUser] = useState<User | null>(null)
  const { user: supabaseUser, signOut, loading } = useAuth()

  // Use Convex to get user profile
  const userProfile = useQuery(api.users.getUserByEmail,
    supabaseUser?.email ? { email: supabaseUser.email } : "skip"
  )

  useEffect(() => {
    if (userProfile === undefined) return // Still loading

    if (!supabaseUser?.email || userProfile === null) {
      setDbUser(null)
      return
    }

    // Transform to match User interface
    const transformedUser: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      type: userProfile.type,
      language: userProfile.language,
      specialty: userProfile.specialty
    }

    setDbUser(transformedUser)
  }, [supabaseUser, userProfile])

  const handleSignOut = async () => {
    await signOut()
    setDbUser(null)
  }

  // Show loading state or return navbar with user data
  if (loading) {
    return <Navbar user={null} onSignOut={handleSignOut} />
  }

  return <Navbar user={dbUser} onSignOut={handleSignOut} />
}

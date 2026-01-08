// lib/auth/AuthContext.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Type User simplifié pour le template
interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      } else {
        const errorData = await response.json()
        console.error("Erreur de connexion:", errorData.error)
        return false
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      setUser(null)
      router.push("/login")
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


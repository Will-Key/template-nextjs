// components/auth/ProtectedRoute.tsx
"use client"

import React from "react"
import { useAuth } from "../../lib/auth/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  allowedRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/login",
  allowedRoles = [],
}) => {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Si l'authentification est requise mais l'utilisateur n'est pas connecté
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
        return
      }

      // Vérifier les rôles si spécifiés
      if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
        const userRole = user?.role
        if (!userRole || !allowedRoles.includes(userRole)) {
          router.push("/unauthorized")
          return
        }
      }
    }
  }, [
    user,
    loading,
    isAuthenticated,
    requireAuth,
    allowedRoles,
    router,
    redirectTo,
  ])

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return null // Le redirect se fait dans useEffect
  }

  // Vérifier les rôles
  if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
    const userRole = user?.role
    if (!userRole || !allowedRoles.includes(userRole)) {
      return null // Le redirect se fait dans useEffect
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

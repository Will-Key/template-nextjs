"use client"

import React, { useEffect } from "react"
import { useStaffAuth } from "@/lib/staff-auth-context"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/auth/LoginForm"

const LoginPage = () => {
  const { isAuthenticated, isLoading, staff } = useStaffAuth()
  const router = useRouter()

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, le rediriger vers le dashboard
    if (!isLoading && isAuthenticated && staff) {
      router.push(`/dashboard/${staff.restaurant.slug}`)
    }
  }, [isAuthenticated, isLoading, staff, router])

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Si l'utilisateur est déjà connecté, ne pas afficher le formulaire
  if (isAuthenticated && staff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return <LoginForm />
}

export default LoginPage

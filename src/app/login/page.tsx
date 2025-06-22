"use client"

import React, { useEffect } from "react"
import LoginForm from "../../components/auth/LoginForm"
import { useAuth } from "../../lib/auth/AuthContext"
import { useRouter } from "next/navigation"

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, le rediriger vers le dashboard
    if (!loading && isAuthenticated) {
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, loading, router])

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Si l'utilisateur est déjà connecté, ne pas afficher le formulaire
  if (isAuthenticated) {
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

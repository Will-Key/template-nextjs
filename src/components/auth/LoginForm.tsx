"use client"

import React, { useState, useCallback } from "react"
import { useAuth } from "../../lib/auth/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, Mail } from "lucide-react"

const LoginForm: React.FC = () => {
  const [personnelNumber, setPersonnelNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Éviter les soumissions multiples
      if (loading || isSubmitted) {
        return
      }

      setError("")
      setLoading(true)
      setIsSubmitted(true)

      console.log("Début de la soumission du formulaire")

      try {
        const success = await login(personnelNumber, password)
        console.log("Résultat du login:", success)

        if (success) {
          console.log("Login réussi, redirection...")
          // Ne pas réinitialiser les états ici pour éviter le flash
          router.push("/admin/dashboard")
        } else {
          console.log("Login échoué")
          setError("Email ou mot de passe incorrect")
          setLoading(false)
          setIsSubmitted(false)
        }
      } catch (error) {
        console.error("Erreur lors de la connexion:", error)

        let errorMessage = "Une erreur est survenue lors de la connexion"

        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === "string") {
          errorMessage = error
        }

        setError(errorMessage)
        setLoading(false)
        setIsSubmitted(false)
      }
      // Ne pas mettre finally ici pour éviter de réinitialiser loading prématurément
    },
    [personnelNumber, password, login, router, loading, isSubmitted]
  )

  // Debug pour voir les re-renders
  console.log(
    "LoginForm render - loading:",
    loading,
    "error:",
    error,
    "isSubmitted:",
    isSubmitted
  )

  return (
    <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/img07.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative max-w-md w-full space-y-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-10 rounded-xl shadow-2xl max-h-screen overflow-auto">
          <div className="space-y-8">
            <div>
              <Image
                src="/images/logoss.png"
                alt="SSISPRO Logo"
                width={20}
                height={20}
                className="mx-auto h-20 w-auto mb-4"
              />
            </div>
            <div>
              <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Espace SSISPRO
              </h1>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                Gérer le contenu du site et vos Agents.
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="personnelNumber" className="sr-only">
                    Matricule
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                    </div>
                    <input
                      id="personnelNumber"
                      name="personnelNumber"
                      type="text"
                      autoComplete="text"
                      required
                      disabled={loading}
                      className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-ssispro-orange focus:border-ssispro-orange sm:text-sm bg-white/80 dark:bg-gray-700/80 disabled:opacity-50"
                      placeholder="Numéro matricule"
                      value={personnelNumber}
                      onChange={(e) => setPersonnelNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-ssispro-orange focus:border-ssispro-orange sm:text-sm bg-white/80 dark:bg-gray-700/80 disabled:opacity-50"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Affichage de l'erreur */}
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || isSubmitted}
                  className="group relative w-full flex justify-center py-2 sm:py-2.5 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connexion...
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm

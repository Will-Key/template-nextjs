// components/auth/LoginForm.tsx
"use client"

import React, { useState } from "react"
import { useAuth } from "../../lib/auth/AuthContext"
import { useRouter } from "next/navigation"

import { Lock, Mail } from "lucide-react"

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/admin/dashboard")
      } else {
        setError("Email ou mot de passe incorrect")
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/img07.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative max-w-md w-full space-y-8">
        <div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-10 rounded-xl shadow-2xl max-h-screen overflow-auto"
        >
          <div className="space-y-8">
            <div>
              <img
                className="mx-auto h-20 w-auto mb-4"
                src="/images/logoss.png"
                alt="SSISPRO Logo"
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
              <div className=" space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-ssispro-orange focus:border-ssispro-orange sm:text-sm bg-white/80 dark:bg-gray-700/80"
                      placeholder="Adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-ssispro-orange focus:border-ssispro-orange sm:text-sm bg-white/80 dark:bg-gray-700/80"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 sm:py-2.5 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Connexion..." : "Se connecter"}
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

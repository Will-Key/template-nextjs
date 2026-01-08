"use client"

import { useAuth } from "@/lib/auth/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          Se déconnecter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>Informations de votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nom:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rôle:</strong> {user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Raccourcis fréquemment utilisés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              📊 Voir les statistiques
            </Button>
            <Button variant="outline" className="w-full justify-start">
              👥 Gérer les utilisateurs
            </Button>
            <Button variant="outline" className="w-full justify-start">
              ⚙️ Paramètres
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>Aperçu de votre activité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dernière connexion</p>
                <p className="text-sm">Maintenant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

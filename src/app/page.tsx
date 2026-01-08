import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Next.js Template
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Un template moderne avec Next.js 15, Prisma, Shadcn/UI, et authentification JWT.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>

        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🚀 Next.js 15</h3>
            <p className="text-sm text-muted-foreground">
              App Router, Server Components, Turbopack
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🗄️ Prisma ORM</h3>
            <p className="text-sm text-muted-foreground">
              PostgreSQL, migrations, type-safe queries
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🎨 Shadcn/UI</h3>
            <p className="text-sm text-muted-foreground">
              Composants accessibles, Tailwind CSS v4
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🔐 Auth JWT</h3>
            <p className="text-sm text-muted-foreground">
              Authentification sécurisée par cookies HTTP-only
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🌙 Dark Mode</h3>
            <p className="text-sm text-muted-foreground">
              Support du thème sombre avec next-themes
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">📝 TypeScript</h3>
            <p className="text-sm text-muted-foreground">
              Type-safe, ESLint configuré
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

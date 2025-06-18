// lib/middleware.ts
import { NextResponse } from 'next/server'
import { verifyAuth } from './auth/verifyAuth'


export function withAuth(handler: (req: Request, user: any) => Promise<NextResponse>) {
  return async (req: Request) => {
    try {
      const user = await verifyAuth(req)
      return await handler(req, user)
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error)
      return NextResponse.json(
        { error: error.message || 'Erreur d\'authentification' },
        { status: error.status || 401 }
      )
    }
  }
}
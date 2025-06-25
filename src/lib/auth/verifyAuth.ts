// lib/auth.ts
import jwt from 'jsonwebtoken'
import { AuthError, JWTPayload } from '@/lib/types/auth'
import { NextRequest } from 'next/server'

export async function verifyAuth(request: NextRequest): Promise<JWTPayload> {
  let token: string | null = null;
  console.log('verifyAuth', request)
  // 1. Chercher d'abord dans le header Authorization
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '')
  }

  // 2. Si pas trouvé, chercher dans les cookies
  if (!token) {
    token = request.cookies.get('auth-token')?.value || null
  }

  // 3. Si toujours pas trouvé, erreur
  if (!token) {
    const error: AuthError = new Error('Token d\'authentification manquant')
    error.status = 401
    throw error
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return decoded
  } catch (jwtError) {
    console.error('Erreur JWT:', jwtError)
    const error: AuthError = new Error('Token invalide')
    error.status = 401
    throw error
  }
}
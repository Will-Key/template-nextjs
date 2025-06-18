// lib/auth.ts
import jwt from 'jsonwebtoken'
import { AuthError, JWTPayload } from '@/lib/types/auth'


export async function verifyAuth(request: Request): Promise<JWTPayload> {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error: AuthError = new Error('Token d\'authentification manquant')
    error.status = 401
    throw error
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    
    // Vérification de l'expiration (optionnel, jwt.verify le fait déjà)
    // if (decoded.exp < Date.now() / 1000) {
    //   const error: AuthError = new Error('Token expiré')
    //   error.status = 401
    //   throw error
    // }

    return decoded
  } catch (jwtError) {
    const error: AuthError = new Error('Token invalide')
    error.status = 401
    throw error
  }
}
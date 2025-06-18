// lib/middleware.ts - Version avec types complets
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from './auth/verifyAuth'
import { Role } from '@prisma/client'

// Types pour les utilisateurs
export interface AuthUser {
  userId: string
  email: string
  role: Role
  name?: string
}

// Types pour les handlers
export type AuthenticatedHandler<T = any> = (
  req: NextRequest,
  context: { params: T },
  user: AuthUser
) => Promise<NextResponse>

export type SimpleAuthenticatedHandler = (
  req: NextRequest,
  user: AuthUser
) => Promise<NextResponse>

// Middleware principal avec types génériques
export function withAuth<T = any>(handler: AuthenticatedHandler<T>) {
  return async (req: NextRequest, context: { params: T }): Promise<NextResponse> => {
    try {
      const user = await verifyAuth(req) as AuthUser
      return await handler(req, context, user)
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error)
      return NextResponse.json(
        { error: error.message || 'Erreur d\'authentification' },
        { status: error.status || 401 }
      )
    }
  }
}

// Middleware pour routes simples
export function withAuthSimple(handler: SimpleAuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const user = await verifyAuth(req) as AuthUser
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

// Middleware avec vérification de rôle
export function withAuthAndRole<T = any>(
  requiredRoles: AuthUser['role'] | AuthUser['role'][]
) {
  return function(handler: AuthenticatedHandler<T>) {
    return async (req: NextRequest, context: { params: T }): Promise<NextResponse> => {
      try {
        const user = await verifyAuth(req) as AuthUser
        
        const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
        
        if (!allowedRoles.includes(user.role) && user.role !== 'admin' && user.role !== "super_admin") {
          return NextResponse.json(
            { error: 'Accès non autorisé pour ce rôle' },
            { status: 403 }
          )
        }
        
        return await handler(req, context, user)
      } catch (error: any) {
        console.error('Erreur d\'authentification:', error)
        return NextResponse.json(
          { error: error.message || 'Erreur d\'authentification' },
          { status: error.status || 401 }
        )
      }
    }
  }
}

// Middleware avec vérification de rôle pour routes simples
export function withAuthAndRoleSimple(
  requiredRoles: AuthUser['role'] | AuthUser['role'][]
) {
  return function(handler: SimpleAuthenticatedHandler) {
    return async (req: NextRequest): Promise<NextResponse> => {
      try {
        const user = await verifyAuth(req) as AuthUser
        
        const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
        
        if (!allowedRoles.includes(user.role) && user.role !== "admin" && user.role !== "super_admin") {
          return NextResponse.json(
            { error: 'Accès non autorisé pour ce rôle' },
            { status: 403 }
          )
        }
        
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
}
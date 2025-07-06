// lib/middleware.ts - Version avec CORS et authentification
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from './auth/verifyAuth'
import { AuthUser } from './types/auth'

// Configuration CORS
interface CorsOptions {
  origin?: string | string[]
  methods?: string[]
  allowedHeaders?: string[]
  credentials?: boolean
}

const DEFAULT_CORS_OPTIONS: CorsOptions = {
  origin: '*', // À modifier selon vos besoins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

// Fonction utilitaire pour ajouter les headers CORS
function addCorsHeaders(response: NextResponse, options: CorsOptions = DEFAULT_CORS_OPTIONS): NextResponse {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = true
  } = options
  // Gérer les origines multiples
  if (Array.isArray(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin.join(', '))
  } else {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
  
  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}

// Fonction pour gérer les requêtes preflight OPTIONS
function handlePreflight(req: NextRequest, corsOptions: CorsOptions = DEFAULT_CORS_OPTIONS): NextResponse {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response, corsOptions)
}

// Types pour les handlers - Updated for Next.js 15 compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AuthenticatedHandler<T = any> = (
  req: NextRequest,
  context: { params: T },
  user: AuthUser
) => Promise<NextResponse>

export type SimpleAuthenticatedHandler = (
  req: NextRequest,
  user: AuthUser
) => Promise<NextResponse>

// Type pour les route handlers Next.js - Compatible avec Next.js 15
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NextRouteHandler<T = any> = (
  req: NextRequest,
  context: { params: T }
) => Promise<NextResponse>


// Middleware principal avec CORS et authentification - FIXED
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuth<T = any>(
  handler: AuthenticatedHandler<T>,
  corsOptions: CorsOptions = DEFAULT_CORS_OPTIONS
): NextRouteHandler<T> {
  return async (req: NextRequest, context: { params: T }): Promise<NextResponse> => {
    try {
      // Gérer les requêtes preflight OPTIONS
      if (req.method === 'OPTIONS') {
        return handlePreflight(req, corsOptions)
      }
      
      const user = await verifyAuth(req) as AuthUser
      const response = await handler(req, context, user)
      return addCorsHeaders(response, corsOptions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error)
      const errorResponse = NextResponse.json(
        { error: error.message || 'Erreur d\'authentification' },
        { status: error.status || 401 }
      )
      return addCorsHeaders(errorResponse, corsOptions)
    }
  }
}

// Middleware pour routes simples avec CORS
export function withAuthSimple(
  handler: SimpleAuthenticatedHandler,
  corsOptions: CorsOptions = DEFAULT_CORS_OPTIONS
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Gérer les requêtes preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return handlePreflight(req, corsOptions)
    }

    try {
      const user = await verifyAuth(req) as AuthUser
      const response = await handler(req, user)
      return addCorsHeaders(response, corsOptions)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error)
      const errorResponse = NextResponse.json(
        { error: error.message || 'Erreur d\'authentification' },
        { status: error.status || 401 }
      )
      return addCorsHeaders(errorResponse, corsOptions)
    }
  }
}

// Middleware avec vérification de rôle et CORS - FIXED
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuthAndRole<T = any>(
  requiredRoles: AuthUser['role'] | AuthUser['role'][],
  corsOptions: CorsOptions = DEFAULT_CORS_OPTIONS
) {
  return function(handler: AuthenticatedHandler<T>): NextRouteHandler<T> {
    return async (req: NextRequest, context: { params: T }): Promise<NextResponse> => {
      // Gérer les requêtes preflight OPTIONS
      if (req.method === 'OPTIONS') {
        return handlePreflight(req, corsOptions)
      }

      try {
        const user = await verifyAuth(req) as AuthUser
        
        const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
        
        if (!allowedRoles.includes(user.role) && user.role !== 'admin' && user.role !== "super_admin") {
          const forbiddenResponse = NextResponse.json(
            { error: 'Accès non autorisé pour ce rôle' },
            { status: 403 }
          )
          return addCorsHeaders(forbiddenResponse, corsOptions)
        }
        
        const response = await handler(req, context, user)
        return addCorsHeaders(response, corsOptions)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Erreur d\'authentification:', error)
        const errorResponse = NextResponse.json(
          { error: error.message || 'Erreur d\'authentification' },
          { status: error.status || 401 }
        )
        return addCorsHeaders(errorResponse, corsOptions)
      }
    }
  }
}

// Middleware avec vérification de rôle pour routes simples et CORS - FIXED
export function withAuthAndRoleSimple(
  requiredRoles: AuthUser['role'] | AuthUser['role'][],
  corsOptions: CorsOptions = DEFAULT_CORS_OPTIONS
) {
  return function(handler: SimpleAuthenticatedHandler): (req: NextRequest) => Promise<NextResponse> {
    return async (req: NextRequest): Promise<NextResponse> => {
      // Gérer les requêtes preflight OPTIONS
      if (req.method === 'OPTIONS') {
        return handlePreflight(req, corsOptions)
      }

      try {
        const user = await verifyAuth(req) as AuthUser
        
        const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
        
        if (!allowedRoles.includes(user.role) && user.role !== "admin" && user.role !== "super_admin") {
          const forbiddenResponse = NextResponse.json(
            { error: 'Accès non autorisé pour ce rôle' },
            { status: 403 }
          )
          return addCorsHeaders(forbiddenResponse, corsOptions)
        }
        
        const response = await handler(req, user)
        return addCorsHeaders(response, corsOptions)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Erreur d\'authentification:', error)
        const errorResponse = NextResponse.json(
          { error: error.message || 'Erreur d\'authentification' },
          { status: error.status || 401 }
        )
        return addCorsHeaders(errorResponse, corsOptions)
      }
    }
  }
}

// Middleware pour routes publiques avec CORS uniquement - FIXED
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withCors<T = any>(
  handler: (req: NextRequest, context: { params: T }) => Promise<NextResponse>,
  corsOptions: CorsOptions = DEFAULT_CORS_OPTIONS
): NextRouteHandler<T> {
  return async (req: NextRequest, context: { params: T }): Promise<NextResponse> => {
    // Gérer les requêtes preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return handlePreflight(req, corsOptions)
    }

    try {
      const response = await handler(req, context)
      return addCorsHeaders(response, corsOptions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Erreur dans le handler:', error)
      const errorResponse = NextResponse.json(
        { error: error.message || 'Erreur serveur' },
        { status: error.status || 500 }
      )
      return addCorsHeaders(errorResponse, corsOptions)
    }
  }
}

// Middleware pour routes publiques simples avec CORS uniquement - FIXED
export function withCorsSimple(
  handler: (req: NextRequest) => Promise<NextResponse>,
  corsOptions: CorsOptions = DEFAULT_CORS_OPTIONS
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Gérer les requêtes preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return handlePreflight(req, corsOptions)
    }

    try {
      const response = await handler(req)
      return addCorsHeaders(response, corsOptions)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Erreur dans le handler:', error)
      const errorResponse = NextResponse.json(
        { error: error.message || 'Erreur serveur' },
        { status: error.status || 500 }
      )
      return addCorsHeaders(errorResponse, corsOptions)
    }
  }
}

// Configuration CORS prédéfinie pour différents environnements
export const CORS_CONFIG = {
  // Développement - Permissif
  development: {
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true
  },
  
  // Production - Restrictif
  production: {
    origin: ['https://votre-domaine.com', 'https://app.votre-domaine.com'],
    credentials: true
  },
  
  // Public - Ouvert mais sans credentials
  public: {
    origin: '*',
    credentials: false
  }
} as const
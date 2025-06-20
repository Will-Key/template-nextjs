import { Role } from "@prisma/client"

export interface AuthError extends Error {
  status?: number
}

export interface JWTPayload {
  userId: string
  email: string
  role?: string
  exp: number
  iat: number
}

export interface AuthUser {
  userId: string
  email: string
  role: Role
  name?: string
}
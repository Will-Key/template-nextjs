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
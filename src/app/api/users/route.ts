// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { withAuthSimple } from '@/lib/middleware'
import prisma from '@/lib/prisma'
import { AuthUser } from '@/lib/types/auth'
import bcrypt from 'bcryptjs'

// GET - Liste tous les utilisateurs (protégé)
async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Crée un nouvel utilisateur (protégé, admin seulement)
async function createUser(req: Request, user: AuthUser) {
  try {
    // Vérifier si l'utilisateur est admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, password, name, role } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, mot de passe et nom sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'user',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export const GET = withAuthSimple(getUsers)
export const POST = withAuthSimple(createUser)

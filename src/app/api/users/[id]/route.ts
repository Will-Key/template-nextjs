// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import prisma from '@/lib/prisma'
import { AuthUser } from '@/lib/types/auth'
import bcrypt from 'bcryptjs'

type Params = Promise<{ id: string }>

// GET - Récupère un utilisateur par ID
async function getUser(
  _req: NextRequest, 
  context: { params: Params }
) {
  try {
    const { id } = await context.params
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Met à jour un utilisateur
async function updateUser(
  req: NextRequest, 
  context: { params: Params },
  authUser: AuthUser
) {
  try {
    const { id } = await context.params
    
    // Seul l'admin ou l'utilisateur lui-même peut modifier
    if (authUser.role !== 'admin' && authUser.userId !== id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, email, password, role, isActive } = body

    // Préparer les données de mise à jour
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.password = await bcrypt.hash(password, 10)
    
    // Seul l'admin peut changer le rôle et le statut
    if (authUser.role === 'admin') {
      if (role) updateData.role = role
      if (typeof isActive === 'boolean') updateData.isActive = isActive
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprime un utilisateur (admin seulement)
async function deleteUser(
  _req: NextRequest, 
  context: { params: Params },
  authUser: AuthUser
) {
  try {
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: 'Utilisateur supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getUser)
export const PUT = withAuth(updateUser)
export const DELETE = withAuth(deleteUser)

// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuthSimple } from '@/lib/middleware'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getMeHandler(req: NextRequest, user: any) {
  try {
    // Récupérer les informations complètes de l'utilisateur
    const fullUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        // Exclure le password
      }
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: fullUser
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export const GET = withAuthSimple(getMeHandler)
import { verifyAuth } from '@/lib/auth/verifyAuth'
import { withAuth, withAuthSimple } from '@/lib/middleware'
import { PrismaClient, Role, User } from '@prisma/client'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const GET = withAuthSimple(async() => {
  try {
    const users = await prisma.user.findMany({
      where: { 
        role: { 
          not: Role.super_admin 
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true
      },
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, _, { userId }) => {
  try {    
    const body: User = await req.json();
    const { name, email, password, role, status } = body;

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, status, createdById: userId },
    });

    return NextResponse.json(user);
  } catch (dbError) {
    console.error('Erreur base de données:', dbError)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
})
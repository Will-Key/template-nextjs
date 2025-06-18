import { verifyAuth } from '@/lib/auth/verifyAuth'
import { withAuth } from '@/lib/middleware'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const formations = await prisma.formation.findMany()
    return NextResponse.json(formations)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const POST = withAuth(async (req) => {
  try {
    await verifyAuth(req)
    
    const body = await req.json();
    const { label, description, days, maxParticipants, amount, modules } = body;

    const formation = await prisma.formation.create({
      data: { label, description, days, maxParticipants, amount, modules },
    });

    return NextResponse.json(formation);
  } catch (dbError) {
    console.error('Erreur base de données:', dbError)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
})
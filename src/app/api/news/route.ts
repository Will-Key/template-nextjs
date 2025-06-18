import { withAuth } from '@/lib/middleware'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const news = await prisma.news.findMany()
    return NextResponse.json(news)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const POST = withAuth(async (req) => {
  const body = await req.json()
  const { label, type, description, content, eventDate } = body
  
  const news = await prisma.news.create({
    data: { label, type, description, content, eventDate }
  })

  return NextResponse.json(news)
})
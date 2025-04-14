import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const body = await request.json()

  const { label, description } = body

  if (!label || !description) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const newService = await prisma.service.create({
    data: {
      label,
      description,
    },
  })

  return NextResponse.json(newService, { status: 201 })
}

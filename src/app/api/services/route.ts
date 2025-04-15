import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// export async function POST(request: Request) {
//   const body = await request.json()

//   const { label, description } = body

//   if (!label || !description) {
//     return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
//   }

//   const newService = await prisma.service.create({
//     data: {
//       label,
//       description,
//     },
//   })

//   return NextResponse.json(newService, { status: 201 })
// }

export async function GET() {
  try {
    const services = await prisma.service.findMany()
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { label, description } = body

    const service = await prisma.service.create({
      data: { label, description },
    })

    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}
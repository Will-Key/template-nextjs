import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET /api/services/[id]
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const service = await prisma.service.findUnique({ where: { id } })

  if (!service) {
    return NextResponse.json({ error: 'Service non trouvé' }, { status: 404 })
  }

  return NextResponse.json(service)
}

// PUT /api/services/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const body = await req.json()
  const { label, description } = body

  try {
    const updated = await prisma.service.update({
      where: { id },
      data: { label, description },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// DELETE /api/services/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  try {
    await prisma.service.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}

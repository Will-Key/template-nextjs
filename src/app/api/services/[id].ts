import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest,
  res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    const post = await prisma.service.findUnique({ where: { id: Number(id) } })
    return res.status(200).json(post)
  }

  if (req.method === 'PUT') {
    const { label, description } = req.body
    const updated = await prisma.service.update({
      where: { id: Number(id) },
      data: { label, description },
    })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.service.delete({ where: { id: Number(id) } })
    return res.status(204).end()
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

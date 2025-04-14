import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest,
  res: NextApiResponse) {
  if (req.method === 'GET') {
    const posts = await prisma.service.findMany()
    return res.status(200).json(posts)
  }

  if (req.method === 'POST') {
    const { label, description } = req.body
    const newPost = await prisma.service.create({
      data: { label, description },
    })
    return res.status(201).json(newPost)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

import { CORS_CONFIG, withAuth, withCors } from '@/lib/middleware'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { v2 as cloudinary} from 'cloudinary'

const prisma = new PrismaClient()

export const GET = withCors(async() => {
  try {
    const news = await prisma.news.findMany()
    return NextResponse.json(news)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}, CORS_CONFIG.public)

export const POST = withAuth(async (req) => {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json()
      const { label, type, description, content, eventDate } = body

      const news = await prisma.news.create({
        data: { label, type, description, content, eventDate }
      })

      return NextResponse.json(news)
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const label = formData.get("label")?.toString() || ""
      const type = formData.get("type")?.toString() || ""
      const description = formData.get("description")?.toString() || ""
      const eventDate = new Date(formData.get("eventDate")?.toString() || "")
      const content = formData.get("content")?.toString() || ""
      const file = formData.get("image") as File | null

      let imageUrl: string | undefined = undefined
      let publicId: string | undefined = undefined

      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer())

        const uploadToCloudinary = async (buffer: Buffer): Promise<{secure_url: string, public_id: string}> => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "services" },
              (error, result) => {
                if (error) return reject(error);
                resolve({secure_url: result?.secure_url || "", public_id: result?.public_id || ""});
              }
            );
            stream.end(buffer);
          });
        };

        imageUrl = (await uploadToCloudinary(buffer)).secure_url;
        publicId = (await uploadToCloudinary(buffer)).public_id
      }

      if (!label || !description || !type || !eventDate) {
        return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
      }

      const news = await prisma.news.create({
        data: {
          label,
          type,
          description,
          content,
          eventDate,
          image: imageUrl,
          imagePublicId: publicId,
        },
      })

      return NextResponse.json(news, { status: 201 })
    }

    return NextResponse.json({ error: "Type de contenu non supporté" }, { status: 415 })

  } catch (error: any) {
    console.error("POST error:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
})

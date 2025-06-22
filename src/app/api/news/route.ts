import { CORS_CONFIG, withAuth, withCors } from '@/lib/middleware'
import { PrismaClient } from '@prisma/client'
import { writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export const GET = withCors(async() => {
  try {
    const news = await prisma.news.findMany()
    return NextResponse.json(news)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}, CORS_CONFIG.public)

export const POST = withAuth(async (req) => {
  try {
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      // 🔹 Mode JSON simple (sans image)
      const body = await req.json()
      const { label, type, description, content, eventDate } = body
      
      const news = await prisma.news.create({
        data: { label, type, description, content, eventDate }
      })

      return NextResponse.json(news)
    }

    if (contentType.includes("multipart/form-data")) {
      // 🔹 Mode FormData (avec image)
      const formData = await req.formData();
      const label = formData.get("label")?.toString() || "";
      const type = formData.get("type")?.toString() || "";
      const description = formData.get("description")?.toString() || "";
      const eventDate = new Date(formData.get("eventDate")?.toString() || "");
      const content = formData.get("content")?.toString() || "";
      const file = formData.get("image") as File;

      let imagePath: string | undefined = undefined
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${Date.now()}-${file.name}`
        const filepath = path.join(process.cwd(), "public", "uploads", filename)
        await writeFile(filepath, buffer)
        imagePath = `/uploads/${filename}`
      }

      if (!label || !description || !type || !eventDate) {
        return NextResponse.json(
          { error: "Champs requis manquants" },
          { status: 400 }
        );
      }

      const news = await prisma.news.create({
        data: {
          label,
          type,
          description,
          content,
          eventDate,
          image: imagePath,
        },
      });

      return NextResponse.json(news, { status: 201 });
    }

    return NextResponse.json(
      { error: "Type de contenu non supporté" },
      { status: 415 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
})
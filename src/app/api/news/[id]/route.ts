import {  NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth } from "@/lib/middleware"
import { writeFile } from "fs/promises"
import path from "path"
import fs from 'fs'

const prisma = new PrismaClient();

interface NewsParams {
  id: string
}

export const GET = withAuth<NewsParams>(async (_, { params }) => {
  try {
    const news = await prisma.news.findUnique({
      where: { id: Number(params.id) },
    });

    if (!news) {
      return NextResponse.json({ error: "Actualité introuvable" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
})

export const PUT = withAuth<NewsParams>(async (req, { params }) => {
  try {
    const contentType = req.headers.get("content-type") || ""
    // Check if it's a multipart request by checking if it starts with multipart/form-data
    // This is more reliable than using .includes()
    if (!contentType.includes("multipart/form-data")) {
      console.log("Content type mismatch. Expected multipart/form-data, got:", contentType)
      return NextResponse.json(
        { error: `Content-Type must be multipart/form-data, received: ${contentType}` },
        { status: 415 }
      )
    }
    
    try {
      const contentType = req.headers.get("content-type") || ""
      
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
        const formData = await req.formData()
        const label = formData.get("label")?.toString() || ""
        const type = formData.get("type")?.toString() || ""
        const description = formData.get("description")?.toString() || ""
        const eventDate = new Date(formData.get("eventDate")?.toString() || "")
        const content = formData.get("content")?.toString() || ""
        const file = formData.get("image") as File | null
              
        let imagePath: string | undefined = undefined
  
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const filename = `${Date.now()}-${file.name}`
          const filepath = path.join(process.cwd(), "public", "uploads", filename)
          await writeFile(filepath, buffer)
          imagePath = `/uploads/${filename}`
        }
  
        if (!label || !type || !description || !eventDate ) {
          return NextResponse.json(
            { error: "Champs requis manquants" },
            { status: 400 }
          )
        }
  
        const updatedService = await prisma.news.update({
          where: { id: Number(params.id) },
          data: {
            label,
            type,
            description,
            content,
            eventDate,
            ...(imagePath && { image: imagePath }),
          },
        })
    
        return NextResponse.json(updatedService)
      }
  
      return NextResponse.json(
        { error: "Type de contenu non supporté" },
        { status: 415 }
      )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (formError: any) {
      return NextResponse.json(
        { error: "Error processing form data: " + (formError?.message || "Unknown error") },
        { status: 400 }
      )
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
})

export const DELETE = withAuth<NewsParams>(async (_, { params }) => {
  try {
    const news = await prisma.news.delete({
      where: { id: Number((await params).id) },
    });

    // Supprimer le fichier physique
    if (news.image) {
      console.log('news.image', news.image)
      // Le fichier est maintenant stocké avec son extension
      const filePath = path.join(process.cwd(), "public", news.image);
      
      try {
        fs.access(filePath, () => {});
        fs.unlink(filePath, () => { });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (fileError: any) {
        if (fileError.code === 'ENOENT') {
          console.warn(`Fichier non trouvé: ${filePath}`);
          return NextResponse.json(
            { error: "Fichier non trouvé" },
            { status: 400 }
          );
        } else {
          console.error('Erreur lors de la suppression du fichier:', fileError);
          return NextResponse.json(
            { error: 'Erreur lors de la suppression du fichier:', fileError },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.json({ message: "Actualité supprimé", news });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
})
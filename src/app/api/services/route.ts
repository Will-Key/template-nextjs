import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient()

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
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // 🔹 Mode JSON simple (sans image)
      const body = await req.json();
      const { label, description, content } = body;

      const service = await prisma.service.create({
        data: { label, description, content },
      });

      return NextResponse.json(service);
    }

    if (contentType.includes("multipart/form-data")) {
      // 🔹 Mode FormData (avec image)
      const formData = await req.formData();
      console.log('formData', formData)
      const label = formData.get("label")?.toString() || "";
      const description = formData.get("description")?.toString() || "";
      const content = formData.get("content")?.toString().split(',') || [];
      const file = formData.get("image") as File | null;

      if (!label || !description || !file) {
        return NextResponse.json(
          { error: "Champs requis manquants" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const filepath = path.join(process.cwd(), "public", "uploads", filename);
      await writeFile(filepath, buffer);

      const service = await prisma.service.create({
        data: {
          label,
          description,
          content,
          image: `/uploads/${filename}`,
        },
      });

      return NextResponse.json(service, { status: 201 });
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
}
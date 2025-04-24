import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { writeFile, unlink } from "fs/promises";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: Number(params.id) },
    });

    if (!service) {
      return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const label = formData.get("label")?.toString() || "";
      const description = formData.get("description")?.toString() || "";
      const file = formData.get("image") as File | null;

      let imagePath;

      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name}`;
        const filepath = path.join(process.cwd(), "public", "uploads", filename);
        await writeFile(filepath, buffer);
        imagePath = `/uploads/${filename}`;
      }

      const updatedService = await prisma.service.update({
        where: { id: Number(params.id) },
        data: {
          label,
          description,
          ...(imagePath && { image: imagePath }),
        },
      });

      return NextResponse.json(updatedService);
    }

    return NextResponse.json(
      { error: "Type de contenu non supporté" },
      { status: 415 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.delete({
      where: { id: Number((params.id)) },
    });

    return NextResponse.json({ message: "Service supprimé", service });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}

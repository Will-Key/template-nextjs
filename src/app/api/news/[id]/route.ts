import {  NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth, withCors } from "@/lib/middleware"
import { v2 as cloudinary} from 'cloudinary'

const prisma = new PrismaClient();

export const GET = withCors(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
    const { id } = context.params;
    try {
      const news = await prisma.news.findUnique({
        where: { id: Number(id) },
      });

      if (!news) {
        return NextResponse.json({ error: "Actualité introuvable" }, { status: 404 });
      }

      return NextResponse.json(news);
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PUT = withAuth(async (req: NextRequest, context: any) => {
  const { id } = context.params;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: `Content-Type must be multipart/form-data, received: ${contentType}` },
        { status: 415 }
      );
    }

    const formData = await req.formData();
    const label = formData.get("label")?.toString() || "";
    const type = formData.get("type")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const eventDate = new Date(formData.get("eventDate")?.toString() || "");
    const content = formData.get("content")?.toString() || "";
    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined;
    let publicId: string | undefined;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

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

      // Supprimer l'ancienne image si elle existe
      const old = await prisma.news.findUnique({ where: { id: Number(id) } });
      if (old?.imagePublicId) {
        await cloudinary.uploader.destroy(old.imagePublicId);
      }
    }

    if (!label || !type || !description || !eventDate) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const updatedNews = await prisma.news.update({
      where: { id: Number(id) },
      data: {
        label,
        type,
        description,
        content,
        eventDate,
        ...(imageUrl && { image: imageUrl }),
        ...(publicId && { imagePublicId: publicId }),
      },
    });

    return NextResponse.json(updatedNews);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'actualité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour: " + error?.message },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth(async (_req: NextRequest, context: any) => {
  const { id } = context.params;

  try {
    const news = await prisma.news.findUnique({
      where: { id: Number(id) },
    });

    if (!news) {
      return NextResponse.json({ error: "Actualité non trouvée" }, { status: 404 });
    }

    // Supprimer l'image sur Cloudinary
    if (news.imagePublicId) {
      await cloudinary.uploader.destroy(news.imagePublicId);
    }

    await prisma.news.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Actualité supprimée avec succès", news });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: "Erreur lors de la suppression " + error?.message }, { status: 500 });
  }
});

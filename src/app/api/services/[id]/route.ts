import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth, withCors } from "@/lib/middleware"
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dfsuc89b6",
  api_key: process.env.CLOUDINARY_API_KEY || "375989313918528",
  api_secret: process.env.CLOUDINARY_API_SECRET || "tbmD83oV0aMnZnEM65eAK3AEB0Y",
})

export const GET = withCors(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
    const { id } = context.params;
    try {
      const service = await prisma.service.findUnique({
        where: { id: Number(id) },
      });

      if (!service) {
        return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
      }

      return NextResponse.json(service);
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
        { error: `Content-Type must be multipart/form-data, reçu : ${contentType}` },
        { status: 415 }
      );
    }

    const formData = await req.formData();
    const label = formData.get("label")?.toString() || "";
    const description = formData.get("description")?.toString() || "";

    let content: string[] = [];
    const contentValue = formData.get("content");
    if (contentValue) {
      if (typeof contentValue === "string") {
        content = contentValue.split(',').filter(item => item.trim() !== "");
      } else if (Array.isArray(contentValue)) {
        content = contentValue.map(item => item.toString());
      }
    }

    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined = undefined;
    let publicId: string | undefined = undefined;

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
      publicId = (await uploadToCloudinary(buffer)).public_id;

      // 🔁 Supprimer ancienne image si présente
      const previous = await prisma.service.findUnique({ where: { id: Number(id) } });
      if (previous?.imagePublicId) {
        await cloudinary.uploader.destroy(previous.imagePublicId);
      }
    }

    const updatedService = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        label,
        description,
        content,
        ...(imageUrl && { image: imageUrl }),
        ...(publicId && { imagePublicId: publicId }),
      },
    });

    return NextResponse.json(updatedService);

  } catch (error) {
    console.error("Erreur lors de la mise à jour du service:", error);
    return NextResponse.json({ error: "Erreur mise à jour : " }, { status: 500 });
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth(async (_req: NextRequest, context: any) => {
  const { id } = context.params;

  try {
    const service = await prisma.service.findUnique({ where: { id: Number(id) } });

    if (!service) {
      return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
    }

    if (service.imagePublicId) {
      await cloudinary.uploader.destroy(service.imagePublicId);
    }

    await prisma.service.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Service supprimé", service });

  } catch (error) {
    console.error("Erreur lors de la suppression du service:", error);
    return NextResponse.json({ error: "Erreur suppression : " }, { status: 500 });
  }
});

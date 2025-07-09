import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { CORS_CONFIG, withAuth, withCors } from '@/lib/middleware'
import { v2 as cloudinary} from 'cloudinary'

const prisma = new PrismaClient()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dfsuc89b6",
  api_key: process.env.CLOUDINARY_API_KEY || "375989313918528",
  api_secret: process.env.CLOUDINARY_API_SECRET || "tbmD83oV0aMnZnEM65eAK3AEB0Y",
})

export const GET = withCors(async () => {
  try {
    const services = await prisma.service.findMany()
    return NextResponse.json(services)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur' + error?.message || "Unknown error" }, { status: 500 })
  }
}, CORS_CONFIG.public)

export const POST = withAuth(async (req: Request) => {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { label, description, content } = body;

      const service = await prisma.service.create({
        data: { label, description, content },
      });

      return NextResponse.json(service);
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const label = formData.get("label")?.toString() || "";
      const description = formData.get("description")?.toString() || "";
      const content = formData.get("content")?.toString().split(',') || [];
      const file = formData.get("image") as File | null;

      let imageUrl: string | undefined = undefined
      let publicId: string | undefined = undefined

      if (!label || !description || !file) {
        return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
      }

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

      const service = await prisma.service.create({
        data: {
          label,
          description,
          content,
          image: imageUrl,
          imagePublicId: publicId,
        },
      });

      return NextResponse.json(service, { status: 201 });
    }

    return NextResponse.json({ error: "Type de contenu non supporté" }, { status: 415 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création " + error.message }, { status: 500 });
  }
});

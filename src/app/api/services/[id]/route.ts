import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { writeFile } from "fs/promises";
import { withAuth } from "@/lib/middleware"

const prisma = new PrismaClient();

export const GET = withAuth(
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

export const PUT = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (req: NextRequest, context: any) => {
    const { id } = await context.params;
    try {
      const contentType = req.headers.get("content-type") || "";    
      // Check if it's a multipart request by checking if it starts with multipart/form-data
      // This is more reliable than using .includes()
      if (!contentType.includes("multipart/form-data")) {
        console.log("Content type mismatch. Expected multipart/form-data, got:", contentType);
        return NextResponse.json(
          { error: `Content-Type must be multipart/form-data, received: ${contentType}` },
          { status: 415 }
        );
      }
      
      try {
        const formData = await req.formData();
        
        const label = formData.get("label")?.toString() || "";
        const description = formData.get("description")?.toString() || "";
        
        // Handle content array properly
        let content: string[] = [];
        const contentValue = formData.get("content");
        
        if (contentValue) {
          if (typeof contentValue === "string") {
            content = contentValue.split(',').filter(item => item.trim() !== "");
          } else if (Array.isArray(contentValue)) {
            content = contentValue.map(item => item.toString());
          }
        }
              
        // Handle image file
        const file = formData.get("image") as File | null;
        
        let imagePath: string | undefined = undefined;

        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${file.name}`;
          const filepath = path.join(process.cwd(), "public", "uploads", filename);
          await writeFile(filepath, buffer);
          imagePath = `/uploads/${filename}`;
        }
        
        // Update the service in the database
        const updatedService = await prisma.service.update({
          where: { id: Number(id) },
          data: {
            label,
            description,
            content,
            ...(imagePath && { image: imagePath }),
          },
        });

        return NextResponse.json(updatedService);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (formError: any) {
        return NextResponse.json(
          { error: "Error processing form data: " + (formError?.message || "Unknown error") },
          { status: 400 }
        );
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour: " + (error?.message || "Unknown error") },
        { status: 500 }
      );
    }
  }
)

export const DELETE = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
  const { id } = context.params;
    try {
      console.log(_req.json())
      const service = await prisma.service.delete({
        where: { id: Number(id) },
      });

      return NextResponse.json({ message: "Service supprimé", service });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return NextResponse.json({ error: "Erreur suppression" + (error?.message || "Unknown error")}, { status: 500 });
    }
  }
)
import { verifyAuth } from "@/lib/auth/verifyAuth"
import { withAuthSimple } from "@/lib/middleware"
import { PrismaClient } from "@prisma/client"
import { writeFile } from "fs/promises"
import { NextResponse } from "next/server"
import path from "path"

const prisma = new PrismaClient()

export const GET = withAuthSimple(async (req) => {
  try {
    await verifyAuth(req)
    const docs = await prisma.docs.findMany({ include: { createdBy: true}})
    return NextResponse.json(docs)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
})

export const POST = withAuthSimple(async (req: Request, user) => {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // 🔹 Mode FormData (avec fichier)
      const formData = await req.formData();

      const name = formData.get("name")?.toString() || "";
      const file = formData.get("file") as File | null;

      if (!name || !file) {
        return NextResponse.json(
          { error: "Champs requis manquants" },
          { status: 400 }
        );
      }

      // 🔹 Récupérer l'extension du fichier original
      const originalExtension = path.extname(file.name);
      
      // 🔹 Créer un nom de fichier unique avec extension
      const timestamp = Date.now();
      const sanitizedName = name.replace(/[^a-zA-Z0-9\-_]/g, '_'); // Nettoyer le nom
      const filename = `${sanitizedName}_${timestamp}${originalExtension}`;
      
      // 🔹 Chemin complet du fichier
      const filepath = path.join(process.cwd(), "public", "uploads", "docs", filename);
      
      // 🔹 Écrire le fichier
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // 🔹 Sauvegarder en base avec le nom d'affichage et le nom de fichier
      const doc = await prisma.docs.create({
        data: {
          name, // Nom d'affichage
          filename, // Nom du fichier physique avec extension
          filePath: `/uploads/docs/${filename}`, // Chemin pour l'accès web
          originalName: file.name, // Nom original du fichier (optionnel)
          fileSize: file.size, // Taille du fichier (optionnel)
          mimeType: file.type, // Type MIME (optionnel)
          createdById: user.userId
        },
      });

      return NextResponse.json(doc, { status: 201 });
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
});

// 🔹 Fonction helper pour générer un nom de fichier sécurisé
function generateSecureFilename(originalName: string, displayName: string): string {
  const extension = path.extname(originalName);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedName = displayName
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .substring(0, 50); // Limiter la longueur
  
  return `${sanitizedName}_${timestamp}_${randomSuffix}${extension}`;
}

// 🔹 Version alternative avec fonction helper
export const POST_ALTERNATIVE = withAuthSimple(async (req: Request, user) => {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const name = formData.get("name")?.toString() || "";
      const file = formData.get("file") as File | null;

      if (!name || !file) {
        return NextResponse.json(
          { error: "Champs requis manquants" },
          { status: 400 }
        );
      }

      // Validation de l'extension
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
      const fileExtension = path.extname(file.name).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: `Extension non autorisée. Extensions acceptées: ${allowedExtensions.join(', ')}` },
          { status: 400 }
        );
      }

      // Validation de la taille (exemple: 10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "Fichier trop volumineux (max 10MB)" },
          { status: 400 }
        );
      }

      // Générer le nom de fichier sécurisé
      const filename = generateSecureFilename(file.name, name);
      const filepath = path.join(process.cwd(), "public", "uploads", "docs", filename);
      
      // Écrire le fichier
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      const doc = await prisma.docs.create({
        data: {
          name,
          filename,
          filePath: `/uploads/docs/${filename}`,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          createdById: user.userId
        },
      });

      return NextResponse.json(doc, { status: 201 });
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
});
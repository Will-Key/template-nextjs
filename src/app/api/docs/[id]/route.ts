import { withAuth } from "@/lib/middleware"
import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from 'fs'

const prisma = new PrismaClient()

export const DELETE = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
  try {
    const { id } = context.params;

    // Récupérer le document
    const doc = await prisma.docs.findUnique({ 
      where: { id: +id },
      select: { 
        id: true, 
        name: true, 
        filename: true, // Maintenant avec extension
        filePath: true 
      }
    });
    
    if (!doc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Supprimer le fichier physique
    if (doc.filename) {
      // Le fichier est maintenant stocké avec son extension
      const filePath = path.join(process.cwd(), "public", "uploads", "docs", doc.filename);
      
      try {
        fs.access(filePath, () => {});
        fs.unlink(filePath, () => { });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (fileError: any) {
        if (fileError.code === 'ENOENT') {
          console.warn(`Fichier non trouvé: ${filePath}`);
        } else {
          console.error('Erreur lors de la suppression du fichier:', fileError);
        }
      }
    }

    // Supprimer de la base de données
    await prisma.docs.delete({ where: { id: +id } });

    return NextResponse.json({ 
      message: 'Document supprimé avec succès',
      id: id 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
})
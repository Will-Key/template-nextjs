import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { withAuth } from '@/lib/middleware'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DocParams {
  id: string
}

export const GET = withAuth<DocParams>(async (_, { params }) => {
  try {
    const { id } = params;

    // Récupérer les informations du document depuis votre base de données
    // Remplacez cette partie par votre logique de récupération
    const doc = await getDocById(+id); // Votre fonction pour récupérer le doc

    if (!doc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Chemin vers le fichier (ajustez selon votre structure)
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'docs', doc.filename);

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
    }

    // Lire le fichier
    const fileBuffer = fs.readFileSync(filePath);
    
    // Déterminer le type MIME
    const mimeType = getMimeType(doc.filename);
    
    // Retourner le fichier avec les en-têtes appropriés
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${doc.name}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
})

// Fonction helper pour déterminer le type MIME
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Fonction exemple pour récupérer le document (à adapter selon votre ORM/base de données)
async function getDocById(id: number) {
  return await prisma.docs.findUnique({ where: { id }});
}
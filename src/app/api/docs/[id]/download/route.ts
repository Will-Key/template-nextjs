import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { withAuth } from '@/lib/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
    try {
      const { id } = context.params;

      // Récupérer les informations du document depuis votre base de données
      const doc = await getDocById(+id);

      if (!doc) {
        return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
      }

      const filePath = path.join(process.cwd(), 'public', 'uploads', 'docs', doc.filename);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = getMimeType(doc.filename);

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
  }
);

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

// Fonction pour récupérer un document par ID (à adapter si besoin)
async function getDocById(id: number) {
  return await prisma.docs.findUnique({ where: { id } });
}

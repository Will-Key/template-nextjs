// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'
import { JWTPayload } from '@/lib/types/auth'

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Retirer "Bearer "

    // Vérifier le token
    const { userId } = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({ where: { id: userId }});
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        personnelNumber: user.personnelNumber,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.json(
      { error: 'Token invalide' },
      { status: 401 }
    );
  }
}
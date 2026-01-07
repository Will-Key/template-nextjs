import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("staff-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      staffId: string;
      email: string;
      name: string;
      role: string;
      restaurantId: string;
      restaurantSlug: string;
    };

    // Récupérer les infos à jour du staff
    const staff = await prisma.staff.findUnique({
      where: { id: decoded.staffId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!staff || !staff.isActive) {
      return NextResponse.json(
        { error: "Session invalide" },
        { status: 401 }
      );
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Erreur de vérification du token:", error);
    return NextResponse.json(
      { error: "Session invalide" },
      { status: 401 }
    );
  }
}

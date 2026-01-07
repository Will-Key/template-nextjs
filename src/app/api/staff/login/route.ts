import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Trouver le staff par email
    const staff = await prisma.staff.findUnique({
      where: { email },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Vérifier si le compte est actif
    if (!staff.isActive) {
      return NextResponse.json(
        { error: "Ce compte a été désactivé" },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Créer le token JWT
    const token = jwt.sign(
      {
        staffId: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        restaurantId: staff.restaurantId,
        restaurantSlug: staff.restaurant.slug,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        restaurant: staff.restaurant,
      },
    });

    // Définir le cookie HTTP-only
    response.cookies.set("staff-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur lors du login:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

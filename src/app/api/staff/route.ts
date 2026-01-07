import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateStaffDTO } from "@/lib/types/order";
import bcrypt from "bcryptjs";

// GET - Liste le personnel d'un restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const role = searchParams.get("role");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId requis" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { restaurantId };
    
    if (role) {
      where.role = role;
    }

    const staff = await prisma.staff.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        assignedTables: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Erreur lors de la récupération du personnel:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Crée un nouveau membre du personnel
export async function POST(request: NextRequest) {
  try {
    const body: CreateStaffDTO = await request.json();

    // Vérifier que l'email est unique
    const existingStaff = await prisma.staff.findUnique({
      where: { email: body.email },
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const staff = await prisma.staff.create({
      data: {
        restaurantId: body.restaurantId,
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phone: body.phone,
        role: body.role ?? "waiter",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du personnel:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

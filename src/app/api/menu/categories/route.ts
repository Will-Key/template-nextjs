import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateMenuCategoryDTO } from "@/lib/types/order";

// GET - Liste toutes les catégories d'un restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId requis" },
        { status: 400 }
      );
    }

    const categories = await prisma.menuCategory.findMany({
      where: { 
        restaurantId,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
      include: {
        menuItems: {
          where: { status: "available" },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Crée une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const body: CreateMenuCategoryDTO = await request.json();

    const category = await prisma.menuCategory.create({
      data: {
        restaurantId: body.restaurantId,
        name: body.name,
        description: body.description,
        displayOrder: body.displayOrder ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

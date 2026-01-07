import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateMenuItemDTO } from "@/lib/types/order";

// GET - Liste tous les articles du menu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};
    
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const items = await prisma.menuItem.findMany({
      where,
      orderBy: { displayOrder: "asc" },
      include: {
        category: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Crée un nouvel article
export async function POST(request: NextRequest) {
  try {
    const body: CreateMenuItemDTO = await request.json();

    const item = await prisma.menuItem.create({
      data: {
        restaurantId: body.restaurantId,
        categoryId: body.categoryId,
        name: body.name,
        description: body.description,
        price: body.price,
        prepTime: body.prepTime,
        ingredients: body.ingredients ?? [],
        allergens: body.allergens ?? [],
        isVegetarian: body.isVegetarian ?? false,
        isVegan: body.isVegan ?? false,
        isSpicy: body.isSpicy ?? false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

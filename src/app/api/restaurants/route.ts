import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateRestaurantDTO } from "@/lib/types/order";

// GET - Liste tous les restaurants
export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Erreur lors de la récupération des restaurants:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Crée un nouveau restaurant
export async function POST(request: NextRequest) {
  try {
    const body: CreateRestaurantDTO = await request.json();

    // Vérifier que le slug est unique
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: body.slug },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        address: body.address,
        phone: body.phone,
        email: body.email,
        currency: body.currency ?? "XOF",
        taxRate: body.taxRate ?? 0,
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du restaurant:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

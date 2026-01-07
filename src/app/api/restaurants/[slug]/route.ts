import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// GET - Récupère un restaurant par son slug avec son menu complet
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          include: {
            menuItems: {
              where: { status: "available" },
              orderBy: { displayOrder: "asc" },
            },
          },
        },
        tables: {
          orderBy: { number: "asc" },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Erreur lors de la récupération du restaurant:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Met à jour un restaurant
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const restaurant = await prisma.restaurant.update({
      where: { slug },
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        phone: body.phone,
        email: body.email,
        logo: body.logo,
        logoPublicId: body.logoPublicId,
        coverImage: body.coverImage,
        coverImagePublicId: body.coverImagePublicId,
        currency: body.currency,
        taxRate: body.taxRate,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du restaurant:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Désactive un restaurant
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    await prisma.restaurant.update({
      where: { slug },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du restaurant:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

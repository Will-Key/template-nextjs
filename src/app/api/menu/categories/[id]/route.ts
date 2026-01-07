import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET - Récupère une catégorie par son ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        menuItems: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Met à jour une catégorie
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const category = await prisma.menuCategory.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        imagePublicId: body.imagePublicId,
        displayOrder: body.displayOrder,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprime une catégorie
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Vérifier s'il y a des articles dans cette catégorie
    const itemsCount = await prisma.menuItem.count({
      where: { categoryId: id },
    });

    if (itemsCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une catégorie contenant des articles" },
        { status: 400 }
      );
    }

    await prisma.menuCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

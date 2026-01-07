import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET - Récupère une table par son ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        restaurant: true,
        assignedWaiter: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        orders: {
          where: {
            status: {
              notIn: ["completed", "cancelled"],
            },
          },
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error("Erreur lors de la récupération de la table:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Met à jour une table
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const table = await prisma.table.update({
      where: { id },
      data: {
        name: body.name,
        capacity: body.capacity,
        status: body.status,
        assignedWaiterId: body.assignedWaiterId,
      },
      include: {
        assignedWaiter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la table:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprime une table
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Vérifier s'il y a des commandes actives
    const activeOrders = await prisma.order.count({
      where: {
        tableId: id,
        status: {
          notIn: ["completed", "cancelled"],
        },
      },
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une table avec des commandes actives" },
        { status: 400 }
      );
    }

    await prisma.table.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la table:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

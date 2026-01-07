import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateTableDTO } from "@/lib/types/order";
import { generateTableQRUrl } from "@/lib/order-utils";

// GET - Liste toutes les tables d'un restaurant
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

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: "asc" },
      include: {
        assignedWaiter: {
          select: {
            id: true,
            name: true,
          },
        },
        orders: {
          where: {
            status: {
              notIn: ["completed", "cancelled"],
            },
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Erreur lors de la récupération des tables:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Crée une nouvelle table
export async function POST(request: NextRequest) {
  try {
    const body: CreateTableDTO = await request.json();

    // Vérifier que le numéro de table est unique pour ce restaurant
    const existingTable = await prisma.table.findUnique({
      where: {
        restaurantId_number: {
          restaurantId: body.restaurantId,
          number: body.number,
        },
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: "Ce numéro de table existe déjà" },
        { status: 400 }
      );
    }

    // Récupérer le slug du restaurant pour générer l'URL du QR code
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: body.restaurantId },
      select: { slug: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant non trouvé" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const qrCode = generateTableQRUrl(baseUrl, restaurant.slug, body.number);

    const table = await prisma.table.create({
      data: {
        restaurantId: body.restaurantId,
        number: body.number,
        name: body.name,
        capacity: body.capacity ?? 4,
        qrCode,
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

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la table:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

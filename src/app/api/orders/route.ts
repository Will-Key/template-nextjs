import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateOrderDTO } from "@/lib/types/order";
import {
  generateOrderNumber,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  estimatePrepTime,
} from "@/lib/order-utils";

// GET - Liste les commandes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const status = searchParams.get("status");
    const tableId = searchParams.get("tableId");

    const where: Record<string, unknown> = {};

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    if (status) {
      // Peut être une liste séparée par des virgules
      const statuses = status.split(",");
      where.status = { in: statuses };
    }

    if (tableId) {
      where.tableId = tableId;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        table: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        handledBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Crée une nouvelle commande
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderDTO = await request.json();

    // Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: body.restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la table existe
    const table = await prisma.table.findUnique({
      where: { id: body.tableId },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les articles du menu avec leurs prix
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: body.items.map((item) => item.menuItemId) },
        status: "available",
      },
    });

    if (menuItems.length !== body.items.length) {
      return NextResponse.json(
        { error: "Certains articles ne sont pas disponibles" },
        { status: 400 }
      );
    }

    // Créer un map pour un accès rapide
    const menuItemsMap = new Map(menuItems.map((item) => [item.id, item]));

    // Préparer les lignes de commande
    const orderItems = body.items.map((item) => {
      const menuItem = menuItemsMap.get(item.menuItemId)!;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: menuItem.price * item.quantity,
        notes: item.notes,
        prepTime: menuItem.prepTime,
      };
    });

    // Calculer les montants
    const subtotal = calculateSubtotal(orderItems);
    const taxAmount = calculateTax(subtotal, restaurant.taxRate);
    const total = calculateTotal(subtotal, taxAmount);

    // Estimer le temps de préparation
    const estimatedPrepTime = estimatePrepTime(
      orderItems.map((item) => ({
        prepTime: item.prepTime,
        quantity: item.quantity,
      }))
    );

    // Générer le numéro de commande
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const orderCount = await prisma.order.count({
      where: {
        restaurantId: body.restaurantId,
        createdAt: { gte: todayStart },
      },
    });
    
    const orderNumber = generateOrderNumber(orderCount + 1);

    // Gérer le client (créer ou retrouver)
    let customerId = body.customerId;
    
    if (!customerId && (body.customerPhone || body.customerName)) {
      // Chercher ou créer le client
      if (body.customerPhone) {
        const existingCustomer = await prisma.customer.findUnique({
          where: { phone: body.customerPhone },
        });
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const newCustomer = await prisma.customer.create({
            data: {
              name: body.customerName,
              phone: body.customerPhone,
            },
          });
          customerId = newCustomer.id;
        }
      }
    }

    // Créer la commande avec ses lignes
    const order = await prisma.order.create({
      data: {
        restaurantId: body.restaurantId,
        tableId: body.tableId,
        customerId,
        orderNumber,
        subtotal,
        taxAmount,
        total,
        notes: body.notes,
        estimatedPrepTime,
        items: {
          create: orderItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
      },
    });

    // Mettre à jour le statut de la table
    await prisma.table.update({
      where: { id: body.tableId },
      data: { status: "occupied" },
    });

    // TODO: Envoyer une notification au caissier
    // Créer une notification pour le staff
    await prisma.notification.createMany({
      data: await getStaffToNotify(body.restaurantId, "new_order", order.id),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Fonction helper pour créer les notifications
async function getStaffToNotify(
  restaurantId: string,
  type: "new_order" | "order_ready",
  orderId: string
) {
  const roles = type === "new_order" 
    ? ["cashier", "manager", "owner"] 
    : ["waiter", "cashier", "manager"];

  const staff = await prisma.staff.findMany({
    where: {
      restaurantId,
      role: { in: roles as never[] },
      isActive: true,
    },
    select: { id: true },
  });

  const title = type === "new_order" 
    ? "Nouvelle commande" 
    : "Commande prête";
  
  const message = type === "new_order"
    ? "Une nouvelle commande a été passée"
    : "Une commande est prête à être servie";

  return staff.map((s) => ({
    staffId: s.id,
    orderId,
    type,
    title,
    message,
  }));
}

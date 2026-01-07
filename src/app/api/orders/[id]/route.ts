import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateOrderStatusDTO } from "@/lib/types/order";
import { isValidStatusTransition } from "@/lib/order-utils";
import { OrderStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// GET - Récupère une commande par son ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            currency: true,
          },
        },
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
                description: true,
                price: true,
                image: true,
              },
            },
          },
        },
        customer: true,
        handledBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Met à jour une commande (principalement le statut)
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: UpdateOrderStatusDTO = await request.json();

    // Récupérer la commande actuelle
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
      },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier la validité de la transition de statut
    if (body.status && !isValidStatusTransition(currentOrder.status, body.status)) {
      return NextResponse.json(
        { error: `Transition de statut invalide: ${currentOrder.status} -> ${body.status}` },
        { status: 400 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {};

    if (body.status) {
      updateData.status = body.status;

      // Mettre à jour le timestamp correspondant
      const now = new Date();
      switch (body.status) {
        case "confirmed":
          updateData.confirmedAt = now;
          break;
        case "preparing":
          updateData.preparingAt = now;
          break;
        case "ready":
          updateData.readyAt = now;
          break;
        case "served":
          updateData.servedAt = now;
          break;
        case "completed":
          updateData.completedAt = now;
          updateData.paymentStatus = "paid";
          updateData.paidAt = now;
          break;
        case "cancelled":
          updateData.cancelledAt = now;
          break;
      }
    }

    if (body.handledById) {
      updateData.handledById = body.handledById;
    }

    // Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
        handledBy: true,
      },
    });

    // Actions supplémentaires selon le nouveau statut
    if (body.status === "ready") {
      // Notifier le client et/ou le serveur
      await createReadyNotifications(order);
    }

    if (body.status === "completed" || body.status === "cancelled") {
      // Vérifier s'il reste des commandes actives sur cette table
      const activeOrders = await prisma.order.count({
        where: {
          tableId: order.tableId,
          status: {
            notIn: ["completed", "cancelled"],
          },
        },
      });

      // Si plus de commandes actives, libérer la table
      if (activeOrders === 0) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: "available" },
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Annule une commande
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Seules les commandes en attente peuvent être supprimées
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Seules les commandes en attente peuvent être annulées" },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'annulation de la commande:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Fonction helper pour créer les notifications quand une commande est prête
async function createReadyNotifications(order: {
  id: string;
  restaurantId: string;
  tableId: string;
  customer: { pushToken: string | null } | null;
  table: { assignedWaiterId: string | null };
}) {
  const notifications = [];

  // Notification pour le client (si pushToken disponible)
  if (order.customer?.pushToken) {
    notifications.push({
      type: "order_ready" as const,
      title: "Votre commande est prête !",
      message: "Vous pouvez venir récupérer votre commande au comptoir.",
      orderId: order.id,
      customerPushToken: order.customer.pushToken,
    });
  }

  // Notification pour le serveur assigné à la table
  if (order.table.assignedWaiterId) {
    notifications.push({
      type: "order_ready" as const,
      title: "Commande prête",
      message: `La commande de la table est prête à être servie.`,
      orderId: order.id,
      staffId: order.table.assignedWaiterId,
    });
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications,
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Récupère les notifications non lues pour un staff
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!staffId) {
      return NextResponse.json(
        { error: "staffId requis" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { staffId };
    
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            table: {
              select: {
                number: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Marque les notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, staffId, markAllRead } = body;

    if (markAllRead && staffId) {
      // Marquer toutes les notifications du staff comme lues
      await prisma.notification.updateMany({
        where: {
          staffId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else if (notificationIds && notificationIds.length > 0) {
      // Marquer des notifications spécifiques comme lues
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else {
      return NextResponse.json(
        { error: "notificationIds ou markAllRead requis" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

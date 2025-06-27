import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth, withCors } from "@/lib/middleware"

const prisma = new PrismaClient();

export const GET = withCors(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
    const { id } = context.params;
    try {
      const formation = await prisma.formation.findUnique({
        where: { id: Number(id) },
      });

      if (!formation) {
        return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
      }

      return NextResponse.json(formation);
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
})

export const PUT = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
    const { id } = await context.params;
    const body = await _req.json();
    const { label, description, days, maxParticipants, amount, modules } = body;
    const updatedFormation = await prisma.formation.update({
      where: { id: Number(id) },
      data: {
        label,
        description,
        days: +days,
        maxParticipants: +maxParticipants,
        amount: +amount,
        modules
      },
    });

    return NextResponse.json(updatedFormation);
})

export const DELETE = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
    const { id } = context.params;
    try {
      const formation = await prisma.formation.delete({
        where: { id: Number((id)) },
      });

      return NextResponse.json({ message: "Formation supprimé", formation });
    } catch (error) {
      console.log(error)
      return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
    }
})
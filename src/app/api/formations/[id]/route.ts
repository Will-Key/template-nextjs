import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  { params }: { params: { id: string } }
) {
  try {
    const formation = await prisma.formation.findUnique({
      where: { id: Number(params.id) },
    });

    if (!formation) {
      return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
    }

    return NextResponse.json(formation);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { label, description, days, maxParticipants, amount, modules } = body;
  const updatedFormation = await prisma.formation.update({
    where: { id: Number(params.id) },
    data: {
      label,
      description,
      days: +days,
      maxParticipants: +maxParticipants,
      amount: +amount,
      modules
    },
  });

  console.log("Service updated successfully:", updatedFormation.id);
  return NextResponse.json(updatedFormation);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('params', params)
    const formation = await prisma.formation.delete({
      where: { id: Number((params.id)) },
    });

    return NextResponse.json({ message: "Formation supprimé", formation });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
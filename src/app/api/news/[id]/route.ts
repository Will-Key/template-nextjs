import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  { params }: { params: { id: string } }
) {
  try {
    const news = await prisma.news.findUnique({
      where: { id: Number(params.id) },
    });

    if (!news) {
      return NextResponse.json({ error: "Actualité introuvable" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { label, type, description, content, eventDate } = body;
  const updatedFormation = await prisma.news.update({
    where: { id: Number(params.id) },
    data: {
      label, type, description, content, eventDate
    },
  });

  return NextResponse.json(updatedFormation);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('params', params)
    const news = await prisma.news.delete({
      where: { id: Number((params.id)) },
    });

    return NextResponse.json({ message: "Actualité supprimé", news });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
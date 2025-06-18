import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth } from "@/lib/middleware"

const prisma = new PrismaClient();

interface NewsParams {
  id: string
}

export const GET = withAuth<NewsParams>(async (_, { params }) => {
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
})

export const PUT = withAuth<NewsParams>(async (req, { params }) => {
  const body = await req.json();
  const { label, type, description, content, eventDate } = body;
  const updatedFormation = await prisma.news.update({
    where: { id: Number(params.id) },
    data: {
      label, type, description, content, eventDate
    },
  });

  return NextResponse.json(updatedFormation);
})

export const DELETE = withAuth<NewsParams>(async (_, { params }) => {
  try {
    const news = await prisma.news.delete({
      where: { id: Number((params.id)) },
    });

    return NextResponse.json({ message: "Actualité supprimé", news });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
})
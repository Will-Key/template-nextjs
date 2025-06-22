import { NextResponse } from "next/server";
import { PrismaClient, User } from "@prisma/client";
import { withAuth } from "@/lib/middleware"
import bcrypt from 'bcryptjs'
import { verifyAuth } from "@/lib/auth/verifyAuth"

const prisma = new PrismaClient();
interface UserParams {
  id: string
}

export const GET = withAuth<UserParams>(async (_, { params }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
})

export const PUT = withAuth<UserParams>(async (req, { params }) => {
  const { userId } = await verifyAuth(req)
  
  const body: User = await req.json();
  const { name, email, password, role, status } = body;
  
  const hashedPassword = await bcrypt.hash(password, 10)

  const updatedUser = await prisma.user.update({
    where: { id: params.id },
    data: { name, email, password: hashedPassword, role, status, createdById: userId },
  });

  return NextResponse.json(updatedUser);
})

export const DELETE = withAuth<UserParams>(async (req, { params }) => {
  try {
    const user = await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User supprimé", user });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
})
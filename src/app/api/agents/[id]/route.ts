import { NextResponse } from "next/server";
import { PrismaClient, User } from "@prisma/client";
import { withAuth } from "@/lib/middleware"
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient();

// Fix 1: Interface for the route params
interface AgentParams {
  id: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth<AgentParams>(async (_, context) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: context.params.id },
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

export const PUT = withAuth<AgentParams>(async (req, context) => {
  try {
    
    const body: User = await req.json();
    const { name, email, password, role, status } = body;
    
    // Fix 3: Only hash password if it's provided
    const updateData: any = { name, email, role, status, createdById: context.params.id };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: context.params.id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DELETE = withAuth<AgentParams>(async (_, context) => {
  try {
    const user = await prisma.user.delete({
      where: { id: context.params.id },
    });

    return NextResponse.json({ message: "User supprimé", user });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
})
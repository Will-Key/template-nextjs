import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, User } from "@prisma/client";
import { withAuth } from "@/lib/middleware";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const GET = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
    const { id } = context.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    }

    return NextResponse.json(user);
  }
);

export const PUT = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (req: NextRequest, context: any) => {
    const { id } = context.params;
    const body: User = await req.json();
    const { name, email, password, role, status } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { name, email, role, status, createdById: id };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  }
);

export const DELETE = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_req: NextRequest, context: any) => {
    const { id } = context.params;

    const user = await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User supprimé", user });
  }
);

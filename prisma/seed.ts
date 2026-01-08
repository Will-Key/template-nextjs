import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
    },
  });

  console.log("Admin user created:", admin.email);

  const userPassword = await bcrypt.hash("user123", 10);

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "User",
      email: "user@example.com",
      password: userPassword,
      role: "user",
      isActive: true,
    },
  });

  console.log("Standard user created:", user.email);
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

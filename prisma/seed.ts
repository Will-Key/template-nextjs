import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Créer un restaurant de test
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "chez-mama" },
    update: {},
    create: {
      name: "Chez Mama",
      slug: "chez-mama",
      description: "Restaurant africain traditionnel",
      address: "123 Rue de la Gastronomie, Abidjan",
      phone: "+225 01 02 03 04 05",
      email: "contact@chezmama.ci",
      currency: "XOF",
      taxRate: 0,
    },
  });

  console.log("✅ Restaurant créé:", restaurant.name);

  // Créer le personnel
  const hashedPassword = await bcrypt.hash("password123", 10);

  const owner = await prisma.staff.upsert({
    where: { email: "owner@chezmama.ci" },
    update: {},
    create: {
      name: "Mama Adjoua",
      email: "owner@chezmama.ci",
      password: hashedPassword,
      phone: "+225 01 02 03 04 05",
      role: "owner",
      restaurantId: restaurant.id,
    },
  });

  const cashier = await prisma.staff.upsert({
    where: { email: "caisse@chezmama.ci" },
    update: {},
    create: {
      name: "Kouamé Jean",
      email: "caisse@chezmama.ci",
      password: hashedPassword,
      phone: "+225 01 02 03 04 06",
      role: "cashier",
      restaurantId: restaurant.id,
    },
  });

  const waiter = await prisma.staff.upsert({
    where: { email: "serveur@chezmama.ci" },
    update: {},
    create: {
      name: "Aya Marie",
      email: "serveur@chezmama.ci",
      password: hashedPassword,
      phone: "+225 01 02 03 04 07",
      role: "waiter",
      restaurantId: restaurant.id,
    },
  });

  console.log("✅ Personnel créé:", owner.name, cashier.name, waiter.name);

  // Créer les catégories
  const categories = await Promise.all([
    prisma.menuCategory.upsert({
      where: { id: "cat-entrees" },
      update: {},
      create: {
        id: "cat-entrees",
        name: "Entrées",
        description: "Nos délicieuses entrées",
        displayOrder: 1,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: "cat-plats" },
      update: {},
      create: {
        id: "cat-plats",
        name: "Plats principaux",
        description: "Nos plats signature",
        displayOrder: 2,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: "cat-accompagnements" },
      update: {},
      create: {
        id: "cat-accompagnements",
        name: "Accompagnements",
        description: "Pour accompagner vos plats",
        displayOrder: 3,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: "cat-boissons" },
      update: {},
      create: {
        id: "cat-boissons",
        name: "Boissons",
        description: "Rafraîchissements",
        displayOrder: 4,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: "cat-desserts" },
      update: {},
      create: {
        id: "cat-desserts",
        name: "Desserts",
        description: "Douceurs sucrées",
        displayOrder: 5,
        restaurantId: restaurant.id,
      },
    }),
  ]);

  console.log("✅ Catégories créées:", categories.length);

  // Créer les plats
  const menuItems = await Promise.all([
    // Entrées
    prisma.menuItem.upsert({
      where: { id: "item-aloko" },
      update: {},
      create: {
        id: "item-aloko",
        name: "Aloko",
        description: "Bananes plantains frites, croustillantes et dorées",
        price: 1500,
        prepTime: 10,
        categoryId: "cat-entrees",
        restaurantId: restaurant.id,
        isVegetarian: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "item-kedjenu" },
      update: {},
      create: {
        id: "item-kedjenu",
        name: "Kedjenu de poulet",
        description: "Poulet mijoté aux épices africaines, tomates et oignons",
        price: 4500,
        prepTime: 25,
        categoryId: "cat-plats",
        restaurantId: restaurant.id,
        isSpicy: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "item-atieke-poisson" },
      update: {},
      create: {
        id: "item-atieke-poisson",
        name: "Attiéké Poisson braisé",
        description: "Semoule de manioc avec poisson braisé aux épices",
        price: 3500,
        prepTime: 20,
        categoryId: "cat-plats",
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "item-foutou-sauce-graine" },
      update: {},
      create: {
        id: "item-foutou-sauce-graine",
        name: "Foutou Sauce Graine",
        description: "Foutou banane/igname avec sauce graine et viande",
        price: 5000,
        prepTime: 30,
        categoryId: "cat-plats",
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "item-garba" },
      update: {},
      create: {
        id: "item-garba",
        name: "Garba",
        description: "Attiéké avec thon frit, oignons et piment",
        price: 2000,
        prepTime: 15,
        categoryId: "cat-plats",
        restaurantId: restaurant.id,
        isSpicy: true,
      },
    }),
    // Accompagnements
    prisma.menuItem.upsert({
      where: { id: "item-riz" },
      update: {},
      create: {
        id: "item-riz",
        name: "Riz blanc",
        description: "Portion de riz",
        price: 500,
        prepTime: 5,
        categoryId: "cat-accompagnements",
        restaurantId: restaurant.id,
        isVegetarian: true,
        isVegan: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "item-attieke" },
      update: {},
      create: {
        id: "item-attieke",
        name: "Attiéké nature",
        description: "Semoule de manioc",
        price: 500,
        prepTime: 5,
        categoryId: "cat-accompagnements",
        restaurantId: restaurant.id,
        isVegetarian: true,
        isVegan: true,
      },
    }),
    // Boissons
    prisma.menuItem.upsert({
      where: { id: "item-bissap" },
      update: {},
      create: {
        id: "item-bissap",
        name: "Jus de Bissap",
        description: "Jus d'hibiscus frais, sucré naturellement",
        price: 1000,
        prepTime: 2,
        categoryId: "cat-boissons",
        restaurantId: restaurant.id,
        isVegetarian: true,
        isVegan: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "item-gingembre" },
      update: {},
      create: {
        id: "item-gingembre",
        name: "Jus de Gingembre",
        description: "Jus de gingembre piquant et rafraîchissant",
        price: 1000,
        prepTime: 2,
        categoryId: "cat-boissons",
        restaurantId: restaurant.id,
        isVegetarian: true,
        isVegan: true,
        isSpicy: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "item-eau" },
      update: {},
      create: {
        id: "item-eau",
        name: "Eau minérale",
        description: "Bouteille 50cl",
        price: 500,
        prepTime: 1,
        categoryId: "cat-boissons",
        restaurantId: restaurant.id,
        isVegetarian: true,
        isVegan: true,
      },
    }),
    // Desserts
    prisma.menuItem.upsert({
      where: { id: "item-deguè" },
      update: {},
      create: {
        id: "item-deguè",
        name: "Dèguè",
        description: "Couscous de mil au lait caillé sucré",
        price: 1500,
        prepTime: 5,
        categoryId: "cat-desserts",
        restaurantId: restaurant.id,
        isVegetarian: true,
      },
    }),
  ]);

  console.log("✅ Plats créés:", menuItems.length);

  // Créer les tables
  const tables = await Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) =>
      prisma.table.upsert({
        where: {
          restaurantId_number: {
            restaurantId: restaurant.id,
            number: num,
          },
        },
        update: {},
        create: {
          number: num,
          name: num <= 4 ? `Intérieur ${num}` : `Terrasse ${num - 4}`,
          capacity: num <= 4 ? 4 : 6,
          restaurantId: restaurant.id,
          qrCode: `http://localhost:3000/r/chez-mama/table/${num}`,
          assignedWaiterId: waiter.id,
        },
      })
    )
  );

  console.log("✅ Tables créées:", tables.length);

  console.log("\n🎉 Seed terminé avec succès!");
  console.log("\n📱 URLs de test:");
  console.log("   Menu client: http://localhost:3000/r/chez-mama/table/1");
  console.log("   Dashboard:   http://localhost:3000/dashboard/chez-mama");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
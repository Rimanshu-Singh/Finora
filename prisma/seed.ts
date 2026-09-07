import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const systemCategories = [
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Clothing",
  "Bills",
  "Subscriptions",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Personal Care",
  "Gifts",
  "Other",
];

export async function seedCategories() {
  for (let i = 0; i < systemCategories.length; i++) {
    const name = systemCategories[i];
    const slug = name.toLowerCase().replaceAll(" ", "-");
    await prisma.category.upsert({
      where: { slug },
      update: { name, icon: name, sortOrder: i },
      create: {
        id: slug,
        name,
        icon: name,
        slug,
        isSystem: true,
        sortOrder: i,
      },
    });
  }
}

async function main() {
  console.log("Seeding system categories...");
  await seedCategories();
  console.log("System categories seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const students = [
    { name: "Krit",    email: "krit.ku.v68@ubu.ac.th", password: "35653"},
    { name: "Atitep",  email: "atitep.bo.v68@ubu.ac.th", password: "35655"}
    // add the rest of your class here
  ];

  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash: await bcrypt.hash(s.password, 12),
        role: "STUDENT",
      },
    });
  }

  // Create your admin account
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash: await bcrypt.hash("adminpassword", 12),
      role: "ADMIN",
    },
  });

  console.log("Seeded.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
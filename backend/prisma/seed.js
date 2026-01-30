import prisma from "../src/utils/prisma.js";

async function initializeSystem() {
  console.log("Seeding database...");

  const systemPasswordHash = process.env.SYSTEM_USER_PASSWORD;
  if (!systemPasswordHash) {
    console.error("SYSTEM_USER_PASSWORD is not set in environment variables.");
    process.exit(1);
  }

  // Vytvoreni systemoveho uzivatele
  try {
    const systemUser = await prisma.user.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        email: "system@fridgee.local",
        name: "system",
        username: "system",
        passwordHash: systemPasswordHash,
      },
    });
    console.log("System user created:", systemUser);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeSystem();

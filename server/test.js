import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Testing User & Device relational link...");

  // 1. Create a user AND a device in a single nested query
  const userWithDevice = await prisma.user.create({
    data: {
      email: `tanmay_${Date.now()}@example.com`,
      name: "Tanmay",
      passwordHash: "secure_hash_here",
      devices: {
        create: {
          name: "Desk Monstera",
          apiKey: `grb_live_${Date.now()}`,
          plantType: "Monstera Deliciosa",
          minSoilMoisture: 35.0,
          maxSoilMoisture: 70.0,
        },
      },
    },
    include: {
      devices: true, // Tells Prisma to return the newly created devices array
    },
  });

  console.log("✅ User and Device created together:");
  console.dir(userWithDevice, { depth: null });
}

main()
  .catch((e) => console.error("❌ Error:", e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
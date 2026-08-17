import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  // 1. Insert one test value
  const item = await prisma.testLog.create({
    data: { val: 26.5 },
  });
  console.log("✅ Saved to Neon:", item);

  // 2. Fetch it back
  const allLogs = await prisma.testLog.findMany();
  console.log("📥 Fetched all values from Neon:", allLogs);
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
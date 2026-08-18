import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Testing User model with Neon...");

  // 2. Insert a test user
  const newUser = await prisma.user.create({
    data: {
      email: `test_${Date.now()}@example.com`,
      name: "Tanmay",
      passwordHash: "fake_hashed_bcrypt_secret_123",
    },
  });

  console.log("✅ User created successfully in Neon:", newUser);

  // 3. Query all users from Neon
  const allUsers = await prisma.user.findMany();
  console.log("📥 All users in database:", allUsers);
}

main()
  .catch((e) => console.error("❌ Error:", e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
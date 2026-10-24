import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 8080}`,
  secret: process.env.BETTER_AUTH_SECRET || "grobot_secret_super_secure_key_32_characters_long",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
});


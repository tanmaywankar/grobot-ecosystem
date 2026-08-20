import { Router } from "express";
import { success, z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const router = Router();

const registerSchema = z.object({
  email: z.email("invalid email format"),
  password: z.string().min(6, "password must be 6 charecters long"),
  name: z.string(),
});

router.post("/register", async (req, res) => {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: "invalid input data",
      issue: validation.error.issues,
    });
  }

  const { email, password, name } = validation.data;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "an account with this email already exist",
      });
    }

    return res.status(200).json({
        success: true,
        message: "email is available"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
        success: false,
        error: "database query failed",
    });
  }

});

export default router;

import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const router = Router();

const registerSchema = z.object({
  email: z.email("invalid email format"),
  password: z.string().min(6, "password must be 6 charecters long"),
  name: z.string(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "password is required"),
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

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
      },
    });
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      success: true,
      message: "user created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "database query failed",
    });
  }
});

router.post("/login", async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: "missing fields",
      issue: validation.error.issues,
    });
  }

  const { email, password } = validation.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password,user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "invalid password",
      });
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    
  return res.status(200).json({
    user: {id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
    
  });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: "failed to login",
    });
  }
});

export default router;

import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../db.js";
import { authGuard } from "../middleware/authGuard.js";

const router = Router();

const DeviceSchema = z.object({
  name: z.string().min(2, "Device name must be minimum 2 charecters"),
  plantType: z.string().optional(),
});

const updateDeviceSchema = z
  .object({
    name: z
      .string()
      .min(2, "Device name must be minimum 2 characters")
      .optional(),
    plantType: z.string().optional(),
  })
  .refine((data) => data.name !== undefined || data.plantType !== undefined, {
    message:
      "At least one field (name or plantType) must be provided to update",
  });

router.post("/", authGuard, async (req, res) => {
  const validation = DeviceSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: "invalid or missing fields",
    });
  }

  const apiKey = `gb_${crypto.randomBytes(24).toString("hex")}`;
  const { name, plantType } = validation.data;
  try {
    const newDevice = await prisma.device.create({
      data: {
        name,
        plantType: plantType || "general",
        apiKey,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "device registered successfully",
      device: newDevice,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "failed to register device",
    });
  }
});

router.get("/", authGuard, async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      devices,
    });
  } catch (err) {
    console.error("fetch device error", err);
    return res.status(500).json({
      success: false,
      error: "failed to fetch devices",
    });
  }
});

router.patch("/:id", authGuard, async (req, res) => {
  const { id } = req.params;

  const validation = updateDeviceSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: "invalid update data",
      issues: validation.error.issues,
    });
  }

  try {
    const existingDevice = await prisma.device.findFirst({
      where: {
        id: id,
        userId: req.user.userId,
      },
    });

    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        error: "device not found or not authorized",
      });
    }

    const updatedDevice = await prisma.device.update({
      where: { id: id },
      data: validation.data,
    });

    return res.status(200).json({
      success: true,
      message: "device updated successfully",
      device: updatedDevice,
    });
  } catch (err) {
    console.error("update device error", err);
    return res.status(500).json({
      success: false,
      error: "failed to update device",
    });
  }
});

router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.device.deleteMany({
      where: {
        id: id,
        userId: req.user.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        error: "device did not found or not authorized to delete",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "failed to delete the device",
    });
  }
});

export default router;

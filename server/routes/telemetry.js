import { z } from "zod";
import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

const telemetrySchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  light: z.number(),
  soilMoisture: z.number(),
  rawAdc: z.number().int().optional(),
});

router.post("/", async (req, res) => {
  const apiKey = req.headers["grobot-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "invalid or missing api key",
    });
  }

  const validation = telemetrySchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid Sensor Data",
      issue: validation.error.issues,
    });
  }

  const { temperature, humidity, light, soilMoisture, rawAdc } = validation.data;

  try {
    const device = await prisma.device.findUnique({
      where: {
        apiKey: apiKey,
      },
    });

    if (!device) {
      return res.status(401).json({
        success: false,
        error: "invalid api key: device not recognised",
      });
    }

    const [log, updatedDevice] = await prisma.$transaction([
      prisma.telemetryLog.create({
        data: {
          deviceId: device.id,
          temperature,
          humidity,
          light,
          soilMoisture,
          rawAdc: rawAdc ?? null,
        },
      }),
      prisma.device.update({
        where:{
          id: device.id,
        },
        data:{
          status: "ONLINE",
          lastSeen: new Date(),
        }
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: "Telemetry recorded successfully",
      logId: log.id,
      deviceStatus: updatedDevice.status,
      lastSeen: updatedDevice.lastSeen,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "server error during lookup",
    });
  }
});

export default router;

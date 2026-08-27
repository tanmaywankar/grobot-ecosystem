import { z } from "zod";
import { Router } from "express";
import { prisma } from "../db.js";
import { authGuard } from "../middleware/authGuard.js";

const router = Router();

// In-memory buffer
export const telemetryBuffer = [];
const sendInterval = 10 * 60 * 1000; // 10 minutes

const telemetrySchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  light: z.number(),
  soilMoisture: z.number(),
  rawAdc: z.number().int().optional(),
});

// Flush function that writes all queued items in bulk
export async function sendBufferToDB() {
  if (telemetryBuffer.length === 0) {
    console.log("nothing in buffer");
    return;
  }

  const dataToWrite = telemetryBuffer.splice(0, telemetryBuffer.length);

  try {
    await prisma.telemetryLog.createMany({
      data: dataToWrite,
    });

    console.log(`Successfully saved ${dataToWrite.length} records to database`);
  } catch (err) {
    console.error("error pushing to database", err);
    // Restore unsaved data back to buffer if database write fails
    telemetryBuffer.unshift(...dataToWrite);
  }
}

setInterval(sendBufferToDB, sendInterval);

// 1. Ingest telemetry -> save to RAM buffer
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
      issues: validation.error.issues,
    });
  }

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

    const { temperature, humidity, light, soilMoisture, rawAdc } =
      validation.data;
    
    const newReading = {
      deviceId: device.id,
      temperature,
      humidity,
      light,
      soilMoisture,
      rawAdc: rawAdc ?? null,
      createdAt: new Date(),
    };

    // Push reading with the matched device.id into RAM buffer
    telemetryBuffer.push(newReading);

    const io = req.app.get("io");
    if (io) {
      io.to(`device:${device.id}`).emit("telemetry:new", newReading);
    }

    return res.status(200).json({
      success: true,
      message: "Telemetry stored in RAM buffer",
      bufferedCount: telemetryBuffer.length,
    });
  } catch (err) {
    console.error("Lookup error:", err);
    return res.status(500).json({
      success: false,
      error: "server error during lookup",
    });
  }
});

// 2. Manual flush route for testing
router.post("/flush", async (req, res) => {
  await sendBufferToDB();
  return res.status(200).json({
    success: true,
    remainingBuffer: telemetryBuffer.length,
  });
});

router.get("/:deviceId", authGuard, async (req, res) => {
  const { deviceId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const device = await prisma.device.findFirst({
      where:{
        id: deviceId,
        userId: req.user.userId,
      },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: "Device not found or not authorized",
      });
    }

    const logs = await prisma.telemetryLog.findMany({
      where: {deviceId},
      orderBy: {createdAt: "desc"},
      take: Math.min(limit, 100),
        });
    
    return res.status(200).json({
      success: true,
      deviceName: device.name,
      count: logs.length,
      data: logs,
    });

  } catch (err) {
    console.error("Fetch telemetry history error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch telemetry history",
    });
  }
});

export default router;

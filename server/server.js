import express from "express";
import cors from "cors";
import "dotenv/config";
import { z } from "zod";
import { prisma } from "./db.js";
const app = express();
const PORT = process.env.PORT || 5000;
import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/device.js";
import telemetryRouter from "./routes/telemetry.js";


const HARDWARE_API_KEY = process.env.HARDWARE_API_KEY;

app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/telemetry", telemetryRouter);

//in memory states cuz otherwise the esp32 would send the sensor data to database 24x7 (i can't afford paid db (T-T) )
let telemetryBuffer = [];
let lastDeviceState = null;

const TelemetrySchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  light: z.number(),
  soilMoisture: z.number().min(0).max(100),
  rawAdc: z.number().int().optional(),
});

async function sendBufferToDB() {
  if (telemetryBuffer.length === 0) {
    console.log("nothing in buffer");
    return;
  }

  const dataToWrite = [...telemetryBuffer];
  telemetryBuffer = [];

  try {
    const device = await prisma.device.findUnique({
      where: { apiKey: HARDWARE_API_KEY },
    });

    if (!device) {
      telemetryBuffer = [...dataToWrite, ...telemetryBuffer];
      console.log("the device with given key does not exist");
      return;
    }

    const records = dataToWrite.map((data) => ({
      deviceId: device.id,
      temperature: data.temperature,
      humidity: data.humidity,
      soilMoisture: data.soilMoisture,
      rawAdc: data.rawAdc,
      light: data.light,
      createdAt: new Date(data.receivedAt),
    }));

    await prisma.telemetryLog.createMany({
      data: records,
    });

    await prisma.device.update({
      where: { id: device.id },
      data: {
        status: "ONLINE",
        lastSeen: new Date(),
      },
    });

    console.log("successfully saved the records");
  } catch (err) {
    console.error("error pushing to database", err);
    telemetryBuffer = [...dataToWrite, ...telemetryBuffer];
  }
}

const sendInterval = 10 * 60 * 1000;
setInterval(sendBufferToDB, sendInterval);
app.post("/api/telemetry", (req, res) => {
  const clientKey = req.headers["grobot-key"];

  // To check if the data being received is valid
  if (!clientKey || clientKey != HARDWARE_API_KEY) {
    console.log("Error: Invalid or missing API keys");
    return res.status(401).json({
      success: false,
      error: "Invalid or missing key",
    });
  }

  const validation = TelemetrySchema.safeParse(req.body);

  if (!validation.success) {
    console.log("validation error", validation.error.format());
    return res.status(400).json({
      success: false,
      issue: validation.error.issues,
      error: "Uncomplete or invalid info",
    });
  }

  const parsedData = {
    ...validation.data,
    receivedAt: new Date().toISOString(),
  };

  lastDeviceState = parsedData;

  telemetryBuffer.push(parsedData);
  console.log(
    `[RAM Buffer] Stored reading #${telemetryBuffer.length}. Current buffer size: ${telemetryBuffer.length}`,
  );
  return res.status(200).json({
    success: true,
    message: "telementry stored in buffer",
    bufferedCount: telemetryBuffer.length,
    latestReading: lastDeviceState,
  });
});

app.post("/api/telemetry/flush", async (req, res) => {
  await sendBufferToDB();
  return res.status(200).json({
    success: true,
    remainingBuffer: telemetryBuffer.length,
  });
});
process.on("SIGINT", async () => {
  console.log("Server shutting down... Flushing buffer to database.");
  await sendBufferToDB();
  process.exit(0);
});
app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});

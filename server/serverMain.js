

import express from "express";
import { z } from "zod";
import "dotenv/config";
import { prisma } from "./db.js";
const app = express();
const Port = process.env.PORT;
const Key = process.env.HARDWARE_API_KEY;

const TelemetrySchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  light: z.number(),
  soilMoisture: z.number().min(0).max(100),
  rawAdc: z.number().int().optional(),
});

let telemetryMemory = [];
let lastDeviceStatus = null;

//middlewares
app.use(express.json());

async function sendDataToDB() {
  if (telemetryMemory.length === 0) {
    console.log("empty buffer, skipping the operation");
    return;
  }

  let dataToWrite = [...telemetryMemory];
  telemetryMemory = [];

  const device = await prisma.device.findUnique({
    where: { apiKey: Key },
  });

  if (!device) {
    console.error("no matching device found");
    telemetryMemory = [...dataToWrite, ...telemetryMemory];
    return res.status(400);
  }

  const records = dataToWrite.map((data) => ({
    deviceId: device.id,
    temperature: data.temperature,
    humidity: data.humidity,
    light: data.light,
    soilMoisture: data.soilMoisture,
    rawAdc: data.rawAdc,
    createdAt: new Date(data.receivedAt),
  }));
}

app.post("/api/telemetry", (req, res) => {
  const clientKey = req.headers["grobot-key"];

  //Key check
  if (!clientKey || clientKey !== Key) {
    return res.status(401).json({
      success: false,
      error: "unauthorised to handle",
    });
  }

  //validation
  const validation = TelemetrySchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: "invalid Data",
    });
  }

  const parsedData = {
    ...validation.data,
    receivedAt: new Date().toISOString(),
  };
  lastDeviceStatus = parsedData;
  telemetryMemory.push(parsedData);
  console.log(telemetryMemory.length);

  return res.status(200).json({
    success: true,
    data: parsedData,
    memoryCount: telemetryMemory.length,
    latestReading: lastDeviceStatus,
  });
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    bufferedCount: telemetryMemory.length,
    latestReading: lastDeviceStatus,
  });
});

app.listen(Port, () => {
  console.log(`listening on port: ${Port} `);
});

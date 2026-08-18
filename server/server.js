import express from "express";
import cors from "cors";
import "dotenv/config";
import { z } from "zod";
const app = express();
const PORT = process.env.PORT || 5000;

const HARDWARE_API_KEY = process.env.HARDWARE_API_KEY;

app.use(cors());
app.use(express.json());

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
console.log(`[RAM Buffer] Stored reading #${telemetryBuffer.length}. Current buffer size: ${telemetryBuffer.length}`);
  return res.status(200).json({
    success: true,
    message: "telementry stored in buffer",
    bufferedCount: telemetryBuffer.length,
    latestReading: lastDeviceState,
  });
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});

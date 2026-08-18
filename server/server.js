import express from "express";
import cors from "cors";
import "dotenv/config";
import {z} from "zod";
const app = express();
const PORT = process.env.PORT || 5000;

const HARDWARE_API_KEY = process.env.HARDWARE_API_KEY;

app.use(cors());
app.use(express.json());

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
  console.log("Access granted");
  return res.status(200).json({
    success: true,
    message: "auth success",
  });


});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});

import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/device.js";
import telemetryRouter, { sendBufferToDB } from "./routes/telemetry.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/telemetry", telemetryRouter);

process.on("SIGINT", async () => {
  console.log("Server shutting down... Flushing buffer to database.");
  await sendBufferToDB();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
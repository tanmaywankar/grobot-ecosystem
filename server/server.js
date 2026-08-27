import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/device.js";
import net from "net";
import { Aedes } from "aedes";
import telemetryRouter, { sendBufferToDB, telemetryBuffer } from "./routes/telemetry.js";
import http from "http";
import { Server } from "socket.io";
import { prisma } from "./db.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

const PORT = process.env.PORT || 3000;
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const aedes = await Aedes.createBroker();
const mqttServer = net.createServer(aedes.handle);
app.set("aedes", aedes);

const authenticatedDevices = new Map();

aedes.authenticate = async (client, username, password, callback) => {
  const apiKey = password ? password.toString() : null;
  if (!apiKey) return callback(new Error("API Key required"), null);

  try {
    const device = await prisma.device.findUnique({ where: { apiKey } });
    if (!device) return callback(new Error("Device not recognized"), null);

    client.deviceId = device.id;
    authenticatedDevices.set(client.id, { deviceId: device.id });

    await prisma.device.update({
      where: { id: device.id },
      data: { status: "ONLINE", lastSeen: new Date() },
    });

    io.to(`device:${device.id}`).emit("device:status", {
      deviceId: device.id,
      status: "ONLINE",
      timestamp: new Date().toISOString(),
    });

    console.log(`[MQTT] Device connected & authenticated: ${device.name} (${device.id})`);
    callback(null, true);
  } catch (err) {
    console.error("[MQTT Auth Error]:", err.message);
    callback(err, null);
  }
};

aedes.on("clientDisconnect", async (client) => {
  const meta = authenticatedDevices.get(client.id);
  if (meta) {
    try {
      await prisma.device.update({
        where: { id: meta.deviceId },
        data: { status: "OFFLINE", lastSeen: new Date() },
      });

      io.to(`device:${meta.deviceId}`).emit("device:status", {
        deviceId: meta.deviceId,
        status: "OFFLINE",
        timestamp: new Date().toISOString(),
      });
      console.log(`[MQTT] Device disconnected: ${meta.deviceId}`);
    } catch (err) {
      console.error("[MQTT Disconnect DB Error]:", err.message);
    }
    authenticatedDevices.delete(client.id);
  }
});

aedes.on("publish", async (packet, client) => {
  if (!client || !client.deviceId || packet.topic !== "grobot/telemetry") return;

  try {
    const raw = JSON.parse(packet.payload.toString());
    const newReading = {
      deviceId: client.deviceId,
      temperature: Number(raw.temperature),
      humidity: Number(raw.humidity),
      light: Number(raw.light),
      soilMoisture: Number(raw.soilMoisture),
      rawAdc: raw.rawAdc ? Number(raw.rawAdc) : null,
      createdAt: new Date(),
    };

    telemetryBuffer.push(newReading);
    io.to(`device:${client.deviceId}`).emit("telemetry:new", newReading);
  } catch (err) {
    console.error("[MQTT Ingest Error]:", err.message);
  }
});

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/telemetry", telemetryRouter);

io.on("connection", (socket) => {
  console.log(`[WebSocket] Web Client connected: ${socket.id}`);

  socket.on("join:device", (deviceId) => {
    socket.join(`device:${deviceId}`);
    console.log(`[WebSocket] Web Client joined room: device:${deviceId}`);
  });

  socket.on("disconnect", () => {
    console.log(`[WebSocket] Web Client disconnected: ${socket.id}`);
  });
});

process.on("SIGINT", async () => {
  console.log("Server shutting down... Flushing buffer to database.");
  await sendBufferToDB();
  process.exit(0);
});

mqttServer.listen(MQTT_PORT, () => {
  console.log(`[MQTT] Broker listening on port: ${MQTT_PORT}`);
});

server.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});

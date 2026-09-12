import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/device.js";
import telemetryRouter, { sendBufferToDB, telemetryBuffer } from "./routes/telemetry.js";
import http from "http";
import { WebSocketServer } from "ws";
import { prisma } from "./db.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Setup native WebSocket servers
const robotWss = new WebSocketServer({ noServer: true });
const dashboardWss = new WebSocketServer({ noServer: true });

const robotClients = new Map(); // key: deviceId, value: ws
const dashboardClients = new Set(); // set of active browser sockets

app.set("robotClients", robotClients);

// Route incoming WebSocket connections by URL path
server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (pathname === "/ws/robot") {
    robotWss.handleUpgrade(request, socket, head, (ws) => {
      robotWss.emit("connection", ws, request);
    });
  } else if (pathname === "/ws/dashboard") {
    dashboardWss.handleUpgrade(request, socket, head, (ws) => {
      dashboardWss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Broadcast helper for web browsers
function broadcastToDashboard(payload) {
  const message = JSON.stringify(payload);
  for (const client of dashboardClients) {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  }
}

// 1. ESP32 Robot WebSocket Handler
robotWss.on("connection", async (ws, req) => {
  const apiKey = req.headers["x-api-key"];
  const clientId = req.headers["x-device-id"] || "Unknown";

  if (!apiKey) {
    console.log("[WS Robot] Rejected: Missing x-api-key");
    ws.close(4001, "API Key Required");
    return;
  }

  try {
    const device = await prisma.device.findUnique({ where: { apiKey } });
    if (!device) {
      console.log(`[WS Robot] Rejected: Invalid key (${clientId})`);
      ws.close(4002, "Device Not Recognized");
      return;
    }

    ws.deviceId = device.id;
    robotClients.set(device.id, ws);

    await prisma.device.update({
      where: { id: device.id },
      data: { status: "ONLINE", lastSeen: new Date() },
    });

    broadcastToDashboard({
      event: "device:status",
      deviceId: device.id,
      status: "ONLINE",
    });

    console.log(`[WS Robot] Online: ${device.name} (${device.id})`);

    ws.on("message", (data, isBinary) => {
      if (isBinary) return; // Audio chunk placeholder

      try {
        const raw = JSON.parse(data.toString());
        if (raw.type === "telemetry") {
          const newReading = {
            deviceId: device.id,
            temperature: Number(raw.temperature),
            humidity: Number(raw.humidity),
            light: Number(raw.light),
            soilMoisture: Number(raw.soilMoisture),
            rawAdc: raw.rawAdc ? Number(raw.rawAdc) : null,
            createdAt: new Date(),
          };

          telemetryBuffer.push(newReading);
          broadcastToDashboard({
            event: "telemetry:new",
            data: newReading,
          });
        }
      } catch (err) {
        console.error("[WS Telemetry Parse Error]:", err.message);
      }
    });

    ws.on("close", async () => {
      robotClients.delete(device.id);
      try {
        await prisma.device.update({
          where: { id: device.id },
          data: { status: "OFFLINE", lastSeen: new Date() },
        });

        broadcastToDashboard({
          event: "device:status",
          deviceId: device.id,
          status: "OFFLINE",
        });
        console.log(`[WS Robot] Disconnected: ${device.id}`);
      } catch (err) {
        console.error("[WS Disconnect Error]:", err.message);
      }
    });
  } catch (err) {
    console.error("[WS Auth Error]:", err.message);
    ws.close(1011, "Internal Server Error");
  }
});

// 2. Web Dashboard WebSocket Handler
dashboardWss.on("connection", (ws) => {
  dashboardClients.add(ws);
  console.log("[WS Dashboard] Web client connected");

  ws.on("close", () => {
    dashboardClients.delete(ws);
    console.log("[WS Dashboard] Web client disconnected");
  });
});

// REST Middleware & Routes
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/telemetry", telemetryRouter);

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down... Flushing buffer to database.");
  await sendBufferToDB();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`HTTP and native WebSockets running on port: ${PORT}`);
});
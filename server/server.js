import express from "express";
import cors from "cors";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
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
const dashboardClients = new Set(); // set of active browser sockets so that there are no two devices with same id

app.set("robotClients", robotClients);

// Route incoming WebSocket connections by URL path
server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
//check if the current communication is with robo or with dashboard
  if (pathname === "/ws/robot") {
    robotWss.handleUpgrade(request, socket, head, (ws) => {
      // if its from robo then use the robo server to emit connection request
      robotWss.emit("connection", ws, request);
    });
  } else if (pathname === "/ws/dashboard") {
    // else if its from dashboard then use the dashboard server to emit connection request
    dashboardWss.handleUpgrade(request, socket, head, (ws) => {
      dashboardWss.emit("connection", ws, request);
    });
  } else {
    //if its from neither then just exit
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
    ws.lastSeen = Date.now();

    // If there is an existing socket for this device, clean up the old zombie connection
    if (robotClients.has(device.id)) {
      const oldWs = robotClients.get(device.id);
      if (oldWs && oldWs !== ws) {
        oldWs.isReplaced = true;
        oldWs.terminate();
      }
    }

    //adds the device in in our roboclients list
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

    let lastMetricsLog = 0;

    ws.on("message", (data, isBinary) => {
      if (isBinary) return; 

      ws.lastSeen = Date.now();

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

          // Log real-time metrics once every ~60 seconds to avoid spamming the log
          const now = Date.now();
          if (now - lastMetricsLog >= 60000) {
            lastMetricsLog = now;
            console.log(
              `[Telemetry] ${device.name} | Temp: ${newReading.temperature}°C | Hum: ${newReading.humidity}% | Soil: ${newReading.soilMoisture}% (Raw: ${newReading.rawAdc ?? "N/A"}) | Light: ${newReading.light} | Buffer: ${telemetryBuffer.length}`
            );
          }
        }
      } catch (err) {
        console.error("[WS Telemetry Parse Error]:", err.message);
      }
    });

    ws.on("close", async (code, reason) => {
      // If this socket was replaced by a newer connection, don't delete from map or mark OFFLINE
      if (ws.isReplaced) {
        return;
      }

      if (robotClients.get(device.id) === ws) {
        robotClients.delete(device.id);
      }

      const reasonStr = reason ? reason.toString() : "No reason provided";
      console.log(`[WS Robot] Disconnected: ${device.name} (${device.id}) [Code: ${code}, Reason: ${reasonStr}]`);

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
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development and production frontends with credentials
    callback(null, true);
  },
  credentials: true,
}));

// Mount Better Auth handler (must be mounted before express.json body parser)
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/telemetry", telemetryRouter);

// Lightweight health check route for uptime monitors (UptimeRobot, cron jobs)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Check every 10s if connected robots have sent telemetry recently
// (ESP32 sends every 5s; if silent for >20s, the socket is dead)
const heartbeatInterval = setInterval(() => {
  const now = Date.now();
  for (const [deviceId, ws] of robotClients.entries()) {
    if (now - (ws.lastSeen || 0) > 20000) {
      console.log(`[WS Inactivity] Robot ${deviceId} quiet for >20s (missed telemetry), terminating dead socket.`);
      ws.terminate();
    }
  }
}, 10000);

// Graceful Shutdown (SIGINT = Ctrl+C locally, SIGTERM = Render/cloud stopping the process)
async function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down... Flushing buffer to database.`);
  clearInterval(heartbeatInterval);
  await sendBufferToDB();
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

server.listen(PORT, () => {
  console.log(`HTTP and native WebSockets running on port: ${PORT}`);
});

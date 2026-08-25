import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/device.js";
import telemetryRouter, { sendBufferToDB } from "./routes/telemetry.js";
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

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/telemetry", telemetryRouter);

const activeSockets = new Map();

io.on("connection", (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  socket.on("join:device", async (deviceId) => {
    socket.join(`device:${deviceId}`);
    activeSockets.set(socket.id, deviceId);
    console.log(`[WebSocket] Client joined room: device:${deviceId}`);
    try {
      await prisma.device.update({
        where: { id: deviceId },
        data: {
          status: "ONLINE",
          lastSeen: new Date(),
        },
      });
    } catch (err) {
      console.error(
        `[DB Error] Setting device ${deviceId} ONLINE:`,
        err.message,
      );
    }

    io.to(`device:${deviceId}`).emit("device:status", {
      deviceId,
      status: "ONLINE",
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", async () => {
    const deviceId = activeSockets.get(socket.id);

    if (deviceId) {
      console.log(`[WebSocket] Device ${deviceId} disconnected`);

      try {
        await prisma.device.update({
          where: { id: deviceId },
          data: {
            status: "OFFLINE",
            lastSeen: new Date(),
          },
        });
      } catch (err) {
        console.error(
          `[DB Error] Setting device ${deviceId} OFFLINE:`,
          err.message,
        );
      }
      io.to(`device:${deviceId}`).emit("device:status", {
        deviceId,
        status: "OFFLINE",
        timestamp: new Date().toISOString(),
      });

      activeSockets.delete(socket.id);
    } else {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    }
  });
});

process.on("SIGINT", async () => {
  console.log("Server shutting down... Flushing buffer to database.");
  await sendBufferToDB();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});

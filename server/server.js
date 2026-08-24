import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/device.js";
import telemetryRouter, { sendBufferToDB } from "./routes/telemetry.js";
import http from "http";
import { Server } from "socket.io";

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

io.on("connection", (socket) =>{
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  socket.on("join:device", (deviceId)=>{
    socket.join(`device:${deviceId}`);
    console.log(`[WebSocket] Client joined room: device:${deviceId}`);
  });

    socket.on("disconnect", ()=>{
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
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
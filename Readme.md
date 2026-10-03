# Grobot Ecosystem: All that you need to make your own Grobot.

## About the Project

Grobot is a **work-in-progress**, fully open source, interactive plant monitoring robot. Its goal is to encourage both kids and adults to take better care of their plants through a gamified experience, adapting its behaviour and responses based on how the user interacts with it.

> **This project is actively under development.** Expect incomplete features, breaking changes, and evolving documentation.

---

## Intro Video

<!-- YouTube embed – Grobot introduction short -->
<a href="https://youtube.com/shorts/FiVdCFkAqFk?si=NA1cAENFp8xfccr_" target="_blank">
  <img src="https://img.youtube.com/vi/FiVdCFkAqFk/hqdefault.jpg" alt="Grobot Intro Video" width="360" />
</a>

*(Click the thumbnail to watch on YouTube)*

---

## System Blueprint

<img width="600" alt="Grobot System Blueprint" src="https://github.com/user-attachments/assets/71b983c1-0fbb-4478-a665-a268b9af661c" />

---

## Folder Structure

```
grobot-ecosystem/
├── firmware/          # ESP32 embedded OS — eye animations, sensors, Wi-Fi, WebSockets
├── server/            # Node.js backend — REST API, WebSocket bridge, database
└── web/               # Frontend dashboard — (work in progress, nothing runnable yet)
```

---

## What's Working Right Now

### Firmware (`/firmware`)
- Dual-core FreeRTOS execution (eyes on Core 1, sensors + Wi-Fi on Core 0)
- Procedural spring-physics eye animations driven by mood state
- Capacitive touch pat detection
- Soil moisture, temperature, humidity, light sensor readings (BME280 + ADC)
- Wi-Fi auto-connect with captive portal fallback for credential setup
- Live WebSocket telemetry streaming to the backend server
- Mood-based idle behaviour system (happy → bored → sleepy → neglected timeline)

**To run the firmware you need:**
- An **ESP32** board (Dev Module or equivalent)
- **TFT_eSPI** library — display driver
- **Grobot_Animations** library — spring-physics eye rendering engine *(bundled in `/firmware/libraries`)*
- **ArduinoJson** (v7.x) — JSON serialisation
- **WebSockets** by Markus Sattler — WebSocket client
- **Adafruit BME280** + **Adafruit Unified Sensor** — environmental sensor drivers

### Server (`/server`)
- Express REST API with JWT auth (signup, login, protected routes)
- Device registration and API key management
- Native WebSocket server — dual path routing (`/ws/robot` for ESP32, `/ws/dashboard` for browser)
- Live telemetry ingestion from Grobot into an in-memory buffer, auto-flushed to PostgreSQL (Neon)
- Real-time broadcast of sensor data and device status to connected dashboards
- Prisma ORM with PostgreSQL (tested with [Neon](https://neon.tech))

**To run the server you need:**
- **Node.js** v18 or later
- **npm** (comes with Node)
- A **PostgreSQL database** — Neon (serverless Postgres) is recommended and free to start
- All npm dependencies (installed via `npm install`) — key ones: Express, Prisma, ws, bcryptjs, jsonwebtoken, zod, dotenv

### Frontend (`/web`)
- Vite + React scaffold is in place
- No functional UI yet — coming soon

---

## Going Deeper

The above is a quick overview of what's needed to get each part running.

> For a full step-by-step setup guide — including exact configuration, environment variables, database setup, and flashing instructions — check each folder's own README:
> - **[firmware/Readme.md](./firmware/Readme.md)** — complete firmware setup and flashing guide
> - **[server/Readme.md](./server/Readme.md)** — complete server setup, database config, and API reference

---

## License

[MIT](./LICENSE.md) — free to use, build on, and contribute to.

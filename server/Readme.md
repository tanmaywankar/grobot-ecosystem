# Grobot Server — Backend API & WebSocket Engine

Node.js backend powering the Grobot ecosystem. Handles device authentication, real-time WebSocket communication between ESP32 robots and the web dashboard, telemetry ingestion, and persistent storage via PostgreSQL.

> **Work in progress.** Core API and WebSocket layer are functional. Frontend integration is ongoing.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Database Setup (Neon PostgreSQL)](#3-database-setup-neon-postgresql)
4. [Installation](#4-installation)
5. [Environment Variables](#5-environment-variables)
6. [Database Migration (Prisma)](#6-database-migration-prisma)
7. [Running the Server](#7-running-the-server)
8. [API Reference](#8-api-reference)
9. [WebSocket Endpoints](#9-websocket-endpoints)
10. [Registering a Grobot Device](#10-registering-a-grobot-device)

---

## 1. Architecture Overview

```
ESP32 Grobot ──WebSocket(/ws/robot)──┐
                                     ├── grobot-server ──── PostgreSQL (Neon)
Web Dashboard ─WebSocket(/ws/dashboard)┘        │
                                              REST API (/api/v1/...)
```

- **ESP32** connects over `ws://server:8080/ws/robot` with an API key header.
- **Dashboard** connects over `ws://server:8080/ws/dashboard` to receive live telemetry.
- The server bridges them in real time — when the robot sends sensor data, all connected dashboards receive it instantly.
- Telemetry is also buffered in RAM and periodically flushed to the database.

---

## 2. Prerequisites

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9 or later (bundled with Node.js)
- A **PostgreSQL database** — [Neon](https://neon.tech) is recommended (free tier, serverless, no local install needed)

---

## 3. Database Setup (Neon PostgreSQL)

Neon gives you a free serverless PostgreSQL database that works out of the box with Prisma. You can also use any standard PostgreSQL instance (local or hosted) — just adapt the `DATABASE_URL`.

### Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new **Project** (e.g. `grobot`).
3. From the project dashboard, click **Connection Details**.
4. Copy the **Connection string** — it looks like:
   ```
   postgresql://neondb_owner:<password>@ep-xxxx.neon.tech/neondb?sslmode=require
   ```
5. Save this — you'll use it as your `DATABASE_URL` in the next step.

### Using a Local PostgreSQL

If you prefer to run PostgreSQL locally:
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).
2. Create a database: `createdb grobot`
3. Your connection string will be: `postgresql://postgres:<password>@localhost:5432/grobot`

---

## 4. Installation

```bash
# From the repo root, navigate into the server folder
cd server

# Install all dependencies
npm install
```

---

## 5. Environment Variables

Create a `.env` file inside the `server/` folder (it's already in `.gitignore` so it won't be committed):

```env
# PostgreSQL connection string (from Neon or your local DB)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Secret key used to sign JWT tokens — set this to any long random string
JWT_SECRET="your_super_secret_jwt_key_here"

# Port for the server to listen on (defaults to 8080 if not set)
PORT=8080
```

> **Never commit your `.env` file.** It's already listed in `.gitignore`.

---

## 6. Database Migration (Prisma)

Prisma manages the database schema. Run this once after setting up your database and `.env`:

```bash
# From inside the server/ folder
npx prisma db push
```

This reads `prisma/schema.prisma` and creates all the tables (`User`, `Device`, `TelemetryLog`) in your database. You can verify it worked by running:

```bash
npx prisma studio
```

This opens a browser-based GUI to browse your database tables.

---

## 7. Running the Server

```bash
# Development mode (auto-restarts on file changes via nodemon)
npm run dev

# Production mode
npm start
```

You should see:
```
HTTP and native WebSockets running on port: 8080
```

The server is now listening for:
- REST API requests at `http://localhost:8080/api/v1/...`
- ESP32 WebSocket connections at `ws://localhost:8080/ws/robot`
- Dashboard WebSocket connections at `ws://localhost:8080/ws/dashboard`

---

## 8. API Reference

All REST routes are prefixed with `/api/v1`.

### Auth — `/api/v1/auth`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/signup` | `{ name, email, password }` | Create a new user account |
| `POST` | `/login` | `{ email, password }` | Log in and receive a JWT token |

The JWT token returned from `/login` must be sent as a Bearer token in the `Authorization` header for all protected routes:
```
Authorization: Bearer <your_token>
```

### Devices — `/api/v1/devices` *(protected)*

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/` | `{ name, plantType? }` | Register a new Grobot device (generates API key) |
| `GET` | `/` | — | List all devices linked to the logged-in user |
| `GET` | `/:id` | — | Get details for a specific device |
| `GET` | `/:id/telemetry` | — | Get recent telemetry history for a device |

### Telemetry — `/api/v1/telemetry` *(protected)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/live` | Get latest buffered sensor readings (in-memory, most recent) |
| `GET` | `/history/:deviceId` | Get paginated sensor history for a device from the database |

---

## 9. WebSocket Endpoints

### `/ws/robot` — ESP32 Connection

The ESP32 connects here. Required headers:

```
x-api-key: <device_api_key>       # the key generated when you registered the device
x-device-id: <any_identifier>     # a human-readable ID string (e.g. "Grobot-AABBCC")
```

Once connected, the ESP32 sends telemetry as JSON text frames:

```json
{
  "type": "telemetry",
  "temperature": 24.5,
  "humidity": 60.2,
  "light": 1840,
  "soilMoisture": 42,
  "rawAdc": 2100
}
```

The server authenticates the key, marks the device `ONLINE` in the database, and forwards all telemetry to connected dashboards.

### `/ws/dashboard` — Web Dashboard Connection

No authentication required at this stage. Any client connecting here receives all live telemetry broadcasts:

```json
{ "event": "telemetry:new", "data": { ...sensorFields } }
{ "event": "device:status", "deviceId": "...", "status": "ONLINE" }
```

---

## 10. Registering a Grobot Device

After the server is running:

1. **Sign up** via `POST /api/v1/auth/signup` with your name, email, and password.
2. **Log in** via `POST /api/v1/auth/login` — save the JWT token from the response.
3. **Register a device** via `POST /api/v1/devices` (with `Authorization: Bearer <token>`):
   ```json
   { "name": "My Grobot", "plantType": "monstera" }
   ```
4. The response includes an `apiKey` — copy this into `Secrets.h` in the firmware as `SECRET_API_KEY`.
5. Set `SECRET_BROKER_IP` in `Secrets.h` to the local IP of the machine running this server.
6. Flash the firmware — the Grobot will now authenticate and connect automatically.

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| Express | v5.x | HTTP REST API |
| ws | v8.x | Native WebSocket server |
| Prisma | v7.x | ORM & database migrations |
| @prisma/adapter-pg | v7.x | Neon-compatible Prisma driver |
| bcryptjs | v3.x | Password hashing |
| jsonwebtoken | v9.x | JWT auth tokens |
| zod | v4.x | Request validation |
| dotenv | v17.x | Environment variable loading |
| nodemon | v3.x | Dev auto-restart |

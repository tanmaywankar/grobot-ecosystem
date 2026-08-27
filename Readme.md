# Grobot Ecosystem: All that you need to make your own grobot.


## About the project
Grobot is a work-in-progress, fully open source, interactive plant monitoring robot. Its goal is to encourage both kids and adults to take better care of their plants through a gamified experience, adapting its behavior and responses based on how the user interacts with it.


## System Blueprint
<img width="600" alt="image" src="https://github.com/user-attachments/assets/71b983c1-0fbb-4478-a665-a268b9af661c" />


## Development Roadmap
> Current focus is on esp32 see the firmware folder for list of tasks
### Tasks Remaining/completed

<details>
<summary><b>1. Telemetry Ingestion (Sensor Data)</b></summary>

- [x] Set up Express server & security key check
- [x] Validate sensor readings (Zod rules)
- [x] Temporary memory buffer (RAM storage)
- [x] Connect database client (Prisma/Neon)
- [x] Auto-save buffered sensor logs to database
- [x] Endpoints to view live state & sensor history

</details>

<details>
<summary><b>2. Auth & User Management</b></summary>

- [x] User signup & secure password encryption
- [x] User login & session tokens (JWT)
- [x] Protect dashboard routes for logged-in users
- [x] Add new Grobot device & generate its unique API key
- [x] View & manage linked devices
- [x] Ingest device telemetry & update online status

</details>

<details>
<summary><b>3. Real-time Dispatch (Live Sync)</b></summary>

- [x] WebSockets setup for instant communication
- [x] Stream live sensor updates to the dashboard
- [x] Send remote commands to Grobot
- [x] Track online/offline device status
</details>

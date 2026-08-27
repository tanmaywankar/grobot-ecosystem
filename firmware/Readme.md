# Grobot Firmware: Onboard OS & Architecture

This directory houses the core embedded software powering the Grobot hardware platform. It is written in C++ for the ESP32 using the Arduino framework and FreeRTOS. Features include dual-core execution, driving real time procedural spring animations, low latency Socket.io telemetry, non blocking audio generation, and capacitive touch navigation without dropping frames.

---

## Getting Started & Usage

### 1. Prerequisites & Dependencies
Install the required libraries in your Arduino IDE or PlatformIO environment:
* **TFT_eSPI** (Optimized display driver for SPI screens)
* **Grobot_Animations** (Spring-physics procedural eye rendering engine)
* **ArduinoJson** (v7.x for JSON telemetry serialization)
* **SocketIOclient / WebSockets** (Real-time duplex communication)
* **Adafruit BME280** (Environmental sensor drivers)

### 2. Display Configuration (`User_Setup.h`)
Configure `TFT_eSPI` by referencing the pin assignments in your local `User_Setup.h`:
* Select your driver: `#define ILI9341_DRIVER` or `#define ST7789_DRIVER`
* Ensure SPI lines match hardware: `MOSI: 23`, `SCLK: 18`, `CS: 15`, `DC: 2`, `RST: 4`

### 3. Flashing the Board
1. Connect your ESP32 board via USB.
2. Select **ESP32 Dev Module** as the target board.
3. Open `Grobot_Firmware.ino` (or PlatformIO main file).
4. Set your Wi-Fi credentials or use the onboard captive portal.
5. Compile and flash to the device.

---

## Development Roadmap
> Current focus is on ESP32 coding.

### Tasks Remaining / In Progress
<details open>
<summary><b>1. Core Link: Live Eyes & Web Control (Current Focus)</b></summary>

- [ ] **Dual-Core Setup & Safe State:** Run WebSockets on Core 0 and Eyes on Core 1, sharing a single protected state so they don't crash into each other.
- [ ] **Wi-Fi & Socket.io Connection:** Connect to local Wi-Fi (with auto-reconnect) and link to the backend over WebSockets.
- [ ] **Two-Way Live Sync:** Send plant telemetry (temp, moisture, light) to the cloud every few seconds and let the web app change Grobot's mood live.

</details>

<details>
<summary><b>2. Screen, Touch & Sound Polish</b></summary>

- [ ] **HUD Badges & Alerts:** Draw small icons (Wi-Fi status, low-water warning) directly on top of the eye animations.
- [ ] **Touch Controls & Navigation:** Use touch pads to tap and switch between the main Eye face, plant sensor stats, and a clock screen.
- [ ] **Cute Sound Effects:** Play procedural audio chirps and beeps on a buzzer whenever moods change or buttons get tapped.

</details>

<details>
<summary><b>3. Extra Apps & Final Touches</b></summary>

- [ ] **Mini Dashboard Screens:** Add full-screen cards for detailed sensor numbers, an internet clock, and Wi-Fi diagnostic settings.
- [ ] **Auto-Dimming & Captive Portal:** Dim screen brightness based on room lighting and add a pop-up Wi-Fi setup page if your home network changes.

</details>
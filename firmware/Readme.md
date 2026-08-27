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

<details>
<summary><b>1. Dual-Core Architecture & Backend Comms (Current Priority)</b></summary>

- [ ] Configure FreeRTOS multi-threading (Pin WebSockets & Audio to Core 0, UI to Core 1)
- [ ] Implement thread-safe global `SystemState` struct guarded by FreeRTOS Mutex
- [ ] Build Socket.io client over Engine.IO v4 for real-time telemetry streaming
- [ ] Create periodic JSON telemetry dispatch task (Soil, BME280 Temp/Hum, TEMT6000 Lux)
- [ ] Implement incoming WebSocket command listener for live cloud mood overrides
- [ ] Add non-blocking Wi-Fi auto-reconnect logic and Captive Portal provisioning fallback

</details>

<details>
<summary><b>2. Eye UI & Dynamic HUD Overlay</b></summary>

- [ ] Integrate `Grobot_Animations` spring physics engine inside the Core 1 `loop()`
- [ ] Create 1-bit monochrome/RGB565 C-array bitmap icon set (Water, Sun, Wi-Fi, Alerts)
- [ ] Build dynamic HUD status overlay engine with canvas blending on `TFT_eSprite`
- [ ] Implement user preference toggle for HUD visibility synced via Web/App dashboard
- [ ] Add smart critical override logic (force-display warning badge when soil moisture < 15%)
- [ ] Optimize SPI buffer blitting (`pushSprite`) to lock steady 60 FPS without screen tearing

</details>

<details>
<summary><b>3. Sound Engine & Non-Blocking Audio Subsystem</b></summary>

- [ ] Set up FreeRTOS inter-core `soundQueue` for zero-latency audio dispatch
- [ ] Build Core 0 tone worker task using ESP32 hardware PWM (`ledcWriteTone`)
- [ ] Create procedural Cozmo-style pitch sweep functions (Happy chirp, Sad whine, Alert double-blip)
- [ ] Implement non-blocking audio trigger helper (`triggerSound(SFX_NAME)`)
- [ ] Design seamless event integration between emotion state changes and audio sweeps
- [ ] Prepare I2S audio driver stubs for future INMP441 mic and MAX98357A amp expansion

</details>

<details>
<summary><b>4. Touch Input & Lag-Free App Switcher</b></summary>

- [ ] Configure built-in capacitive touch pins (Left T4, Right T5, Top T7)
- [ ] Implement software debounce and edge-detection to eliminate ghost/repeated touches
- [ ] Build finite state machine (FSM) for screen navigation (`SCREEN_EMOTIONS`, `SCREEN_STATS`, `SCREEN_CLOCK`, `SCREEN_SETTINGS`)
- [ ] Implement single-frame screen context switching (clean display clearing without physics stalls)
- [ ] Map Top Touchpad to toggle between Home (Emotions) and the last active app widget
- [ ] Map Left and Right Touchpads to cycle forward and backward through system screens

</details>

<details>
<summary><b>5. Onboard System Apps (Stats, Clock, Settings)</b></summary>

- [ ] Build `SCREEN_STATS` plant vitals dashboard card (Soil %, Temp, Humidity, Light Lux)
- [ ] Implement NTP network time synchronization helper for local timekeeping
- [ ] Build `SCREEN_CLOCK` application featuring large digital typography and weather status
- [ ] Build `SCREEN_SETTINGS` diagnostics card displaying IP address, Wi-Fi SSID, and socket status
- [ ] Implement ambient light auto-dimming routines driven by the TEMT6000 sensor
- [ ] Add low-cost refresh intervals for static UI cards to preserve Core 1 CPU cycles

</details>
# Grobot Firmware — Onboard OS & Architecture

This directory houses the core embedded software powering the Grobot hardware platform. Written in C++ for the **ESP32** using the **Arduino framework** and **FreeRTOS**. Features include dual-core execution, real-time procedural spring-physics eye animations, low-latency WebSocket telemetry, and capacitive touch navigation — all without dropping frames.

> **Work in progress.** Core features are functional but the codebase is actively evolving.

---

## Table of Contents

1. [Prerequisites & Libraries](#1-prerequisites--libraries)
2. [Hardware Wiring](#2-hardware-wiring)
3. [Display Configuration (TFT_eSPI)](#3-display-configuration-tft_espi)
4. [Firmware Configuration](#4-firmware-configuration)
5. [Flashing to the ESP32](#5-flashing-to-the-esp32)
6. [First Boot & Wi-Fi Setup](#6-first-boot--wi-fi-setup)
7. [Development Roadmap](#7-development-roadmap)

---

## 1. Prerequisites & Libraries

### Arduino IDE Setup

1. Install [Arduino IDE 2.x](https://www.arduino.cc/en/software).
2. Add the ESP32 board package:
   - Go to **File → Preferences → Additional boards manager URLs** and add:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Open **Tools → Board → Boards Manager**, search for `esp32` by Espressif and install it.

### Required Libraries

Install all of the following via **Tools → Manage Libraries** (or copy from the bundled `/firmware/libraries` folder into your Arduino libraries directory):

| Library | Author | Purpose |
|---|---|---|
| **TFT_eSPI** | Bodmer | Optimised SPI display driver |
| **Grobot_Animations** | Tanmay Wankar | Spring-physics procedural eye engine *(bundled)* |
| **ArduinoJson** v7.x | Benoit Blanchon | JSON serialisation for telemetry |
| **WebSockets** | Markus Sattler | WebSocket client for ESP32 |
| **Adafruit BME280** | Adafruit | Temperature, humidity, pressure sensor |
| **Adafruit Unified Sensor** | Adafruit | Sensor abstraction layer (BME280 dependency) |

> **Grobot_Animations** is available in the Arduino Library Manager — search for `Grobot_Animations` and install it directly from there.

---

## 2. Hardware Wiring

| Component | ESP32 Pin |
|---|---|
| TFT MOSI | GPIO 23 |
| TFT SCLK | GPIO 18 |
| TFT CS | GPIO 15 |
| TFT DC | GPIO 2 |
| TFT RST | GPIO 4 |
| BME280 SDA | GPIO 21 |
| BME280 SCL | GPIO 22 |
| Soil Moisture Sensor | GPIO 34 (ADC) |
| Light Sensor | GPIO 35 (ADC) |
| Touch Pad Left | GPIO 13 |
| Touch Pad Right | GPIO 12 |

---

## 3. Display Configuration (TFT_eSPI)

`TFT_eSPI` requires a `User_Setup.h` file to know which display driver and pins you're using. This file lives inside the TFT_eSPI library folder.

1. Navigate to your Arduino libraries folder and open `TFT_eSPI/User_Setup.h`.
2. Comment out any existing driver and uncomment the one that matches your display:
   ```cpp
   // #define ILI9341_DRIVER   // uncomment if using ILI9341
   #define ST7789_DRIVER       // uncomment if using ST7789
   ```
3. Set the resolution (for a 320×120 strip display):
   ```cpp
   #define TFT_WIDTH  240
   #define TFT_HEIGHT 135
   ```
4. Verify the pin definitions match the wiring table above:
   ```cpp
   #define TFT_MOSI 23
   #define TFT_SCLK 18
   #define TFT_CS   15
   #define TFT_DC    2
   #define TFT_RST   4
   ```

---

## 4. Firmware Configuration

Open `firmware/Grobot_OS/Secrets.h` and set your backend server's IP and your device's API key (generated from the server after registering a device):

```cpp
#define SECRET_BROKER_IP  "192.168.x.x"   // IP of the machine running the Grobot server
#define SECRET_API_KEY    "gb_your_key"    // API key from the server's device registration
```

> The Wi-Fi credentials (SSID & password) are **not** stored in code — they are entered via the captive portal on first boot (see §6).

---

## 5. Flashing to the ESP32

1. Connect the ESP32 to your computer via USB.
2. In Arduino IDE, select:
   - **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
   - **Tools → Port** → select the correct COM port
3. Open `firmware/Grobot_OS/Grobot_OS.ino`.
4. Click **Upload** (▶).
5. Open **Tools → Serial Monitor** at baud rate `115200` to see boot logs.

---

## 6. First Boot & Wi-Fi Setup

On first boot (or if no Wi-Fi credentials are saved), Grobot automatically starts a **captive portal**:

1. On your phone or computer, connect to the Wi-Fi network named **`Grobot-Setup`**.
2. A setup page will open automatically (if it doesn't, navigate to `192.168.4.1` in your browser).
3. Select your home Wi-Fi network from the list, enter the password, and enter the backend server's IP address.
4. Tap **Save & Connect** — Grobot will reboot and connect automatically.

On subsequent boots, Grobot connects to the saved network automatically. If the connection drops, it retries every 10 seconds before falling back to the captive portal again.

---

## 7. Development Roadmap

> Current focus is on stabilising the core link between the ESP32 and backend server.

<details open>
<summary><b>1. Core Link: Live Eyes & Web Control (Current Focus)</b></summary>

- [x] Dual-core FreeRTOS setup with shared mutex-protected sensor state
- [x] Wi-Fi auto-connect with captive portal fallback
- [x] WebSocket telemetry streaming to backend (temperature, humidity, soil, light)
- [x] Touch pat detection & mood system
- [ ] Receive mood override commands from web dashboard

</details>

<details>
<summary><b>2. Screen, Touch & Sound Polish</b></summary>

- [ ] HUD badges & alerts (Wi-Fi status indicator, low-water warning icon)
- [ ] Touch navigation between Eye face, sensor stats screen, and clock screen
- [ ] Procedural audio chirps on mood change or button tap (buzzer)

</details>

<details>
<summary><b>3. Extra Apps & Final Touches</b></summary>

- [ ] Full-screen sensor dashboard card
- [ ] Internet clock screen
- [ ] Auto-dimming based on ambient light
- [ ] Wi-Fi diagnostic settings screen

</details>
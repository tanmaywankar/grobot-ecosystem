#include <Arduino.h>
#include "GrobotSystem.h"
#include "Sensor.h"
#include "Display.h"
#include "WiFiPortal.h"

// Shared data state & mutex
SensorData data;
SemaphoreHandle_t dataMutex;

void setup() {
  Serial.begin(115200);

  dataMutex = xSemaphoreCreateMutex();

  // 1. Start eyes and display on Core 1
  initDisplay();

  // 2. Start hardware sensors
  initSensors();

  // 3. Core 0: High-frequency touch & BME/ADC reads
  xTaskCreatePinnedToCore(
    sensorTask,
    "SensorWorker",
    4096,
    NULL,
    1,
    NULL,
    0
  );

  // 4. Core 0: Wi-Fi autoconnect / Captive Portal
  xTaskCreatePinnedToCore(
    wifiTask,
    "WiFiWorker",
    8192,
    NULL,
    1,
    NULL,
    0
  );
}

void loop() {
  // Core 1 runs eye animations and patting gestures without blocking
  updateDisplay();
}
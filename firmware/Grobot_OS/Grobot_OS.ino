#include <Arduino.h>
#include "GrobotSystem.h"
#include "Sensor.h"
#include "Display.h"

// Allocate shared state memory
SensorData data;
SemaphoreHandle_t dataMutex;

void setup() {
  Serial.begin(115200);

  // 1. Thread-safe lock
  dataMutex = xSemaphoreCreateMutex();

  // 2. Hardware initialization
  initDisplay();
  initSensors();

  // 3. Launch background worker on Core 0
  xTaskCreatePinnedToCore(
    sensorTask,
    "SensorWorker",
    4096,
    NULL,
    1,
    NULL,
    0
  );
}

void loop() {
  // Core 1 runs display and eye rendering
  updateDisplay();
}
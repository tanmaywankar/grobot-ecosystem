#include "Sensor.h"
#include "GrobotSystem.h"
#include <Wire.h>
#include <Adafruit_BME280.h>

#define SOIL_SENSOR 34
#define LIGHT_SENSOR 35
#define TOUCH_LEFT_PIN 13
#define TOUCH_RIGHT_PIN 12

// Calibration constants
#define SOIL_DRY_RAW 3200  
#define SOIL_WET_RAW 1450
#define TOUCH_THRESHOLD 20

static Adafruit_BME280 bme;

static int readSmoothedADC(int pin, int samples = 16)
{
  long sum = 0;
  for (int i = 0; i < samples; i++)
  {
    sum += analogRead(pin);
    delayMicroseconds(200);
  }
  return sum / samples;
}

void initSensors()
{
  Wire.begin(21, 22);
  if (!bme.begin(0x76, &Wire) && !bme.begin(0x77, &Wire))
  {
    Serial.println("[WARNING] BME280 not found, check wiring!");
  }
}

void sensorTask(void *pvParameters)
{
  uint32_t lastEnvRead = 0;
  bool prevLeft = false;
  bool prevRight = false;

  for (;;)
  {

    bool left = touchRead(TOUCH_LEFT_PIN) < TOUCH_THRESHOLD;
    bool right = touchRead(TOUCH_RIGHT_PIN) < TOUCH_THRESHOLD;

    if (left != prevLeft || right != prevRight)
    {
      Serial.printf("[TOUCH INSTANT] Left: %d | Right: %d\n", left, right);
      prevLeft = left;
      prevRight = right;
    }

    // Always update touch state to shared memory immediately
    if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(10)) == pdTRUE)
    {
      data.isLeftTouched = left;
      data.isRightTouched = right;
      xSemaphoreGive(dataMutex);
    }

    // 2. Low-frequency environmental & analog scan (every 1 second)
    if (millis() - lastEnvRead >= 1000)
    {
      lastEnvRead = millis();

      float temp = bme.readTemperature();
      float hum = bme.readHumidity();
      float pres = bme.readPressure() / 100.0F;

      int rawSoil = readSmoothedADC(SOIL_SENSOR);
      int rawLight = readSmoothedADC(LIGHT_SENSOR);

      // Convert raw soil voltage to 0-100% moisture
      int soilPercent = constrain(map(rawSoil, SOIL_DRY_RAW, SOIL_WET_RAW, 0, 100), 0, 100);

      // Thread-safe update for environmental data
      if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(50)) == pdTRUE)
      {
        data.temperature = isnan(temp) ? data.temperature : temp;
        data.humidity = isnan(hum) ? data.humidity : hum;
        data.pressure = isnan(pres) ? data.pressure : pres;
        data.soilMoisture = soilPercent;
        data.light = rawLight;
        xSemaphoreGive(dataMutex);
      }

      Serial.printf(
          "[Sensors] Temp: %.1fC | Hum: %.1f%% | Pres: %.1fhPa | Soil: %d%% (Raw: %d) | Light: %d\n",
          temp, hum, pres, soilPercent, rawSoil, rawLight);
    }

    vTaskDelay(pdMS_TO_TICKS(30));
  }
}
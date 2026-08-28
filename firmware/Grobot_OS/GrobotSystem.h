#pragma once
#include <Arduino.h>

struct SensorData {
  float temperature = 0.0f;
  float humidity    = 0.0f;
  float pressure    = 0.0f;
  int   soilMoisture = 0;
  int   light       = 0;
  bool  isLeftTouched  = false;
  bool  isRightTouched = false;
};

extern SensorData data;
extern SemaphoreHandle_t dataMutex;
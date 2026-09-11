#pragma once
#include <Arduino.h>
void wifiTask(void *pvParameters);
bool isWiFiConnected();
String getSavedBrokerHost();
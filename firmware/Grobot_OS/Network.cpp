#include "Network.h"
#include "GrobotSystem.h"
#include "WiFiPortal.h"
#include "Secrets.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Low-level TCP client and MQTT wrapper
static WiFiClient espClient;
static PubSubClient mqttClient(espClient);

// Broker details
static const char *BROKER_IP = SECRET_BROKER_IP;
static const uint16_t BROKER_PORT = 1883;

static const char *API_KEY = SECRET_API_KEY;

// Timers for non-blocking execution
static uint32_t lastMqttReconnect = 0;
static uint32_t lastTelemetrySend = 0;

static void checkMqtt(){
    if (!isWiFiConnected || mqttClient.connected())
        return;

    uint32_t now = millis();

    if (now - lastMqttReconnect >= 5000)
    {
        lastMqttReconnect = now;

        String mac = WiFi.macAddress();
        String clientid = "Grobot-" + mac.substring(mac.length() - 5);
        clientid.replace(":", "");

        if (mqttClient.connect(clientid.c_str(), "grobot", API_KEY))
        {
            Serial.println("CONNECTED!");
        }
        else
        {
            Serial.print("FAILED (rc=");
            Serial.print(mqttClient.state());
            Serial.println(")");
        }
    }
}

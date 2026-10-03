#include "GrobotNetwork.h"
#include "GrobotSystem.h"
#include "WiFiPortal.h"
#include "Secrets.h"
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WebSockets client instance
static WebSocketsClient webSocket;

// Server details
static const uint16_t SERVER_PORT = 8080;
static const char *WS_PATH = "/ws/robot";
static const char *API_KEY = SECRET_API_KEY;

static String activeServerHost = "";
static bool wsConnected = false;

// Timers for non-blocking execution
static uint32_t lastWsReconnect = 0;
static uint32_t lastTelemetrySend = 0;

bool isWebSocketConnected()
{
    return wsConnected;
}

static void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
    switch (type)
    {
    case WStype_DISCONNECTED:
        wsConnected = false;
        Serial.println("[WS] Disconnected from server");
        break;

    case WStype_CONNECTED:
        wsConnected = true;
        Serial.printf("[WS] Connected to ws://%s:%d%s\n", activeServerHost.c_str(), SERVER_PORT, WS_PATH);
        break;

    case WStype_TEXT:
        Serial.printf("[WS] Received: %s\n", payload);
        break;

    case WStype_ERROR:
        Serial.println("[WS] Error occurred");
        break;

    default:
        break;
    }
}

static void checkWebSocket()
{
    if (!isWiFiConnected() || wsConnected)
        return;

    uint32_t now = millis();
    if (now - lastWsReconnect >= 5000)
    {
        lastWsReconnect = now;

        // activeServerHost is read once at task startup and never changes
        // without a reboot (credentials can only change via the captive portal
        // which calls ESP.restart()), so no NVS read is needed here.
        Serial.printf("[WS] Connecting to %s:%d%s...\n", activeServerHost.c_str(), SERVER_PORT, WS_PATH);

        String mac = WiFi.macAddress();
        String clientId = "Grobot-" + mac.substring(mac.length() - 8);
        clientId.replace(":", "");

        // Configure event handler and headers BEFORE begin() so they are
        // guaranteed to be in place before the handshake is initiated.
        String extraHeaders = "x-api-key: " + String(API_KEY) + "\r\nx-device-id: " + clientId;
        webSocket.onEvent(webSocketEvent);
        webSocket.setExtraHeaders(extraHeaders.c_str());
        webSocket.setReconnectInterval(5000);

        webSocket.begin(activeServerHost.c_str(), SERVER_PORT, WS_PATH);
    }
}

static void sendTelemetry()
{
    uint32_t now = millis();
    if (now - lastTelemetrySend < 5000)
        return;
    lastTelemetrySend = now;

    SensorData current;
    if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(20)) == pdTRUE)
    {
        current = data;
        xSemaphoreGive(dataMutex);
    }
    else
    {
        return;
    }

    JsonDocument doc;
    doc["type"] = "telemetry";
    doc["temperature"] = current.temperature;
    doc["humidity"] = current.humidity;
    doc["light"] = current.light;
    doc["soilMoisture"] = current.soilMoisture;
    doc["rawAdc"] = current.rawAdc;

    char buffer[256];
    size_t len = serializeJson(doc, buffer, sizeof(buffer));

    // len == sizeof(buffer)-1 means the output was silently truncated,
    // which would produce malformed JSON. Reject it rather than send garbage.
    if (len > 0 && len < sizeof(buffer) - 1)
    {
        bool sent = webSocket.sendTXT(buffer);
        if (!sent)
        {
            Serial.println("[WS] Telemetry send failed");
        }
    }
    else if (len >= sizeof(buffer) - 1)
    {
        Serial.println("[WS] Telemetry JSON truncated — increase buffer size");
    }
}

void networkTask(void *pvParameters)
{
    Serial.println("[Network Task] Running WebSockets on Core 0");

    activeServerHost = getSavedBrokerHost();
    Serial.printf("[WS] Target Server: %s:%d\n", activeServerHost.c_str(), SERVER_PORT);

    for (;;)
    {
        if (isWiFiConnected())
        {
            checkWebSocket();
            webSocket.loop();

            if (wsConnected)
            {
                sendTelemetry();
            }
        }

        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
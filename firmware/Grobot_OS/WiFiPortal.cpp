#include "WiFiPortal.h"
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>

static WebServer server(80);
static DNSServer dnsServer;
static Preferences prefs;

static const byte DNS_PORT = 53;
static const IPAddress apIP(192, 168, 4, 1);

static String lastSSID = "";
static bool wifiReady = false;

bool isWiFiConnected() {
  return wifiReady && (WiFi.status() == WL_CONNECTED);
}

static void handleRoot() {
  int n = WiFi.scanNetworks();
  String networkListHtml = "";

  if (n == 0) {
    networkListHtml = "<div class='item muted'>No networks found</div>";
  } else {
    for (int i = 0; i < n; ++i) {
      String ssid = WiFi.SSID(i);
      int rssi = WiFi.RSSI(i);
      if (ssid.length() == 0) continue;

      String safeSSID = ssid;
      safeSSID.replace("'", "\\'");

      networkListHtml += "<div class='item' onclick=\"selectSSID('" + safeSSID + "')\">";
      networkListHtml += "<span>" + ssid + "</span>";
      networkListHtml += "<span class='rssi'>" + String(rssi) + " dBm</span>";
      networkListHtml += "</div>";
    }
  }
  WiFi.scanDelete();

  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>Grobot Wi-Fi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body {
      width: 100%; height: 100%; min-height: 100vh;
      background: #0d1117; color: #e6edf3;
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .card {
      background: #161b22; border: 1px solid #30363d;
      border-radius: 16px; width: 100%; max-width: 360px;
      padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    h2 { font-size: 20px; font-weight: 700; color: #4ade80; text-align: center; margin-bottom: 6px; }
    .subtitle { font-size: 13px; color: #8b949e; text-align: center; margin-bottom: 16px; }
    .prev-box {
      background: #21262d; border-radius: 8px; padding: 10px 12px;
      font-size: 12px; color: #8b949e; margin-bottom: 16px;
    }
    .prev-box b { color: #58a6ff; font-size: 13px; }
    .list-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #8b949e; margin-bottom: 8px; }
    .net-list {
      max-height: 160px; overflow-y: auto; background: #0d1117;
      border: 1px solid #30363d; border-radius: 8px; margin-bottom: 16px;
    }
    .item {
      padding: 10px 12px; border-bottom: 1px solid #21262d;
      font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
    }
    .item:last-child { border-bottom: none; }
    .item:hover { background: #1f242c; }
    .rssi { font-size: 11px; color: #8b949e; }
    .muted { color: #8b949e; text-align: center; cursor: default; }
    input {
      width: 100%; padding: 12px; margin-bottom: 12px;
      background: #0d1117; border: 1px solid #30363d; border-radius: 8px;
      color: #fff; font-size: 14px; outline: none;
    }
    input:focus { border-color: #4ade80; }
    button {
      width: 100%; padding: 12px; border: none; border-radius: 8px;
      background: #4ade80; color: #04260f; font-weight: 700; font-size: 14px;
      cursor: pointer;
    }
    button:active { opacity: 0.8; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Grobot Wi-Fi Setup</h2>
    <p class="subtitle">Connect your smart planter to your home network</p>
)rawliteral";

  if (lastSSID.length() > 0) {
    html += "<div class='prev-box'>Previously paired: <b>" + lastSSID + "</b></div>";
  }

  html += "<div class='list-label'>Select Wi-Fi Network</div>";
  html += "<div class='net-list'>" + networkListHtml + "</div>";

  html += R"rawliteral(
    <form action="/save" method="POST">
      <input type="text" id="ssid" name="ssid" placeholder="Network Name (SSID)" required autocomplete="off">
      <input type="password" id="password" name="password" placeholder="Password (if secured)">
      <button type="submit">Save & Connect</button>
    </form>
  </div>
  <script>
    function selectSSID(name) {
      document.getElementById('ssid').value = name;
      document.getElementById('password').focus();
    }
  </script>
</body>
</html>
)rawliteral";

  server.send(200, "text/html", html);
}

static void handleSave() {
  if (server.hasArg("ssid")) {
    String newSSID = server.arg("ssid");
    String newPass = server.arg("password");

    prefs.begin("grobot_wifi", false);
    prefs.putString("ssid", newSSID);
    prefs.putString("pass", newPass);
    prefs.end();

    String resHtml = R"rawliteral(
      <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body { background:#0d1117; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; text-align:center; font-family:sans-serif; }
        h2 { color:#4ade80; margin-bottom:8px; }
        p { color:#8b949e; font-size:14px; }
      </style></head>
      <body><div><h2>Connecting...</h2><p>Grobot is saving credentials and rebooting.</p></div></body></html>
    )rawliteral";

    server.send(200, "text/html", resHtml);
    delay(2000);
    ESP.restart();
  } else {
    server.send(400, "text/plain", "Missing SSID");
  }
}

static void startConfigPortal() {
  Serial.println("\n[WiFi] Starting AP Mode: 'Grobot-Setup'");

  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP("Grobot-Setup");

  dnsServer.start(DNS_PORT, "*", apIP);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/save", HTTP_POST, handleSave);
  server.onNotFound(handleRoot);

  server.begin();
  Serial.println("[WiFi] Web portal running at 192.168.4.1");

  while (true) {
    dnsServer.processNextRequest();
    server.handleClient();
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

void wifiTask(void *pvParameters) {
  prefs.begin("grobot_wifi", true);
  String savedSSID = prefs.getString("ssid", "");
  String savedPass = prefs.getString("pass", "");
  prefs.end();

  lastSSID = savedSSID;

  if (savedSSID.length() > 0) {
    Serial.printf("[WiFi] Connecting to saved network: %s\n", savedSSID.c_str());
    WiFi.mode(WIFI_STA);
    WiFi.begin(savedSSID.c_str(), savedPass.c_str());

    uint32_t startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
      delay(400);
      Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.printf("\n[WiFi] Connected! Local IP: %s\n", WiFi.localIP().toString().c_str());
      wifiReady = true;

      // Keep task alive to monitor Wi-Fi status
      for (;;) {
        if (WiFi.status() != WL_CONNECTED) {
          Serial.println("\n[WiFi] Connection lost. Reconnecting...");
          WiFi.reconnect();
        }
        vTaskDelay(pdMS_TO_TICKS(5000));
      }
    }
    Serial.println("\n[WiFi] Connection timed out.");
  } else {
    Serial.println("[WiFi] No saved credentials found.");
  }

  // Fallback: Launch configuration portal on Core 0
  startConfigPortal();
}
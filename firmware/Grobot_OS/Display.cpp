#include "Display.h"
#include "GrobotSystem.h"
#include <TFT_eSPI.h>
#include <Grobot_Animations.h>
#include "GrobotMoods.h"

static TFT_eSPI tft = TFT_eSPI();
static TFT_eSprite canvas = TFT_eSprite(&tft);
static GrobotEyes eyes(0x97E0, 0x0000);


static bool prevLeftTouch = false;
static bool prevRightTouch = false;
static int patStrokeCount = 0;
static uint32_t lastStrokeTime = 0;
static int lastTouchedSide = 0; // 1 = Left was last, 2 = Right was last
static uint32_t lastWiggleTime = 0;
static int wiggleStep = 0;

static bool isPatting = false;
static uint32_t patEndTime = 0;


static bool isTakenCare = true;
static uint32_t lastCareTime = 0;

static uint32_t lastGazeShift = 0;
static uint32_t gazeInterval = 15000;

static uint32_t lastNeglectCycle = 0;
static int neglectStage = 0; 

static int prevSoilMoisture = -1;


void initDisplay() {
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.invertDisplay(1);

  canvas.createSprite(320, 120);
  eyes.setEmotion(IDLE);
}

static void idleMoodSwitch(const SensorData &s) {
  uint32_t now = millis();

  if (prevSoilMoisture != -1 && (s.soilMoisture - prevSoilMoisture >= 10)) {
    isTakenCare = true;
    lastCareTime = now;
  }
  prevSoilMoisture = s.soilMoisture;

  if (lastCareTime == 0) lastCareTime = now;

  uint32_t elapsed = now - lastCareTime;

  // Time brackets in milliseconds (10m, 30m, 60m, 90m)
  const uint32_t TEN_MINS    = 10UL * 60UL * 1000UL;
  const uint32_t THIRTY_MINS = 30UL * 60UL * 1000UL;
  const uint32_t ONE_HOUR    = 60UL * 60UL * 1000UL;
  const uint32_t NINETY_MINS = 90UL * 60UL * 1000UL;

  if (elapsed < TEN_MINS) {
    eyes.setEmotion(HAPPY);
  } 
  else if (elapsed < THIRTY_MINS) {
    eyes.setEmotion(KAWAII);
  } 
  else if (elapsed < ONE_HOUR) {
    eyes.setEmotion(IDLE);
  } 
  else {
    isTakenCare = false;

    // Cycle mood every 3 minutes (180000 ms)
    if (now - lastNeglectCycle > 180000) {
      lastNeglectCycle = now;
      neglectStage = (neglectStage + 1) % 3;
    }

    if (elapsed < NINETY_MINS) {
      // Moderate neglect: alternate IDLE and BORED
      eyes.setEmotion((neglectStage % 2 == 0) ? IDLE : BORED);
    } else {
      // Heavy neglect (> 1.5h): alternate between IDLE, BORED, and FEDUP
      if (neglectStage == 0) eyes.setEmotion(IDLE);
      else if (neglectStage == 1) eyes.setEmotion(BORED);
      else eyes.setEmotion(FEDUP);
    }
  }

  // 3. Expressive lookAt shifts every 15-20s while in this mood
  if (now - lastGazeShift > gazeInterval) {
    lastGazeShift = now;
    gazeInterval = random(15000, 20001); // 15 to 20 seconds
    eyes.lookAt(random(-25, 26), random(-15, 16));
  }
}

static bool checkPatting(const SensorData &s) {
  uint32_t now = millis();

  // 1. Detect rising edges (finger touchdown)
  bool leftJustPressed  = (s.isLeftTouched && !prevLeftTouch);
  bool rightJustPressed = (s.isRightTouched && !prevRightTouch);

  prevLeftTouch  = s.isLeftTouched;
  prevRightTouch = s.isRightTouched;

  // 2. Gesture timeout (700ms reset window)
  if (patStrokeCount > 0 && (now - lastStrokeTime > 700)) {
    patStrokeCount = 0;
    lastTouchedSide = 0;
  }

  // 3. Track alternating stroke count
  if (leftJustPressed && lastTouchedSide != 1) {
    patStrokeCount++;
    lastStrokeTime = now;
    lastTouchedSide = 1;
  } else if (rightJustPressed && lastTouchedSide != 2) {
    patStrokeCount++;
    lastStrokeTime = now;
    lastTouchedSide = 2;
  }

  // 4. Trigger patting animation loop on 2 or more alternating strokes
  if (patStrokeCount >= 5) {
    isPatting = true;
    patEndTime = now + 3000; 
    patStrokeCount = 0;
    lastTouchedSide = 0;
    lastWiggleTime = 0;      
    wiggleStep = 0;
    isTakenCare = true;
    lastCareTime = now;
  }

  // 5. Active Animation Sequence
  if (isPatting) {
    if (now < patEndTime) {
      eyes.setEmotion(HAPPY);

      if (now - lastWiggleTime >= 320) {
        lastWiggleTime = now;

        int targetX;
        if (wiggleStep == 0) {
          targetX = random(-15, -7); // Swing to the left
          wiggleStep = 1;
        } else {
          targetX = random(8, 16);   // Swing to the right
          wiggleStep = 0;
        }

        // Maintain upward gaze (-26) while sweeping horizontally
        eyes.lookAt(targetX, -26);
      }

      return true; // Keep Priority 1 active
    } else {
      isPatting = false; // Animation loop finished
      eyes.lookAt(0, 0); // Return gaze to center
    }
  }

  return false;
}

void updateDisplay() {

  SensorData currentData;
  if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
    currentData = data;
    xSemaphoreGive(dataMutex);
  }

  if (!checkPatting(currentData)) {
    idleMoodSwitch(currentData);
  }

  eyes.renderEmotions(canvas);
  eyes.HUD(tft);
}
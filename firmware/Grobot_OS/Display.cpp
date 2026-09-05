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

static uint32_t lastMoodSwitch = 0;
static uint32_t moodSwitchInterval = 5000;
static int moodIndex = 0;


void initDisplay() {
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.invertDisplay(1);

  canvas.createSprite(320, 120);
  eyes.setEmotion(IDLE);
}

static void moodSwitch(bool toSwitch) {
  if (!toSwitch) return;
  if (millis() - lastMoodSwitch <= moodSwitchInterval) return;

  static const MoodData moods[] = {
    HAPPY,KAWAII, BORED, FEDUP, IDLE
  };
  const int numMoods = sizeof(moods) / sizeof(moods[0]);

  moodIndex = (moodIndex + 1) % numMoods;

  eyes.setEmotion(moods[moodIndex]);
  eyes.lookAt(random(-30, 31), random(-20, 21));

  lastMoodSwitch = millis();
  moodSwitchInterval = random(5000, 8000);
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
    patEndTime = now + 3500; 
    patStrokeCount = 0;
    lastTouchedSide = 0;
    lastWiggleTime = 0;      
    wiggleStep = 0;
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
    moodSwitch(true);
  }

  eyes.renderEmotions(canvas);
  eyes.HUD(tft);
}
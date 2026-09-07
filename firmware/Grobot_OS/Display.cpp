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
static uint32_t gazeInterval = 2000;

static uint32_t lastNeglectCycle = 0;
static int neglectStage = 0;

static int soilBaseline = -1;

static void checkSoilCare(const SensorData &s)
{
  uint32_t now = millis();

  if (soilBaseline == -1)
  {
    soilBaseline = s.soilMoisture;
    return;
  }

  // Did moisture jump >= 10% above the lowest dry baseline?
  if (s.soilMoisture - soilBaseline >= 10)
  {
    isTakenCare = true;
    lastCareTime = now;
    soilBaseline = s.soilMoisture; // Reset baseline to new wet level
  }
  // Track naturally drying soil downwards
  else if (s.soilMoisture < soilBaseline)
  {
    soilBaseline = s.soilMoisture;
  }
}

void initDisplay()
{
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.invertDisplay(1);

  canvas.createSprite(320, 120);
  eyes.setEmotion(IDLE);
}

static void idleMoodSwitch()
{
  uint32_t now = millis();

  if (lastCareTime == 0)
    lastCareTime = now;

  uint32_t elapsed = now - lastCareTime;

  // Time brackets in milliseconds (5m, 30m, 60m, 90m)
  const uint32_t FIVE_MINS = 5UL * 60UL * 1000UL;
  const uint32_t THIRTY_MINS = 30UL * 60UL * 1000UL;
  const uint32_t ONE_HOUR = 60UL * 60UL * 1000UL;
  const uint32_t NINETY_MINS = 90UL * 60UL * 1000UL;

  if (elapsed < FIVE_MINS)
  {
    eyes.setEmotion(HAPPY);
  }
  else if (elapsed < THIRTY_MINS)
  {
    eyes.setEmotion(IDLE);
  }
  else if (elapsed < ONE_HOUR)
  {
    eyes.setEmotion(BORED);
  }
  else
  {
    isTakenCare = false;

    // Cycle mood every 3 minutes (180000 ms)
    if (now - lastNeglectCycle > 180000)
    {
      lastNeglectCycle = now;
      neglectStage = (neglectStage + 1) % 3;
    }

    if (elapsed < NINETY_MINS)
    {
      eyes.setEmotion((neglectStage % 2 == 0) ? ANGRY : BORED);
    }
    else
    {
      if (neglectStage == 0)
        eyes.setEmotion(ANGRY);
      else if (neglectStage == 1)
        eyes.setEmotion(BORED);
      else
        eyes.setEmotion(FEDUP);
    }
  }

  // LookAt shifts every 15-20s while in this mood
  if (now - lastGazeShift > gazeInterval)
  {
    lastGazeShift = now;
    gazeInterval = random(2500, 6001);
    eyes.lookAt(random(-25, 26), random(-15, 16));
  }

  static uint32_t lastFidgetTime = 0;
  static uint32_t fidgetInterval = 9000;
  static bool isFidgeting = false;
  static uint32_t fidgetEndTime = 0;

  if (!isFidgeting && (now - lastFidgetTime > fidgetInterval))
  {
    isFidgeting = true;
    fidgetEndTime = now + random(700, 1200);
    lastFidgetTime = now;
    fidgetInterval = random(10000, 18000);
    if (elapsed < FIVE_MINS)
      eyes.setEmotion(KAWAII);
    else if (elapsed < THIRTY_MINS)
      eyes.setEmotion(random(0, 2) ? BORED : IDLE);
    else if (elapsed < ONE_HOUR)
      eyes.setEmotion(random(0, 2) ? FEDUP : WTHBRO);
    else
      eyes.setEmotion(random(0,2)? ANGRY : SAD);
  }

  if (isFidgeting && (now >= fidgetEndTime))
  {
    isFidgeting = false;
  }
}

static bool checkPatting(const SensorData &s)
{
  uint32_t now = millis();

  // 1. Detect rising edges (finger touchdown)
  bool leftJustPressed = (s.isLeftTouched && !prevLeftTouch);
  bool rightJustPressed = (s.isRightTouched && !prevRightTouch);

  prevLeftTouch = s.isLeftTouched;
  prevRightTouch = s.isRightTouched;

  // 2. Gesture timeout (700ms reset window)
  if (patStrokeCount > 0 && (now - lastStrokeTime > 700))
  {
    patStrokeCount = 0;
    lastTouchedSide = 0;
  }

  // 3. Track alternating stroke count
  if (leftJustPressed && lastTouchedSide != 1)
  {
    patStrokeCount++;
    lastStrokeTime = now;
    lastTouchedSide = 1;
  }
  else if (rightJustPressed && lastTouchedSide != 2)
  {
    patStrokeCount++;
    lastStrokeTime = now;
    lastTouchedSide = 2;
  }

  // 4. Trigger patting animation loop on 2 or more alternating strokes
  if (patStrokeCount >= 5)
  {
    isPatting = true;
    patEndTime = now + 3500;
    patStrokeCount = 0;
    lastTouchedSide = 0;
    lastWiggleTime = 0;
    wiggleStep = 0;
    isTakenCare = true;
    lastCareTime = now;
  }

  // 5. Active Animation Sequence
  if (isPatting)
  {
    if (now < patEndTime)
    {
      eyes.setEmotion(CUDDLE);

      if (now - lastWiggleTime >= 320)
      {
        lastWiggleTime = now;

        int targetX;
        if (wiggleStep == 0)
        {
          targetX = random(-15, -7); // Swing to the left
          wiggleStep = 1;
        }
        else
        {
          targetX = random(8, 16); // Swing to the right
          wiggleStep = 0;
        }

        // Maintain upward gaze (-26) while sweeping horizontally
        eyes.lookAt(targetX, -26);
      }

      return true; // Keep Priority 1 active
    }
    else
    {
      isPatting = false; // Animation loop finished
      eyes.lookAt(0, 0); // Return gaze to center
    }
  }

  return false;
}

void updateDisplay()
{

  SensorData currentData;
  if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(10)) == pdTRUE)
  {
    currentData = data;
    xSemaphoreGive(dataMutex);
  }

  checkSoilCare(currentData);

  if (!checkPatting(currentData))
  {
    idleMoodSwitch();
  }

  eyes.renderEmotions(canvas);
  eyes.HUD(tft);
}
#include "Display.h"
#include "GrobotSystem.h"
#include <TFT_eSPI.h>
#include <Grobot_Animations.h>
#include "GrobotMoods.h"

static TFT_eSPI tft = TFT_eSPI();
static TFT_eSprite canvas = TFT_eSprite(&tft);
static GrobotEyes eyes(0x97E0, 0x0000);

// Touch & Pat Tracking
static bool prevLeftTouch = false;
static bool prevRightTouch = false;
static int patStrokeCount = 0;
static uint32_t lastStrokeTime = 0;
static int lastTouchedSide = 0;
static uint32_t lastWiggleTime = 0;
static int wiggleStep = 0;
static bool isPatting = false;
static uint32_t patEndTime = 0;

// Care Tracking
static bool isTakenCare = true;
static uint32_t lastCareTime = 0;

// Gaze & Flutter Tracking
static uint32_t lastGazeShift = 0;
static uint32_t gazeInterval = 2500;
static uint32_t lastSleepyDriftTime = 0;

// Micro-Event Tracking
static bool inMicroEvent = false;
static uint32_t microEventEndTime = 0;
static uint32_t lastMicroEventTime = 0;
static uint32_t nextMicroEventDelay = 45000;
static int microEventPhase = 0;
static uint32_t microPhaseStepTime = 0;

static int soilBaseline = -1;

static void checkSoilCare(const SensorData &s)
{
  uint32_t now = millis();

  if (soilBaseline == -1)
  {
    soilBaseline = s.soilMoisture;
    return;
  }

  if (s.soilMoisture - soilBaseline >= 10)
  {
    isTakenCare = true;
    lastCareTime = now;
    soilBaseline = s.soilMoisture;
  }
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

static void renderSleepyPair(const MoodData &leftShape, const MoodData &rightShape, bool flip)
{
  if (!flip)
    eyes.setEmotion(leftShape, rightShape);
  else
    eyes.setEmotion(rightShape, leftShape);
}

static void handleSleepyDrift(uint32_t now)
{
  if (now - lastSleepyDriftTime >= 20000)
  {
    lastSleepyDriftTime = now;
    int baseDown = random(48, 55);
    int driftOffset = random(-8, 9);
    eyes.lookAt(0, constrain(baseDown + driftOffset, 45, 60));
  }
}

static void handleMicroEvents(uint32_t now, uint32_t elapsed)
{
  if (!inMicroEvent && (now - lastMicroEventTime >= nextMicroEventDelay))
  {
    inMicroEvent = true;
    lastMicroEventTime = now;
    microEventPhase = 0;
    microPhaseStepTime = now;
    nextMicroEventDelay = random(45000, 120001); // Every 45s to 2 mins
    microEventEndTime = now + random(8000, 18001); // Runs 8 to 18 seconds
    eyes.lookAt(0, 0);
  }

  if (inMicroEvent)
  {
    if (now >= microEventEndTime)
    {
      inMicroEvent = false;
      return;
    }

    // Stage 1 (0-5m): Satisfied alternating wink loop
    if (elapsed < 5UL * 60UL * 1000UL)
    {
      if (now - microPhaseStepTime >= 2000)
      {
        microPhaseStepTime = now;
        microEventPhase = (microEventPhase + 1) % 2;
      }
      if (microEventPhase == 0)
        eyes.setEmotion(IDLELOAD, IDLE);
      else
        eyes.setEmotion(IDLE, IDLELOAD);
    }
    // Stage 2 (5-20m): Idleload on one eye + Idle on other
    else if (elapsed < 20UL * 60UL * 1000UL)
    {
      if (now - microPhaseStepTime >= 2000)
      {
        microPhaseStepTime = now;
        microEventPhase = (microEventPhase + 1) % 2;
      }
      if (microEventPhase == 0)
        eyes.setEmotion(SATISFIED, IDLE);
      else
        eyes.setEmotion(IDLE, SATISFIED);
    }
    // Stage 3 (20-50m): Doubting or Unbelievable shrugs
    else if (elapsed < 50UL * 60UL * 1000UL)
    {
      if (now - microPhaseStepTime >= 2500)
      {
        microPhaseStepTime = now;
        microEventPhase = (microEventPhase + 1) % 2;
      }
      if (microEventPhase == 0)
        eyes.setEmotion(DOUBTING);
      else
        eyes.setEmotion(UNBELIEVABLE);
    }
  }
}

static void idleMoodSwitch()
{
  uint32_t now = millis();

  if (lastCareTime == 0)
    lastCareTime = now;

  uint32_t elapsed = now - lastCareTime;

  // Timeline Milliseconds
  const uint32_t M_5   = 5UL  * 60UL * 1000UL;
  const uint32_t M_20  = 20UL * 60UL * 1000UL;
  const uint32_t M_50  = 50UL * 60UL * 1000UL;
  const uint32_t M_70  = 70UL * 60UL * 1000UL; // Sleep descent finishes at 70 mins

  bool flipSleepSides = ((now / 120000) % 2) == 1;


  if (elapsed < M_5)
  {
    handleMicroEvents(now, elapsed);
    if (!inMicroEvent)
      eyes.setEmotion(((now / 30000) % 2 == 0) ? HAPPY : KAWAII);
  }

  else if (elapsed < M_20)
  {
    handleMicroEvents(now, elapsed);
    if (!inMicroEvent)
    {
      int sub = (now / 40000) % 3;
      if (sub == 0)      eyes.setEmotion(IDLE);
      else if (sub == 1) eyes.setEmotion(HAPPY);
      else               eyes.setEmotion(KAWAII);
    }
  }
 
  else if (elapsed < M_50)
  {
    handleMicroEvents(now, elapsed);
    if (!inMicroEvent)
    {
      int sub = (now / 45000) % 2;
      eyes.setEmotion(sub == 0 ? IDLE : BORED);
    }
  }

  else if (elapsed < M_70)
  {
    isTakenCare = false;
    uint32_t sleepElapsed = elapsed - M_50;

    if (sleepElapsed < 6UL * 60UL * 1000UL)        // 50 - 56 min (6 min)
      renderSleepyPair(SLEEPYFIRSTL, SLEEPYFIRSTR, flipSleepSides);
    else if (sleepElapsed < 10UL * 60UL * 1000UL)  // 56 - 60 min (4 min)
      renderSleepyPair(SLEEPYSECONDL, SLEEPYSECONDR, flipSleepSides);
    else                                           // 60 - 70 min (10 min initial deep sleep)
      renderSleepyPair(SLEEPYTHIRDL, SLEEPYTHIRDR, flipSleepSides);

    handleSleepyDrift(now);
  }
 
  else
  {
    isTakenCare = false;
    uint32_t neglectElapsed = elapsed - M_70;

    // 15-minute loop: 12 mins asleep (720s), 3 mins awake (180s)
    const uint32_t CYCLE_LEN = 15UL * 60UL * 1000UL;
    const uint32_t ASLEEP_LEN = 12UL * 60UL * 1000UL;

    uint32_t cyclePos = neglectElapsed % CYCLE_LEN;
    bool isAwakeWindow = (cyclePos >= ASLEEP_LEN);

    if (isAwakeWindow)
    {
      uint32_t wakeTime = cyclePos - ASLEEP_LEN;

      // Startle awake with SHOCKED for the first 4 seconds
      if (wakeTime < 4000)
      {
        eyes.setEmotion(SHOCKED);
      }
      else
      {
        uint32_t totalMinutes = elapsed / (60UL * 1000UL);

        if (totalMinutes < 120)       // 70m - 2.0 hr
          eyes.setEmotion(FEDUP);
        else if (totalMinutes < 180)  // 2.0 - 3.0 hr
          eyes.setEmotion(SAD);
        else if (totalMinutes < 240)  // 3.0 - 4.0 hr
          eyes.setEmotion(WORRIED);
        else if (totalMinutes < 300)  // 4.0 - 5.0 hr
          eyes.setEmotion(SCARED);
        else                          // 5.0 hr+
          eyes.setEmotion(((now / 20000) % 2 == 0) ? HORRIFIED : ANGRY);
      }
    }
    else
    {
      // Slumped back into deep sleep
      renderSleepyPair(SLEEPYTHIRDL, SLEEPYTHIRDR, flipSleepSides);
      handleSleepyDrift(now);
    }
  }

  // Regular LookAt Drift (Only active when awake)
  bool isAwakeInTier5 = (elapsed >= M_70 && ((elapsed - M_70) % (15UL * 60UL * 1000UL) >= 12UL * 60UL * 1000UL));
  if (!inMicroEvent && (elapsed < M_50 || isAwakeInTier5))
  {
    if (now - lastGazeShift > gazeInterval)
    {
      lastGazeShift = now;
      gazeInterval = random(2500, 5001);
      eyes.lookAt(random(-25, 26), random(-15, 16));
    }
  }
}

static bool checkPatting(const SensorData &s)
{
  uint32_t now = millis();

  bool leftJustPressed = (s.isLeftTouched && !prevLeftTouch);
  bool rightJustPressed = (s.isRightTouched && !prevRightTouch);

  prevLeftTouch = s.isLeftTouched;
  prevRightTouch = s.isRightTouched;

  if (patStrokeCount > 0 && (now - lastStrokeTime > 700))
  {
    patStrokeCount = 0;
    lastTouchedSide = 0;
  }

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
    inMicroEvent = false;
  }

  if (isPatting)
  {
    if (now < patEndTime)
    {
      eyes.setEmotion(CUDDLE);

      if (now - lastWiggleTime >= 320)
      {
        lastWiggleTime = now;
        int targetX = (wiggleStep == 0) ? random(-15, -7) : random(8, 16);
        wiggleStep = 1 - wiggleStep;
        eyes.lookAt(targetX, -26);
      }
      return true;
    }
    else
    {
      isPatting = false;
      eyes.lookAt(0, 0);
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
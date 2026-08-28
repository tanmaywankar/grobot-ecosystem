#include "Display.h"
#include "GrobotSystem.h"
#include <TFT_eSPI.h>
#include <Grobot_Animations.h>
#include <GrobotMoods.h>

static TFT_eSPI tft = TFT_eSPI();
static TFT_eSprite canvas = TFT_eSprite(&tft);
static GrobotEyes eyes(0x97E0, 0x0000);

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
    HAPPY, SAD, ANGRY, HORRIFIED, SHOCKED, 
    KAWAII, BORED, FEDUP, WTHBRO, WORRIED, SATISFIED, IDLE
  };
  const int numMoods = sizeof(moods) / sizeof(moods[0]);

  moodIndex = (moodIndex + 1) % numMoods;

  eyes.setEmotion(moods[moodIndex]);
  eyes.lookAt(random(-30, 31), random(-20, 21));

  lastMoodSwitch = millis();
  moodSwitchInterval = random(5000, 8000);
}

void updateDisplay() {
  moodSwitch(true);
  eyes.renderEmotions(canvas);
  eyes.HUD(tft);
}
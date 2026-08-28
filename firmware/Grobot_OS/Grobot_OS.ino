#include <Arduino.h>
#include <TFT_eSPI.h>
#include <Grobot_Animations.h>
#include <GrobotMoods.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

//Pin definitions
#define SOIL_SENSOR       34   
#define LIGHT_SENSOR      35   
#define TOUCH_LEFT_PIN     13  
#define TOUCH_RIGHT_PIN    12   
#define SEALEVELPRESSURE_HPA (1013.25)

struct SensorData {
  float temperature = 0.0f;
  float humidity = 0.0f;
  float pressure = 0.0f;
  int soilMoisture = 0;
  int lightLevel = 0;
  bool isLeftTouched = false;
  bool isRightTouched = false;
};


Adafruit_BME280 bme;
TFT_eSPI tft = TFT_eSPI();
TFT_eSprite canvas = TFT_eSprite(&tft);

GrobotEyes eyes(0x97E0, 0x0000); 

uint32_t lastMoodSwitch = 0;
uint32_t moodSwitchInterval = 5000;
int moodIndex = 0;
int touchValue = touchRead(13);

void setup() {
  tft.init();
  tft.setRotation(1); 
  tft.fillScreen(TFT_BLACK);
  tft.invertDisplay(1);

  canvas.createSprite(320, 120);

  eyes.setEmotion(IDLE);
  
  Serial.begin(115200);

  bool status = bme.begin(0x76);
}

void loop() {
 moodSwitch(true);
  eyes.renderEmotions(canvas);
  eyes.HUD(tft); 
}

void moodSwitch(bool toSwitch){
  if(!toSwitch) return;
  if(millis() - lastMoodSwitch <= moodSwitchInterval) return;

static const MoodData moods[] = {HAPPY, SAD, ANGRY, HORRIFIED, SHOCKED, KAWAII, BORED, FEDUP, WTHBRO, WORRIED, SATISFIED, IDLE};
const int numMoods = sizeof(moods)/sizeof(moods[0]);

moodIndex = (moodIndex + 1) % numMoods;


eyes.setEmotion(moods[moodIndex]);
eyes.lookAt(random(-30, 31), random(-20, 21));

lastMoodSwitch = millis();
moodSwitchInterval = random(5000, 8000);

}
#pragma once
#include <Grobot_Animations.h>

// Mood constants are DECLARED here and DEFINED once in GrobotMoods.cpp.
// Do not put definitions (initializers) in this header \u2014 every .cpp that
// includes it would get its own copy, wasting RAM and violating the ODR.

extern const MoodData HAPPY;
extern const MoodData CUDDLE;
extern const MoodData SAD;
extern const MoodData ANGRY;
extern const MoodData HORRIFIED;
extern const MoodData SHOCKED;
extern const MoodData KAWAII;
extern const MoodData BORED;
extern const MoodData FEDUP;
extern const MoodData SCARED;
extern const MoodData WORRIED;
extern const MoodData IDLE;
extern const MoodData DOUBTING;

// below mood can be used as a loop where one eye state is one of below states and the other is the IDLE state. or can be used for both eyes as well.
extern const MoodData IDLELOAD;
extern const MoodData SATISFIED;
extern const MoodData UNBELIEVABLE;

//SLEEPY MOODS: these moods can be switched i.e left can become right and right can become left
//Also add a small random up/down movement maybe random upto 8px up and 8px down every 20s or so.
// also keep lookat between(0, 45 to 60) max.
extern const MoodData SLEEPYFIRSTL;
extern const MoodData SLEEPYFIRSTR;

extern const MoodData SLEEPYSECONDL;
extern const MoodData SLEEPYSECONDR;

extern const MoodData SLEEPYTHIRDL;
extern const MoodData SLEEPYTHIRDR;



#pragma once
#include <Grobot_Animations.h>

const MoodData HAPPY = {0, 50, 0, 30, 45};
const MoodData CUDDLE = {0, 50, 0, 0, 45};
const MoodData SAD = {0, 0, -52, 30, 45};
const MoodData ANGRY = {0, 0, 60, 30, 45};
const MoodData HORRIFIED = {0, 0, 0, 30, 32};
const MoodData SHOCKED = {0, 0, 0, 15, 50};
const MoodData KAWAII = {0, 0, 0, 23, 50};
const MoodData BORED = {50, 0, 0, 0, 45};
const MoodData FEDUP = {50, 34, 0, 0, 45};
const MoodData SCARED = {0, 31, -38, 11, 45};
const MoodData WORRIED = {0, 17, -27, 23, 45};
const MoodData IDLE = {0, 0, 0, 30, 45};
const MoodData DOUBTING = {16, 0, 0, 30, 45};

// below mood can be used as a loop where one eye state is one of below states and the other is the IDLE state. or can be used for both eyes as well.
const MoodData IDLELOAD = {0, 0, 0, 18, 36};
const MoodData SATISFIED = {50, 0, 0, 30, 45};
const MoodData UNBELIEVABLE = {0, 20, 19, 30, 45};


//SLEEPY MOODS: these moods can be switched i.e left can become right and right can become left 
//Also add a small random up/down movement maybe random upto 8px up and 8px down every 20s or so. 
// also keep lookat between(0,  45 to 60 ) max.
const MoodData SLEEPYFIRSTL = {23, 31, -15, 0, 45};
const MoodData SLEEPYFIRSTR = {33, 31, -15, 0, 45};

const MoodData SLEEPYSECONDL = {50, 27, -7, 0, 45}; 
const MoodData SLEEPYSECONDR = {50, 27, -1, 0, 45}; 

const MoodData SLEEPYTHIRDL = {49, 39, -1, 0, 45};
const MoodData SLEEPYTHIRDR = {49, 40, 0, 0, 45};



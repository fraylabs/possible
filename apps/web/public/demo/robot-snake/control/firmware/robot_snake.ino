#include <Arduino.h>
#include <ESP32Servo.h>

// Three-module bench prototype: two yaw joints. Add pins, centers, and
// directions only after the power rail is validated for the added servos.
constexpr uint8_t JOINT_COUNT = 2;
constexpr uint8_t SERVO_PINS[JOINT_COUNT] = {18, 19};
constexpr uint8_t ESTOP_SENSE_PIN = 27; // NC auxiliary contact: LOW = healthy.
constexpr int SERVO_CENTER_US[JOINT_COUNT] = {1500, 1500};
constexpr int SERVO_DIRECTION[JOINT_COUNT] = {1, -1};
constexpr int SERVO_US_PER_RAD = 382; // goBILDA 25-2 nominal 0.150 deg/us; calibrate each joint.
constexpr uint32_t CONTROL_PERIOD_MS = 20;
constexpr uint32_t WATCHDOG_MS = 600;

Servo servos[JOINT_COUNT];
String line;
bool armed = false;
float amplitude = 0.55f;
float frequencyHz = 0.8f;
float wavelength = 4.0f;
float maxAngle = 0.8f;
float maxSpeed = 3.0f;
float drive = 0.0f;
float steer = 0.0f;
float jointAngle[JOINT_COUNT] = {0};
uint32_t lastCommandMs = 0;
uint32_t lastControlMs = 0;

float clampf(float value, float low, float high) {
  return min(high, max(low, value));
}

void writeNeutralAndDetach() {
  for (uint8_t i = 0; i < JOINT_COUNT; ++i) {
    if (servos[i].attached()) {
      servos[i].writeMicroseconds(SERVO_CENTER_US[i]);
      delay(20);
      servos[i].detach();
    }
    jointAngle[i] = 0;
  }
  armed = false;
  drive = 0;
  Serial.println("STATE,DISARMED");
}

void armOutputs() {
  if (digitalRead(ESTOP_SENSE_PIN) != LOW) {
    Serial.println("FAULT,PHYSICAL_ESTOP");
    return;
  }
  for (uint8_t i = 0; i < JOINT_COUNT; ++i) {
    servos[i].setPeriodHertz(50);
    servos[i].attach(SERVO_PINS[i], 500, 2500);
    servos[i].writeMicroseconds(SERVO_CENTER_US[i]);
  }
  armed = true;
  lastCommandMs = millis();
  Serial.println("STATE,ARMED");
}

void handleCommand(String command) {
  command.trim();
  if (command == "PING") { lastCommandMs = millis(); Serial.println("PONG"); return; }
  if (command == "ESTOP") { writeNeutralAndDetach(); return; }
  if (command == "ARM") { if (!armed) armOutputs(); return; }

  float a, f, w, angleLimit, speedLimit;
  int requestedJoints;
  if (sscanf(command.c_str(), "CFG,%f,%f,%f,%f,%f,%d", &a, &f, &w,
      &angleLimit, &speedLimit, &requestedJoints) == 6) {
    if (a >= 0 && a <= 1.2f && f >= 0.1f && f <= 3.0f && w >= 2 && w <= 12 &&
        angleLimit >= 0.1f && angleLimit <= 1.2f && speedLimit >= 0.2f && speedLimit <= 10) {
      amplitude = a; frequencyHz = f; wavelength = w;
      maxAngle = angleLimit; maxSpeed = speedLimit;
      lastCommandMs = millis();
      Serial.printf("CFG,OK,%d\n", min(requestedJoints, (int)JOINT_COUNT));
    } else Serial.println("ERR,CFG_RANGE");
    return;
  }

  float requestedDrive, requestedSteer;
  if (sscanf(command.c_str(), "DRV,%f,%f", &requestedDrive, &requestedSteer) == 2) {
    drive = clampf(requestedDrive, -1, 1);
    steer = clampf(requestedSteer, -1, 1);
    lastCommandMs = millis();
    return;
  }
  Serial.println("ERR,COMMAND");
}

void updateJoints(uint32_t now) {
  if (!armed) return;
  const float dt = (now - lastControlMs) / 1000.0f;
  const float phaseTime = now / 1000.0f * frequencyHz * TWO_PI * (drive < 0 ? -1 : 1);
  const float motionScale = abs(drive);
  for (uint8_t i = 0; i < JOINT_COUNT; ++i) {
    const float wave = amplitude * motionScale * sinf(i / wavelength * TWO_PI - phaseTime);
    const float steeringBias = steer * maxAngle * 0.35f;
    const float target = clampf(wave + steeringBias, -maxAngle, maxAngle);
    const float maximumStep = maxSpeed * dt;
    jointAngle[i] += clampf(target - jointAngle[i], -maximumStep, maximumStep);
    const int pulse = SERVO_CENTER_US[i] + SERVO_DIRECTION[i] * jointAngle[i] * SERVO_US_PER_RAD;
    servos[i].writeMicroseconds(constrain(pulse, 500, 2500));
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(ESTOP_SENSE_PIN, INPUT_PULLUP);
  line.reserve(96);
  Serial.println("SNAKE,READY,1");
}

void loop() {
  while (Serial.available()) {
    const char value = Serial.read();
    if (value == '\n') { handleCommand(line); line = ""; }
    else if (value != '\r' && line.length() < 95) line += value;
  }
  const uint32_t now = millis();
  if (armed && digitalRead(ESTOP_SENSE_PIN) != LOW) {
    Serial.println("FAULT,PHYSICAL_ESTOP");
    writeNeutralAndDetach();
  }
  if (armed && now - lastCommandMs > WATCHDOG_MS) {
    Serial.println("FAULT,WATCHDOG");
    writeNeutralAndDetach();
  }
  if (now - lastControlMs >= CONTROL_PERIOD_MS) {
    updateJoints(now);
    lastControlMs = now;
  }
}

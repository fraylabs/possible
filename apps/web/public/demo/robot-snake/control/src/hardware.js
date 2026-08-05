const GRAVITY = 9.80665;
const NM_PER_KG_CM = 0.0980665;

export const HARDWARE_DEFAULTS = Object.freeze({
  moduleMassKg: 0.14,
  moduleLengthM: 0.08,
  electronicsMassKg: 0.18,
  frictionCoefficient: 0.35,
  torqueSafetyFactor: 2,
  servoVoltage: 7.4,
  batteryCapacityAh: 2.2,
  batteryUsableFraction: 0.8,
  driveEfficiency: 0.55,
  servoIdlePowerW: 0.35,
  controllerPowerW: 1.2
});

export function estimateHardware(gait, hardware = HARDWARE_DEFAULTS) {
  const jointCount = Math.max(1, gait.segmentCount - 1);
  const totalMassKg = gait.segmentCount * hardware.moduleMassKg + hardware.electronicsMassKg;
  const angularSpeedPeak = gait.amplitude * 2 * Math.PI * gait.frequency;
  const angularAccelerationPeak = gait.amplitude * (2 * Math.PI * gait.frequency) ** 2;

  // Ground support prevents the whole tail mass acting as a cantilever. This
  // estimates yaw torque from distributed friction over 35% of body mass.
  const frictionTorqueNm = hardware.frictionCoefficient * totalMassKg * GRAVITY *
    hardware.moduleLengthM * 0.35;
  const effectiveRotatingMass = totalMassKg * 0.2;
  const rotationalInertia = effectiveRotatingMass * hardware.moduleLengthM ** 2 / 3;
  const dynamicTorqueNm = rotationalInertia * angularAccelerationPeak;
  const workingTorqueNm = frictionTorqueNm + dynamicTorqueNm;
  const requiredStallTorqueNm = workingTorqueNm * hardware.torqueSafetyFactor;

  // RMS motion and a 35% loaded duty cycle approximate a traveling wave where
  // joints do not all reach peak load simultaneously.
  const mechanicalPowerW = workingTorqueNm * angularSpeedPeak / Math.SQRT2 * jointCount * 0.35;
  const averagePowerW = mechanicalPowerW / hardware.driveEfficiency +
    jointCount * hardware.servoIdlePowerW + hardware.controllerPowerW;
  const peakPowerW = requiredStallTorqueNm * angularSpeedPeak * jointCount * 0.65 /
    hardware.driveEfficiency + jointCount * hardware.servoIdlePowerW + hardware.controllerPowerW;
  const batteryEnergyWh = hardware.servoVoltage * hardware.batteryCapacityAh * hardware.batteryUsableFraction;

  return {
    jointCount,
    totalMassKg,
    requiredStallTorqueNm,
    requiredStallTorqueKgCm: requiredStallTorqueNm / NM_PER_KG_CM,
    averagePowerW,
    averageCurrentA: averagePowerW / hardware.servoVoltage,
    peakCurrentA: peakPowerW / hardware.servoVoltage,
    estimatedRuntimeMinutes: batteryEnergyWh / averagePowerW * 60
  };
}

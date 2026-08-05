export const DEFAULTS = Object.freeze({
  segmentCount: 14,
  segmentLength: 26,
  amplitude: 0.72,
  frequency: 1.25,
  wavelength: 5.5,
  speed: 85,
  turnRate: 1.7,
  maxJointAngle: 0.95,
  maxJointSpeed: 4.5,
  bodyRadius: 10
});

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

export function jointTarget(index, time, params = DEFAULTS) {
  const phase = (index / params.wavelength) * Math.PI * 2 - time * params.frequency * Math.PI * 2;
  return clamp(params.amplitude * Math.sin(phase), -params.maxJointAngle, params.maxJointAngle);
}

export function createSnake(x = 0, y = 0, params = DEFAULTS) {
  return {
    x, y, heading: 0, time: 0,
    joints: Array.from({ length: params.segmentCount - 1 }, () => 0),
    distance: 0,
    collisions: 0
  };
}

export function resolveCollisions(state, obstacles = [], params = DEFAULTS) {
  const next = { ...state };
  let hits = 0;
  // Several passes settle cases where a body segment touches two obstacles.
  for (let pass = 0; pass < 3; pass += 1) {
    let corrected = false;
    for (const pose of segmentPoses(next, params)) {
      for (const obstacle of obstacles) {
        const dx = pose.x - obstacle.x;
        const dy = pose.y - obstacle.y;
        const minimum = params.bodyRadius + obstacle.radius;
        const distance = Math.hypot(dx, dy);
        if (distance < minimum) {
          const nx = distance > 1e-8 ? dx / distance : 1;
          const ny = distance > 1e-8 ? dy / distance : 0;
          const penetration = minimum - distance;
          next.x += nx * penetration;
          next.y += ny * penetration;
          corrected = true;
          hits += 1;
        }
      }
    }
    if (!corrected) break;
  }
  next.collisions = (state.collisions || 0) + hits;
  return next;
}

export function stepSnake(state, input, dt, params = DEFAULTS, obstacles = []) {
  const next = { ...state, joints: [...state.joints] };
  next.time += dt;
  const maximumStep = params.maxJointSpeed * dt;
  next.joints = next.joints.map((angle, index) => {
    const error = jointTarget(index, next.time, params) - angle;
    return clamp(angle + clamp(error, -maximumStep, maximumStep), -params.maxJointAngle, params.maxJointAngle);
  });

  const drive = clamp(input.drive || 0, -1, 1);
  const steer = clamp(input.steer || 0, -1, 1);
  next.heading += steer * params.turnRate * dt * (drive < 0 ? -1 : 1);

  // An empirical traction factor connects lateral body waves to forward motion.
  const gaitStrength = Math.min(1, params.amplitude / DEFAULTS.amplitude) *
    Math.min(1.5, params.frequency / DEFAULTS.frequency);
  const distance = drive * params.speed * gaitStrength * dt;
  next.x += Math.cos(next.heading) * distance;
  next.y += Math.sin(next.heading) * distance;
  next.distance = (state.distance || 0) + Math.abs(distance);
  return resolveCollisions(next, obstacles, params);
}

export function segmentPoses(state, params = DEFAULTS) {
  const poses = [{ x: state.x, y: state.y, angle: state.heading }];
  let angle = state.heading;
  let x = state.x;
  let y = state.y;
  for (let i = 0; i < state.joints.length; i += 1) {
    angle -= state.joints[i];
    x -= Math.cos(angle) * params.segmentLength;
    y -= Math.sin(angle) * params.segmentLength;
    poses.push({ x, y, angle });
  }
  return poses;
}

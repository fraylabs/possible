import { DEFAULTS, createSnake, segmentPoses, stepSnake } from "./snake.js";
import { estimateHardware, HARDWARE_DEFAULTS } from "./hardware.js";
import { configCommand, driveCommand, armCommand, estopCommand, telemetryCsv } from "./protocol.js";
import { ControllerLink } from "./serial.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const status = document.querySelector("#status");
const keys = new Set();
const link = new ControllerLink();
let params = { ...DEFAULTS };
let hardware = { ...HARDWARE_DEFAULTS };
let snake = createSnake(0, 0, params);
let last = performance.now();
let camera = { x: 0, y: 0 };
let recording = false;
let telemetry = [];
let recordingStarted = 0;
let lastSample = 0;
let lastControllerWrite = 0;
let currentInput = { drive: 0, steer: 0 };
const presets = {
  efficient: { amplitude: 0.5, frequency: 0.75, wavelength: 7, speed: 65, maxJointAngle: 0.75, maxJointSpeed: 3 },
  explore: { amplitude: 0.72, frequency: 1.25, wavelength: 5.5, speed: 85, maxJointAngle: 0.95, maxJointSpeed: 4.5 },
  tight: { amplitude: 0.9, frequency: 1, wavelength: 3.5, speed: 55, maxJointAngle: 1.05, maxJointSpeed: 5 }
};
const obstacles = [
  { x: 230, y: -80, radius: 35 }, { x: 350, y: 80, radius: 48 },
  { x: 500, y: -30, radius: 28 }, { x: 620, y: 110, radius: 55 },
  { x: -210, y: 120, radius: 42 }, { x: -370, y: -65, radius: 33 }
];

for (const slider of document.querySelectorAll("input[type=range]")) {
  const output = document.querySelector(`[data-for=${slider.id}]`);
  const update = () => {
    const target = slider.dataset.group === "hardware" ? hardware : params;
    target[slider.id] = Number(slider.value);
    output.textContent = Number(slider.value).toFixed(slider.step.includes(".") ? 2 : 0);
    updateHardwareEstimate();
    if (slider.dataset.group !== "hardware") link.send(configCommand(params));
  };
  slider.addEventListener("input", update);
  update();
}

function applyPreset(preset) {
  for (const [key, value] of Object.entries(preset)) {
    const slider = document.querySelector(`#${key}`);
    if (!slider) continue;
    slider.value = value;
    slider.dispatchEvent(new Event("input"));
  }
}

const presetSelect = document.querySelector("#preset");
presetSelect.addEventListener("change", () => {
  const preset = presetSelect.value === "custom"
    ? JSON.parse(localStorage.getItem("robot-snake-preset") || "null")
    : presets[presetSelect.value];
  if (preset) applyPreset(preset);
});
document.querySelector("#savePreset").addEventListener("click", () => {
  const saved = Object.fromEntries(Object.keys(presets.explore).map(key => [key, params[key]]));
  localStorage.setItem("robot-snake-preset", JSON.stringify(saved));
  presetSelect.value = "custom";
  document.querySelector("#consoleState").textContent = "Custom preset saved";
});

const recordButton = document.querySelector("#record");
recordButton.addEventListener("click", () => {
  recording = !recording;
  if (recording) { telemetry = []; recordingStarted = performance.now(); }
  recordButton.textContent = recording ? "Stop recording" : "Record telemetry";
  recordButton.classList.toggle("active", recording);
  document.querySelector("#export").disabled = recording || telemetry.length === 0;
});
document.querySelector("#export").addEventListener("click", () => {
  const blob = new Blob([telemetryCsv(telemetry)], { type: "text/csv" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `robot-snake-${new Date().toISOString().replaceAll(":", "-")}.csv`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
});

const connectButton = document.querySelector("#connect");
connectButton.disabled = !("serial" in navigator);
connectButton.addEventListener("click", async () => {
  try {
    if (link.connected) await link.disconnect();
    else { await link.connect(); await link.send(configCommand(params)); }
  } catch (error) { document.querySelector("#consoleState").textContent = error.message; }
});
link.addEventListener("change", () => {
  connectButton.textContent = link.connected ? "Disconnect" : "Connect ESP32";
  document.querySelector("#consoleState").textContent = link.connected ? "Connected · outputs disarmed" : "Simulator only";
});
document.querySelector("#arm").addEventListener("click", () => link.send(armCommand()));
document.querySelector("#estop").addEventListener("click", () => link.send(estopCommand()));

function updateHardwareEstimate() {
  const estimate = estimateHardware(params, hardware);
  document.querySelector("#massEstimate").textContent = `${estimate.totalMassKg.toFixed(2)} kg`;
  document.querySelector("#torqueEstimate").textContent = `${estimate.requiredStallTorqueKgCm.toFixed(1)} kg·cm`;
  document.querySelector("#currentEstimate").textContent = `${estimate.averageCurrentA.toFixed(1)} / ${estimate.peakCurrentA.toFixed(1)} A`;
  document.querySelector("#runtimeEstimate").textContent = `${estimate.estimatedRuntimeMinutes.toFixed(0)} min`;
}

addEventListener("keydown", event => {
  keys.add(event.key.toLowerCase());
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(event.key.toLowerCase())) event.preventDefault();
  if (event.key.toLowerCase() === "r") snake = createSnake(0, 0, params);
  if (event.key === " ") link.send(estopCommand());
});
addEventListener("keyup", event => keys.delete(event.key.toLowerCase()));

function resize() {
  const ratio = devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
addEventListener("resize", resize);
resize();

function drawGrid(width, height) {
  ctx.strokeStyle = "#20343a";
  ctx.lineWidth = 1;
  const spacing = 50;
  for (let x = ((-camera.x + width / 2) % spacing + spacing) % spacing; x < width; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = ((-camera.y + height / 2) % spacing + spacing) % spacing; y < height; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
}

function drawSnake(width, height) {
  const poses = segmentPoses(snake, params);
  ctx.save();
  ctx.translate(width / 2 - camera.x, height / 2 - camera.y);
  for (let i = poses.length - 1; i >= 0; i -= 1) {
    const pose = poses[i];
    ctx.save();
    ctx.translate(pose.x, pose.y); ctx.rotate(pose.angle);
    ctx.fillStyle = i === 0 ? "#ffd166" : `hsl(${165 - i * 2} 58% ${47 - i * 0.7}%)`;
    ctx.strokeStyle = "#081416"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-params.segmentLength * 0.52, -10, params.segmentLength * 1.04, 20, 7);
    ctx.fill(); ctx.stroke();
    if (i === 0) {
      ctx.fillStyle = "#081416";
      ctx.beginPath(); ctx.arc(7, -5, 2.2, 0, Math.PI * 2); ctx.arc(7, 5, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawObstacles(width, height) {
  ctx.save();
  ctx.translate(width / 2 - camera.x, height / 2 - camera.y);
  for (const obstacle of obstacles) {
    ctx.fillStyle = "#263c43";
    ctx.strokeStyle = "#48636b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#314b53";
    ctx.beginPath();
    ctx.arc(obstacle.x - obstacle.radius * .15, obstacle.y - obstacle.radius * .1, obstacle.radius * .55, 0, Math.PI * 1.4);
    ctx.stroke();
  }
  ctx.restore();
}

function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  const drive = (keys.has("arrowup") || keys.has("w") ? 1 : 0) - (keys.has("arrowdown") || keys.has("s") ? 1 : 0);
  const steer = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
  currentInput = { drive, steer };
  snake = stepSnake(snake, { drive, steer }, dt, params, obstacles);
  if (link.connected && now - lastControllerWrite >= 100) {
    link.send(driveCommand(drive, steer));
    lastControllerWrite = now;
  }
  camera.x += (snake.x - camera.x) * Math.min(1, dt * 4);
  camera.y += (snake.y - camera.y) * Math.min(1, dt * 4);
  const width = canvas.clientWidth, height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  drawGrid(width, height); drawObstacles(width, height); drawSnake(width, height);
  const peakJoint = Math.max(...snake.joints.map(angle => Math.abs(angle))) * 180 / Math.PI;
  if (recording && now - lastSample >= 100) {
    telemetry.push({
      time_s: ((now - recordingStarted) / 1000).toFixed(3), x_px: snake.x.toFixed(2),
      y_px: snake.y.toFixed(2), heading_deg: (snake.heading * 180 / Math.PI).toFixed(2),
      distance_px: snake.distance.toFixed(2), contacts: snake.collisions,
      drive: currentInput.drive, steer: currentInput.steer, amplitude_rad: params.amplitude,
      frequency_hz: params.frequency, wavelength_joints: params.wavelength,
      peak_joint_deg: peakJoint.toFixed(2)
    });
    lastSample = now;
    document.querySelector("#sampleCount").textContent = `${telemetry.length} samples`;
  }
  status.textContent = `distance ${snake.distance.toFixed(0)} px · peak joint ${peakJoint.toFixed(0)}° · contacts ${snake.collisions}`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

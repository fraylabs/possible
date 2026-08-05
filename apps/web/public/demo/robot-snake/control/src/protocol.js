const finite = value => Number.isFinite(value);
const fixed = value => Number(value).toFixed(4);

export function configCommand(params, jointCount = params.segmentCount - 1) {
  const values = [params.amplitude, params.frequency, params.wavelength,
    params.maxJointAngle, params.maxJointSpeed, jointCount];
  if (!values.every(finite)) throw new TypeError("Configuration values must be finite");
  return `CFG,${values.slice(0, 5).map(fixed).join(",")},${Math.trunc(jointCount)}\n`;
}

export function driveCommand(drive, steer) {
  if (!finite(drive) || !finite(steer)) throw new TypeError("Drive values must be finite");
  const clamp = value => Math.max(-1, Math.min(1, value));
  return `DRV,${fixed(clamp(drive))},${fixed(clamp(steer))}\n`;
}

export const armCommand = () => "ARM\n";
export const estopCommand = () => "ESTOP\n";
export const pingCommand = () => "PING\n";

export function telemetryCsv(samples) {
  const columns = ["time_s", "x_px", "y_px", "heading_deg", "distance_px", "contacts",
    "drive", "steer", "amplitude_rad", "frequency_hz", "wavelength_joints", "peak_joint_deg"];
  const rows = samples.map(sample => columns.map(column => sample[column]).join(","));
  return `${columns.join(",")}\n${rows.join("\n")}${rows.length ? "\n" : ""}`;
}

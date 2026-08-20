import { spawnSync } from "node:child_process";

const result = spawnSync("supabase", process.argv.slice(2), {
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
if (result.status !== 0) process.exitCode = result.status ?? 1;

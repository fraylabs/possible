import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import path from "node:path";

const workspaceEnvPath = path.resolve(import.meta.dirname, "../../.env.local");
if (existsSync(workspaceEnvPath)) process.loadEnvFile(workspaceEnvPath);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  experimental: { cpus: 4 },
  turbopack: {
    root: path.resolve(import.meta.dirname, "../.."),
  },
};

export default nextConfig;

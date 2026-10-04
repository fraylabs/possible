import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--days")) throw new Error("Usage: npm run visits -- --days 7");
const days = args.length ? Number(args[1]) : 7;
if (!Number.isInteger(days) || days < 1 || days > 31) throw new Error("days must be an integer from 1 to 31");
const result = spawnSync(process.execPath, ["node_modules/convex/bin/main.js", "run", "--deployment", "reminiscent-lark-333", "visits:daily", JSON.stringify({ days })], { stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const scoreDirectory = path.dirname(fileURLToPath(import.meta.url));
const argument = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
};

const source = argument("source", "possible-world-score.strudel.js");
const output = argument("output", "../assets/audio/possible-world-strudel-raw.wav");
const bpm = Number(argument("bpm", "109.0909"));
const cycles = Number(argument("cycles", "20"));
const name = argument("name", path.basename(source, path.extname(source)));
const outputPath = path.resolve(scoreDirectory, output);
const audioDirectory = path.dirname(outputPath);

await mkdir(audioDirectory, { recursive: true });

const server = await createServer({
  root: scoreDirectory,
  server: { host: "127.0.0.1", port: 4179, strictPort: true },
  logLevel: "error",
});

await server.listen();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  page.on("console", (message) => {
    if (message.type() === "error") console.error(message.text());
  });
  page.on("pageerror", (error) => console.error(error));
  page.on("requestfailed", (request) => {
    console.error(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  });

  const renderUrl = new URL("http://127.0.0.1:4179/render.html");
  renderUrl.searchParams.set("source", source);
  renderUrl.searchParams.set("bpm", String(bpm));
  renderUrl.searchParams.set("cycles", String(cycles));
  renderUrl.searchParams.set("name", name);

  await page.goto(renderUrl.href, { waitUntil: "networkidle" });
  await page.waitForFunction(() => globalThis.scoreReady === true, undefined, { timeout: 60_000 });

  const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
  await page.getByRole("button", { name: "Render score" }).click();
  const download = await downloadPromise;
  await download.saveAs(outputPath);

  console.log(outputPath);
} finally {
  await browser.close();
  await server.close();
}

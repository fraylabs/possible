import * as strudel from "@strudel/core";
import * as miniNotation from "@strudel/mini";
import { transpiler } from "@strudel/transpiler";
import { registerSynthSounds, renderPatternAudio } from "@strudel/webaudio";

await strudel.evalScope(strudel, miniNotation, {
  setcpm: () => strudel.silence,
});
registerSynthSounds();

const renderButton = document.querySelector("#render");
const status = document.querySelector("#status");
const parameters = new URLSearchParams(globalThis.location.search);
const sourcePath = parameters.get("source") ?? "possible-world-score.strudel.js";
const bpm = Number(parameters.get("bpm") ?? "109.0909");
const cycles = Number(parameters.get("cycles") ?? "20");
const renderName = parameters.get("name") ?? "possible-world-strudel";
const duration = cycles / (bpm / 240);
const sourceUrl = sourcePath.startsWith("/") ? sourcePath : `/${sourcePath}`;
const source = await fetch(sourceUrl).then((response) => {
  if (!response.ok) throw new Error(`Could not load ${sourcePath}`);
  return response.text();
});
const { pattern: score } = await strudel.evaluate(source, transpiler, {
  wrapAsync: false,
  addReturn: true,
  simpleLocs: true,
});

renderButton.disabled = false;
status.value = "Ready";
globalThis.scoreReady = true;

renderButton.addEventListener("click", async () => {
  renderButton.disabled = true;
  status.value = `Rendering ${duration.toFixed(1)} seconds…`;

  try {
    await renderPatternAudio(
      score,
      bpm / 240,
      0,
      cycles,
      48000,
      128,
      false,
      renderName,
    );
    status.value = "Rendered";
  } catch (error) {
    status.value = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    renderButton.disabled = false;
  }
});

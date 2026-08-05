import passing from "../../fixtures/01-passing-evidence.json";
import hiddenNonzero from "../../fixtures/02-hidden-nonzero-exit.json";
import noVisual from "../../fixtures/06-ui-without-visual-evidence.json";
import { buildReceipt } from "../../src/lib/receipt.js";

const fixtures = new Map([passing, hiddenNonzero, noVisual].map((fixture) => [fixture.id, fixture]));
const statuses = ["passed", "failed", "skipped", "unknown", "unsupported"];

const byId = (id) => document.getElementById(id);

function firstChangedPath(receipt) {
  return receipt.evidence.changedFiles[0]?.path || "No changed file extracted.";
}

function firstCheck(receipt) {
  const check = receipt.evidence.checks[0];
  if (!check) return "No check extracted.";
  return `${check.command || "command missing"} · exit ${check.exitCode ?? "unknown"}`;
}

function claimRow(claim) {
  const row = document.createElement("div");
  row.className = "claim-row";
  row.dataset.status = claim.status;

  const name = document.createElement("span");
  name.textContent = claim.text;
  const state = document.createElement("strong");
  state.className = `status-${claim.status}`;
  state.textContent = claim.status;
  row.append(name, state);
  return row;
}

function renderFixture(id) {
  const fixture = fixtures.get(id);
  if (!fixture) return;
  const receipt = buildReceipt(fixture.draft);

  byId("demo-task").textContent = fixture.draft.task;
  byId("demo-file").textContent = firstChangedPath(receipt);
  byId("demo-check").textContent = firstCheck(receipt);
  byId("demo-limitation").textContent = fixture.draft.limitations[0] || "No limitation supplied.";
  byId("fixture-description").textContent = fixture.description;
  byId("demo-claims").replaceChildren(...receipt.claims.map(claimRow));

  for (const status of statuses) byId(`count-${status}`).textContent = String(receipt.summary[status]);
  for (const tab of document.querySelectorAll("[data-fixture]")) {
    const active = tab.dataset.fixture === id;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  }
}

for (const tab of document.querySelectorAll("[data-fixture]")) {
  tab.addEventListener("click", () => renderFixture(tab.dataset.fixture));
}

byId("copy-quickstart").addEventListener("click", async () => {
  const value = byId("quickstart-command").textContent;
  try {
    await navigator.clipboard.writeText(value);
    byId("copy-status").textContent = "Quickstart copied. Nothing is deployed or uploaded.";
  } catch {
    byId("copy-status").textContent = "Copy was blocked. Select the command text and copy it manually.";
  }
});

renderFixture("passing-evidence");

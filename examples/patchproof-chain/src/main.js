import "./styles.css";
import { FIXTURES, getFixture } from "./fixtures.js";
import {
  ARTIFACT_TYPES,
  CLAIM_KINDS,
  EMPTY_DRAFT,
  EVIDENCE_STATUSES,
  STORAGE_KEY,
  buildReceipt,
  calculateClaim,
  extractEvidence,
  generateMarkdownFromReceipt,
  normalizeDraft,
  parseImportedDraft,
  stableStringify,
  validateDraft,
} from "./lib/receipt.js";

const byId = (id) => document.getElementById(id);
const form = byId("evidence-form");
const artifactList = byId("artifact-list");
const claimList = byId("claim-list");
const fixtureSelect = byId("fixture-select");
const receiptOutput = byId("receipt-output");
const dialog = byId("import-dialog");
let outputFormat = "markdown";
let saveTimer;
let generatedReceipt = null;
let generatedFingerprint = null;
let importCandidate = null;

function announce(message) {
  byId("live-region").textContent = "";
  requestAnimationFrame(() => { byId("live-region").textContent = message; });
}

function restoreDraft() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { draft: normalizeDraft(EMPTY_DRAFT), recovered: false };
  try {
    return { draft: parseImportedDraft(stored), recovered: true };
  } catch {
    return { draft: normalizeDraft(EMPTY_DRAFT), recovered: false, error: "Saved draft could not be restored. Start a new draft to replace it." };
  }
}

const restored = restoreDraft();
let draft = restored.draft;

const makeOption = (value) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
};

for (const fixture of FIXTURES) {
  const option = document.createElement("option");
  option.value = fixture.id;
  option.textContent = fixture.title;
  fixtureSelect.append(option);
}

function labeled(text, control) {
  const label = document.createElement("label");
  const span = document.createElement("span");
  span.textContent = text;
  label.append(span, control);
  return label;
}

function input(name, value, testId, placeholder = "") {
  const control = document.createElement("input");
  control.name = name;
  control.value = value;
  control.placeholder = placeholder;
  control.dataset.testid = testId;
  return control;
}

function select(name, value, values, testId) {
  const control = document.createElement("select");
  control.name = name;
  control.dataset.testid = testId;
  control.append(...values.map(makeOption));
  control.value = value;
  return control;
}

function removeButton(type, index) {
  const control = document.createElement("button");
  control.type = "button";
  control.className = "icon-button";
  control.dataset[`remove${type}`] = String(index);
  control.setAttribute("aria-label", `Remove ${type.toLowerCase()} ${index + 1}`);
  control.textContent = "×";
  return control;
}

function renderArtifacts() {
  artifactList.replaceChildren();
  if (!draft.artifacts.length) {
    const empty = document.createElement("p");
    empty.className = "artifact-empty";
    empty.textContent = "No artifacts supplied. UI claims require a referenced visual artifact.";
    artifactList.append(empty);
    return;
  }
  draft.artifacts.forEach((artifact, index) => {
    const row = document.createElement("div");
    row.className = "artifact-row artifact-contract-row";
    row.dataset.artifactIndex = String(index);
    row.dataset.testid = `artifact-${index}`;
    row.append(
      labeled("ID", input("artifactId", artifact.id, `artifact-id-${index}`, "screenshot-home")),
      labeled("Label", input("artifactLabel", artifact.label, `artifact-label-${index}`, "Homepage screenshot")),
      labeled("Type", select("artifactType", artifact.type, ARTIFACT_TYPES, `artifact-type-${index}`)),
      labeled("Status", select("artifactStatus", artifact.status, EVIDENCE_STATUSES, `artifact-status-${index}`)),
      labeled("Reference", input("artifactReference", artifact.reference, `artifact-reference-${index}`, "What was inspected?")),
      labeled("Note", input("artifactNote", artifact.note, `artifact-note-${index}`, "Boundary or context")),
      removeButton("Artifact", index),
    );
    artifactList.append(row);
  });
}

function renderClaims() {
  claimList.replaceChildren();
  const evidence = extractEvidence(draft);
  const refHelp = [...evidence.changedFiles, ...evidence.checks, ...draft.artifacts]
    .map((item) => item.id)
    .join(", ") || "none extracted yet";
  if (!draft.claims.length) {
    const empty = document.createElement("p");
    empty.className = "artifact-empty";
    empty.textContent = "No completion claims yet. A receipt with zero claims never reports success.";
    claimList.append(empty);
    return;
  }
  draft.claims.forEach((claim, index) => {
    const row = document.createElement("div");
    row.className = "claim-row";
    row.dataset.claimIndex = String(index);
    row.dataset.testid = `claim-${index}`;
    const derived = calculateClaim(claim, evidence);
    const status = document.createElement("output");
    status.className = "derived-status";
    status.dataset.status = derived.status;
    status.dataset.testid = `claim-status-${index}`;
    status.textContent = derived.status;
    status.title = derived.explanation;
    const refs = input("claimRefs", claim.evidenceRefs.join(", "), `claim-refs-${index}`, refHelp);
    refs.setAttribute("aria-describedby", `claim-ref-help-${index}`);
    const refsLabel = labeled("Evidence IDs", refs);
    const help = document.createElement("small");
    help.id = `claim-ref-help-${index}`;
    help.textContent = `Available: ${refHelp}`;
    refsLabel.append(help);
    row.append(
      labeled("ID", input("claimId", claim.id, `claim-id-${index}`, "tests-pass")),
      labeled("Claim", input("claimText", claim.text, `claim-text-${index}`, "The receipt tests pass")),
      labeled("Kind", select("claimKind", claim.kind, CLAIM_KINDS, `claim-kind-${index}`)),
      labeled("Exact target", input("claimTarget", claim.target, `claim-target-${index}`, "npm test or src/file.js")),
      refsLabel,
      labeled("Derived status", status),
      removeButton("Claim", index),
    );
    claimList.append(row);
  });
}

function refreshClaimStatuses() {
  const evidence = extractEvidence(draft);
  const available = [...evidence.changedFiles, ...evidence.checks, ...draft.artifacts]
    .map((item) => item.id)
    .join(", ") || "none extracted yet";
  draft.claims.forEach((claim, index) => {
    const derived = calculateClaim(claim, evidence);
    const output = claimList.querySelector(`[data-testid="claim-status-${index}"]`);
    if (output) {
      output.dataset.status = derived.status;
      output.textContent = derived.status;
      output.title = derived.explanation;
    }
    const help = byId(`claim-ref-help-${index}`);
    if (help) help.textContent = `Available: ${available}`;
  });
}

function writeForm() {
  byId("task").value = draft.task;
  byId("diff").value = draft.unifiedDiff;
  byId("check-log").value = draft.checkLog;
  byId("limitations").value = draft.limitations.join("\n");
  renderArtifacts();
  renderClaims();
}

function readArtifacts() {
  return [...artifactList.querySelectorAll(".artifact-row")].map((row) => ({
    id: row.querySelector('[name="artifactId"]').value,
    label: row.querySelector('[name="artifactLabel"]').value,
    type: row.querySelector('[name="artifactType"]').value,
    reference: row.querySelector('[name="artifactReference"]').value,
    status: row.querySelector('[name="artifactStatus"]').value,
    note: row.querySelector('[name="artifactNote"]').value,
  }));
}

function readClaims() {
  return [...claimList.querySelectorAll(".claim-row")].map((row) => ({
    id: row.querySelector('[name="claimId"]').value,
    text: row.querySelector('[name="claimText"]').value,
    kind: row.querySelector('[name="claimKind"]').value,
    target: row.querySelector('[name="claimTarget"]').value,
    evidenceRefs: row.querySelector('[name="claimRefs"]').value.split(",").map((item) => item.trim()).filter(Boolean),
  }));
}

function readForm() {
  return normalizeDraft({
    kind: "patchproof.draft",
    schemaVersion: 1,
    task: byId("task").value,
    unifiedDiff: byId("diff").value,
    checkLog: byId("check-log").value,
    artifacts: readArtifacts(),
    claims: readClaims(),
    limitations: byId("limitations").value.split("\n").filter((item) => item.length > 0),
  });
}

function isMeaningful(value) {
  return Boolean(value.task.trim() || value.unifiedDiff.trim() || value.checkLog.trim() || value.artifacts.length || value.claims.length || value.limitations.length);
}

function persistDraft() {
  clearTimeout(saveTimer);
  byId("save-state").textContent = "Saving…";
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, stableStringify(draft));
      byId("save-state").textContent = "Saved locally";
    } catch {
      byId("save-state").textContent = "Draft is not saved in this browser";
      announce("Draft is not saved in this browser. Download JSON or retry saving.");
    }
  }, 100);
}

function currentFingerprint() {
  return stableStringify(draft);
}

function setExportEnabled(enabled) {
  byId("copy-output").disabled = !enabled;
  byId("download-output").disabled = !enabled;
}

function overallClaimStatus(receipt) {
  if (!receipt.claims.length) return "no claims";
  return ["failed", "unsupported", "unknown", "skipped", "passed"].find((status) => receipt.claims.some((item) => item.status === status));
}

function claimLedgerNode(claim) {
  const article = document.createElement("article");
  article.className = `finding finding-${claim.status}`;
  const status = document.createElement("span");
  status.textContent = claim.status;
  const content = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = claim.text;
  const detail = document.createElement("p");
  detail.textContent = claim.explanation;
  content.append(title, detail);
  article.append(status, content);
  return article;
}

function renderGenerated() {
  const stale = generatedReceipt && generatedFingerprint !== currentFingerprint();
  const status = byId("overall-status");
  if (!generatedReceipt) {
    status.textContent = "not generated";
    status.dataset.status = "unknown";
    receiptOutput.textContent = "Generate a receipt to freeze the current claim-to-evidence ledger.";
    for (const key of EVIDENCE_STATUSES) byId(`summary-${key}`).textContent = "0";
    byId("claim-ledger").replaceChildren();
    setExportEnabled(false);
    return;
  }
  status.textContent = stale ? "out of date" : overallClaimStatus(generatedReceipt);
  status.dataset.status = stale ? "unknown" : overallClaimStatus(generatedReceipt);
  for (const key of EVIDENCE_STATUSES) byId(`summary-${key}`).textContent = String(generatedReceipt.summary[key]);
  const ledger = byId("claim-ledger");
  ledger.replaceChildren();
  if (generatedReceipt.claims.length) ledger.append(...generatedReceipt.claims.map(claimLedgerNode));
  else {
    const empty = document.createElement("p");
    empty.className = "finding-clear";
    empty.textContent = "No claims were supplied. This receipt does not report success.";
    ledger.append(empty);
  }
  receiptOutput.textContent = outputFormat === "markdown"
    ? generateMarkdownFromReceipt(generatedReceipt)
    : stableStringify(generatedReceipt);
  setExportEnabled(!stale);
}

function updateFromForm() {
  draft = readForm();
  persistDraft();
  refreshClaimStatuses();
  renderGenerated();
}

form.addEventListener("input", updateFromForm);
form.addEventListener("change", updateFromForm);

artifactList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-artifact]");
  if (!button) return;
  draft = readForm();
  draft.artifacts.splice(Number(button.dataset.removeArtifact), 1);
  writeForm(); persistDraft(); renderGenerated(); announce("Artifact removed.");
});

claimList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-claim]");
  if (!button) return;
  draft = readForm();
  draft.claims.splice(Number(button.dataset.removeClaim), 1);
  writeForm(); persistDraft(); renderGenerated(); announce("Claim removed.");
});

byId("add-artifact").addEventListener("click", () => {
  draft = readForm();
  draft.artifacts.push({ id: `artifact-${draft.artifacts.length + 1}`, label: "", type: "note", reference: "", status: "unknown", note: "" });
  writeForm(); persistDraft(); renderGenerated();
  artifactList.querySelector(".artifact-row:last-child input")?.focus();
});

byId("add-claim").addEventListener("click", () => {
  draft = readForm();
  draft.claims.push({ id: `claim-${draft.claims.length + 1}`, text: "", kind: "other", target: "", evidenceRefs: [] });
  writeForm(); persistDraft(); renderGenerated();
  claimList.querySelector(".claim-row:last-child input")?.focus();
});

fixtureSelect.addEventListener("change", () => {
  byId("fixture-description").textContent = getFixture(fixtureSelect.value)?.description || "Load a case to inspect its classification.";
});

byId("load-fixture").addEventListener("click", () => {
  const fixture = getFixture(fixtureSelect.value);
  if (!fixture) return;
  if (isMeaningful(draft) && !window.confirm("Load and replace the current draft with this fixture?")) return;
  draft = validateDraft(fixture.draft, { requireTask: false });
  generatedReceipt = null; generatedFingerprint = null;
  writeForm(); persistDraft(); renderGenerated();
  byId("import-json").value = fixture.importText || "";
  announce(`${fixture.title} loaded.`);
});

byId("reset-draft").addEventListener("click", () => {
  if (isMeaningful(draft) && !window.confirm("Reset this local draft? Downloaded receipts will not be affected.")) return;
  draft = normalizeDraft(EMPTY_DRAFT);
  generatedReceipt = null; generatedFingerprint = null;
  localStorage.removeItem(STORAGE_KEY);
  writeForm(); renderGenerated(); byId("save-state").textContent = "New draft"; announce("Draft reset.");
});

byId("generate-receipt").addEventListener("click", () => {
  draft = readForm();
  try {
    generatedReceipt = buildReceipt(draft);
    generatedFingerprint = currentFingerprint();
    persistDraft(); renderGenerated(); announce("Receipt generated.");
  } catch (error) {
    announce(error.message);
    byId("save-state").textContent = error.message;
  }
});

function setOutputFormat(format) {
  outputFormat = format;
  const markdown = format === "markdown";
  byId("show-markdown").classList.toggle("is-active", markdown);
  byId("show-markdown").setAttribute("aria-pressed", String(markdown));
  byId("show-json").classList.toggle("is-active", !markdown);
  byId("show-json").setAttribute("aria-pressed", String(!markdown));
  byId("download-output").textContent = markdown ? "Download Markdown" : "Download JSON";
  renderGenerated();
}

byId("show-markdown").addEventListener("click", () => setOutputFormat("markdown"));
byId("show-json").addEventListener("click", () => setOutputFormat("json"));

byId("copy-output").addEventListener("click", async () => {
  if (!generatedReceipt || generatedFingerprint !== currentFingerprint()) return;
  try {
    await navigator.clipboard.writeText(receiptOutput.textContent);
    announce(`${outputFormat === "markdown" ? "Markdown" : "JSON"} copied.`);
  } catch {
    receiptOutput.focus();
    announce("Clipboard access failed. Download the generated receipt or retry copy.");
  }
});

byId("download-output").addEventListener("click", () => {
  if (!generatedReceipt || generatedFingerprint !== currentFingerprint()) return;
  try {
    const extension = outputFormat === "markdown" ? "md" : "json";
    const blob = new Blob([receiptOutput.textContent], { type: outputFormat === "markdown" ? "text/markdown" : "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `patchproof-receipt.${extension}`; link.click();
    URL.revokeObjectURL(url);
    announce(`${outputFormat === "markdown" ? "Markdown" : "JSON"} downloaded.`);
  } catch {
    announce(`The ${outputFormat} download could not start. The generated receipt is still available.`);
  }
});

byId("open-import").addEventListener("click", () => {
  importCandidate = null;
  byId("import-error").textContent = "";
  byId("import-summary").textContent = "";
  byId("confirm-import").textContent = "Validate import";
  dialog.showModal(); byId("import-json").focus();
});

byId("cancel-import").addEventListener("click", () => { importCandidate = null; dialog.close(); announce("Current draft kept."); });

byId("import-json").addEventListener("input", () => {
  importCandidate = null;
  byId("import-error").textContent = "";
  byId("import-summary").textContent = "";
  byId("confirm-import").textContent = "Validate import";
});

byId("import-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!importCandidate) {
    try {
      importCandidate = parseImportedDraft(byId("import-json").value);
      byId("import-error").textContent = "";
      byId("import-summary").textContent = `Ready to replace with “${importCandidate.task || "untitled draft"}” (${importCandidate.claims.length} claims).`;
      byId("confirm-import").textContent = "Import and replace";
    } catch (error) {
      byId("import-error").textContent = `${error.message} Choose another file or keep current draft.`;
    }
    return;
  }
  draft = importCandidate;
  importCandidate = null; generatedReceipt = null; generatedFingerprint = null;
  writeForm(); persistDraft(); renderGenerated(); dialog.close(); announce("Draft imported and replaced.");
});

writeForm();
renderGenerated();
byId("save-state").textContent = restored.error || (restored.recovered ? "Recovered locally" : "New draft");
fixtureSelect.dispatchEvent(new Event("change"));

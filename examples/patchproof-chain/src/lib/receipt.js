export const EVIDENCE_STATUSES = Object.freeze([
  "passed",
  "failed",
  "skipped",
  "unknown",
  "unsupported",
]);

export const CLAIM_KINDS = Object.freeze(["tests", "file-change", "ui", "other"]);
export const ARTIFACT_TYPES = Object.freeze(["visual", "file", "note"]);
export const STORAGE_KEY = "patchproof:draft:v1";

export const EMPTY_DRAFT = Object.freeze({
  kind: "patchproof.draft",
  schemaVersion: 1,
  task: "",
  unifiedDiff: "",
  checkLog: "",
  artifacts: [],
  claims: [],
  limitations: [],
});

const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const normalizeText = (value) =>
  (typeof value === "string" ? value : "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");

function exactKeys(value, allowed, path) {
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown) throw new Error(`${path}.${unknown} is not supported by schemaVersion 1.`);
}

function assertId(id, path) {
  if (!ID_PATTERN.test(id)) throw new Error(`${path} must match ${ID_PATTERN}.`);
}

function uniqueIds(items, path) {
  const seen = new Set();
  for (const [index, item] of items.entries()) {
    assertId(item.id, `${path}[${index}].id`);
    if (seen.has(item.id)) throw new Error(`${path}[${index}].id duplicates ${item.id}.`);
    seen.add(item.id);
  }
}

export function normalizeDraft(value) {
  const draft = isRecord(value) ? value : {};
  return {
    kind: "patchproof.draft",
    schemaVersion: 1,
    task: normalizeText(draft.task),
    unifiedDiff: normalizeText(draft.unifiedDiff),
    checkLog: normalizeText(draft.checkLog),
    artifacts: Array.isArray(draft.artifacts)
      ? draft.artifacts.map((artifact) => ({
          id: normalizeText(artifact?.id),
          label: normalizeText(artifact?.label),
          type: ARTIFACT_TYPES.includes(artifact?.type) ? artifact.type : "note",
          reference: normalizeText(artifact?.reference),
          status: EVIDENCE_STATUSES.includes(artifact?.status) ? artifact.status : "unknown",
          note: normalizeText(artifact?.note),
        }))
      : [],
    claims: Array.isArray(draft.claims)
      ? draft.claims.map((claim) => ({
          id: normalizeText(claim?.id),
          text: normalizeText(claim?.text),
          kind: CLAIM_KINDS.includes(claim?.kind) ? claim.kind : "other",
          target: normalizeText(claim?.target),
          evidenceRefs: Array.isArray(claim?.evidenceRefs)
            ? claim.evidenceRefs.map(normalizeText)
            : [],
        }))
      : [],
    limitations: Array.isArray(draft.limitations)
      ? draft.limitations.map(normalizeText)
      : [],
  };
}

function extractChangedFiles(unifiedDiff) {
  const lines = unifiedDiff.split("\n");
  const files = [];
  const warnings = [];
  const normalizePath = (path) => {
    const clean = path.split("\t")[0].trim();
    if (clean === "/dev/null") return null;
    return clean.replace(/^[ab]\//, "");
  };

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].startsWith("diff --git ")) continue;
    const match = lines[index].match(/^diff --git a\/(.+) b\/(.+)$/);
    if (!match) continue;
    const oldPath = normalizePath(`a/${match[1]}`);
    let path = normalizePath(`b/${match[2]}`);
    let change = oldPath === path ? "modified" : "renamed";
    let warning = null;

    for (let cursor = index + 1; cursor < lines.length && !lines[cursor].startsWith("diff --git "); cursor += 1) {
      const line = lines[cursor];
      if (line.startsWith("new file mode") || line.startsWith("--- /dev/null")) change = "added";
      if (line.startsWith("deleted file mode") || line.startsWith("+++ /dev/null")) {
        change = "deleted";
        path = oldPath;
      }
      if (/^Binary files .* differ$|^GIT binary patch$/.test(line)) {
        change = "binary";
        warning = `Binary content was not inspected for ${path}.`;
      }
    }

    files.push({
      id: `diff-${String(files.length + 1).padStart(3, "0")}`,
      path,
      change,
      status: change === "binary" ? "unknown" : "passed",
      oldPath: change === "renamed" || change === "deleted" ? oldPath : null,
      warning,
    });
    if (warning) warnings.push(warning);
  }

  if (unifiedDiff.trim() && !files.length) warnings.push("The supplied diff could not be parsed as a standard unified diff.");
  if (!unifiedDiff.trim()) warnings.push("No unified diff was supplied.");
  return { files, warnings };
}

function extractChecks(checkLog) {
  if (!checkLog.trim()) return { checks: [], warnings: ["No check log was supplied."] };
  const lines = checkLog.split("\n");
  const commandLine = lines.find((line) => /^\s*(?:\$|command\s*:)/i.test(line));
  const command = commandLine
    ? commandLine.replace(/^\s*(?:\$\s*|command\s*:\s*)/i, "").trim()
    : "";
  const exitMatches = [...checkLog.matchAll(/(?:exit(?:ed)?(?:\s+with)?(?:\s+code)?|status)\s*[:=]?\s*(-?\d+)/gi)];
  const exitCodes = exitMatches.map((match) => Number(match[1]));
  const nonzero = exitCodes.find((code) => code !== 0);
  const explicitlySkipped = /\b(?:skipped|pending|not run|did not run)\b/i.test(checkLog);
  const ambiguous = /\b(?:stale|from previous|unknown revision|ambiguous|truncated|date unknown)\b/i.test(checkLog);
  const conflictingFailureCount = /\b[1-9]\d*\s+(?:failed|failing|failures?|errors?)\b/i.test(checkLog);
  let status = "unknown";
  let warning = null;

  if (!command) {
    status = "unsupported";
    warning = "The supplied check log does not identify the command.";
  } else if (nonzero !== undefined || /(?:command failed|process failed|npm err!|tests? failed)/i.test(checkLog)) {
    status = "failed";
  } else if (ambiguous || (exitCodes.includes(0) && conflictingFailureCount)) {
    status = "unknown";
    warning = "The supplied check log is stale, ambiguous, truncated, or conflicting.";
  } else if (explicitlySkipped) {
    status = "skipped";
  } else if (exitCodes.includes(0)) {
    status = "passed";
  } else {
    warning = "The supplied check log has no unambiguous exit code.";
  }

  const check = {
    id: "check-001",
    command,
    exitCode: nonzero ?? (exitCodes.includes(0) ? 0 : null),
    status,
    excerpt: checkLog.slice(0, 800),
    warning,
  };
  return { checks: [check], warnings: warning ? [warning] : [] };
}

export function extractEvidence(value) {
  const draft = normalizeDraft(value);
  const changed = extractChangedFiles(draft.unifiedDiff);
  const checked = extractChecks(draft.checkLog);
  return {
    changedFiles: changed.files,
    checks: checked.checks,
    artifacts: draft.artifacts,
    warnings: [...changed.warnings, ...checked.warnings],
  };
}

export function validateDraft(value, { requireTask = true } = {}) {
  if (!isRecord(value)) throw new Error("Draft must be a JSON object.");
  exactKeys(value, ["kind", "schemaVersion", "task", "unifiedDiff", "checkLog", "artifacts", "claims", "limitations"], "draft");
  if (value.kind !== "patchproof.draft") throw new Error('draft.kind must be "patchproof.draft".');
  if (value.schemaVersion !== 1) throw new Error("draft.schemaVersion must be 1.");
  for (const key of ["task", "unifiedDiff", "checkLog"]) {
    if (typeof value[key] !== "string") throw new Error(`draft.${key} must be a string.`);
  }
  if (requireTask && !value.task.trim()) throw new Error("draft.task must contain text before generation.");
  for (const key of ["artifacts", "claims", "limitations"]) {
    if (!Array.isArray(value[key])) throw new Error(`draft.${key} must be a list.`);
  }
  if (value.limitations.some((item) => typeof item !== "string")) throw new Error("draft.limitations must contain only strings.");

  value.artifacts.forEach((artifact, index) => {
    if (!isRecord(artifact)) throw new Error(`draft.artifacts[${index}] must be an object.`);
    exactKeys(artifact, ["id", "label", "type", "reference", "status", "note"], `draft.artifacts[${index}]`);
    for (const key of ["id", "label", "reference", "note"]) {
      if (typeof artifact[key] !== "string") throw new Error(`draft.artifacts[${index}].${key} must be a string.`);
    }
    if (!ARTIFACT_TYPES.includes(artifact.type)) throw new Error(`draft.artifacts[${index}].type is unsupported.`);
    if (!EVIDENCE_STATUSES.includes(artifact.status)) throw new Error(`draft.artifacts[${index}].status is unsupported.`);
  });
  uniqueIds(value.artifacts, "draft.artifacts");

  value.claims.forEach((claim, index) => {
    if (!isRecord(claim)) throw new Error(`draft.claims[${index}] must be an object.`);
    exactKeys(claim, ["id", "text", "kind", "target", "evidenceRefs"], `draft.claims[${index}]`);
    for (const key of ["id", "text", "target"]) {
      if (typeof claim[key] !== "string") throw new Error(`draft.claims[${index}].${key} must be a string.`);
    }
    if (!CLAIM_KINDS.includes(claim.kind)) throw new Error(`draft.claims[${index}].kind is unsupported.`);
    if (!Array.isArray(claim.evidenceRefs) || claim.evidenceRefs.some((item) => typeof item !== "string")) {
      throw new Error(`draft.claims[${index}].evidenceRefs must be a list of IDs.`);
    }
  });
  uniqueIds(value.claims, "draft.claims");

  const evidence = extractEvidence(value);
  const validRefs = new Set([
    ...evidence.changedFiles.map((item) => item.id),
    ...evidence.checks.map((item) => item.id),
    ...value.artifacts.map((item) => item.id),
  ]);
  value.claims.forEach((claim, claimIndex) => {
    const duplicateRef = claim.evidenceRefs.find((ref, index) => claim.evidenceRefs.indexOf(ref) !== index);
    if (duplicateRef) throw new Error(`draft.claims[${claimIndex}].evidenceRefs duplicates ${duplicateRef}.`);
    const unresolved = claim.evidenceRefs.find((ref) => !validRefs.has(ref));
    if (unresolved) throw new Error(`draft.claims[${claimIndex}].evidenceRefs cannot resolve ${unresolved}.`);
  });
  return normalizeDraft(value);
}

const PRECEDENCE = ["failed", "unsupported", "unknown", "skipped", "passed"];

function deriveStatus(items) {
  return PRECEDENCE.find((status) => items.some((item) => item.status === status)) || "unsupported";
}

export function calculateClaim(claim, evidence) {
  const refMap = new Map([
    ...evidence.changedFiles.map((item) => [item.id, { ...item, class: "changed file" }]),
    ...evidence.checks.map((item) => [item.id, { ...item, class: "check" }]),
    ...evidence.artifacts.map((item) => [item.id, { ...item, class: `${item.type} artifact` }]),
  ]);
  const references = claim.evidenceRefs.map((ref) => refMap.get(ref)).filter(Boolean);
  let required = [];
  let missing = "";

  if (claim.kind === "tests") {
    required = references.filter((item) => item.class === "check" && item.command);
    if (!required.length) missing = "No referenced check identifies a reproducible command.";
  } else if (claim.kind === "file-change") {
    required = references.filter((item) => item.class === "changed file" && item.path === claim.target);
    if (!required.length) missing = `No referenced changed file exactly matches ${claim.target || "the claim target"}.`;
  } else if (claim.kind === "ui") {
    required = references.filter((item) => item.class === "visual artifact");
    if (!required.length) missing = "No referenced visual artifact supports this UI claim.";
  } else {
    required = references;
    if (!required.length) missing = "No supplied evidence is referenced by this claim.";
  }

  const status = missing ? "unsupported" : deriveStatus(required);
  const classes = [...new Set(required.map((item) => item.class))].join(", ");
  return {
    id: claim.id,
    text: claim.text,
    kind: claim.kind,
    target: claim.target,
    evidenceRefs: claim.evidenceRefs,
    status,
    explanation: missing || `Derived from referenced ${classes}: ${required.map((item) => `${item.id}=${item.status}`).join(", ")}.`,
  };
}

function claimSummary(claims) {
  return {
    passed: claims.filter((item) => item.status === "passed").length,
    failed: claims.filter((item) => item.status === "failed").length,
    skipped: claims.filter((item) => item.status === "skipped").length,
    unknown: claims.filter((item) => item.status === "unknown").length,
    unsupported: claims.filter((item) => item.status === "unsupported").length,
  };
}

export function buildReceipt(value) {
  const draft = validateDraft(value);
  const extracted = extractEvidence(draft);
  const claims = draft.claims.map((claim) => calculateClaim(claim, extracted));
  const referencedFiles = new Set(draft.claims.flatMap((claim) => claim.evidenceRefs.filter((ref) => ref.startsWith("diff-"))));
  const unrelatedWarnings = extracted.changedFiles
    .filter((item) => !referencedFiles.has(item.id))
    .map((item) => `Changed path is not referenced by any claim: ${item.path}.`);
  return {
    kind: "patchproof.receipt",
    schemaVersion: 1,
    draft,
    evidence: {
      changedFiles: extracted.changedFiles,
      checks: extracted.checks,
      artifacts: draft.artifacts,
    },
    claims,
    warnings: [...extracted.warnings, ...unrelatedWarnings],
    limitations: draft.limitations,
    summary: claimSummary(claims),
  };
}

export function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function generateJsonReceipt(value) {
  return stableStringify(buildReceipt(value));
}

const escapeMarkdown = (value) =>
  normalizeText(value)
    .replace(/\\/g, "\\\\")
    .replace(/([`*_{}\[\]()<>#+\-.!|])/g, "\\$1")
    .replace(/\n/g, "<br>");

function fenced(value) {
  const content = normalizeText(value);
  const runs = content.match(/`+/g) || [];
  const fence = "`".repeat(Math.max(3, ...runs.map((run) => run.length + 1)));
  return `${fence}\n${content || "(not supplied)"}\n${fence}`;
}

export function generateMarkdownFromReceipt(receipt) {
  const claimRows = receipt.claims.length
    ? receipt.claims.map((claim) => `| ${escapeMarkdown(claim.id)} | ${escapeMarkdown(claim.text)} | ${claim.kind} | **${claim.status}** | ${escapeMarkdown(claim.explanation)} |`)
    : ["| — | No claims supplied | — | — | — |"];
  const changedFiles = receipt.evidence.changedFiles.length
    ? receipt.evidence.changedFiles.map((item) => `- **${item.status}** — \`${escapeMarkdown(item.path)}\` (${item.change})${item.warning ? ` — ${escapeMarkdown(item.warning)}` : ""}`)
    : ["- No changed files extracted."];
  const checks = receipt.evidence.checks.length
    ? receipt.evidence.checks.map((item) => `- **${item.status}** — \`${escapeMarkdown(item.command || "command missing")}\`; exit ${item.exitCode ?? "unknown"}${item.warning ? ` — ${escapeMarkdown(item.warning)}` : ""}`)
    : ["- No checks extracted."];
  const artifacts = receipt.evidence.artifacts.length
    ? receipt.evidence.artifacts.map((item) => `- **${item.status}** — ${escapeMarkdown(item.label)} (${item.type}, \`${escapeMarkdown(item.id)}\`) — ${escapeMarkdown(item.reference || item.note || "No reference supplied")}`)
    : ["- No artifacts supplied."];
  const warnings = receipt.warnings.length ? receipt.warnings.map((item) => `- ${escapeMarkdown(item)}`) : ["- No extraction warnings."];
  const limitations = receipt.limitations.length ? receipt.limitations.map((item) => `- ${escapeMarkdown(item)}`) : ["- No explicit limitations supplied."];

  return [
    "# PatchProof completion receipt",
    "",
    "## Task",
    "",
    escapeMarkdown(receipt.draft.task),
    "",
    "## Claim-status summary",
    "",
    `- passed: ${receipt.summary.passed}`,
    `- failed: ${receipt.summary.failed}`,
    `- skipped: ${receipt.summary.skipped}`,
    `- unknown: ${receipt.summary.unknown}`,
    `- unsupported: ${receipt.summary.unsupported}`,
    "",
    "## Claim-to-evidence ledger",
    "",
    "| ID | Claim | Kind | Status | Explanation |",
    "|---|---|---|---|---|",
    ...claimRows,
    "",
    "## Changed files",
    "",
    ...changedFiles,
    "",
    "## Checks",
    "",
    ...checks,
    "",
    "## Artifacts",
    "",
    ...artifacts,
    "",
    "## Warnings",
    "",
    ...warnings,
    "",
    "## Limitations",
    "",
    ...limitations,
    "",
    "## Raw unified diff",
    "",
    fenced(receipt.draft.unifiedDiff),
    "",
    "## Raw check log",
    "",
    fenced(receipt.draft.checkLog),
    "",
    "> This receipt reports what the supplied evidence shows. It does not prove semantic code correctness, security, production readiness, demand, or product-market fit.",
    "",
  ].join("\n");
}

export function generateMarkdownReceipt(value) {
  return generateMarkdownFromReceipt(buildReceipt(value));
}

export function parseImportedDraft(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Malformed JSON. Supported schema: patchproof.draft schemaVersion 1. Your current draft was not changed.");
  }
  if (!isRecord(parsed)) throw new Error("Wrong document shape. Supported schema: patchproof.draft schemaVersion 1.");
  let candidate;
  if (parsed.kind === "patchproof.draft") {
    candidate = parsed;
  } else if (parsed.kind === "patchproof.receipt") {
    exactKeys(parsed, ["kind", "schemaVersion", "draft", "evidence", "claims", "warnings", "limitations", "summary"], "receipt");
    if (parsed.schemaVersion !== 1) throw new Error("Unsupported receipt schemaVersion. PatchProof supports version 1.");
    candidate = parsed.draft;
  } else {
    throw new Error("Wrong document kind. Import patchproof.draft or patchproof.receipt schemaVersion 1.");
  }
  return validateDraft(candidate, { requireTask: false });
}

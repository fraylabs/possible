import { visibleText } from "./text-safety.mjs";
import { mkdir, readFile, writeFile, lstat, chmod, rename, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { readCaptureSource } from "./capture-sources.mjs";
import { redactCapture, inspectReviewText } from "./capture-redaction.mjs";
import { canonicalJson, captureReviewDigest, verifyCaptureReview } from "./capture-integrity.mjs";
import { validateOutcomeManifest, parseOutcomeMarkdown } from "./outcome-format.mjs";

const MAX_DRAFT = 1024 * 1024;
const SOURCES = new Set(["claude-code", "turnless", "codex"]);
const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const sha = value => createHash("sha256").update(canonicalJson(value)).digest("hex");
async function privateDirectory(folder) {
  try { await mkdir(folder, { mode: 0o700 }); }
  catch (error) { throw Object.assign(new Error("Cannot create the destination. Choose a new writable local directory; existing drafts and exports are never overwritten."), { code: error.code }); }
}
const privateWrite = (path, text) => writeFile(path, text, { flag: "wx", mode: 0o600 });

// Titles and collapsed turns are derived only after redaction, so a short
// title cannot reintroduce a secret removed from the recorded prompt.
function recipeSteps(prompts) {
  const steps = [];
  const trivial = /^(?:yes|yep|yeah|ok|okay|sure|continue|proceed|go ahead|please continue|please proceed)[.!\s]*$/i;
  for (const { text } of prompts) {
    if (trivial.test(text.trim()) && steps.length) {
      steps.at(-1).prompt += `\n\n${text}`;
      continue;
    }
    const prose = text.replace(/\[REDACTED[^\]]*\]/g, '').replace(/^[#>*\s]+/, '')
      .replace(/^(?:please\s+|can you\s+|could you\s+|I (?:want|would like) (?:you )?to\s+)/i, '').trim();
    const words = prose.split(/[\n.!?]/, 1)[0].trim().split(/\s+/).filter(Boolean).slice(0, 9).join(' ');
    const title = words ? words[0].toUpperCase() + words.slice(1, 80) : 'Review redacted instructions';
    steps.push({ title, instructions: title, prompt: text });
  }
  return steps;
}

function editableDraft(capture, findings) {
  const notes = [...new Set([
    "Recorded from a local session; privacy redactions and creator edits may change the wording.",
    "Tool outputs and file contents were omitted. Unknown ingredients are not inferred.",
    ...(capture.unknowns ?? []),
    ...(capture.references.length ? [`${capture.references.length} reference ingredients were detected; only shareable URLs retained below are included.`] : []),
    ...(capture.skills.length ? [`${capture.skills.length} skill loads were detected; only complete, shareable repository and version coordinates retained below are included.`] : []),
  ])];
  const steps = recipeSteps(capture.prompts);
  const recipe = {
    provenance: { method: "recorded", source: capture.source },
    notes,
  };
  const agents = [...new Set(capture.models.map(model => model.agent).filter(Boolean))];
  if (agents.length) recipe.agent = { name: agents.join(", ") };
  const skills = capture.skills.filter(skill => skill.repository && skill.directory && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(skill.lastReviewedCommit ?? ""))
    .map(({ repository, directory, lastReviewedCommit }) => ({ repository, directory, lastReviewedCommit }));
  if (skills.length) recipe.skills = skills;
  const references = capture.references.filter(reference => reference.url?.startsWith("https://"))
    .map(({ kind, label, url, purpose }) => ({ kind, label, url, ...(purpose ? { purpose } : {}) }));
  if (references.length) recipe.references = references;
  if (capture.tools.length) recipe.tools = capture.tools;
  if (steps.length) recipe.steps = steps;
  else recipe.notes.push("No user prompts could be determined. Supply an appropriate public prompt before export.");
  return {
    schemaVersion: 1,
    manifest: {
      schemaVersion: 4, slug: "choose-outcome-slug", files: { about: "outcome.md", prompt: "prompt.md" }, authoredAt: null,
      author: { name: "REQUIRED: public creator name", url: "https://example.com" },
      models: capture.models.length ? capture.models : [{ provider: "Unknown", model: "Not recorded", role: "execution" }],
      requirements: [], primary: { kind: "product", id: "choose/product" }, recipe,
    },
    about: "# REQUIRED: Outcome title\n\nREQUIRED: Describe the result and add only public previews or artifact links to the manifest.\n",
    prompt: steps.map(({ title, prompt }) => `${title}:\n${prompt}`).join("\n\n"),
    ingredientsToReview: { references: capture.references, skills: capture.skills },
    findings,
  };
}

export async function createCaptureDraft({ source, file, thread, out }) {
  if (!SOURCES.has(source) || !file || !out) throw new Error("Capture requires a supported source, explicit local session file and --out directory.");
  const normalized = await readCaptureSource({ source, file, thread });
  const { capture, findings } = redactCapture(normalized);
  const draft = editableDraft(capture, findings);
  const folder = resolve(out);
  await privateDirectory(folder); // Refuse an existing destination.
  await chmod(folder, 0o700);
  await privateWrite(join(folder, ".gitignore"), "*\n");
  await privateWrite(join(folder, "draft.json"), `${JSON.stringify(draft, null, 2)}\n`);
  await privateWrite(join(folder, "REVIEW.md"), "# Private capture draft\n\nNothing was uploaded. Edit draft.json: supply a title, result summary, public author and primary attribution. Inspect every prompt, tool and reference. Add only verified public references or skill coordinates omitted for privacy; do not infer historical versions. Add public result previews before review.\n\nRun `possible capture review <this-directory>` in your own terminal. Approval is tied to the exact draft; edits require a new review. Then `possible capture export <this-directory> --out <new-directory>` writes an unpublished Outcome. Publication is a separate explicit action.\n\nApproval is creator-attested and unauthenticated. A terminal can be automated; the check prevents accidental export, not deliberate automation.\n\nAutomated redaction is incomplete: names, private business context and uncommon secrets need your review. Do not approve on someone else’s behalf.\n");
  return { folder, findingCount: findings.length };
}

async function loadDraft(folder) {
  const path = join(resolve(folder), "draft.json");
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_DRAFT) throw new Error("Draft must be a regular local file smaller than 1 MiB.");
  let draft;
  try { draft = JSON.parse(await readFile(path, "utf8")); } catch { throw new Error("Draft is not valid JSON. No draft content was printed."); }
  if (!draft || draft.schemaVersion !== 1 || !draft.manifest || typeof draft.about !== "string" || typeof draft.prompt !== "string") throw new Error("Draft shape is invalid.");
  if (draft.manifest.recipe?.provenance?.method !== "recorded" || !SOURCES.has(draft.manifest.recipe.provenance.source)) throw new Error("Capture provenance is missing or invalid.");
  return draft;
}

function prepareReview(draft, reviewedAt) {
  const manifest = structuredClone(draft.manifest);
  manifest.recipe.provenance = { method: "recorded", source: manifest.recipe.provenance.source, reviewedAt, reviewDigest: "0".repeat(64) };
  const content = { manifest, about: draft.about, prompt: draft.prompt };
  const inspection = structuredClone(content);
  delete inspection.manifest.recipe.provenance;
  const serialized = JSON.stringify(inspection, null, 2);
  if (/REQUIRED:|choose-outcome-slug|choose\/product/.test(serialized) || manifest.author?.url === "https://example.com") throw new Error("Complete the result title, summary, author and primary attribution in draft.json before review.");
  try { validateOutcomeManifest(manifest); parseOutcomeMarkdown(draft.about); }
  catch { throw new Error("Draft metadata or outcome description is invalid. Check the Outcome format; no draft content was printed."); }
  if (!draft.prompt.trim()) throw new Error("Provide a public prompt before review.");
  if (manifest.recipe.tools?.some(tool => tool.purpose === "Observed in the session; creator must describe its purpose.")) throw new Error("Describe each tool’s actual purpose or remove it before review.");
  const findings = inspectReviewText(serialized);
  findings.push({ category: "ingredient-names", severity: "review", message: "Confirm model, provider and tool names are public; private deployment names and internal MCP names may not look like secrets." });
  if (findings.some(finding => finding.severity === "block")) {
    throw new Error(`Privacy review found content that must be removed first: ${[...new Set(findings.filter(f => f.severity === "block").map(f => f.category))].join(", ")}. Edit the draft and review again.`);
  }
  manifest.recipe.provenance.reviewDigest = captureReviewDigest(manifest, draft.about, draft.prompt);
  return { content, findings };
}

export async function reviewCaptureDraft(folder, { input = process.stdin, output = process.stdout } = {}) {
  if (!input.isTTY || !output.isTTY) throw new Error("Privacy review requires the creator’s interactive terminal. Piped input and --yes approval are not supported.");
  const draft = await loadDraft(folder);
  const initialHash = sha(draft);
  const { content, findings } = prepareReview(draft, new Date().toISOString());
  // Transcript control sequences must not hide content or spoof a terminal prompt.
  const displayed = visibleText(JSON.stringify(content, null, 2));
  output.write(`\nPRIVATE LOCAL REVIEW — nothing will be uploaded\n${displayed}\n\n`);
  output.write("Approval is creator-attested and unauthenticated. A terminal can be automated; this check prevents accidental export, not deliberate automation. Agents must not approve on behalf of the creator.\n");
  output.write("Review every prompt and ingredient above. Automated redaction cannot identify all personal names, private context or uncommon secrets. Confirm this is a finished session, that you own the prompts, and every retained reference is public or permitted to share.\n");
  for (const finding of [...(Array.isArray(draft.findings) ? draft.findings : []), ...findings]) {
    // JSON encoding keeps arbitrary edited findings inert in the terminal.
    output.write(`${JSON.stringify({ category: finding.category, message: finding.message })}\n`);
  }
  const digest = content.manifest.recipe.provenance.reviewDigest;
  const expected = `APPROVE ${digest.slice(0, 12)}`;
  const readline = createInterface({ input, output, terminal: true });
  let answer;
  try { answer = await readline.question(`Type ${expected} to approve this exact local export, or anything else to cancel: `); }
  finally { readline.close(); }
  if (answer !== expected) throw new Error("Review cancelled. Nothing was exported or published.");
  if (sha(await loadDraft(folder)) !== initialHash) throw new Error("Draft changed during review. Review again.");
  const receipt = { schemaVersion: 1, draftHash: initialHash, ...content };
  const approvalPath = join(resolve(folder), "approval.json");
  const temporaryPath = join(resolve(folder), `.approval-${randomUUID()}.tmp`);
  try {
    await privateWrite(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`);
    // Atomic replacement replaces an existing symlink itself, never its target.
    await rename(temporaryPath, approvalPath);
  } finally { await unlink(temporaryPath).catch(() => {}); }
  return { digest };
}

export async function exportCaptureDraft(folder, out) {
  if (!out) throw new Error("Export requires --out with a new local directory.");
  const draft = await loadDraft(folder);
  let receipt;
  try {
    const receiptPath = join(resolve(folder), "approval.json");
    const stat = await lstat(receiptPath);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_DRAFT) throw new Error("Invalid receipt.");
    receipt = JSON.parse(await readFile(receiptPath, "utf8"));
  }
  catch { throw new Error("Creator review is required. Run possible capture review first."); }
  if (receipt.schemaVersion !== 1 || receipt.draftHash !== sha(draft)) throw new Error("Draft was not approved or changed after review. Review it again.");
  const reviewedAt = receipt.manifest?.recipe?.provenance?.reviewedAt;
  const expected = prepareReview(draft, reviewedAt).content;
  if (canonicalJson(expected) !== canonicalJson({ manifest: receipt.manifest, about: receipt.about, prompt: receipt.prompt })) throw new Error("Approval does not match this draft. Review again.");
  verifyCaptureReview(receipt.manifest, receipt.about, receipt.prompt);
  const slug = receipt.manifest.slug;
  if (!SAFE_SLUG.test(slug)) throw new Error("Invalid Outcome slug.");
  const root = resolve(out);
  await privateDirectory(root);
  const destination = join(root, "outcomes", slug);
  await mkdir(destination, { recursive: true, mode: 0o700 });
  await privateWrite(join(destination, "outcome.json"), `${JSON.stringify(receipt.manifest, null, 2)}\n`);
  await privateWrite(join(destination, "outcome.md"), `${receipt.about.trim()}\n`);
  await privateWrite(join(destination, "prompt.md"), `${receipt.prompt.trim()}\n`);
  await privateWrite(join(root, "outcomes.json"), `${JSON.stringify({ schemaVersion: 1, publisher: receipt.manifest.author, outcomes: [{ slug, url: `./outcomes/${slug}/outcome.json` }] }, null, 2)}\n`);
  return { folder: root, slug };
}

export async function runCaptureCommand(args) {
  const [action, file, ...rest] = args;
  const options = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!["--out", "--thread"].includes(rest[i]) || !rest[i + 1] || rest[i + 1].startsWith("--") || options[rest[i]]) throw new Error("Unknown or incomplete capture option. Review has no approval-bypass flag.");
    options[rest[i]] = rest[i + 1];
  }
  if (!file) throw new Error("Capture requires an explicit local input or draft directory.");
  if (action === "review") {
    if (rest.length) throw new Error("Review accepts only the draft directory; no bypass flags.");
    await reviewCaptureDraft(file);
    return "Approved exact local draft. Export separately; nothing was uploaded.";
  }
  if (action === "export") {
    if (options["--thread"]) throw new Error("Export does not accept --thread.");
    await exportCaptureDraft(file, options["--out"]);
    return "Exported reviewed Outcome locally. Nothing was uploaded or published.";
  }
  await createCaptureDraft({ source: action, file, thread: options["--thread"], out: options["--out"] });
  return "Created private draft.json and REVIEW.md. Edit the draft, then run possible capture review. Nothing was uploaded.";
}

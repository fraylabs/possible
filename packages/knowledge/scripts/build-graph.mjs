import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageDir, "../..");
const defaultKnowledgeDir = resolve(repositoryRoot, "knowledge");
const schemaPath = resolve(repositoryRoot, "schema/knowledge-collection.schema.json");
const generatedPath = resolve(packageDir, "src/generated-data.ts");

const args = process.argv.slice(2);
const mode = args.includes("--write")
  ? "write"
  : args.includes("--validate-only")
    ? "validate-only"
    : "check";
const knowledgeDirectoryIndex = args.indexOf("--knowledge-dir");
const knowledgeDir =
  knowledgeDirectoryIndex >= 0 && args[knowledgeDirectoryIndex + 1]
    ? resolve(process.cwd(), args[knowledgeDirectoryIndex + 1])
    : defaultKnowledgeDir;

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return jsonFiles(path);
      return entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
    }),
  );
  return nested.flat().sort();
}

const printableErrors = (errors) =>
  (errors ?? [])
    .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
    .sort()
    .join("\n");

function assertGraphIntegrity(collections) {
  const errors = [];
  const nodes = [];
  for (const { file, value } of collections) {
    for (const node of value.nodes) {
      if (node.domain !== value.branch) {
        errors.push(`${file}: ${node.id} belongs to ${node.domain}, not collection branch ${value.branch}`);
      }
      nodes.push(node);
    }
  }

  const byId = new Map();
  for (const node of nodes) {
    if (byId.has(node.id)) errors.push(`duplicate node id: ${node.id}`);
    byId.set(node.id, node);
  }

  if (nodes.length < 24) errors.push(`expected at least 24 nodes, found ${nodes.length}`);
  for (const domain of ["web", "manufacturing"]) {
    const count = nodes.filter((node) => node.domain === domain).length;
    if (count < 10) errors.push(`expected at least 10 ${domain} nodes, found ${count}`);
  }
  for (const type of ["topic", "practice", "tool", "provider", "action"]) {
    if (!nodes.some((node) => node.type === type)) errors.push(`missing required node type: ${type}`);
  }

  const relationTypes = new Set();
  const edgeIds = new Set();
  for (const node of nodes) {
    for (const recommendation of node.recommendations) {
      const alternativeIds = new Set();
      for (const alternative of recommendation.alternatives) {
        if (!byId.has(alternative.nodeId)) {
          errors.push(`${node.id}: recommendation alternative does not exist: ${alternative.nodeId}`);
        }
        if (alternative.nodeId === node.id) {
          errors.push(`${node.id}: recommendation cannot name itself as an alternative`);
        }
        if (alternativeIds.has(alternative.nodeId)) {
          errors.push(`${node.id}: duplicate recommendation alternative: ${alternative.nodeId}`);
        }
        alternativeIds.add(alternative.nodeId);
      }
    }

    for (const relationship of node.relationships) {
      relationTypes.add(relationship.type);
      if (!byId.has(relationship.target)) {
        errors.push(`${node.id}: relationship target does not exist: ${relationship.target}`);
      }
      if (relationship.target === node.id) {
        errors.push(`${node.id}: relationship cannot target itself`);
      }
      const edgeId = `${node.id}::${relationship.type}::${relationship.target}`;
      if (edgeIds.has(edgeId)) errors.push(`${node.id}: duplicate relationship: ${edgeId}`);
      edgeIds.add(edgeId);
    }

    if (node.type === "provider") {
      const unknownFields = new Set(node.provider.unknowns.map((unknown) => unknown.field));
      for (const requiredUnknown of ["pricing", "availability"]) {
        if (!unknownFields.has(requiredUnknown)) {
          errors.push(`${node.id}: provider must explicitly mark ${requiredUnknown} as unknown/live`);
        }
      }
      for (const capability of node.provider.capabilities) {
        if (capability.status === "supported" && capability.source?.kind !== "official-capability") {
          errors.push(`${node.id}: supported capability ${capability.key} needs official-capability provenance`);
        }
      }
      for (const recommendation of node.recommendations) {
        if (recommendation.reviewIntervalDays > 30) {
          errors.push(`${node.id}: provider recommendations must be reviewed at least every 30 days`);
        }
      }
    }

    if (
      node.type === "tool" &&
      node.tool.categories.some((category) => ["framework", "renderer", "ui-components"].includes(category))
    ) {
      for (const recommendation of node.recommendations) {
        if (recommendation.reviewIntervalDays > 60) {
          errors.push(`${node.id}: volatile framework/renderer guidance must be reviewed at least every 60 days`);
        }
      }
    }

    if (node.type === "action" && node.action.providerId) {
      const provider = byId.get(node.action.providerId);
      if (provider?.type !== "provider") {
        errors.push(`${node.id}: action providerId is not a provider: ${node.action.providerId}`);
      }
      const invocation = node.relationships.some(
        (relationship) =>
          relationship.type === "invocation" && relationship.target === node.action.providerId,
      );
      if (!invocation) {
        errors.push(`${node.id}: provider action needs an invocation relationship to ${node.action.providerId}`);
      }
    }
  }

  for (const type of ["hierarchy", "relevance", "compatibility", "alternatives", "support", "invocation"]) {
    if (!relationTypes.has(type)) errors.push(`missing required relationship type: ${type}`);
  }

  if (errors.length > 0) throw new Error(errors.sort().join("\n"));

  const sortedNodes = [...nodes].sort((left, right) => left.id.localeCompare(right.id));
  const edges = sortedNodes
    .flatMap((node) =>
      node.relationships.map((relationship) => ({
        id: `${node.id}::${relationship.type}::${relationship.target}`,
        source: node.id,
        target: relationship.target,
        type: relationship.type,
        description: relationship.description,
      })),
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  return { nodes: sortedNodes, edges };
}

function generatedModule(graph) {
  return [
    "// Generated from contributor-authored files in knowledge/. Do not edit by hand.",
    'import type { KnowledgeGraph } from "./types.js";',
    "",
    `export const knowledgeGraphData: KnowledgeGraph = ${JSON.stringify(graph, null, 2)};`,
    "",
  ].join("\n");
}

async function main() {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const files = await jsonFiles(knowledgeDir);
  if (files.length === 0) throw new Error(`no JSON knowledge collections found in ${knowledgeDir}`);

  const collections = [];
  for (const file of files) {
    const value = JSON.parse(await readFile(file, "utf8"));
    if (!validate(value)) {
      throw new Error(`${relative(repositoryRoot, file)} failed schema validation:\n${printableErrors(validate.errors)}`);
    }
    collections.push({ file: relative(repositoryRoot, file), value });
  }

  const graph = assertGraphIntegrity(collections);
  const generated = generatedModule(graph);
  if (mode === "write") {
    await writeFile(generatedPath, generated, "utf8");
  } else if (mode === "check") {
    if (!existsSync(generatedPath)) {
      throw new Error("generated graph is missing; run npm run generate -w @possible/knowledge");
    }
    const current = await readFile(generatedPath, "utf8");
    if (current !== generated) {
      throw new Error("generated graph is stale; run npm run generate -w @possible/knowledge");
    }
  }
  process.stdout.write(
    `Validated ${graph.nodes.length} nodes and ${graph.edges.length} edges from ${files.length} collections.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type" };
const githubPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const slugPattern = /^[a-z0-9][a-z0-9-]*$/;
const commitPattern = /^[0-9a-f]{40}$/;
const allowedManifestKeys = new Set(["schemaVersion", "slug", "files", "authoredAt", "author", "models", "requirements", "products", "skills", "inputs", "artifacts", "preview"]);
const maxOutcomes = 100;
const maxBytes = 1024 * 1024;

type Source = { type: "github" | "well-known"; locator: string; installUrl: string };
type Document = {
  slug: string; title: string; summary: string; manifest: Record<string, unknown>;
  aboutMarkdown: string; promptMarkdown: string; contentHash: string;
  manifestUrl: string; aboutUrl: string; promptUrl: string;
};

function privateHostname(value: string) {
  const hostname = value.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return true;
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const first = Number(ipv4[1]);
    const second = Number(ipv4[2]);
    return first === 0 || first === 10 || first === 127 || first >= 224
      || (first === 100 && second >= 64 && second <= 127)
      || (first === 169 && second === 254)
      || (first === 172 && second >= 16 && second <= 31)
      || (first === 192 && second === 168)
      || (first === 198 && (second === 18 || second === 19));
  }
  return hostname === "::" || hostname === "::1" || /^(?:fc|fd|fe[89ab])/i.test(hostname) || /^::ffff:(?:0\.|10\.|127\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname);
}

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });
}

function parseSource(value: unknown): Source {
  const raw = String(value ?? "").trim().replace(/\/$/, "");
  if (githubPattern.test(raw)) {
    const locator = raw.replace(/\.git$/, "");
    return { type: "github", locator, installUrl: "https://github.com/" + locator };
  }
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("Source must be a GitHub owner/repository or an HTTPS publisher URL"); }
  if (url.protocol !== "https:") throw new Error("Publisher domains must use HTTPS");
  if (url.hostname.toLowerCase() === "github.com") {
    const parts = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (!parts[0] || !parts[1]) throw new Error("GitHub sources must identify an owner and repository");
    const locator = parts[0] + "/" + parts[1].replace(/\.git$/, "");
    return { type: "github", locator, installUrl: "https://github.com/" + locator };
  }
  const hostname = url.hostname.toLowerCase();
  if (privateHostname(hostname)) {
    throw new Error("Publisher source cannot use a local or private network address");
  }
  return { type: "well-known", locator: url.origin, installUrl: url.origin };
}

async function fetchText(url: string, accept: string, additionalHeaders: Record<string, string> = {}) {
  const request = await fetch(url, { headers: { accept, "user-agent": "possible-registry", ...additionalHeaders }, redirect: "error" });
  if (!request.ok) throw new Error(url + " returned HTTP " + request.status);
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new Error(url + " exceeds the 1 MiB document limit");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error(url + " exceeds the 1 MiB document limit");
  return text;
}

async function fetchJson(url: string, additionalHeaders: Record<string, string> = {}) {
  return JSON.parse(await fetchText(url, "application/json", additionalHeaders)) as Record<string, unknown>;
}

async function digest(parts: string[]) {
  const value = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(parts.join("\0")));
  return "sha256:" + [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseAbout(markdown: string, context: string) {
  const normalized = markdown.trim();
  const lines = normalized.split(/\r?\n/);
  if (!lines[0]?.startsWith("# ") || !lines[0].slice(2).trim()) throw new Error(context + " must begin with one # title");
  if (lines.slice(1).some((line) => line.startsWith("# "))) throw new Error(context + " must contain exactly one # title");
  let position = 1;
  while (lines[position]?.trim() === "") position += 1;
  const summaryLines: string[] = [];
  while (position < lines.length && lines[position]?.trim() && !lines[position]?.startsWith("## ")) summaryLines.push(lines[position++]!);
  if (!summaryLines.length) throw new Error(context + " requires an opening summary");
  const plain = (text: string) => text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();
  return { title: plain(lines[0].slice(2)), summary: plain(summaryLines.join("\n")), markdown: normalized };
}

function parseManifest(text: string, context: string) {
  const manifest = JSON.parse(text) as Record<string, unknown>;
  for (const key of Object.keys(manifest)) if (!allowedManifestKeys.has(key)) throw new Error(context + "." + key + " is unsupported");
  if (manifest.schemaVersion !== 3 || typeof manifest.slug !== "string" || !slugPattern.test(manifest.slug)) throw new Error(context + " must be a schemaVersion 3 Outcome manifest with a valid slug");
  const files = manifest.files as Record<string, unknown> | undefined;
  if (!files || files.about !== "outcome.md" || files.prompt !== "prompt.md") throw new Error(context + " must reference outcome.md and prompt.md");
  const author = manifest.author as Record<string, unknown> | undefined;
  if (!author || typeof author.name !== "string" || !author.name.trim() || typeof author.url !== "string" || !author.url.startsWith("https://")) throw new Error(context + " requires an author name and HTTPS URL");
  if (!Array.isArray(manifest.models) || !manifest.models.length) throw new Error(context + ".models must be a non-empty array");
  for (const model of manifest.models) {
    const item = model as Record<string, unknown>;
    if (!item || typeof item.provider !== "string" || typeof item.model !== "string" || !["authorship", "execution", "review"].includes(String(item.role))) throw new Error(context + ".models is invalid");
  }
  if (!Array.isArray(manifest.requirements) || !manifest.requirements.every((item) => typeof item === "string" && item.trim())) throw new Error(context + ".requirements is invalid");
  return manifest;
}

async function readDocument(manifestUrl: string, aboutUrl: string, promptUrl: string, folderSlug?: string): Promise<Document> {
  const texts = await Promise.all([fetchText(manifestUrl, "application/json"), fetchText(aboutUrl, "text/markdown,text/plain"), fetchText(promptUrl, "text/markdown,text/plain")]);
  const manifest = parseManifest(texts[0], manifestUrl);
  const slug = manifest.slug as string;
  if (folderSlug && slug !== folderSlug) throw new Error(manifestUrl + " slug must match its folder");
  const about = parseAbout(texts[1], aboutUrl);
  const prompt = texts[2].trim();
  if (!prompt) throw new Error(promptUrl + " must contain the exact execution prompt");
  return { slug, title: about.title, summary: about.summary, manifest, aboutMarkdown: about.markdown, promptMarkdown: prompt, contentHash: await digest(texts), manifestUrl, aboutUrl, promptUrl };
}

async function discoverGithub(source: Source) {
  const githubToken = Deno.env.get("GITHUB_TOKEN");
  const githubHeaders: Record<string, string> = githubToken ? { authorization: "Bearer " + githubToken } : {};
  const repository = await fetchJson("https://api.github.com/repos/" + source.locator, githubHeaders);
  if (repository.private !== false || typeof repository.default_branch !== "string") throw new Error(source.locator + " is not a public GitHub repository");
  const revisionData = await fetchJson("https://api.github.com/repos/" + source.locator + "/commits/" + encodeURIComponent(repository.default_branch), githubHeaders);
  const revision = String(revisionData.sha ?? "");
  if (!commitPattern.test(revision)) throw new Error("GitHub did not return an exact commit");
  const base = "https://raw.githubusercontent.com/" + source.locator + "/" + revision + "/";
  const indexUrl = new URL("outcomes.json", base).toString();
  const index = await fetchJson(indexUrl, githubHeaders);
  const entries = index.outcomes as Array<Record<string, unknown>> | undefined;
  if (index.schemaVersion !== 1 || !entries?.length || entries.length > maxOutcomes) throw new Error(source.locator + "/outcomes.json must list between 1 and " + maxOutcomes + " Outcomes");
  const baseUrl = new URL(base);
  const outcomes = await Promise.all(entries.map(async (entry, indexPosition) => {
    if (typeof entry.url !== "string") throw new Error(source.locator + "/outcomes.json outcomes[" + indexPosition + "] must contain a URL");
    const manifestUrl = new URL(entry.url, indexUrl);
    if (manifestUrl.origin !== baseUrl.origin || !manifestUrl.pathname.startsWith(baseUrl.pathname)) throw new Error("GitHub Outcome URLs must stay inside the exact repository revision");
    const folder = new URL("./", manifestUrl);
    const document = await readDocument(manifestUrl.toString(), new URL("outcome.md", folder).toString(), new URL("prompt.md", folder).toString(), folder.pathname.split("/").filter(Boolean).at(-1));
    if (entry.slug !== undefined && entry.slug !== document.slug) throw new Error(source.locator + "/outcomes.json contains a slug mismatch");
    return document;
  }));
  const publisher = index.publisher as Record<string, unknown> | undefined;
  const publisherName = typeof publisher?.name === "string" && publisher.name.trim() ? publisher.name.trim() : source.locator.split("/")[0]!;
  return { source, revision, publisherName, outcomes };
}

async function discoverWellKnown(source: Source) {
  const indexUrl = new URL("/.well-known/possible/outcomes.json", source.locator).toString();
  const index = await fetchJson(indexUrl);
  const entries = index.outcomes as Array<Record<string, unknown>> | undefined;
  if (index.schemaVersion !== 1 || !entries?.length || entries.length > maxOutcomes) throw new Error(indexUrl + " must list between 1 and " + maxOutcomes + " Outcomes");
  const outcomes = await Promise.all(entries.map((entry) => {
    const manifestUrl = new URL(String(entry.url), indexUrl);
    if (manifestUrl.origin !== source.locator || manifestUrl.protocol !== "https:") throw new Error("Publisher Outcome URLs must stay on the publisher origin");
    const folder = new URL("./", manifestUrl);
    return readDocument(manifestUrl.toString(), new URL("outcome.md", folder).toString(), new URL("prompt.md", folder).toString());
  }));
  const publisher = index.publisher as Record<string, unknown> | undefined;
  const name = typeof publisher?.name === "string" && publisher.name.trim() ? publisher.name.trim() : new URL(source.locator).hostname;
  return { source, revision: await digest(outcomes.map((outcome) => outcome.contentHash).sort()), publisherName: name, outcomes };
}

function absoluteUrl(value: unknown, base: string) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const url = new URL(value, base);
  if (url.protocol !== "https:") throw new Error("Outcome files must resolve to HTTPS");
  return url.toString();
}

function resolveFiles(value: unknown, base: string) {
  return Array.isArray(value) ? value.map((file) => ({ ...(file as Record<string, unknown>), src: absoluteUrl((file as Record<string, unknown>).src, base) })) : [];
}

function resolvePreview(value: unknown, base: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const preview = structuredClone(value) as Record<string, unknown>;
  const images = Array.isArray(preview.images) ? preview.images as Array<Record<string, unknown>> : [];
  for (const image of images) image.src = absoluteUrl(image.src, base);
  for (const name of ["video", "audio"]) {
    const media = preview[name] as Record<string, unknown> | undefined;
    if (media?.src) media.src = absoluteUrl(media.src, base);
    if (media?.poster) media.poster = absoluteUrl(media.poster, base);
  }
  const cad = preview.cad as Record<string, unknown> | undefined;
  if (cad?.preview) cad.preview = absoluteUrl(cad.preview, base);
  if (cad?.poster) cad.poster = absoluteUrl(cad.poster, base);
  if (Array.isArray(cad?.downloads)) for (const item of cad.downloads as Array<Record<string, unknown>>) item.src = absoluteUrl(item.src, base);
  return preview;
}

function primaryMedia(preview: Record<string, unknown> | null) {
  if (!preview) return { result: null, poster: null };
  const video = preview.video as Record<string, unknown> | undefined;
  const audio = preview.audio as Record<string, unknown> | undefined;
  const cad = preview.cad as Record<string, unknown> | undefined;
  const images = Array.isArray(preview.images) ? preview.images as Array<Record<string, unknown>> : [];
  const cover = images.find((image) => image.cover === true) ?? images[0];
  return { result: video?.src ?? cover?.src ?? audio?.src ?? cad?.preview ?? cad?.poster ?? null, poster: video?.poster ?? cover?.src ?? audio?.poster ?? cad?.poster ?? null };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 4096) return reply({ error: "Request is too large" }, 413);
    const body = await request.json() as { source?: unknown };
    const source = parseSource(body.source);
    const discovery = source.type === "github" ? await discoverGithub(source) : await discoverWellKnown(source);
    if (new Set(discovery.outcomes.map((outcome) => outcome.slug)).size !== discovery.outcomes.length) throw new Error("Source contains duplicate Outcome slugs");

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return reply({ error: "Outcome registry is not configured" }, 500);
    const database = createClient(url, key, { auth: { persistSession: false } });
    const sourceWrite = await database.from("outcome_sources").upsert({
      source_type: source.type, locator: source.locator, install_url: source.installUrl,
      publisher_name: discovery.publisherName, current_revision: discovery.revision,
    }, { onConflict: "source_type,locator" }).select("id").single();
    if (sourceWrite.error) throw sourceWrite.error;
    const sourceId = sourceWrite.data.id as string;
    const published: Array<{ id: string; slug: string; title: string; publicationKind: string }> = [];

    for (const document of discovery.outcomes) {
      const skills = Array.isArray(document.manifest.skills) ? document.manifest.skills : [];
      const ownsSkill = source.type === "github" && skills.some((skill) => (skill as Record<string, unknown>)?.repository === source.locator);
      const publicationKind = source.type === "well-known" || ownsSkill ? "official" : "community";
      const outcomeWrite = await database.from("outcomes").upsert({ source_id: sourceId, slug: document.slug, status: "published", publication_kind: publicationKind }, { onConflict: "source_id,slug" }).select("id").single();
      if (outcomeWrite.error) throw outcomeWrite.error;
      const outcomeId = outcomeWrite.data.id as string;
      const preview = resolvePreview(document.manifest.preview, document.manifestUrl);
      const media = primaryMedia(preview);
      const snapshotWrite = await database.from("outcome_snapshots").upsert({
        outcome_id: outcomeId, source_revision: discovery.revision, content_hash: document.contentHash,
        manifest: document.manifest, about_markdown: document.aboutMarkdown, prompt_markdown: document.promptMarkdown,
        title: document.title, summary: document.summary, requirements: document.manifest.requirements,
        models: document.manifest.models, products: document.manifest.products ?? [], skills,
        preview, inputs: resolveFiles(document.manifest.inputs, document.manifestUrl), artifacts: resolveFiles(document.manifest.artifacts, document.manifestUrl),
        result_media_url: media.result, poster_url: media.poster,
        manifest_url: document.manifestUrl, about_url: document.aboutUrl, prompt_url: document.promptUrl,
      }, { onConflict: "outcome_id,content_hash" }).select("id").single();
      if (snapshotWrite.error) throw snapshotWrite.error;
      const current = await database.from("outcomes").update({ current_snapshot_id: snapshotWrite.data.id, publication_kind: publicationKind, status: "published" }).eq("id", outcomeId);
      if (current.error) throw current.error;
      published.push({ id: outcomeId, slug: document.slug, title: document.title, publicationKind });
    }

    const slugs = discovery.outcomes.map((outcome) => outcome.slug);
    const retired = await database.from("outcomes").update({ status: "hidden" }).eq("source_id", sourceId).not("slug", "in", "(" + slugs.map((slug) => '"' + slug + '"').join(",") + ")");
    if (retired.error) throw retired.error;
    return reply({ source: { ...source, revision: discovery.revision, publisherName: discovery.publisherName }, outcomes: published });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : String(error) }, 400);
  }
});

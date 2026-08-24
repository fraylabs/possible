import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

type Attribution = { kind: "product"; id: string } | { kind: "skill"; repository: string; directory: string; lastReviewedCommit: string };

function normalizeAttributions(manifest: Record<string, unknown>) {
  if (manifest.schemaVersion === 4) {
    const primary = manifest.primary as Attribution;
    const secondary = (manifest.secondary ?? []) as Attribution[];
    const all = [primary, ...secondary];
    return {
      primary,
      secondary,
      products: all.filter((item): item is Extract<Attribution, { kind: "product" }> => item.kind === "product").map((item) => item.id),
      skills: all.filter((item): item is Extract<Attribution, { kind: "skill" }> => item.kind === "skill").map(({ kind: _kind, ...item }) => item),
    };
  }
  const products = Array.isArray(manifest.products) ? manifest.products as string[] : [];
  const skills = Array.isArray(manifest.skills) ? manifest.skills as Array<Omit<Extract<Attribution, { kind: "skill" }>, "kind">> : [];
  const all: Attribution[] = [
    ...products.map((id) => ({ kind: "product" as const, id })),
    ...skills.map((skill) => ({ kind: "skill" as const, ...skill })),
  ];
  return { primary: all[0] ?? null, secondary: all.slice(1), products, skills };
}

function resolvedUrl(value: unknown, base: string) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const url = new URL(value, base);
  if (url.protocol !== "https:") throw new Error("Outcome files must resolve to HTTPS");
  return url.toString();
}

function resolveFiles(value: unknown, base: string) {
  return Array.isArray(value) ? value.map((file) => ({ ...(file as Record<string, unknown>), src: resolvedUrl((file as Record<string, unknown>).src, base) })) : [];
}

function resolvePreview(value: unknown, base: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const preview = structuredClone(value) as Record<string, any>;
  if (Array.isArray(preview.images)) for (const image of preview.images) image.src = resolvedUrl(image.src, base);
  for (const name of ["video", "audio"]) {
    const media = preview[name];
    if (media?.src) media.src = resolvedUrl(media.src, base);
    if (media?.poster) media.poster = resolvedUrl(media.poster, base);
  }
  const cad = preview.cad;
  if (cad?.preview) cad.preview = resolvedUrl(cad.preview, base);
  if (cad?.poster) cad.poster = resolvedUrl(cad.poster, base);
  if (Array.isArray(cad?.downloads)) for (const item of cad.downloads) item.src = resolvedUrl(item.src, base);
  return preview;
}

function primaryMedia(preview: Record<string, any> | undefined) {
  if (!preview) return {};
  const cover = Array.isArray(preview.images) ? preview.images.find((image: any) => image.cover === true) ?? preview.images[0] : undefined;
  return {
    resultMediaUrl: preview.video?.src ?? cover?.src ?? preview.audio?.src ?? preview.cad?.preview ?? preview.cad?.poster,
    posterUrl: preview.video?.poster ?? cover?.src ?? preview.audio?.poster ?? preview.cad?.poster,
  };
}

export const applyDiscovery = internalMutation({
  args: { discovery: v.any() },
  handler: async (ctx, { discovery }) => {
    if (!discovery || !["github", "well-known"].includes(discovery.source?.type) || !Array.isArray(discovery.outcomes) || discovery.outcomes.length < 1 || discovery.outcomes.length > 100) {
      throw new Error("Invalid Outcome discovery snapshot");
    }
    const now = Date.now();
    let source = await ctx.db.query("outcomeSources").withIndex("by_type_locator", (index) => index.eq("sourceType", discovery.source.type).eq("locator", discovery.source.locator)).unique();
    let sourceId;
    if (source) {
      sourceId = source._id;
      await ctx.db.patch(sourceId, { installUrl: discovery.source.installUrl, publisherName: discovery.publisherName, currentRevision: discovery.source.revision, updatedAt: now });
    } else {
      sourceId = await ctx.db.insert("outcomeSources", { sourceType: discovery.source.type, locator: discovery.source.locator, installUrl: discovery.source.installUrl, publisherName: discovery.publisherName, currentRevision: discovery.source.revision, createdAt: now, updatedAt: now });
    }
    const published = [];
    const activeSlugs = new Set<string>();
    for (const document of discovery.outcomes) {
      activeSlugs.add(document.slug);
      const attributions = normalizeAttributions(document.manifest);
      const ownsSkill = discovery.source.type === "github" && attributions.skills.some((skill) => skill.repository === discovery.source.locator);
      const publicationKind = discovery.source.type === "well-known" || ownsSkill ? "official" : "community";
      let outcome = await ctx.db.query("outcomes").withIndex("by_source_slug", (index) => index.eq("sourceId", sourceId).eq("slug", document.slug)).unique();
      let outcomeId;
      if (outcome) {
        outcomeId = outcome._id;
        await ctx.db.patch(outcomeId, { status: "published", publicationKind, updatedAt: now });
      } else {
        outcomeId = await ctx.db.insert("outcomes", { sourceId, slug: document.slug, status: "published", publicationKind, createdAt: now, updatedAt: now });
      }
      let snapshot = await ctx.db.query("outcomeSnapshots").withIndex("by_outcome_hash", (index) => index.eq("outcomeId", outcomeId).eq("contentHash", document.contentHash)).unique();
      if (!snapshot) {
        const preview = resolvePreview(document.manifest.preview, document.manifestUrl);
        const media = primaryMedia(preview);
        const snapshotId = await ctx.db.insert("outcomeSnapshots", {
          outcomeId,
          sourceRevision: discovery.source.revision,
          contentHash: document.contentHash,
          manifest: document.manifest,
          aboutMarkdown: document.aboutMarkdown,
          prompt: document.prompt,
          title: document.title,
          summary: document.summary,
          requirements: document.manifest.requirements,
          models: document.manifest.models,
          products: attributions.products,
          skills: attributions.skills,
          ...(attributions.primary ? { primary: attributions.primary } : {}),
          secondary: attributions.secondary,
          ...(preview ? { preview } : {}),
          inputs: resolveFiles(document.manifest.inputs, document.manifestUrl),
          artifacts: resolveFiles(document.manifest.artifacts, document.manifestUrl),
          ...media,
          manifestUrl: document.manifestUrl,
          aboutUrl: document.aboutUrl,
          promptUrl: document.promptUrl,
          createdAt: now,
        });
        snapshot = await ctx.db.get(snapshotId);
      }
      if (!snapshot) throw new Error("Outcome snapshot could not be stored");
      await ctx.db.patch(outcomeId, { currentSnapshotId: snapshot._id, status: "published", publicationKind, updatedAt: now });
      published.push({ id: outcomeId, slug: document.slug, title: document.title, publicationKind });
    }
    const existing = await ctx.db.query("outcomes").withIndex("by_source_slug", (index) => index.eq("sourceId", sourceId)).collect();
    for (const outcome of existing) if (!activeSlugs.has(outcome.slug) && outcome.status !== "hidden") await ctx.db.patch(outcome._id, { status: "hidden", updatedAt: now });
    return { source: { ...discovery.source, publisherName: discovery.publisherName }, outcomes: published };
  },
});

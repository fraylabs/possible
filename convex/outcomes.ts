import { query } from "./_generated/server";
import { v } from "convex/values";

function executionModel(models: Array<Record<string, unknown>>) {
  return models.find((model) => model.role === "execution") ?? {};
}

function author(manifest: Record<string, unknown>) {
  const value = manifest.author;
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("outcomes").withIndex("by_status", (index) => index.eq("status", "published")).collect();
    const entries = await Promise.all(records.map(async (outcome) => {
      if (!outcome.currentSnapshotId) return null;
      const [source, snapshot, uses, likes] = await Promise.all([
        ctx.db.get(outcome.sourceId),
        ctx.db.get(outcome.currentSnapshotId),
        ctx.db.query("outcomeUses").withIndex("by_outcome", (index) => index.eq("outcomeId", outcome._id)).collect(),
        ctx.db.query("outcomeLikes").withIndex("by_outcome", (index) => index.eq("outcomeId", outcome._id)).collect(),
      ]);
      if (!source || !snapshot || snapshot.outcomeId !== outcome._id) return null;
      const model = executionModel(snapshot.models as Array<Record<string, unknown>>);
      const outcomeAuthor = author(snapshot.manifest as Record<string, unknown>);
      return {
        id: outcome._id,
        slug: outcome.slug,
        title: snapshot.title,
        summary: snapshot.summary,
        about_markdown: snapshot.aboutMarkdown,
        prompt: snapshot.prompt,
        recipe: snapshot.manifest.recipe ?? null,
        requirements: snapshot.requirements,
        models: snapshot.models,
        products: snapshot.products,
        skills: snapshot.skills,
        primary_attribution: snapshot.primary ?? null,
        secondary_attributions: snapshot.secondary,
        inputs: snapshot.inputs,
        artifacts: snapshot.artifacts,
        preview: snapshot.preview ?? null,
        author_name: typeof outcomeAuthor.name === "string" ? outcomeAuthor.name : null,
        author_url: typeof outcomeAuthor.url === "string" ? outcomeAuthor.url : null,
        published_at: new Date(snapshot.createdAt).toISOString(),
        publication_kind: outcome.publicationKind,
        source_type: source.sourceType,
        source_locator: source.locator,
        source_url: source.installUrl,
        source_revision: snapshot.sourceRevision,
        manifest_url: snapshot.manifestUrl,
        result_media_url: snapshot.resultMediaUrl ?? null,
        poster_url: snapshot.posterUrl ?? null,
        provider: typeof model.provider === "string" ? model.provider : null,
        model: typeof model.model === "string" ? model.model : null,
        agent: typeof model.agent === "string" ? model.agent : null,
        use_count: uses.length,
        like_count: likes.length,
      };
    }));
    return entries.filter((entry) => entry !== null).sort((left, right) => {
      return right.use_count - left.use_count
        || right.like_count - left.like_count
        || right.published_at.localeCompare(left.published_at)
        || left.title.localeCompare(right.title);
    });
  },
});

export const getPublic = query({
  args: { id: v.id("outcomes") },
  handler: async (ctx, { id }) => {
    const outcome = await ctx.db.get(id);
    if (!outcome || outcome.status !== "published" || !outcome.currentSnapshotId) return null;
    const [source, snapshot, uses, likes] = await Promise.all([
      ctx.db.get(outcome.sourceId),
      ctx.db.get(outcome.currentSnapshotId),
      ctx.db.query("outcomeUses").withIndex("by_outcome", (index) => index.eq("outcomeId", id)).collect(),
      ctx.db.query("outcomeLikes").withIndex("by_outcome", (index) => index.eq("outcomeId", id)).collect(),
    ]);
    if (!source || !snapshot || snapshot.outcomeId !== id) return null;
    const model = executionModel(snapshot.models as Array<Record<string, unknown>>);
    const outcomeAuthor = author(snapshot.manifest as Record<string, unknown>);
    return {
      id: outcome._id,
      slug: outcome.slug,
      title: snapshot.title,
      summary: snapshot.summary,
      about_markdown: snapshot.aboutMarkdown,
      prompt: snapshot.prompt,
      recipe: snapshot.manifest.recipe ?? null,
      requirements: snapshot.requirements,
      models: snapshot.models,
      products: snapshot.products,
      skills: snapshot.skills,
      primary_attribution: snapshot.primary ?? null,
      secondary_attributions: snapshot.secondary,
      inputs: snapshot.inputs,
      artifacts: snapshot.artifacts,
      preview: snapshot.preview ?? null,
      author_name: typeof outcomeAuthor.name === "string" ? outcomeAuthor.name : null,
      author_url: typeof outcomeAuthor.url === "string" ? outcomeAuthor.url : null,
      published_at: new Date(snapshot.createdAt).toISOString(),
      publication_kind: outcome.publicationKind,
      source_type: source.sourceType,
      source_locator: source.locator,
      source_url: source.installUrl,
      source_revision: snapshot.sourceRevision,
      manifest_url: snapshot.manifestUrl,
      result_media_url: snapshot.resultMediaUrl ?? null,
      poster_url: snapshot.posterUrl ?? null,
      provider: typeof model.provider === "string" ? model.provider : null,
      model: typeof model.model === "string" ? model.model : null,
      agent: typeof model.agent === "string" ? model.agent : null,
      use_count: uses.length,
      like_count: likes.length,
    };
  },
});

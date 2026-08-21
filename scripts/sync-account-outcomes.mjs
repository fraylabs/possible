import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { readOutcomeFolders } from "./lib/outcome-folders.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const account = {
  handle: "fray-labs",
  name: "Fray Labs",
  websiteUrl: "https://github.com/fraylabs",
};

async function readJsonRecords(directory) {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  return Promise.all(names.map(async (name) => JSON.parse(await readFile(join(directory, name), "utf8"))));
}

function skillName(directory) {
  return basename(directory).split("-").map((part) => {
    const upper = new Set(["cad", "css", "html", "pptx", "ui", "ux"]);
    return upper.has(part) ? part.toUpperCase() : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`;
  }).join(" ");
}

function mediaRecords(preview) {
  const records = [];
  for (const [position, image] of (preview?.images ?? []).entries()) {
    records.push({ kind: "image", position, mediaUrl: image.src, alt: image.alt, caption: image.caption ?? null, isCover: image.cover ?? false, posterUrl: null, format: null });
  }
  for (const kind of ["video", "audio"]) {
    const media = preview?.[kind];
    if (media) records.push({ kind, position: 0, mediaUrl: media.src, posterUrl: media.poster ?? null, alt: null, caption: media.caption ?? null, isCover: false, format: null });
  }
  const cad = preview?.cad;
  let cadPosition = 0;
  if (cad?.preview) {
    records.push({ kind: "cad", position: cadPosition++, mediaUrl: cad.preview, posterUrl: cad.poster ?? null, alt: null, caption: cad.caption ?? null, isCover: false, format: "glb" });
  }
  for (const download of cad?.downloads ?? []) {
    records.push({ kind: "cad", position: cadPosition++, mediaUrl: download.src, posterUrl: cad.poster ?? null, alt: download.label ?? null, caption: cad.caption ?? null, isCover: false, format: download.format });
  }
  return records;
}

function primaryMedia(preview) {
  if (preview?.video) return { resultMediaUrl: preview.video.src, posterUrl: preview.video.poster ?? null };
  const image = preview?.images?.find(({ cover }) => cover) ?? preview?.images?.[0];
  if (image) return { resultMediaUrl: image.src, posterUrl: null };
  if (preview?.audio) return { resultMediaUrl: preview.audio.src, posterUrl: preview.audio.poster ?? null };
  const cad = preview?.cad;
  return { resultMediaUrl: cad?.preview ?? cad?.downloads?.[0]?.src ?? cad?.poster ?? null, posterUrl: cad?.poster ?? null };
}

async function buildPayload() {
  const companies = await readJsonRecords(join(repositoryRoot, "packages/catalog/src/companies"));
  const products = await readJsonRecords(join(repositoryRoot, "packages/catalog/src/products"));
  const entries = await readOutcomeFolders(repositoryRoot);
  const outcomes = entries.map(({ slug, outcome }) => {
    const primary = primaryMedia(outcome.preview);
    if (!primary.resultMediaUrl) throw new Error(`${slug} requires primary preview media before account sync`);
    return {
      slug,
      title: outcome.title,
      summary: outcome.summary,
      originalPrompt: outcome.originalPrompt ?? null,
      executionPrompt: outcome.executionPrompt,
      provider: outcome.execution.provider,
      agent: outcome.execution.agent ?? null,
      model: outcome.execution.model,
      executionTimestamp: outcome.execution.timestamp ?? null,
      authorName: outcome.author.name,
      authorUrl: outcome.author.url,
      sourceType: outcome.source?.type ?? "community",
      sourceUrl: outcome.source?.url ?? `https://github.com/fraylabs/possible/tree/main/packages/catalog/src/outcomes/${slug}`,
      sourcePublishedAt: outcome.source?.publishedAt ?? null,
      previewDescription: outcome.preview?.description ?? null,
      resultMediaUrl: primary.resultMediaUrl,
      posterUrl: primary.posterUrl,
      products: outcome.products ?? [],
      skills: (outcome.skills ?? []).map((skill) => ({ ...skill, name: skillName(skill.directory) })),
      media: mediaRecords(outcome.preview),
    };
  });
  return { schemaVersion: 1, account, companies, products, outcomes };
}

function syncSql(payload) {
  const json = JSON.stringify(payload);
  if (json.includes("$possible_payload$")) throw new Error("Sync payload contains the SQL delimiter");
  return `begin;
do $sync$
declare
  payload jsonb := $possible_payload$${json}$possible_payload$::jsonb;
  admin_id uuid;
  admin_count integer;
  target_account_id uuid;
  company_item jsonb;
  product_item jsonb;
  outcome_item jsonb;
  product_ref jsonb;
  skill_ref jsonb;
  media_ref jsonb;
  target_company_id uuid;
  target_product_id uuid;
  target_outcome_id uuid;
  target_skill_id uuid;
  existing_source_key text;
begin
  select count(*), (array_agg(user_id))[1] into admin_count, admin_id from public.platform_admins;
  if admin_count <> 1 then raise exception 'Expected exactly one Possible platform administrator, found %', admin_count; end if;

  select id into target_account_id from public.accounts where handle = payload #>> '{account,handle}';
  if target_account_id is null then
    insert into public.accounts (handle, name, website_url)
    values (payload #>> '{account,handle}', payload #>> '{account,name}', payload #>> '{account,websiteUrl}')
    returning id into target_account_id;
  else
    update public.accounts set
      name = payload #>> '{account,name}',
      website_url = payload #>> '{account,websiteUrl}'
    where id = target_account_id;
  end if;
  insert into public.account_members (account_id, user_id, role)
  values (target_account_id, admin_id, 'owner')
  on conflict (account_id, user_id) do update set role = 'owner';

  for company_item in select value from jsonb_array_elements(payload -> 'companies') loop
    select id into target_company_id from public.companies where slug = company_item ->> 'id';
    if target_company_id is null then
      insert into public.companies (slug, name, website_url)
      values (company_item ->> 'id', company_item ->> 'name', company_item ->> 'website')
      returning id into target_company_id;
    else
      update public.companies set name = company_item ->> 'name', website_url = company_item ->> 'website'
      where id = target_company_id;
    end if;
    insert into public.company_members (company_id, user_id, role)
    values (target_company_id, admin_id, 'owner')
    on conflict (company_id, user_id) do update set role = 'owner';
  end loop;

  for product_item in select value from jsonb_array_elements(payload -> 'products') loop
    select id into target_company_id from public.companies where slug = product_item ->> 'company';
    if target_company_id is null then raise exception 'Product company % is missing', product_item ->> 'company'; end if;
    insert into public.products (
      company_id, slug, name, official_description, logo_url, website_url, documentation_url
    ) values (
      target_company_id,
      split_part(product_item ->> 'id', '/', 2),
      product_item ->> 'name',
      product_item ->> 'summary',
      product_item ->> 'logoUrl',
      product_item ->> 'website',
      product_item ->> 'docsUrl'
    ) on conflict (company_id, slug) do update set
      name = excluded.name,
      official_description = excluded.official_description,
      logo_url = excluded.logo_url,
      website_url = excluded.website_url,
      documentation_url = excluded.documentation_url;
  end loop;

  update public.outcomes set account_id = target_account_id where account_id is null;

  for outcome_item in select value from jsonb_array_elements(payload -> 'outcomes') loop
    select id, source_key into target_outcome_id, existing_source_key
    from public.outcomes
    where account_id = target_account_id and slug = outcome_item ->> 'slug';
    if target_outcome_id is not null and existing_source_key <> 'possible-bundled:' || (outcome_item ->> 'slug') then
      raise exception 'Outcome slug % already belongs to another source', outcome_item ->> 'slug';
    end if;

    insert into public.outcomes (
      account_id, slug, source_key, source_url, source_type, title, summary, original_prompt, prompt,
      preview_description, result_media_url, poster_url, provider, agent, model, execution_timestamp,
      author_name, author_url, source_published_at, source_updated_at, status, origin_type, attribution_type
    ) values (
      target_account_id,
      outcome_item ->> 'slug',
      'possible-bundled:' || (outcome_item ->> 'slug'),
      outcome_item ->> 'sourceUrl',
      outcome_item ->> 'sourceType',
      outcome_item ->> 'title',
      outcome_item ->> 'summary',
      nullif(outcome_item ->> 'originalPrompt', ''),
      outcome_item ->> 'executionPrompt',
      nullif(outcome_item ->> 'previewDescription', ''),
      outcome_item ->> 'resultMediaUrl',
      nullif(outcome_item ->> 'posterUrl', ''),
      outcome_item ->> 'provider',
      nullif(outcome_item ->> 'agent', ''),
      outcome_item ->> 'model',
      nullif(outcome_item ->> 'executionTimestamp', '')::timestamptz,
      outcome_item ->> 'authorName',
      outcome_item ->> 'authorUrl',
      nullif(outcome_item ->> 'sourcePublishedAt', '')::date,
      now(),
      'published',
      'account',
      'account'
    ) on conflict (account_id, slug) where slug is not null do update set
      source_url = excluded.source_url,
      source_type = excluded.source_type,
      title = excluded.title,
      summary = excluded.summary,
      original_prompt = excluded.original_prompt,
      prompt = excluded.prompt,
      preview_description = excluded.preview_description,
      result_media_url = excluded.result_media_url,
      poster_url = excluded.poster_url,
      provider = excluded.provider,
      agent = excluded.agent,
      model = excluded.model,
      execution_timestamp = excluded.execution_timestamp,
      author_name = excluded.author_name,
      author_url = excluded.author_url,
      source_published_at = excluded.source_published_at,
      source_updated_at = excluded.source_updated_at,
      status = excluded.status,
      origin_type = excluded.origin_type,
      attribution_type = excluded.attribution_type
    returning id into target_outcome_id;

    delete from public.outcome_products where outcome_id = target_outcome_id;
    for product_ref in select value from jsonb_array_elements(outcome_item -> 'products') loop
      select products.id into target_product_id
      from public.products
      join public.companies on companies.id = products.company_id
      where companies.slug = split_part(product_ref #>> '{}', '/', 1)
        and products.slug = split_part(product_ref #>> '{}', '/', 2);
      if target_product_id is null then raise exception 'Outcome Product % is missing', product_ref #>> '{}'; end if;
      insert into public.outcome_products (outcome_id, product_id) values (target_outcome_id, target_product_id);
      update public.products set status = 'published' where id = target_product_id and status <> 'disabled';
    end loop;

    delete from public.outcome_skills where outcome_id = target_outcome_id;
    for skill_ref in select value from jsonb_array_elements(outcome_item -> 'skills') loop
      insert into public.skills (repository, directory, name)
      values (skill_ref ->> 'repository', skill_ref ->> 'directory', skill_ref ->> 'name')
      on conflict (repository, directory) do update set name = excluded.name
      returning id into target_skill_id;
      insert into public.outcome_skills (outcome_id, skill_id, last_reviewed_commit)
      values (target_outcome_id, target_skill_id, skill_ref ->> 'lastReviewedCommit');
    end loop;

    delete from public.outcome_media where outcome_id = target_outcome_id;
    for media_ref in select value from jsonb_array_elements(outcome_item -> 'media') loop
      insert into public.outcome_media (
        outcome_id, kind, position, media_url, poster_url, alt, caption, format, is_cover
      ) values (
        target_outcome_id,
        media_ref ->> 'kind',
        (media_ref ->> 'position')::smallint,
        media_ref ->> 'mediaUrl',
        nullif(media_ref ->> 'posterUrl', ''),
        nullif(media_ref ->> 'alt', ''),
        nullif(media_ref ->> 'caption', ''),
        nullif(media_ref ->> 'format', ''),
        coalesce((media_ref ->> 'isCover')::boolean, false)
      );
    end loop;
  end loop;
end;
$sync$;
commit;
select jsonb_build_object(
  'account', '${account.handle}',
  'ownedOutcomes', (
    select count(*) from public.outcomes
    join public.accounts on accounts.id = outcomes.account_id
    where accounts.handle = '${account.handle}' and outcomes.attribution_type = 'account'
  ),
  'sourceAttributedOutcomes', (
    select count(*) from public.outcomes
    join public.accounts on accounts.id = outcomes.account_id
    where accounts.handle = '${account.handle}' and outcomes.attribution_type = 'source'
  ),
  'linkedProducts', (
    select count(*) from public.account_product_directory where account_handle = '${account.handle}'
  ),
  'linkedSkills', (
    select count(*) from public.account_skill_directory where account_handle = '${account.handle}'
  )
) as sync_receipt;
`;
}

async function run() {
  const payload = await buildPayload();
  const directory = await mkdtemp(join(tmpdir(), "possible-account-sync-"));
  const sqlPath = join(directory, "sync.sql");
  try {
    await writeFile(sqlPath, syncSql(payload), { mode: 0o600 });
    const result = spawnSync("supabase", ["db", "query", "--linked", "--file", sqlPath], {
      cwd: repositoryRoot,
      env: process.env,
      encoding: "utf8",
    });
    if (result.error) throw result.error;
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

await run();

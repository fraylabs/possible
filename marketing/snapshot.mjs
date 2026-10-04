#!/usr/bin/env node
// Posting-experiment snapshot: public Convex counts plus GitHub release/traffic data via `gh`.
// Usage: node marketing/snapshot.mjs [--json]
import { execFileSync } from 'node:child_process';

const convex = 'https://reminiscent-lark-333.convex.cloud/api/query';
const gh = path => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8' }));

const response = await fetch(convex, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ path: 'outcomes:listPublic', args: {}, format: 'json' }),
});
const { value: outcomes } = await response.json();
const releases = gh('repos/fraylabs/possible/releases');
const snapshot = {
  at: new Date().toISOString(),
  outcomes: outcomes.map(o => ({ slug: o.slug ?? o.manifest_url?.split('/outcomes/')[1]?.split('/')[0], uses: o.use_count, likes: o.like_count })),
  totals: {
    outcomes: outcomes.length,
    uses: outcomes.reduce((n, o) => n + o.use_count, 0),
    likes: outcomes.reduce((n, o) => n + o.like_count, 0),
  },
  npmLastWeek: (await (await fetch('https://api.npmjs.org/downloads/point/last-week/@fraylabs/possible')).json()).downloads,
  downloads: Object.fromEntries(releases.map(r => [r.tag_name, Object.fromEntries(r.assets.map(a => [a.name, a.download_count]))])),
  github: Object.fromEntries(['possible', 'possible-outcomes'].map(repo => {
    const info = gh(`repos/fraylabs/${repo}`);
    const views = gh(`repos/fraylabs/${repo}/traffic/views`);
    const clones = gh(`repos/fraylabs/${repo}/traffic/clones`);
    return [repo, { stars: info.stargazers_count, views14d: views.count, viewUniques14d: views.uniques,
      clones14d: clones.count, cloneUniques14d: clones.uniques, referrers14d: gh(`repos/fraylabs/${repo}/traffic/popular/referrers`) }];
  })),
};
if (process.argv.includes('--json')) console.log(JSON.stringify(snapshot, null, 2));
else {
  console.log(`${snapshot.at}  outcomes=${snapshot.totals.outcomes} uses=${snapshot.totals.uses} likes=${snapshot.totals.likes} npmLastWeek=${snapshot.npmLastWeek}`);
  for (const o of snapshot.outcomes.filter(o => o.uses || o.likes)) console.log(`  ${o.slug}: uses=${o.uses} likes=${o.likes}`);
  for (const [tag, assets] of Object.entries(snapshot.downloads)) console.log(`  ${tag}: ${Object.entries(assets).map(([n, d]) => `${n}=${d}`).join(' ')}`);
  for (const [repo, g] of Object.entries(snapshot.github)) console.log(`  ${repo}: stars=${g.stars} views14d=${g.views14d}/${g.viewUniques14d}u clones14d=${g.clones14d}/${g.cloneUniques14d}u referrers=${g.referrers14d.map(r => `${r.referrer}:${r.count}`).join(',') || 'none'}`);
}

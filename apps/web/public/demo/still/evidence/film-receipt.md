# Launch film receipt

Status: **passed locally** on 2026-07-18 (Asia/Singapore).

## Provenance

- Skill: `remotion-best-practices` from `remotion-dev/skills`.
- The required creation, React markup, video-layout, and rendering references were read before authoring.
- Upstream drift note: the Remotion upstream drifted from the reviewed revision only in auxiliary video-editing reference files; the main `SKILL.md` is unchanged.

## Claim boundary

- Every product statement is taken from `../outcome-brief.md`.
- The product, device rendering, interface, and film are fictional evaluation artifacts.
- The approximate 72 × 72 × 18 mm dimensions are labeled as a design target, not a validated physical specification.
- The companion interface is a concept rendering. No production app is claimed.
- No demand, battery, manufacturing, certification, physical-validation, or readiness claims are made.
- No external media, publishing, deployment, analytics, data collection, or backend is used.

## Verification

Executed verifier commands:

```bash
npm run typecheck
npm run compositions
npm run still
npm run still:interaction
npm run render
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -show_entries format=size,duration -of default=noprint_wrappers=1 out/still-launch.mp4
ffmpeg -y -hide_banner -loglevel error -i out/still-launch.mp4 -vf "fps=1/4,scale=480:-1,tile=3x2" -frames:v 1 out/still-launch-contact-sheet.png
shasum -a 256 out/still-launch.mp4 out/still-launch-preview.png out/still-launch-interaction.png out/still-launch-contact-sheet.png
```

## Checks

- Passed: `npm run typecheck` completed with no TypeScript errors.
- Passed: `npm run compositions` discovered `StillLaunch` at 1920 × 1080, 30 fps, 720 frames / 24.00 seconds.
- Passed: `npm run still` rendered `out/still-launch-preview.png` at frame 174.
- Passed: `npm run still:interaction` rendered `out/still-launch-interaction.png` at frame 348.
- Passed: `npm run render` rendered `out/still-launch.mp4` locally.
- Passed: `ffprobe` reported H.264, 1920 × 1080, 30 fps, 24.000-second video duration; the MP4 container duration is 24.043 seconds.
- Passed: six-frame contact-sheet review found a coherent sequence, readable primary text, one dominant focal point per scene, and no visible overlap or clipping.
- Failed: none.
- Skipped: audio review; the film is intentionally silent.
- Skipped: external-media provenance review; no external media exists.
- Skipped: browser/Studio interaction review; local deterministic renders are the acceptance artifact.
- Unproven: physical dimensions, hardware performance, battery life, manufacturing readiness, and production-app behavior.

## Artifact receipt

| Artifact | Size | SHA-256 |
| --- | ---: | --- |
| `out/still-launch.mp4` | 19,372,593 bytes | `5da0102cd1daabd74680938432696aaa45d85ac17ec5f73fbc1ce3f2492b4ce1` |
| `out/still-launch-preview.png` | 316,467 bytes | `1539bcc51bedda99c3e0939f6e9990b53388bde9af6638144bac23b8f3888a35` |
| `out/still-launch-interaction.png` | 314,412 bytes | `5259c1aee1dabd7141b77d2904018f5fcbdc7b58b6dd7a430d338ace67be5dc1` |
| `out/still-launch-contact-sheet.png` | 269,764 bytes | `ca18eae648e0c63cb7144976a87f0910735be26ba109f28a796ffa0a1e6eb93a` |

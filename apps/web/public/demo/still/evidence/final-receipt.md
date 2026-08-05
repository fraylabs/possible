# Still Hardware Launch — fresh verification receipt

Status: **passed after one material integration repair, with disclosed limitations** on 2026-07-18 (Asia/Singapore).

This was an independent review of the integrated `outcome-room/` plus the raw `site/`, `film/`, and `hardware/` artifacts. The reviewer did not implement or repair product code.

## Material failure found and repaired

The first real-browser run failed: the embedded launch site requested its compiled JavaScript and CSS from root-relative `/assets/...` URLs, while the integrated files lived below `/assets/site/assets/...`. Both assets returned 404, the iframe did not render, and the integrated waitlist could not be exercised. The failed result is preserved at `../../verification/browser-results-initial-failure.json`.

The captain repaired the site build by adding Vite `base: "./"`, rebuilt it, and recopied `site/dist/` into the outcome room. The fresh post-repair rerun passed at desktop and mobile.

## Passed

- Post-repair browser run: desktop 1440 × 1000 and mobile 390 × 844 rendered without horizontal overflow.
- Outcome navigation targets, embedded site, desktop/mobile preview resizing, all four CAD view switches, captions, selection state, and local artifact links loaded as expected.
- Final browser trace: 50 requests and 50 responses, zero console errors, zero page errors, zero non-OK responses, and zero material request failures.
- Integrated iframe waitlist: invalid address produced the local validation message; valid address produced the explicit demo confirmation and cleared the input.
- Network-write proof: both invalid and valid integrated submissions created **zero requests** after the baseline. The same paths also passed in the raw site build.
- Persistence proof: after submission, `localStorage`, `sessionStorage`, and cookies were empty.
- Artifact audit: **58 checks passed** covering required non-empty files, JSON shape, raw-to-integrated SHA-256 equality, cross-medium facts, film facts, and silent-audio verification.
- Film: ffprobe reported H.264, 1920 × 1080, 30 fps, 24.000-second video duration, 24.043-second container duration, and 19,372,593 bytes. The AAC carrier is digital silence (`max_volume: -91.0 dB`).
- CAD: integrated STEP, native GLB, STL, Python source, and four 1800 × 1200 review views are non-empty and hash-identical to the raw workstream outputs. STEP remains the primary artifact.
- Cross-artifact facts agree: Still is fictional; the launch promise, turn/press/glance interaction, companion local-history scope, and 72 × 72 × 18 mm design-target language are consistent across site, film source/frames, hardware report, and outcome room.
- Unsupported claims are caveated in the user-facing artifacts and evidence rather than presented as proven facts.
- Raw launch-site unit test passed: 1 test file / 1 test, including invalid input, successful clearing, confirmation copy, and zero `fetch` calls.

Screenshots are preserved under `screenshots/`, including full desktop/mobile outcome rooms, the embedded site, successful integrated waitlist, raw-site waitlist, and CAD section.

## Failed

- **Initial integrated-site run:** failed with two compiled-asset 404s as described above. Repaired by the captain; the fresh rerun passed.
- **CAD Viewer live handoff:** remains failed from the hardware workstream because the installed viewer package lacks its documented `agent:start` script. This receipt independently confirms the failure is disclosed in the room; it does not retry or repair the external skill package.

No failures remain in the repaired browser path or the 58-check artifact audit.

## Skipped or limited

- Headless Chromium under the documented Python static server did not expose video metadata or advance playback; eight duplicate/preload media requests ended with `net::ERR_ABORTED`. There were no HTTP errors, and the MP4, posters, and contact sheet loaded as local artifacts. Exact stream, duration, size, and silence checks passed independently with ffprobe/ffmpeg. Browser playback itself is therefore not claimed by this receipt.
- Audio listening review was skipped because the film is intentionally silent; silence was measured instead.
- Deployment, publishing, email, analytics, backend writes, purchasing, fabrication, and real-data collection were skipped by explicit constraint.
- Live CAD Viewer review was unavailable because of the disclosed launcher failure; static STEP inspection, GLB/STL files, measured facts, and the four-view packet remain reviewable.

## Unproven claims

The outcome does not prove physical fit, internal electronics, antenna behavior, battery life, thermal behavior, tolerances, drop resistance, ergonomics, USB-C connector fit, manufacturability, safety, certification, customer demand, production readiness, or production companion-app behavior. No fabrication, DFM, FEA, thermal, tolerance, compliance, customer, or physical testing was performed.

## Exact verifier commands

```bash
python .agents/skills/webapp-testing/scripts/with_server.py --help

verification/.venv/bin/python .agents/skills/webapp-testing/scripts/with_server.py \
  --server "python -m http.server 4177 --directory outcome-room" --port 4177 \
  --server "python -m http.server 4178 --directory site/dist" --port 4178 \
  -- verification/.venv/bin/python verification/browser_verify.py

verification/.venv/bin/python verification/artifact_audit.py

ffprobe -v error \
  -show_entries stream=codec_name,width,height,r_frame_rate,duration \
  -show_entries format=size,duration,format_name \
  -of json outcome-room/assets/film/still-launch.mp4

ffmpeg -hide_banner \
  -i outcome-room/assets/film/still-launch.mp4 \
  -map 0:a:0 -af volumedetect -f null -

file \
  outcome-room/assets/film/still-launch.mp4 \
  outcome-room/assets/hardware/still.step \
  outcome-room/assets/hardware/still.glb \
  outcome-room/assets/hardware/still.stl \
  outcome-room/assets/hardware/*.png

shasum -a 256 \
  outcome-room/assets/film/still-launch.mp4 \
  outcome-room/assets/hardware/still.step \
  outcome-room/assets/hardware/still.glb \
  outcome-room/assets/hardware/still.stl

(cd site && npm test -- --run)
```

## Evidence files

- `../../verification/browser-results-initial-failure.json` — preserved first-run 404 failure.
- `../../verification/browser-results.json` — final post-repair browser trace and interaction facts.
- `../../verification/artifact-results.json` — 58-check artifact, hash, JSON, film, and consistency audit.
- `screenshots/` — post-repair visual evidence.

At audit time, `manifest.json` and `run-events.json` still marked the fresh review as pending. The captain must update those two integration records after accepting this receipt; this reviewer intentionally did not edit integration metadata.

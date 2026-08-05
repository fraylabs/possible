# Still Hardware Launch — outcome receipt

Status: **complete locally after one integration repair, with explicit limitations**.

Possible's Hardware Launch pack turned the confirmed Still brief into one local launch room. Nothing was deployed, published, emailed, purchased, fabricated, or connected to real customer data.

## Created artifacts

- Launch site: `site/` with production build in `site/dist/`.
- Waitlist contract: `site/WAITLIST-CONTRACT.md`.
- Launch film: `film/out/still-launch.mp4`, two review stills, and a six-frame contact sheet.
- Prototype CAD: `hardware/still.step`, parametric `hardware/still.py`, STL/native GLB review exports, four-view snapshot packet, and measured geometry report.
- Integrated room: `outcome-room/index.html` with copied, hash-checked site, film, and hardware outputs.
- Replay data: `outcome-room/manifest.json` and `outcome-room/run-events.json`.
- Independent evidence: `outcome-room/evidence/final-receipt.md`, browser trace, artifact audit, and six screenshots.

Open the result locally:

```bash
python -m http.server 4177 --directory outcome-room
```

Then visit `http://127.0.0.1:4177/`.

## Verification run

```bash
(cd site && npm test && npm run build)
(cd film && npm run typecheck && npm run compositions)

hardware/.venv/bin/python .agents/skills/cad/scripts/inspect refs \
  hardware/still.step --facts --planes --positioning --format text

verification/.venv/bin/python .agents/skills/webapp-testing/scripts/with_server.py \
  --server "python -m http.server 4177 --directory outcome-room" --port 4177 \
  --server "python -m http.server 4178 --directory site/dist" --port 4178 \
  -- verification/.venv/bin/python verification/browser_verify.py

verification/.venv/bin/python verification/artifact_audit.py
```

## Passed

- Site test: 1/1, including invalid input, successful clearing, confirmation copy, and zero `fetch` calls.
- Site production build: passed after switching the Vite base to a portable relative path.
- Film: 720 frames, 24 seconds, 1920 × 1080, 30 fps, H.264; rendered locally and visually reviewed.
- CAD: labeled STEP assembly, 72 × 72 × 18 mm concept body, 72 × 72 × 23 mm full dial-inclusive envelope, flush base/faceplate delta, measured display placement, STL/native GLB exports, and four reviewed snapshots.
- Fresh browser review: desktop and mobile outcome room, embedded site, preview resizing, CAD switching, integrated and raw waitlist paths, and no horizontal overflow.
- Final browser trace: 50 responses; zero console errors, page errors, non-OK responses, or material request failures.
- Waitlist submission: zero new requests, storage keys, or cookies for both invalid and valid paths.
- Artifact audit: 58/58, including required files, raw-to-integrated SHA-256 equality, JSON shape, film facts/silence, and cross-medium product facts.

## Failed and repaired

- The first independent browser run exposed root-relative site asset URLs inside the outcome room. JavaScript and CSS returned 404, so the embedded site did not render. The captain added Vite `base: "./"`, rebuilt, recopied, and reran verification successfully. The failed trace is preserved at `verification/browser-results-initial-failure.json`.

## Remaining failure

- The documented CAD Viewer live handoff could not start because the installed viewer package lacks its documented `agent:start` npm script. No viewer URL is claimed. STEP inspection, native GLB/STL, measured geometry, and snapshots remain available.

## Skipped or limited

- Deployment, publishing, email, analytics, backend writes, purchasing, fabrication, and real-data collection were skipped by constraint.
- Browser video playback is not claimed from the headless static-server check because its media preloads aborted; ffprobe/ffmpeg facts, rendered stills, contact sheet, and MP4 integrity passed.
- Audio listening was skipped because the film is intentionally silent; digital silence was measured.

## Unproven

Physical fit, internal electronics, antenna behavior, battery life, thermal behavior, tolerances, drop resistance, ergonomics, USB-C connector fit, manufacturability, safety, certification, customer demand, production readiness, and production companion-app behavior remain unproven.

## Skill provenance

The run used the five installed skills locked in `skills-lock.json`: `frontend-design`, `vercel-react-best-practices`, `remotion-best-practices`, `cad`, and `webapp-testing`. The Remotion upstream drifted from the reviewed revision only in auxiliary video-editing reference files; its main `SKILL.md` was unchanged. Installed local skill files were treated as runtime source of truth.

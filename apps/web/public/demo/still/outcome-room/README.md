# Still outcome room

This is the integrated, local-only result of the recorded Possible Hardware Launch run. Raw workstream source and evidence remain in `../site/`, `../film/`, and `../hardware/`; this directory copies the reviewable outputs into one portable room without replacing those originals.

## Open locally

From the repository root:

```bash
python -m http.server 4177 --directory outcome-room
```

Then open `http://127.0.0.1:4177/`.

The launch site is embedded from its production build. The film and CAD downloads are local assets. No interaction in the outcome room sends data or performs an external write.

## Replay data

- `manifest.json` lists the promised outputs, skills, known failure, and unproven claims.
- `run-events.json` is a compact event sequence for a later deterministic Possible demo replay.
- `evidence/` contains copied workstream receipts plus the fresh final review when complete.

## Boundary

Still is a fictional concept. This room does not prove physical fit, electronics, battery life, thermal behavior, tolerances, manufacturability, certification, demand, or production readiness. Nothing was deployed, published, purchased, fabricated, emailed, or connected to real data collection.

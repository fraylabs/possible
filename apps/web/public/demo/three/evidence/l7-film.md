# L7 — film render and inspection

Status: **Pass**

Commands:

```sh
npm run film:render
npm run film:verify
```

Final exact-tree intervals: render 2026-07-18T21:00:40.607Z–21:00:53.665Z; verify 2026-07-18T21:00:53.665Z–21:00:55.918Z. Machine receipt: `evidence/runtime/film-verification.json`.

Metadata and integrity:

- **Pass:** `film/out/three-demo.mp4`; H.264 in MP4; 1920 × 1080; 30 fps; 660 frames.
- **Pass:** 22.058667-second container duration, within the 15–30 second target.
- **Pass:** 2,915,965 bytes; SHA-256 `cfe5453a9adda811d950fadbb3913537f8cfb1a2acdd86e49a9d990a61ee7824`.
- **Pass:** complete FFmpeg decode.
- **Pass:** fresh post-sign-off render reproduced the same MP4 hash.
- **Pass:** editable composition SHA-256 `c544a3f60a63aa9266ddc7ba21e5bcdca174cff887690a5219e13875562a51f6`.

Original-detail frame inspection:

| Frame/time | State | Decision |
| --- | --- | --- |
| 75 / 2.50 s | Overload | Pass — central message readable; backlog remains secondary. |
| 305 / 10.17 s | Choose | Pass — 3 commitments, full label, no fourth composer, no clipping. |
| 470 / 15.67 s | Complete | Pass — 2 done / 1 open states remain distinct. |
| 505 / 16.83 s | Product closed | Pass — all 3 checks and canonical closed copy are visible. |
| 600 / 20.00 s | Done | Pass — conclusive message is centered, high contrast, and within safe area. |
| 142 / 4.73 s | Overload → choose | Pass — sparse transition, no collision. |
| 337 / 11.23 s | Choose → complete | Pass — incoming focal copy remains in its slot. |
| 532 / 17.73 s | Complete → done | Pass — intentional green breathing frame with local-only chrome. |

Product/claim comparison:

- **Pass:** current visible product and film share the 3-item boundary, rails, palette, full/open counts, completion/strike-through behavior, local-only chrome, and `Docket closed. Nothing else is owed today.`
- **Pass:** sequence is overload → choose up to 3 → complete → done.
- **Pass:** no demand, availability, performance, security, privacy-certification, compatibility, or production-readiness claim appears.

Evidence-maintenance note: `film/RENDER-RECEIPT.md` preserves product App/test snapshot hashes from before the L5 accessibility/copy repair. Those historical hashes are not used as the final integrated tree identifier. The post-repair reviewer instead compared the final product contract/source and rendered frames directly; the film source/output remained deterministic and the depicted contract passes C17.

- **Failed required checks:** none.
- **Skipped required checks:** none.
- **Unproven:** playback/transcoding on representative devices/services, viewer comprehension, and real-user benefit. The film does not demonstrate reload or 2-step removal; L4 covers those product behaviors. No upload or publication occurred.

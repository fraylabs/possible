# Three demo film — render receipt

Verified locally on 2026-07-19 with Node `v25.2.1`, npm `11.6.2`, and
Remotion `4.0.491`.

## Outcome

The editable Remotion composition renders a short, silent 16:9 product film
with the requested narrative:

1. overload — the backlog is deliberately shown as unfocused background noise;
2. choose — the product adds three illustrative commitments and removes the
   composer at the verified boundary;
3. complete — all three commitments are checked in sequence;
4. done — the verified closed-docket copy becomes the final focal message.

All motion is driven by Remotion frames through `useCurrentFrame()` and
`interpolate()`. The source contains no CSS transitions, CSS animations,
hosted fonts, remote runtime assets, voiceover, music, tracking, analytics, or
network calls.

## Rendered artifact

- File: `out/three-demo.mp4`
- SHA-256: `cfe5453a9adda811d950fadbb3913537f8cfb1a2acdd86e49a9d990a61ee7824`
- Picture: H.264 High, 1920×1080, 16:9, 30 fps, 660 frames,
  `yuvj420p`
- Intended picture duration: 22.000 seconds (`660 / 30`)
- Probed MP4 container duration: 22.058667 seconds; the small difference is
  silent AAC track padding
- File size: 2,915,965 bytes
- Audio: no authored audio; the renderer emitted a stereo AAC silence track.
  `volumedetect` reported mean and maximum volume of `-91.0 dB`.
- SHA-256 of editable composition at render time:
  `c544a3f60a63aa9266ddc7ba21e5bcdca174cff887690a5219e13875562a51f6`

`ffmpeg -v error -i out/three-demo.mp4 -f null -` decoded the complete file
without error.

## Exact commands

Run from `film/`:

```sh
npm install
npm run lint
npm run build
npx remotion still ThreeDemo stills/01-overload.png --frame=75
npx remotion still ThreeDemo stills/02-choose.png --frame=305
npx remotion still ThreeDemo stills/03-complete.png --frame=470
npx remotion still ThreeDemo stills/03b-product-closed.png --frame=505
npx remotion still ThreeDemo stills/04-done.png --frame=600
npx remotion still ThreeDemo stills/05-transition-overload-to-choose.png --frame=142
npx remotion still ThreeDemo stills/06-transition-choose-to-complete.png --frame=337
npx remotion still ThreeDemo stills/07-transition-complete-to-done.png --frame=532
npm run render
ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,nb_frames -show_entries format=duration,size,bit_rate -of json out/three-demo.mp4
ffmpeg -v error -i out/three-demo.mp4 -f null -
npm audit --audit-level=high
```

`npm run render` expands to:

```sh
remotion render ThreeDemo out/three-demo.mp4 --codec=h264 --crf=18
```

## Representative frame inspection

Each listed PNG is 1920×1080 and was inspected at original resolution for
readability, clipping, overlap, contrast, safe areas, and product consistency.

| Frame | Time | State | Inspection | SHA-256 |
| ---: | ---: | --- | --- | --- |
| 75 | 2.50 s | Overload | Passed; one central message, background slips remain secondary, all text clear of edges. | `dcb94880ccf1eeb50862c088a20469a65ad757a9910a626bc76dda3d1e2d365c` |
| 305 | 10.17 s | Three chosen | Passed; full docket, rails, capacity, commitments, and footer are readable without overlap. | `231b8ea7bc7fcb023d5cc56ebee20deb0da76cfa0739b262d69de4e1e036434b` |
| 470 | 15.67 s | Two complete | Passed; checked/unchecked states, strike-throughs, and one-item-open label remain distinct. | `7a9c84a5849b3be14d1878537f39c2c1d16cca15754edc144fd67f73a06ab4d3` |
| 505 | 16.83 s | Product closed | Passed; all checks and `Docket closed. Nothing else is owed today.` are visible and unclipped. | `d21428ca66f208455163ae2a92752c2e55e8ef77cc27e2916c8dba726235f784` |
| 600 | 20.00 s | Conclusive done | Passed; final message and promise have high contrast and generous safe areas. | `82e46177810174a317820dc9407a36194e9f5159137af88ab0d7da683a9d3049` |
| 142 | 4.73 s | Overload → choose | Passed; incoming scene is sparse and no readable elements collide. | `8239981086e694f0f4994fe5fbf817e5a2b389a899d546dd821f960482a26346` |
| 337 | 11.23 s | Choose → complete | Passed; incoming focal copy remains within its layout slot and no competing card copy is exposed. | `dbdfdf950c2418f465b1d1f2e5df0ad6352a0bb329934f63bf0f199d435b2cfa` |
| 532 | 17.73 s | Complete → done | Passed; brief green breathing frame contains only persistent brand/privacy chrome before the final message enters. | `1799ff95742f6bd9492c9db1dd2da0a1f389b70cc8ce8083d3cdb33432656cab` |

## Product-state traceability

The final product source and its completed test receipt were re-read before
rendering. The film reproduces these verified states and exact pieces of copy:

- `Three things. Then you’re done.`
- `Choose up to three commitments that deserve today.` as the behavior behind
  the shorter film headline `Choose up to three.`
- rails `I`, `II`, `III`, composer prompt `What deserves this line?`, and the
  `3 / 3 chosen` boundary
- `Docket full · 3 items open`, followed by the decrementing open-item count
- checkbox completion and strike-through treatment
- `The day ends right here.`
- `Docket closed. Nothing else is owed today.`
- `Local only · this device`

The three task sentences in the film are explicitly illustrative product input,
not customer data, evidence of demand, or a claim that those tasks were
performed.

Source snapshot hashes used for traceability:

- `product/src/App.tsx` —
  `7bd595c3fce9ff2ce5ef5c83c3438c6619990f54070361f60e23ef3e80ac8c54`
- `product/src/model.ts` —
  `10cfad9b15c01f7d4ff081a540db9552d77f9993d8c253c4fc8469ffaefc2fca`
- `product/src/storage.ts` —
  `034f41546161199f9df99ab5a1e50f978d9c23657da73a124eb82d0e9c07554f`
- `product/TEST-RECEIPT.md` —
  `10db108e9ee603a2989aa2a88786c255c437d714945b468dcef7d4d9a0a073c1`

## Verification results and repaired failures

- `npm install` — passed; installed 292 packages. The audit reported two low
  severity issues in the ESLint toolchain.
- `npm run lint` — passed after repair. The first run correctly rejected a
  redundant `from={0}` sequence prop; it was removed and the rerun passed both
  ESLint and TypeScript.
- `npm run build` — passed after repair. The generated scaffold configuration
  still referenced its removed Tailwind plugin; that unused import/config hook
  was removed and the bundle rerun passed.
- Still rendering — passed. Three of the first four concurrent commands raced
  while Remotion downloaded one shared Chrome Headless Shell and failed with a
  missing temporary ZIP. They were rerun sequentially after the browser was
  installed; all eight reviewed stills rendered successfully.
- `npm run render` — passed; all 660 frames rendered and encoded.
- Full-file decode — passed with no FFmpeg errors.
- `npm audit --audit-level=high` — exit 0; no high-severity issue, with the two
  low-severity ESLint-toolchain findings still disclosed rather than force-fixed.
- Static source scan for `http://`, `https://`, `@font-face`, CSS `url()`, CSS
  `transition`, and CSS `animation` — no matches in film runtime source or copy.

## Known limitations and unproven claims

- The film demonstrates selection, the three-item boundary, completion, and the
  conclusive done state. It does not visually demonstrate reload persistence or
  the two-step removal confirmation; those behaviors are covered by the final
  product test receipt, not by this communication artifact.
- System-font rendering can vary slightly by operating system, although the
  fallback stack and layout were verified in this local render environment.
- The film has not been reviewed on representative playback devices, in social
  media transcoders, or with viewers. Readability outside the inspected local
  1920×1080 frames remains unproven.
- The subjective goal of helping someone “feel done rather than buried” is a
  design intention, not user-research evidence.
- The film makes no claim of customer demand, public availability, production
  readiness, privacy certification, security, compatibility, or performance.
- No deployment, upload, publishing, outreach, account creation, analytics,
  backend, purchase, or other external release action was performed.

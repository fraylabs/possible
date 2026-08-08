# Possible product explainer dogfood (superseded)

This is a retained historical run from before the official HyperFrames product-launch
workflow was installed. It is intentionally **not** proof for the current
`product-launch-video` Outcome Pack and is kept as a negative fixture showing why the
old generic explainer path was rejected.

The 30-second artifact is deliberately text-led: it explains the product through the
actual Outcome Pack model and the preserved Robot Snake evidence. It uses an editable
HTML scene source, Playwright browser capture, procedural audio, and FFmpeg assembly.
No HyperFrames, Remotion, TTS provider, external music, publishing, or audience action
was used. The current pack requires the official HyperFrames project, capture, preview,
and render gates; re-rendering this legacy artifact is not a supported completion path.

## Re-render

From this directory:

```bash
python3 synthesize_audio.py
python3 capture.py
ffmpeg -y -framerate 30 -i frames/frame-%05d.png -i audio/possible-procedural.wav \
  -c:v libx264 -pix_fmt yuv420p -r 30 -c:a aac -b:a 160k -shortest \
  -movflags +faststart exports/possible-explainer.mp4
ffprobe -v error -show_streams -show_format -of json exports/possible-explainer.mp4
python3 verify.py
```

The source, timing, audio plan, asset manifest, and completion receipt sit beside the
export so the historical result can be reviewed without trusting the flattened MP4
alone. The verifier intentionally reports `repair-required` rather than `ready`.

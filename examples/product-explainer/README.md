# Possible product explainer dogfood

This is a local run of the `product-explainer-video` Outcome Pack against Possible itself.

The 30-second artifact is deliberately text-led: it explains the product through the
actual Outcome Pack model and the preserved Robot Snake evidence. It uses an editable
HTML scene source, Playwright browser capture, procedural audio, and FFmpeg assembly.
No HyperFrames, Remotion, TTS provider, external music, publishing, or audience action
was used.

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
export so the result can be reviewed without trusting the flattened MP4 alone.

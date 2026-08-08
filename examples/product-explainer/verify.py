import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def read_json(path: str):
    return json.loads((ROOT / path).read_text())


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL: {message}")


def main() -> None:
    brief = read_json("brief.json")
    timeline = read_json("scene-timeline.json")
    audio = read_json("audio-plan.json")
    manifest = read_json("asset-manifest.json")
    receipt = read_json("outcome-room/product-explainer-video-receipt.json")
    output = ROOT / "exports/possible-explainer.mp4"

    require(brief["durationSeconds"] == timeline["durationSeconds"] == 30, "brief and timeline must agree on 30 seconds")
    require(timeline["renderer"]["kind"] == "html-browser-capture", "renderer must be declared")
    require((ROOT / "scene.html").read_text().find("__renderAt") >= 0, "scene source must expose deterministic rendering")
    require(audio["mode"] == "procedural" and audio["narration"] == "none", "audio mode must match the recorded dogfood run")
    require(all(cue["source"] == "procedural" and cue["required"] for cue in audio["cues"]), "every requested cue must have procedural provenance")
    require(manifest["externalActions"] == "none", "the run must not claim external actions")
    require(output.exists() and output.stat().st_size > 0, "final MP4 must exist")
    require((ROOT / "previews/contact-sheet.png").exists(), "representative visual review must exist")

    probe = json.loads(subprocess.run([
        "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(output)
    ], check=True, capture_output=True, text=True).stdout)
    require(abs(float(probe["format"]["duration"]) - 30.0) < 0.01, "final media duration must be 30 seconds")
    video = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
    sound = next(stream for stream in probe["streams"] if stream["codec_type"] == "audio")
    require((video["codec_name"], video["width"], video["height"], video["r_frame_rate"]) == ("h264", 1280, 720, "30/1"), "video stream must be H.264 1280x720 at 30 fps")
    require((sound["codec_name"], sound["sample_rate"], sound["channels"]) == ("aac", "48000", 2), "audio stream must be stereo AAC at 48 kHz")

    output_hash = hashlib.sha256(output.read_bytes()).hexdigest()
    output_entry = next(item for item in receipt["artifacts"] if item["path"] == "exports/possible-explainer.mp4")
    require(output_hash == output_entry["sha256"], "receipt output hash must match the final MP4")
    require(receipt["decision"] == "ready", "receipt must record the final decision")
    print("Product Explainer dogfood verified: 30s H.264/AAC master, deterministic source, procedural audio, receipt hash, and no external actions.")


if __name__ == "__main__":
    main()

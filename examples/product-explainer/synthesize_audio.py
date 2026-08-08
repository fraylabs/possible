import math
import random
import struct
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "audio" / "possible-procedural.wav"
RATE = 48000
DURATION = 30.0
SEED = 240808


def envelope(t: float, start: float, length: float, attack: float = 0.04, release: float = 0.18) -> float:
    if t < start or t > start + length:
        return 0.0
    x = t - start
    if x < attack:
        return x / attack
    if x > length - release:
        return max(0.0, (length - x) / release)
    return 1.0


def tone(t: float, hz: float, start: float, length: float, gain: float, attack=0.04, release=0.18) -> float:
    return math.sin(2 * math.pi * hz * t) * envelope(t, start, length, attack, release) * gain


def main() -> None:
    OUT.parent.mkdir(exist_ok=True)
    rng = random.Random(SEED)
    phase = rng.random() * math.tau
    frames = bytearray()
    for i in range(int(RATE * DURATION)):
        t = i / RATE
        # Quiet stereo bed: two detuned sine tones and a filtered-feeling shimmer.
        bed = 0.022 * math.sin(2 * math.pi * 110 * t + phase)
        bed += 0.013 * math.sin(2 * math.pi * 164.81 * t + phase * 0.4)
        bed += 0.008 * math.sin(2 * math.pi * 220 * t + math.sin(t * 0.4))
        shimmer = 0.004 * math.sin(2 * math.pi * (880 + 16 * math.sin(t * 0.7)) * t)
        sample = bed + shimmer

        # Opening impact, contract chime, workstream pulses, evidence rise, resolve.
        sample += tone(t, 72, 0.08, 0.45, 0.13, 0.008, 0.28)
        sample += tone(t, 523.25, 5.15, 0.34, 0.07)
        sample += tone(t, 659.25, 5.35, 0.55, 0.06)
        for start in (11.2, 12.5, 13.8, 15.1):
            sample += tone(t, 330 + (start - 11.2) * 70, start, 0.28, 0.045, 0.015, 0.12)
        rise = max(0.0, min(1.0, (t - 18.1) / 1.2))
        sample += math.sin(2 * math.pi * (260 + 360 * rise) * t) * rise * 0.035 * (1 - max(0.0, rise - 0.78) / 0.22)
        sample += tone(t, 392, 25.1, 0.45, 0.06)
        sample += tone(t, 523.25, 25.32, 0.72, 0.065)
        sample = max(-0.28, min(0.28, sample))
        # Slight width makes the procedural bed audible without overpowering captions.
        left = sample + 0.004 * math.sin(2 * math.pi * 197 * t)
        right = sample - 0.004 * math.sin(2 * math.pi * 197 * t)
        frames.extend(struct.pack("<hh", int(left * 32767), int(right * 32767)))
    with wave.open(str(OUT), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(frames)


if __name__ == "__main__":
    main()

"""Generate original, quiet ambient demo WAVs using only Python's standard library.

Run from any directory: python alive/scripts/generate-demo-audio.py
No samples, recordings, artist imitations or external dependencies are used.
"""
from array import array
import math
from pathlib import Path
import sys
import wave

RATE = 22050
DURATION = 18
OUTPUT = Path(__file__).resolve().parents[1] / "frontend/public/media/audio"
TRACKS = {
    "soft-focus-01": (130.8128, 164.8138, 195.9977, 261.6256),
    "soft-focus-02": (146.8324, 174.6141, 220.0000, 293.6648),
    "night-notes-01": (110.0000, 130.8128, 164.8138, 220.0000),
    "somewhere-slow-01": (98.0000, 123.4708, 146.8324, 195.9977),
}


def render(name: str, notes: tuple[float, ...]) -> None:
    pcm = array("h")
    peak = 0.0
    for frame in range(RATE * DURATION):
        t = frame / RATE
        fade_in = min(1.0, t / 2.8)
        fade_out = min(1.0, (DURATION - t) / 4.0)
        envelope = math.sin(fade_in * math.pi / 2) ** 2
        envelope *= math.sin(fade_out * math.pi / 2) ** 2
        for channel in range(2):
            value = 0.0
            for index, note in enumerate(notes):
                pan = 0.8 + 0.2 * math.cos(index * 1.7 + channel * math.pi)
                swell = 0.72 + 0.28 * math.sin(2 * math.pi * t / (9 + index * 2) + index)
                detune = 1 + (channel * 2 - 1) * 0.0007
                phase = 2 * math.pi * note * detune * t
                tone = math.sin(phase) + 0.14 * math.sin(phase * 2 + 0.3)
                value += tone * pan * swell / len(notes)
            value *= envelope * 0.24
            peak = max(peak, abs(value))
            pcm.append(round(value * 32767))
    if sys.byteorder != "little":
        pcm.byteswap()
    target = OUTPUT / f"{name}.wav"
    with wave.open(str(target), "wb") as audio:
        audio.setnchannels(2)
        audio.setsampwidth(2)
        audio.setframerate(RATE)
        audio.writeframes(pcm.tobytes())
    print(f"{target.name}: {DURATION}s, stereo {RATE}Hz PCM16, peak {peak:.3f}, {target.stat().st_size} bytes")


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for title, frequencies in TRACKS.items():
        render(title, frequencies)

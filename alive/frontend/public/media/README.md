# Archive media

The active photo library contains 48 owner-provided photographs from the 2025 and 2026 collections. Original files stay in their supplied folders. Web copies under `collections/` are byte-for-byte copies with safe, descriptive URL paths; no cropping, resizing, retouching or orientation changes were applied.

Albums: Blue hour (5), Motion in frames (5), Summer 2025 (19), Arrakis (9), Summer 2026 (10). Collection years follow folder names, not the export timestamps in filenames. Unknown locations and identities are left unspecified. Titles and descriptions are in `../../../docs/photo-catalog.html` and the companion JSON.

The six third-party sample photos and their source manifests have been retired from public assets. Their files and credits remain in the workspace review archive at `.impeccable/photo-review/retired-demo-photos/`. Do not reintroduce sample photographs into the active catalog. Music release cover images now also use the supplied photography; the audio itself is still demonstration material.
## Audio

`audio/soft-focus-01.wav`, `audio/soft-focus-02.wav`,
`audio/night-notes-01.wav` and `audio/somewhere-slow-01.wav` are original
procedurally synthesized demonstration clips created for this project.
They use sine harmonics, slow amplitude movement, slight stereo detuning,
and soft fade-in/fade-out envelopes. There are no external samples, voice,
field recordings, or imitations of a named artist.

Each file is exactly 18 seconds: 22,050 Hz, stereo, 16-bit little-endian PCM
in a standard WAV container. Peak amplitude is below 0.20 full scale; the
files contain no clipped samples. They are intentionally modest in level.

Reproduce all four files from the repository root using Python 3.10 or newer:

```sh
python alive/scripts/generate-demo-audio.py
```

The generator uses only Python's standard library. Replace the demo assets
with the owner's permitted media and update catalog metadata before treating
the archive as a publication of personal work.


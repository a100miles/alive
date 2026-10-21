# Owner photo library and four-edge glass

Completed from the supplied 2025/2026 folders on 2026-10-21. All 48 images were inspected in labeled contact sheets; ambiguous subjects were inspected at full size. Every image received a title and visual description in [the illustrated catalog](photo-catalog.html) and [its source mapping](photo-catalog.json). This catalog was presented before integration, and the user explicitly requested applying it without a separate review pause.

## Content

Five albums retain the supplied grouping: Blue hour (5), Motion in frames (5), Summer 2025 (19), Arrakis (9), Summer 2026 (10). Collection years come from folder labels, not export filenames. No locations, identities or capture circumstances were invented. Deliberate inversion and collage work are described and preserved.

The active read-only catalog has 48 non-demo photos and no third-party sample photos. All four release covers use supplied images; audio and release/demo labels remain unchanged. About and gallery copy now distinguish owner photography from demonstration audio. Missing location fields no longer create dangling slashes.

The backend's strict media-path validation excludes spaces. Supplied originals remain untouched in their original folders, while byte-identical copies use `/media/collections/<year>/<album>/<title>.jpg` URLs. All 48 SHA-256 source/copy pairs match. The six retired sample photos and their manifests were moved out of public assets to `.impeccable/photo-review/retired-demo-photos/`; the previous content JSON is archived alongside them. No original owner files were removed or edited.

## Interface

Four 16–38px frosted strips soften the film perimeter with 7px backdrop blur, a milk tint and inward masks. They ignore pointer input and are hidden from accessibility APIs. They do not mask the center or change video movement, dimensions, pause or reduced-motion behavior.

The reconstructed reel retains its geometry but loads at most nine nearby images, including wrapped neighbors. Tablet filter labels now wrap without squeezing the heading; paper behind filter text protects contrast over passing image planes. The horizontal view and fullscreen focus handoff remain available.

## Modified areas

- `backend/data/content.json`; owner photo copies under `frontend/public/media/collections/`; retired public sample-photo directory.
- `frontend/src/components/HomeVideo.tsx` and `home-video.css`.
- `frontend/src/gallery/Photography.tsx`, `PhotoStrip.tsx`, `PhotoViewer.tsx`, `photography.css`.
- `frontend/src/App.tsx`, `pages/About.tsx`, and `frontend/public/media/README.md`.
- `frontend/e2e/archive.spec.ts`, new `photo-library.spec.ts`; backend handler and repository tests updated for the real catalog.
- `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, and these catalog/review documents.

No dependencies added, no backend validation weakened, and no new public write endpoints introduced. Future imagery is explicitly restricted to the supplied owner collections in project instructions.

## Verification and limits

The local backend was restarted because its repository is an immutable startup snapshot. The frontend is available at localhost:5173 and the API at localhost:8080. Windows required elevated access to restart the verified project server. Go's default build cache was inaccessible; verification used a workspace-local cache without changing project configuration.

Checked all 48 image URLs, five album filters, captions, demo flags, release covers, native image dimensions, bounded reel loading, and fullscreen keyboard access. Desktop/tablet/mobile image captures were inspected after waiting for actual decode. Evidence is in `.impeccable/photo-review/`; captures before decode are not treated as rendering failures. Existing animation goldens predate the requested media replacement, so their pixel assertions are intentionally disabled rather than overwritten.

Browser verification is Edge/Chromium with synthesized touch, not physical-device, Safari or screen-reader certification. Original JPEGs and MOVs were retained; no image compression or cross-browser codec claims are made.

Final verification: all 30 distinct browser checks passed across the archive/photo-library and animation suites, with the photo-library check repeated after decode-aware captures and tablet layout adjustment. Frontend typecheck/ESLint/build and 10 unit tests passed; Go fmt/test/vet passed with the workspace cache. All 48 asset URLs returned JPEGs, all source/copy hashes matched, and all five collections were exercised through fullscreen navigation. No third-party sample photos remain in the public or production media directories.

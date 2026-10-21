# Film, contour and navigation refinement — 2026-10-21

The user adopted the attached refinement brief and explicitly authorized muted autoplay, superseding AGENTS.md's no-autoplay rule for the home films only. Music still requires deliberate playback.

## Evidence and decisions

Inspected both supplied recordings with browser-decoded contact sheets and full-resolution frames before editing. `20-57-13` is 23.189 seconds and `21-00-55` is 15.05 seconds, both 2560×1440. Evidence lives in `.impeccable/refinement-recordings/`; reference artwork is not included in runtime assets. The existing paired reconstruction gallery and reference-interactions.md were also reviewed.

The first recording shows changing broken graphite contours on a hovered disc, a stationary printed disc at rest, and diagonal depth movement when browsing. The second shows restrained navbar hover feedback while the disc contour is absent. No entrance sequence is clearly captured. The retained disc projection and settling remain frame-calibrated estimates, not extracted WebGL constants. New contour cycle lengths (3.8/5.4 seconds), the 600ms clipped navigation entrance with 45ms staggering, and the 700ms video dissolve are authored approximations. There is no home film carousel in these recordings to measure against.

## Implementation

- `src/components/HomeVideo.tsx` and `home-video.css`: two video layers, muted inline playback, advance near the end, dissolve only after the incoming clip has decoded, wrap without resetting the entire stage. Only current/next clips have sources, and the next loads near the end. Pauses below 15% visibility, on hidden tabs, on user pause, and when reduced motion is enabled. Space/Enter or tap/click toggles playback; left/right changes clips. Reduced motion starts paused, allows explicit playback and manual changes, and removes dissolves. A failed clip is skipped; all failures expose retry.
- `src/config.ts`, `src/pages/Home.tsx`: replace the spread contents with the five owner-provided MOV clips. All five decode as 960×1280 in Edge. The frame uses their actual 3:4 proportions, caps at 70svh, and preserves the complete image with contain. No reference media or new claims about ownership are added.
- `src/music/MusicArchive.tsx`, `music.css`, `disc-contour.css`: remove the automatic selection spin and one-time outline drawing; add two broken, imperfect contours moving in opposing directions on hover/focus. The existing depth projection, scroll damping, touch/keyboard browsing and audio behavior remain unchanged. Touch gets a static selected contour; reduced motion stops orbiting.
- `src/components/FilmGrain.tsx`, `atmosphere.css`, `src/App.tsx`: generate a 192px noise tile once, then shift it in discrete CSS steps. No per-frame noise generation. Pointer-transparent, hidden from accessibility APIs, stopped when the document is hidden, static with reduced motion. Navigation uses a small current-page dot, color feedback and clipped/staggered labels; the entrance waits for the intro to close.
- `src/components/Navigation.tsx`, `src/styles.css`: navigation label wrappers and full-width spread layout; preserve existing links, responsive menu and focus behavior.
- `e2e/film-refinement.spec.ts`, `e2e/pencil-glass.spec.ts`, `playwright.config.ts`: playback/decode/wrap/visibility/reduced-motion checks, viewport captures, update the superseded spin expectation, allow an isolated test server URL.
- `e2e/inspect-refinement-recordings.mjs`: reproduce reference frame extraction, with no runtime dependency.

No packages or dependencies added. Original MOV files were not modified.

## Verification

Frontend TypeScript + ESLint, 10 unit tests, and production build passed. Go test, fmt and vet passed with no backend changes. Browser verification uses Edge/Chromium at 1440, 768 and 390 pixels, plus the existing integration suite's synthesized touch and keyboard paths. The five actual media files decoded, playback advanced through every clip and returned to the first, and no page errors were reported by the playback test.

The initial browser pass caught a visibility-threshold bug and undersized mobile video; both were corrected in the single refinement batch. The Playwright CLI could not write its browser cache; the project's direct Playwright runner works. The existing dev server served a blank page during the first attempt, so verification uses a separate Vite server at localhost:5174. Existing screenshot goldens predate the requested design changes and are not used as pixel-approval evidence. Final test outcome is recorded below.

Physical devices, Safari/Firefox, screen readers, codec support outside this Windows Edge installation and a sustained 60fps performance benchmark are not verified. Native MOV decoding can vary by platform. The exact reference shader, hover contour deformation and entrance timing are not reproduced or claimed.

Final result: 22 Playwright tests passed (including the aperture smoke test with screenshot comparison disabled), 10 Vitest tests passed, TypeScript/ESLint/build passed, Go test/fmt/vet passed. Final desktop/tablet/mobile captures were inspected in the second and final visual pass. No physical-device or cross-browser claim is made. DESIGN.md was also updated with the explicit autoplay exception and current behavior.

Reproduction: run a Vite server at port 5174, set ALIVE_TEST_URL=http://127.0.0.1:5174, then run `node node_modules/playwright/cli.js test --grep-invert "baseline|composition|aperture baseline" --trace=off --ignore-snapshots` from alive/frontend. This intentionally does not approve the older screenshot goldens.

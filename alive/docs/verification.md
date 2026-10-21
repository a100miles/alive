# Verification record

## Interaction reconstruction update

The later reference-reconstruction pass on 16 October 2026 is now verified. TypeScript and ESLint pass, **10 unit tests pass**, and **19 Playwright tests pass**: 14 interaction/integration tests plus 5 saved visual-regression comparisons. Visual baselines were created once, inspected, then verified in the full run without updating them. They cover desktop/mobile disc and reel compositions and the aperture at 266ms virtual animation time.

New coverage includes continuous reel wrapping, vertical touch, horizontal alternative, page scrolling outside the reel media, dynamic motion-preference interruption during intro exit, keyboard album/view focus, fullscreen navigation returning to an accessible target, and reduced-motion Track notes scrolling. A touch-capture regression was reproduced and fixed: the browser's implicit button capture was being canceled when capture transferred to the surface; bubbled child lost-capture events are now ignored. Selection via arrows/buttons announces the intended release immediately, preventing a rapid play action from using stale metadata.

The [reference interaction report](reference-interactions.md) and [ten paired comparisons](comparisons/index.html) distinguish direct measurements from fitted WebGL estimates. Desktop disc bounds have approximately 9px maximum edge deviation from frame-estimated reference bounds; mobile disc bounds approximately 6px. Local/reference motion samples use an equivalent virtual animation clock where stated. Local capture recorded no JavaScript exceptions. These facts do not imply copied shaders, identical artwork, or cross-browser certification.

Independent [fidelity review](reconstruction-design-review.md) and [source audit](reconstruction-audit.md) were performed after implementation. Their focus/reduced-motion/intro findings were fixed and covered by the final test run. The reconstruction detector ran once and returned no findings. The Go API and content repository were unchanged during this frontend reconstruction; their earlier passing checks below remain the baseline.

The existing development servers on 5173/8080 predated this pass and were reused. They were not stopped or replaced. Only the isolated reference browser and temporary capture processes belong to this inspection pass.

## Earlier MVP verification

Verified on 16 October 2026 on Windows, Node 24.11, Go 1.24.3 and Microsoft Edge (Chromium) through Playwright.

## Automated checks

- TypeScript strict checking and ESLint: pass.
- Six frontend unit tests: pass. Cover mixed-aspect gallery selection/bounds and audio no-autoplay, persistent element lifecycle, queue progression, stale play requests, errors, seek and cleanup.
- Vite production build: pass; JS approximately 121KB gzip and CSS approximately 7KB gzip. Self-hosted Latin font subsets; no external media request is required at runtime.
- Go tests: pass. Include typed content validation, repository behavior, all API paths, error envelopes, filtering, unpublished content, CORS, media traversal/encoding rejection, actual Windows symlink escape protection, range requests and SPA fallback.
- `go vet ./...`: pass. `gofmt -l .`: no output.
- Final optional photo/release `tags` and `moods` fields were followed by passing Go tests/vet and frontend typecheck/lint. Go's cache required the approved sandbox escalation; this was a permissions issue, not a test failure.
- Live `GET /api/v1/health`: returned `{ "data": { "status": "ok" } }`.

## Browser checks

All nine final Playwright integration tests pass, including the fixes from independent review:

1. Intro skip and session marker.
2. Homepage, scene navigation, route heading focus, browser back, direct refresh and all routes.
3. Album filters, keyboard gallery, fullscreen next/previous, Escape and opener-focus restoration.
4. Real bundled WAV playback, advancing time, seeking, volume/mute, persistent player across routes and empty release.
5. All five mobile layouts at 390×844 without horizontal document overflow, mobile menu, synthesized touch swipes on discs and the native photo rail.
6. Animated rapid route changes, complete curtain reveal and pointer-drag gallery with no unintended viewer opening.
7. Empty photography and unavailable audio states.
8. Reduced-motion navigation, switching the preference during a transition with visible final content, and retry after a simulated API 503.
9. Mobile persistent-player 44px hit areas and reopening the current release.

Desktop screenshots at 1440px and mobile screenshots at 390px are in the workspace `.impeccable/review/` directory. Route screenshots include home, photography, music, about and contact. The main navigation test records JavaScript exceptions and found none.

The first browser round exposed album switching retaining a later scroll position. Remounting the rail per collection now resets native scrolling correctly. Missing-media checks initially failed while downloads were pending; all assets are now local. A test selector was narrowed by waiting for scene completion before inspecting persistent playback, since outgoing and persistent controls coexist during the transition. Independent review led to 44px compact/footer targets, current-release restoration, and an explicit final content state when reduced motion changes during an entrance.

Production-mode Go serving was also started locally on port 8081. All five direct page URLs and health/albums/photos/releases/track API requests returned HTTP 200 with the expected content type. A WAV range request returned HTTP 206, 100 bytes and a correct Content-Range header. A first PowerShell range check failed because that shell reserves the Range header; repeating with curl verified the actual server behavior.

## Scope and limits

Touch evidence is synthesized through Chromium's CDP with mobile emulation; no physical phone or Safari/WebKit run was performed. Audio playback state and decoded time were verified, not an acoustic listening-device assessment. Screen-reader behavior was reviewed from semantics/focus handling, not tested with a particular assistive technology. Pixel-perfect reference equivalence is not claimed; see reference-review.md for observed and inaccessible interactions.

No external deployment, contact destinations, personal biography or owner media were supplied. Those remain content/configuration work for the owner. Demo photos retain their Unsplash source/license record, and the bundled sounds are original synthetic playback demonstrations.

Temporary development and production-check servers were stopped after verification. Start the app with `npm run dev` from `alive/`.

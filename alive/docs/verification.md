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
5. All five mobile layouts at 390Ã—844 without horizontal document overflow, mobile menu, synthesized touch swipes on discs and the native photo rail.
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

## Persistent player close button - 2026-10-22

Added a 44px close control that stops/unloads audio, clears the selected track and returns focus to main without scrolling. Explicit playback can select the same track again. Frontend typecheck/lint/build and all 10 existing unit tests passed; Go test/fmt/vet passed. Headless Edge checks at 1440, 390 and 320px confirmed button bounds, no horizontal overflow, keyboard dismissal, focus handoff and replay. Desktop/mobile screenshots were inspected. The check used synthetic history navigation to expose the persistent bar; full animated navigation and physical touch devices were not tested in this pass.


## Persistent player glass buttons - 2026-10-22

Applied the requested glass effect to persistent-player transport, mute and close buttons: translucent milk highlights, backdrop blur, subtle depth and a darker play/pause surface. Existing 44px targets and focus outlines remain; reduced motion disables transitions and forced colors supplies a visible button border. Frontend typecheck/lint/build and 10 unit tests passed; Go test/fmt/vet passed. Edge desktop/mobile (1440/390px) screenshots inspected; computed blur, target sizes, no overflow and keyboard close verified. Safari and physical touch devices were not tested.


## Music page glass controls - 2026-10-22

Shared the persistent player's glass button styles with the music page release player, including hover/pressed, reduced-motion and forced-color rules. Frontend typecheck/lint/build, all 10 tests and Go test/fmt/vet passed. Edge screenshots at 1440/390px inspected; all four playback buttons retain 44px targets and computed backdrop blur; keyboard pause passed. Safari and physical devices were not tested.


## Film border crop - 2026-10-22

Confirmed white frames were embedded in the supplied films. Added clipping to each film wrapper and a uniform 1.025 display scale (about 1.22% cropped per edge), preserving original files and image proportions. The strip retains zero gap and its existing playback/motion behavior. Edge desktop/mobile screenshots at 1440/390px inspected, including both ends of the collection, with reduced motion; embedded white borders are removed. Zero CSS gap and no page overflow verified. Frontend typecheck/lint/build, all 10 tests and Go test/fmt/vet passed. Continuous-motion seams, Safari and physical devices were not retested.


## Film/listening section gap - 2026-10-22

Removed the listening band's 42px desktop and 35px mobile top margin. Edge at 1440/390px measured exactly 0px between the film wrapper and listening band; screenshots inspected with reduced motion. Internal listening-section padding remains. Frontend typecheck/lint/build, 10 tests and Go test/fmt/vet passed. Safari and physical devices not tested.


## Home dark footer - 2026-10-22

Home footer now continues the listening section's charcoal background across the full viewport, with milk branding and readable muted text. Side margins become internal gutters. Other routes retain their existing footer theme. Edge screenshots inspected at 1440/390px; background color, full width and unchanged About footer verified. Frontend typecheck/lint/build, 10 tests and Go test/fmt/vet passed. Safari and physical devices not tested.


## Smoky scroll glass - 2026-10-22

Frontend typecheck/lint/build, all 10 tests and Go test/fmt/vet passed. Edge at 1440/390px confirmed title and film section opacity remains 1 in the former departure fade range, computed dark glass/10px blur, reverse-scroll reset and dynamic reduced-motion cleanup. Desktop/mobile screenshots inspected. Blur stays bounded to the existing top overlay rather than the entire media section. Safari, physical devices and performance profiling were not tested.


## Film viewport boundary fix - 2026-10-22

Reviewed the supplied 15.3-second recording. The media observer treated less than 10% visibility as offscreen and detached sources, exposing the white page while the strip was still visible. It now observes any intersection and retains horizontally nearby loaded frames when vertically offscreen; playback still pauses offscreen and distant horizontal sources still unload. Two new Edge regression checks at 1440/390px verify frames and playback at 30px and 2px remaining, pause/frame retention fully offscreen, and reverse scrolling. Screenshots inspected. Existing media suspension/reduced-motion check also passed. Frontend typecheck/lint/build, 10 unit tests and Go test/fmt/vet passed. One initial browser run hit a shared trace-output collision with another test process; sequential rerun passed. Safari and physical devices not tested.


## Film boundary backing correction - 2026-10-22

Following the owner's report that the glow remained, removed the slider wrapper from scroll entrance animation and replaced its transparent backing with charcoal matching the listening band. The video stage and reduced-motion scrollbar track also use charcoal. Desktop/mobile Edge regression checks confirm no transform, dark stage backing, loaded frames and zero section gap while crossing/reversing the viewport boundary. Reduced-motion screenshots at 1440/390px inspected. Frontend check/build, 10 unit tests, two boundary browser tests and Go test/fmt/vet passed. The exact residual glow was not reproduced in the automated browser; this correction removes remaining light fallback surfaces. Physical devices and the user's embedded browser were not tested.


## Mobile menu text - 2026-10-22

Replaced the mobile opening SVG with lowercase menu in the existing Arvo navigation typeface. Retains accessible name, 44px minimum target, dialog semantics and close control. Edge mobile screenshot inspected; keyboard open, Escape close, focus restoration and hidden toggle at desktop verified. Frontend check/build, 10 tests and Go test/fmt/vet passed. Physical devices and Safari not tested.


## Mobile menu desktop hover - 2026-10-22

Removed the icon-button class from the text menu trigger. It now shares desktop navigation underline styling, 13px Arvo type and transparent hover, retaining a minimum 44px target. Edge mobile hover screenshot inspected; computed transparent background and expanded underline verified, with menu open/Escape close. Frontend check/build, 10 tests and Go test/fmt/vet passed. Physical touch devices and Safari not tested.


## Smooth photograph opening - 2026-10-22

Added a 320ms viewer/backdrop fade and 440ms gentle photograph scale/12px rise. CSS animations run only without reduced-motion preference, stop immediately on dynamic preference changes, and disappear automatically when the dialog unmounts. Existing dialog controls/focus lifecycle remain. Edge 1440/390px checks verified animation durations, intermediate/final captures, navigation, Escape during opening, focus return and dynamic reduced motion; screenshots inspected. Frontend check/build, 10 unit tests and Go test/fmt/vet passed. Bundled Playwright CLI attempted but its daemon log path returned EPERM; existing Playwright API used. Safari and physical devices not tested.


## Reel filter navigation font - 2026-10-22

Reel filters inherit the navigation's Arvo, Georgia, serif family. Existing font sizes, selected state and responsive wrapping remain. Edge 1440/390px screenshots inspected; all filter buttons compute to Arvo and no horizontal overflow was detected. Frontend check/build, 10 tests and Go test/fmt/vet passed. Safari and physical devices not tested.


## Horizontal album bar font and label - 2026-10-22

Matched the horizontal album bar to Arvo navigation typography and removed the static Sample archive label and its unused CSS. Edge 1440/390px screenshots inspected; computed font, label removal and album selection verified. Frontend check/build, 10 tests and Go test/fmt/vet passed. Safari and physical devices not tested.


## Plain lowercase view-switch button - 2026-10-22

Buttons using underlined-link now explicitly use lowercase with no bottom border or text decoration. Desktop/mobile Edge verified the Perspective reel control styles and successful switch back to the reel; mobile capture inspected. Frontend check/build, 10 tests and Go test/fmt/vet passed. Safari and physical devices not tested.


## Consistent lowercase interface - 2026-10-22

Kept the global body lowercase rule and explicitly made buttons, inputs, selects and textareas inherit it, overriding control defaults. Edge audits at 1440/390px found no visible uppercase text outside lowercase styling across all five routes, not-found, photo viewer, horizontal gallery, music controls and mobile menu. Album bar screenshots inspected. Frontend check/build, 10 tests and Go test/fmt/vet passed. This is display styling; source metadata, URLs and text embedded in original media are preserved. Safari and physical devices not tested.


## About note removal - 2026-10-22

Removed only the About page p.small-note editorial placeholder. Photo caption remains. Edge 1440/390px confirmed absence and screenshots inspected. Frontend check/build, 10 tests and Go test/fmt/vet passed. Safari and physical devices not tested.


## Footer divider removal - 2026-10-22

Removed the shared footer top border. Edge at 1440/390px confirmed 0px top borders on home, photography, music, about, contact and not-found; screenshots inspected. Frontend check/build, 10 tests and Go test/fmt/vet passed. Safari and physical devices not tested.

## About portrait replacement - 2026-10-22

About now uses supplied me2.jpg with its actual 1280x1023 dimensions and updated descriptive alt text. Edge desktop/mobile image decoding verified and captures inspected. Frontend check/build, 10 tests and Go test/fmt/vet passed. Safari and physical devices not tested.


### Shared footer text removal — 2026-10-22
Removed Photography / 2025–2026 from the shared App footer used by all routes. Frontend typecheck/lint/build and all 10 tests passed. Go test/vet passed and gofmt reported no changes; Go emitted a non-fatal cache trim permission warning. Edge DOM checks at 1440px and 390px confirmed the old footer text is absent. No screenshot or physical-device inspection was performed for this text-only change.

# Continuous film strip refinement - 2026-10-21

## What changed

The home videos now form a continuous horizontal strip moving at 32 CSS px/s. Five physical video elements maintain sequence; each wraps only when its entire image is offscreen. This avoids a duplicated-track reset and any visible snap. Native video looping is independent of strip translation. The originals remain unchanged, at 960x1280, with contain sizing and a common responsive height. Metadata supplies actual aspect ratios. A CSS alpha mask fades the outer 4% of the strip; image centers remain unblurred.

Visible films play, the 160px approach buffer preloads, and distant films pause and detach their sources. Media visibility updates are throttled to roughly 8Hz; the animation frame callback updates only transforms from cached dimensions. ResizeObserver recalculates dimensions. Offscreen and hidden-tab states stop motion and playback. Tap/Space/Enter pauses without adding visible controls. Reduced motion replaces automatic movement with a stationary native scrolling row, manual playback and arrow-key browsing. Individual load failures show an inline message and retry on the next explicit play action.

The shared paper token changes from warm gray #f2f0eb to milk #f8f7f3; quiet, border and curtain tones are coordinated. Root background, text selection and transition glass use shared tokens, and browser theme metadata matches. The grain tile's random alpha range rises from 28 to 44 and its base opacity from .18 to .42. Stepped offsets and small opacity fluctuations keep it irregular. Tile generation happens once per mount, with no pixel calculation in animation frames.

No changes to disc geometry/contours, navbar motion, scroll-reveal logic, photography or audio controls. No packages added. Reference artwork stays research-only.

## Modified files

- `frontend/src/components/HomeVideo.tsx`
- `frontend/src/components/filmStrip.ts` (new)
- `frontend/src/components/home-video.css`
- `frontend/src/components/FilmGrain.tsx`
- `frontend/src/components/atmosphere.css`
- `frontend/src/styles.css`
- `frontend/index.html`
- `frontend/e2e/film-refinement.spec.ts`
- Workspace `DESIGN.md`
- `docs/film-strip-review.md` (this report)

## Verification

Screenshots at 1440x900, 768x900 and 390x900 are in `.impeccable/film-strip/`. Inspected the masked strip, grain and preserved music layout at all three widths. Checked native ratios, loaded-source bounds, manual pause, offscreen pause, reduced-motion interruption, native horizontal access and milk background. The circuit test uses virtual RAF time and checks linear displacement, viewport coverage, and every recycle occurring outside the visible strip. The test first warms the virtual time origin to avoid confusing the real-to-virtual clock handoff with motion speed.

The official Playwright CLI skill was already read in this session; its browser-cache permission failure is recorded in the prior review. Verification uses the functioning project Playwright runner and the isolated Vite server at localhost:5174. Older screenshot goldens predate the requested changes, so pixel assertions are disabled rather than silently updating them. Physical phones, Safari/Firefox, assistive technology and sustained hardware FPS have not been measured. No claim of universal MOV codec support is made.

Final results: TypeScript/ESLint and production build passed; 10 unit tests passed; Go test/fmt/vet passed with no backend changes. All 22 browser tests passed, including an entire linear-motion circuit, mobile menu/touch gestures, disc contours, gallery fullscreen focus restoration, scroll reveals, audio playback and navigation/aperture smoke checks. Pixel comparisons against obsolete goldens were disabled. Final captures were inspected; no additional visual changes were needed after the first batch.


Spacing follow-up: removed the CSS gap and corrected the motion engine to accept zero; narrowed both edge fades to 4%. Frontend check/build and 10 unit tests passed, all 5 targeted browser tests passed (full circuit plus desktop/tablet/mobile), and Go test/fmt/vet passed. Desktop/mobile captures inspected.

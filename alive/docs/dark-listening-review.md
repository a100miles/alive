# Dark listening section, scroll frost and disc navigation

Implemented 2026-10-21 from the user's screenshot/request and accompanying pasted brief.

## Changes

- Removed `.home-colophon` and its unused styles. The former divider-to-divider listening area is a full-width charcoal band with milk text. Section boundaries and the local CTA rule are removed; the footer stays milk. Only the inner content participates in the established scroll reveal, keeping the dark backdrop solid.
- Removed the film strip's edge masks. Its zero-gap continuous motion, native proportions and decoder/visibility management are unchanged.
- Added a fixed top frost with a vertical alpha gradient and 12px backdrop blur. It progresses from transparent at scroll zero to full opacity at 180px, sits beneath navigation, and ignores pointer input. A passive listener and at most one scheduled frame update it; both clean up on unmount. It uses the current shared milk token, preserving the existing palette rather than reverting to the attachment's older hex example.
- Added a home-disc shared-element transition using the existing GSAP/router stack. The disc stays on screen in a temporary decorative layer, while its real source/destination are hidden. It accelerates for 300ms before navigation. Over the next 820ms it translates, scales, tilts and finishes a full rotation, crossfading its hub/printing to the destination artwork. A short hold finishes the 1.2-second sequence. Translation and perspective are isolated in separate layers, so the final geometry matches the existing archive plane. The existing aperture supplies the background reveal.
- Passing the chosen release through router state makes the destination match the clicked home artwork even if another release is currently playing. Playback is never triggered by browsing. Direct Music navigation and other navigation retain their previous behavior.
- Repeated activation is guarded. Reduced motion skips or immediately completes the flight. Navigation cancellation removes the temporary layer and restores hidden elements. History and heading focus handoff remain in the router.

## Modified files

- `frontend/src/pages/Home.tsx`
- `frontend/src/App.tsx`
- `frontend/src/components/ScrollFrost.tsx` (new)
- `frontend/src/components/SceneRoutes.tsx`
- `frontend/src/components/home-video.css`
- `frontend/src/motion/discNavigation.ts` (new)
- `frontend/src/motion/discFlight.ts` (new)
- `frontend/src/music/MusicArchive.tsx`
- `frontend/src/styles.css`
- `frontend/e2e/home-transition.spec.ts` (new)
- `frontend/e2e/film-refinement.spec.ts`
- Workspace `DESIGN.md`
- This review

No dependencies added. The reconstructed archive geometry, reel, disc contour animations, navbar interactions and audio controls were retained. No reference artwork was added to runtime assets.

## Evidence and limits

Read the existing reference-interactions record and previously inspected paired gallery before coordinating the new flight with the archive plane. The new home-disc transition is an original implementation of the supplied written sequence; it is not claimed to reproduce a recorded home-disc transition absent from the reference footage.

Browser checks run in Edge/Chromium through the existing Playwright runner at localhost:5174. Desktop, tablet and mobile captures and intermediate-flight frames are in `.impeccable/dark-listening/`. Destination bounds are checked to within 2px at 1440, 768 and 390px widths. The initial tablet check exposed a perspective/translation coupling; separating the layers fixed the mismatch. Native MOV compatibility outside this Windows browser, physical devices, screen readers and sustained frame-rate performance are not certified. Older screenshot goldens intentionally remain unchanged and their pixel assertions are disabled for these requested visual changes.

Final verification: frontend TypeScript/ESLint, production build, all 10 unit tests and Go test/fmt/vet passed. All 29 browser checks passed, including sharp film edges, top-frost progression, border removal, the continuous film circuit, 2px disc handoff checks at all three sizes, keyboard/touch activation, duplicate-click guarding, reduced-motion interruption, Back during arrival, Back/Forward history, direct reload and the existing archive/audio interactions. No new console page errors were reported in the shared-flight checks. Source and intermediate frame captures were visually inspected.

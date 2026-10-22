# Contact pencil birds — 2026-10-22

The screenshot supplied flower surrounds and four graphite birds that were absent from the local Contact source. Contact now includes original SVG flower outlines around the existing destinations, plus four independently animated birds. Typography, paper/grain, navigation and contact URLs remain unchanged. Mobile reserves 104px above the heading for a clear flight strip.

## Implementation

- `frontend/src/components/ContactBirds.tsx`: four small textured SVGs; GSAP drives closed harmonic curves with 37/43/49/41-second periods, distinct phases and bank angles. Position and velocity match at each loop boundary. Four uneven wing drawings alternate in stepped sequences with held glides. No React rendering per animation frame, no new dependencies.
- `frontend/src/components/ContactFlower.tsx`: colored pencil contours and green stems around the existing icons.
- `frontend/src/components/contact-pencil.css`: bounded desktop whitespace, mobile flight strip, flower placement and pause control.
- `frontend/src/pages/Contact.tsx`: illustration composition; original hrefs, accessible names and external-link attributes retained.

Decorative SVGs ignore pointers and are hidden from assistive technology. Pause is keyboard/touch accessible; reduced motion immediately returns to a static composition. IntersectionObserver and visibility events suspend flight offscreen/in hidden tabs. Tweens, observers and listeners are removed on cleanup. Optional cursor avoidance was omitted to keep movement understated.

## Actual verification

- Frontend TypeScript and ESLint passed; production build passed; all 10 existing Vitest tests passed.
- Go test and vet passed; gofmt reported no files needing formatting.
- Official bundled Playwright CLI with isolated Edge checked 1440, 768, 390 and 320px widths. Each bird changed position; keyboard pause and dynamic reduced-motion reset passed. No horizontal overflow; all contact targets were at least 44px in each dimension.
- Desktop, tablet and mobile PNGs inspected. A mobile cascade conflict was corrected and the browser checks repeated. Early automated desktop screenshots caught navigation labels during their existing entrance; `desktop-settled.png` confirms readable navigation after settling.
- Closed-curve continuity and hidden/offscreen cleanup were reviewed in code; no frame-time profiling or physical-device/Safari testing was performed. External destinations were not opened and no messages were sent.

`review.cjs` is a Playwright CLI run-code callback. From `alive/frontend`, run it with `node node_modules/playwright/cli.js cli -s=contact-birds run-code --filename=../docs/contact-birds/review.cjs` after opening the local Contact page in that session.

## Follow-up: pause control removed
The owner requested removal of the pause button. Its state and styles are removed; autonomous flight, reduced motion and offscreen/hidden-tab suspension remain. Earlier captures and pause verification above describe the prior version. The review callback now checks that the control is absent.

# Homepage pencil layer — 2026-10-22

Added an original SVG pencil layer around the existing homepage title. Five red, red, blue, orange and yellow scribbled flowers sit on seven irregular green ground strokes. The corner sun uses a fixed scribbled center and 28 curved rays (seven directions, four differing traces each). A small static SVG texture filter breaks up the marks; no images, dependencies or per-frame JavaScript were added.

CSS stroke-dashoffset draws each ray, holds the accumulated marks, then fades them before the next pass. Durations range from 4.8 to 5.58 seconds with differing negative delays. The sun button pauses/resumes via keyboard, mouse or touch. IntersectionObserver and document visibility suspend the loop; both listeners clean up on unmount. Reduced motion immediately presents all rays statically. The existing layout, typography, film strip and reconstructed archive interactions are preserved.

Verification: frontend typecheck/lint/build and 10 unit tests passed; Go test/fmt/vet passed. Headless Edge checks at 1440×900, 390×844 and 320×640 found no horizontal overflow or browser errors. Desktop/mobile screenshots were inspected. Keyboard pause/resume, dynamic reduced motion and offscreen suspension passed. Mobile sun anchoring was corrected in the final visual pass. Safari and physical devices were not tested.

Implementation files: frontend/src/components/HomePencil.tsx, frontend/src/components/home-pencil.css, frontend/src/pages/Home.tsx. Screenshots: pencil-1440.png, pencil-390.png and pencil-320.png.

Follow-up: increased separation between ray traces and shortened the cycle to make the repeated drawing more visible. Edge sampling confirmed stroke length and opacity change over time, pause freezes them, and reduced motion remains static. Frontend and Go checks passed again.


Hand-drawn refinement: replaced the radial curves with seven individually placed, wavering gestures. Each has four imperfect retracings made of three fine pigment tracks, varied stroke weight and two pencil yellows. A 7.6-second loop now draws each pass in about 0.6 seconds with a small hesitation, leaving layered marks before a soft fade. Desktop/mobile screenshots inspected; animated stroke sampling, keyboard pause and reduced motion passed. Frontend typecheck/lint/build, 10 tests and Go test/fmt/vet passed. Safari/physical devices remain untested.

Flower wind animation: five flowers now sway from their grounded stem bases with differing 5.6�7.9 second gust rhythms. Two faint, delayed SVG instances follow each flower and fade as overlapping pencil impressions. Geometry is reused through SVG defs/use. The sun button now pauses/resumes all pencil animations; hidden/offscreen suspension also covers flowers. Reduced motion restores upright flowers and hides echoes. Edge verified changing transforms/opacity, ten echo instances, keyboard pause/resume, offscreen suspension and dynamic reduced motion. Inspected desktop/mobile captures and checked 320/390/1440px without overflow. Frontend typecheck/lint/build, all 10 tests and Go test/fmt/vet passed; Safari and physical devices not tested.

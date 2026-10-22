# Living typography — 2026-10-21

Added `live. love. create.` directly between the home film/photography strip and the dark listening section. No screenshot attachment was available in this session; placement follows the named listening heading in the existing Home component.

Three equal columns share an off-white field, 76–100px tall, absorbing the former 35–42px margin above the listening section. Type scales from 23–42px. Six overlapping layers reuse installed, licensed fonts: Bodoni Moda regular/italic, DM Sans, Caveat, Cutive Mono and Indie Flower. Each word has a separate 11.4–13.44s cycle with staggered phases, a clear hold and a 380–450ms blur/opacity crossfade. No new dependencies, remote font requests, timers or animation-frame loops.

Only the used font faces are warmed through FontFaceSet before animation begins. IntersectionObserver and document visibility pause CSS animation; listeners and observer clean up on unmount. Live reduced-motion preferences select a stable serif treatment. The phrase is a native button supporting click, tap, Enter and Space to toggle pause, with a visible keyboard focus outline and accessible pressed state. Decorative layers are hidden from screen readers.

Verification: frontend typecheck, lint, production build and all 10 unit tests passed. Go tests and vet passed; gofmt reported no files. A focused Playwright test passed in Edge at 1440, 768, 390 and 320px, checking layer fit, stable word bounding boxes, no horizontal overflow, keyboard pause, offscreen pause and dynamic reduced motion. Desktop/mobile screenshots were visually inspected in `.impeccable/living-typography-1440.png` and `.impeccable/living-typography-390.png`. The first offscreen test used a viewport tall enough to still contain the element; it was corrected to actually scroll the element out of view. Safari and physical devices were not tested.

Existing gallery, scroll reveal, music presentation, navigation and grain code were not changed.

## Compact spacing and removed pause control — 2026-10-22

Removed the 76–100px minimum height, set margin to zero and reduced vertical padding from 12px to 4px. The phrase is now a non-interactive div with a single screen-reader text alternative; click/tap and keyboard pause controls, tooltips and pressed state are removed. Offscreen/document visibility suspension and dynamic reduced-motion support remain.

Verification: frontend typecheck, lint, build and all 10 unit tests passed; Go test/fmt/vet passed. The updated Edge browser test passed at 1440, 768, 390 and 320px, covering fit, stable word geometry, overflow, continued animation after clicking, offscreen suspension and reduced motion. Desktop/mobile screenshots were inspected. Safari and physical devices were not tested.

Follow-up spacing reduction: removed the remaining 4px vertical padding, reduced word height from 1.6em to 1.4em and line-height from 1.4 to 1.2, preserving font sizes. Repeated frontend check/build/10 unit tests, Go test/fmt/vet and the four-width Edge typography test successfully; refreshed desktop/mobile captures were inspected. Safari and physical devices remain untested.

Further text and spacing reduction: font size now scales from 18–32px instead of 23–42px, word height is 1.3em and line-height is 1.1. Margin and vertical padding remain zero. Frontend check/build/10 unit tests, Go test/fmt/vet and the four-width Edge typography test passed again; desktop/mobile captures were inspected. Safari and physical devices remain untested.

Faster font changes: each word now advances every 1.2, 1.3 or 1.4 seconds (previously 1.9, 2.07 or 2.24 seconds), preserving staggered phases and reduced-motion support. Dissolves now last approximately 240–280ms. Frontend check/build/10 unit tests, Go test/fmt/vet and the Edge browser test at 1440/768/390/320px passed. Safari and physical devices were not tested.

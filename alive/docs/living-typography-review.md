# Living typography — 2026-10-21

Added `live. love. create.` directly between the home film/photography strip and the dark listening section. No screenshot attachment was available in this session; placement follows the named listening heading in the existing Home component.

Three equal columns share an off-white field, 76–100px tall, absorbing the former 35–42px margin above the listening section. Type scales from 23–42px. Six overlapping layers reuse installed, licensed fonts: Bodoni Moda regular/italic, DM Sans, Caveat, Cutive Mono and Indie Flower. Each word has a separate 11.4–13.44s cycle with staggered phases, a clear hold and a 380–450ms blur/opacity crossfade. No new dependencies, remote font requests, timers or animation-frame loops.

Only the used font faces are warmed through FontFaceSet before animation begins. IntersectionObserver and document visibility pause CSS animation; listeners and observer clean up on unmount. Live reduced-motion preferences select a stable serif treatment. The phrase is a native button supporting click, tap, Enter and Space to toggle pause, with a visible keyboard focus outline and accessible pressed state. Decorative layers are hidden from screen readers.

Verification: frontend typecheck, lint, production build and all 10 unit tests passed. Go tests and vet passed; gofmt reported no files. A focused Playwright test passed in Edge at 1440, 768, 390 and 320px, checking layer fit, stable word bounding boxes, no horizontal overflow, keyboard pause, offscreen pause and dynamic reduced motion. Desktop/mobile screenshots were visually inspected in `.impeccable/living-typography-1440.png` and `.impeccable/living-typography-390.png`. The first offscreen test used a viewport tall enough to still contain the element; it was corrected to actually scroll the element out of view. Safari and physical devices were not tested.

Existing gallery, scroll reveal, music presentation, navigation and grain code were not changed.

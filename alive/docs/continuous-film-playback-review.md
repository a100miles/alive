# Continuous film playback — 2026-10-22

Removed click/tap and Space/Enter playback toggles from the homepage video strip, along with its pointer cursor and pause instructions. The normal strip is no longer an interactive tab stop. Reduced motion retains a stationary, keyboard-focusable horizontal strip with arrow-key browsing. Offscreen, hidden-tab and inert-scene suspension remain in place.

Changed HomeVideo.tsx, filmStrip.ts, home-video.css and the existing film-refinement browser test.

Validation: frontend typecheck/lint/build, all 10 unit tests and Go test/fmt/vet passed. Edge browser regression passed for click/keyboard gestures continuing movement, media proportions, offscreen suspension and reduced-motion browsing. A separate 390px touch-emulation check confirmed tapping does not stop the strip. No visual geometry changes were made. Physical devices and Safari were not tested.

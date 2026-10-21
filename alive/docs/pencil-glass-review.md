# Pencil, glass and signature refinement

Implemented 2026-10-21 at the user's request. This is an intentional visual departure from the dated reference comparison, preserving disc poses, reel geometry and aperture timing.

- Self-hosted Caveat Latin 400 with OFL in public/licenses; home signature reveals after the intro.
- Two irregular SVG graphite strokes draw around the active disc. Its artwork rotates from -16 degrees to rest over 2.8 seconds. Finite selection motion avoids unattended loops.
- Borderless frosted-glass navigation replaces the old shader rim. Both scenes hide decorative disc contours throughout the transition. Native keyboard focus remains available after handoff.
- Reduced motion disables the signature/disc choreography and interrupts active navigation immediately.

Verification: frontend typecheck/lint, 10 unit tests, production build and Go test/fmt/vet passed. Desktop 1440x900 and mobile 390x844 inspected in Edge through the bundled Playwright CLI. Screenshots: .impeccable/review/pencil-{home,music}-{desktop,mobile}.png. Browser coverage includes touch gestures, keyboard navigation, fullscreen restoration, audio and reduced-motion interruption. Updated music and aperture visual baselines reflect the requested change; photography baselines remain unchanged.

An initial browser launch caught Vite's temporary missing-font error during installation; reload after installation succeeded. Two overlapping test commands collided on trace output, requiring one serial rerun. No physical-device or Safari verification was performed. Backdrop-filter has a translucent warm fallback on browsers without blur support.

Final serial browser run: all 20 integration and visual tests passed (1.3 minutes). Final frontend typecheck and lint also passed after adding test coverage.

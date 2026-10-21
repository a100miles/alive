# Photography interface dissolve

Implemented 2026-10-21.

The absolute, perspective-transformed reel planes previously extended into the toolbar. Filters were already above the planes, but solid backgrounds hid only the individual labels. Removing those backgrounds alone would expose the collision.

The image layer now has a spatial alpha mask below the actual toolbar bottom, including wrapped rows. A narrow transparent blur layer progressively blends softened image pixels into the fading boundary. No opaque panel, full-gallery blur, additional animation loop or scroll handler is used. The original GSAP pose calculations are unchanged. ResizeObserver measures toolbar layout and disconnects on cleanup. The toolbar and navigation sit above the isolated image layer; the blur cannot sample the filter controls. Reduced motion keeps the static fade and removes blur.

Album buttons stay transparent in normal, hover, focus and pressed states. Selection keeps the existing underline; keyboard outlines and focus restoration remain available.

## Verification

- Frontend typecheck, ESLint, production build and 10 unit tests passed.
- Go test, fmt and vet passed.
- New browser coverage passed at 1440, 768, 390 and 320px: responsive boundary measurements, transparent button states, selected underline, keyboard focus, forward/reverse browsing, fullscreen focus return, reduced motion, Horizontal view and page overflow.
- Wheel browsing passed in both directions.
- Three existing browser tests passed: collection/fullscreen focus handoff; reel wrapping/filtering/page scrolling; vertical drag and synthesized mobile touch without accidental fullscreen opening.
- Desktop/mobile resting and intermediate frames were captured in `.impeccable/reel-interface/` and visually inspected. The centered photograph stays sharp and filters remain clear.

Browser checks used installed Microsoft Edge via Playwright. No physical-device or Safari verification was performed. The gradient's fade lengths and 6px blur are implementation choices; toolbar geometry is measured DOM layout, not a claim about reference Canvas/WebGL internals. No quantitative GPU benchmark was performed.

The existing paper token is #f8f7f3; it was preserved rather than changing the global palette to the request's #F5F2EB.

Affected files: `src/gallery/Photography.tsx`, `src/gallery/photography.css`, `e2e/reel-interface.spec.ts`, this review and root `DESIGN.md`. Earlier home-slider edits remain separate working-tree changes.

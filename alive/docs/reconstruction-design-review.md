# Reconstruction finish review

Reviewed 2026-10-16. Final disposition: **ship this reconstruction with the stated fidelity limits. Both listed interaction issues are resolved.**

This is the bounded independent finish review required by the applied Impeccable workflow. It used `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, Frontend Design, Impeccable's craft floor, and `reference-interactions.md`. The latter and the reference captures take precedence over the earlier design review. `DESIGN.md` was still being updated when inspected.

## Evidence and visual judgment

Inspected all ten paired images in `docs/comparisons`: desktop discs, discs at 350 and 700 ms, mobile discs, desktop/mobile photography, navigation at 150/266/443 ms, and the intro typography hold. Also inspected `referenceMotion.ts`, `useKineticSelection.ts`, `portalRim.ts`, `Intro.tsx`, `SceneRoutes.tsx`, `Photography.tsx`, `photography.css`, `MusicArchive.tsx`, `music.css`, the relevant shared CSS, and `PhotoViewer.tsx` for its focus handoff.

The reconstruction now carries the defining reference relationships: a central oblique disc with diagonal neighbors and a distinct mobile arrangement; a vertical photo reel with native image proportions, peripheral folded planes, synchronized descriptions and an oversized sequence readout; and an expanding aperture that leaves the outgoing scene visible around the incoming route. The neutral ground, a.l.i.v.e typography, demonstration disclosures and local artwork form a coherent integration. Desktop and mobile captures do not show a material collision requiring redesign. The alternative horizontal gallery remains findable.

The intro's single-line a.l.i.v.e signature, local artwork, surrounding controls and reference character omission are intentional brand/content differences. The supplied paired image establishes an equivalent typography hold, not equal total loading duration. It must not be presented as timing proof.

## Resolved findings

1. **Passed: accessible focus restoration after viewer navigation.** The original viewer cleanup restored its opening plane even after reel navigation made that plane nonselected and hidden from accessibility APIs. `PhotoViewer.tsx` now accepts an optional `returnFocus` ref; `Photography.tsx` supplies the stable, focusable reel surface. Closing returns to that accessible surface, whose Enter action opens the currently selected photograph. The horizontal strip retains its original-opener behavior. The root verification pass reports a passing keyboard test covering button-open, next photograph and Escape with focus returning to the reel; it also reports passing keyboard filter-remount focus coverage.

2. **Passed: reduced motion for Track notes.** Both Track notes and active-disc scrolling now use the component's reactive reduced-motion preference to select `instant` or `smooth`. The root verification pass reports a passing test that intercepts the actual Track notes scroll behavior with reduced motion enabled.

The bounded verdict pass re-inspected only these fixes in source; it did not begin another defect search. The root reports all 19 Playwright tests passing, including five visual golden tests without baseline updates. No composition changes occurred after the reviewed comparisons.

## Fidelity and verification limits

No new browser run, detector run, test run or code edit was performed by this reviewer. Source changes were inspected directly; test results above are attributed to the root implementation pass. Static captures alone do not certify touch behavior, focus behavior, route interruption, audio persistence, frame rate or every viewport. The compared desktop and mobile viewport sizes and deterministic RAF offsets are supplied by the capture pass, not independently remeasured here.

The original WebGL camera, deformation, easing and shaders were unavailable. CSS disc/reel poses and the portal shader are original, frame-calibrated estimates. Disc silhouette/tilt is close but not pixel-identical; the local portal's early rim and asymmetry differ visibly from the reference's strongly deformed, chromatically fringed surface. The three navigation frames demonstrate aperture scale progression and outgoing-scene continuity, not recovery of the reference shader. These are declared reconstruction limits rather than grounds to replace the coherent local visual direction. Native photograph aspect ratios must remain intact. No reference artwork or proprietary source is requested for the app.

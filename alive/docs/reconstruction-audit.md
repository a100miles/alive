# Reconstruction audit — independent Assessment B

Date: 2026-10-16. Scope: original loading/reel/disc/aperture reconstruction. Read-only source assessment; no implementation changes, browser interaction, or duplicate test runs. Parent agent owns runtime verification. PRODUCT.md, DESIGN.md, project instructions, Impeccable audit playbook and craft floor informed this review.

## Implementation integrity verdict

Pass at source level. The reconstruction remains specific to an editorial photograph/music archive: natural photograph ratios, physical discs, neutral surfaces, honest sample labels, explicit playback, and original mathematical/shader motion. The detector ran exactly once for this reconstruction and returned `[]`; raw evidence is in `reconstruction-detector.json`. The earlier `design-detector.json` was not reused. Detector silence is not evidence of accessibility or runtime correctness.

## Provisional health score

| Dimension | Score | Evidence and limitation |
|---|---:|---|
| Accessibility | 3/4 | Native dialogs, labeled controls, heading focus, keyboard selection; interruption/focus risks below remain. |
| Performance | 3/4 | Tween cleanup, bounded shader resolution, conditional media loading; no frame-time measurement performed. |
| Theming | 3/4 | Shared neutral tokens; some explicit disc-material and shader colors are intentional local materials. |
| Responsive design | 3/4 | Separate mobile poses, touch-action rules and 44px controls in source; this review did not synthesize touch or inspect rendered layout. |
| Implementation integrity | 4/4 | Coherent content-specific structure; no detector findings. |
| Total | 16/20 | Good, provisional source review rather than a WCAG or rendering certification. |

Original assessment: three actionable source findings, one P1 and two P2. All three are now resolved in the bounded confirmation below. The score above records the original assessment and has not been re-scored through another full audit.

## Bounded resolution confirmation

On 2026-10-16, Assessment B re-read the changed Intro, Photography, PhotoViewer and MusicArchive source plus the three targeted Playwright tests. All original findings are resolved at source level. The parent agent reports the complete 19 browser tests, 10 unit tests, typecheck and lint passing; this reviewer did not rerun those checks and attributes runtime results to the parent.

| Original finding | Status | Confirmed change and runtime evidence |
|---|---|---|
| P1 interrupted intro | Resolved | The media-query change callback permanently clears visible state and marks the intro dismissed when reduction becomes active; initial reduced mode initializes hidden. The targeted test starts Skip with time paused, toggles reduction on/off, advances four seconds, checks that the dialog remains absent and navigates successfully. Parent reports passing. |
| P2 reel focus handoff | Resolved | Photography restores filter and view-switch focus through persistent parent refs/layout effects. PhotoViewer accepts an explicit return-focus ref, supplied as the reel region, and checks that the target remains connected. The targeted test verifies keyboard filter activation, viewer-next-close focus on the region with selection 02, and both view-switch handoffs. Parent reports passing. |
| P2 Track notes motion | Resolved | Both Track notes and active-disc scrolling use the existing reduced preference to select instant/smooth. The targeted browser test records the Track notes request as `instant` under reduced motion. Parent reports passing. |

No detector rerun, code change, fresh broad audit or additional visual inspection was performed by this reviewer. The original findings below are retained as historical rationale, not outstanding work.

## Findings

### Resolved P1 — Interrupted intro exit can leave the modal permanently open

Location: `frontend/src/components/Intro.tsx:16`, `:21`, `:32`, `:45`. Category: Accessibility / interruption integrity.

Validated control-flow risk: `finish()` marks `done.current=true`, but only the reveal timeline completion sets `visible=false`. Changing reduced motion during that reveal runs effect cleanup and kills the timeline. The reduced-motion readiness timer calls `finish()` again, which returns because `done` is already true. If reduced motion is then switched off while the component remains mounted, `visible` is still true and `showModal()` runs again. Skip, Escape and the timeout all call the guarded `finish()` and cannot close it. This can block the archive after a system preference change. The existing reduced-motion test covers route motion, not interrupted intro completion.

Recommendation: make logical dismissal independent of animation completion, or explicitly complete dismissal when reduced motion interrupts an in-progress exit. Add a targeted sequence: start Skip exit, enable reduction before completion, disable reduction, verify the dialog stays dismissed and the archive remains operable. Relevant standard: keyboard operability (WCAG 2.1.1) and the project's dynamic reduced-motion requirement; browser confirmation remains needed. Suggested command: `$impeccable harden`.

### Resolved P2 — Reel changes can lose or restore focus to a hidden photograph

Locations: `frontend/src/gallery/Photography.tsx:41`, `:50`, `:58`; `frontend/src/gallery/PhotoViewer.tsx:12`, `:16`. Category: Accessibility.

Validated source risks share a missing focus handoff. Changing album remounts the entire keyed `PhotoReel`, including the activated filter button, with no focus restoration to its replacement. Separately, opening the viewer from a photograph button, changing photographs inside it, and closing restores the original button even though `goTo(next)` has made that button `aria-hidden=true` and removed it from the tab order. The index-driven focus effect has already run while focus was in the dialog, so it does not correct the final restore. The existing reel test opens from the region and closes without changing photographs; it does not exercise this path. The horizontal-view restore test is a different implementation.

Impact: keyboard users can lose their collection position or land on a photograph excluded from the accessibility tree. Recommendation: preserve the toolbar across selection resets or restore the activated filter explicitly; let the reel provide an appropriate current photograph/region return target when the viewer closes. Verify keyboard filter activation and button-open → next photograph → Escape. Relevant standard: focus order (WCAG 2.4.3); precise browser/AT effect is unverified. Suggested command: `$impeccable harden`.

### Resolved P2 — Track notes always requests animated scrolling

Location: `frontend/src/music/MusicArchive.tsx:71`. Category: Accessibility / motion.

The Track notes handler unconditionally requests `scrollIntoView({ behavior: 'smooth' })`, unlike the active-disc handler at line 63, which checks the motion preference. The CSS reduced-motion rule sets `scroll-behavior:auto`, but an explicit JS smooth request does not use that CSS default. Users requesting reduced motion can still receive a long viewport scroll from this desktop control.

Recommendation: use the existing `reduced` value for `instant` versus `smooth`, shared with the disc action. Verify under reduced motion at the desktop viewport where the control is displayed. Relevant requirement: project reduced-motion policy; WCAG 2.3.3 is AAA, so this report does not mislabel the issue as an AA violation. Suggested command: `$impeccable animate`.

## Positive findings and boundaries

- The route overlay is inert and hidden from assistive technology; the committed route receives heading focus and restored scroll position. Route replacement kills its timeline and disposes WebGL resources. Missing WebGL preserves the semantic aperture fallback.
- Kinetic controls kill replaced tweens, clear wheel timers, and handle pointer cancel/lost capture. Reduced motion snaps to the intended selection. Off-media vertical touch remains page scrolling on the reel; music permits vertical touch through `pan-y`; bounded music wheel navigation releases outward scroll at its endpoints. No global scroll lock exists except the modal photo viewer, which restores prior overflow. Actual gestures and window-blur interruption were not exercised here.
- Browsing selections never calls `audio.choose()`. Playback requires explicit controls, and AudioProvider remains separate from route instances, validates playable tracks, guards stale play promises and cleans up listeners. Incoming routes therefore do not intentionally autoplay audio.
- The reel exposes a live caption even where its large visual descriptions are hidden from assistive technology. Buttons and Home/End/arrow controls preserve keyboard access to selection.
- Existing Playwright source covers navigation, route interruption, mobile touch synthesis, audio persistence, failures, reel wrapping and screenshot comparisons. Reading tests does not establish their results; use the parent agent's actual run evidence.

## Recommended bounded action

The recommended fix batch and targeted confirmation are complete. No outstanding action remains from these three findings. Retain the parent agent's runtime evidence and this source confirmation; do not interpret this report as authorization for another broad visual redesign or repeated detector runs.

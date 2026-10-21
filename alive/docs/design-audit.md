# Independent technical design audit

Assessment B, 16 October 2026. Scope: `frontend/src`, PRODUCT.md, DESIGN.md and the installed Impeccable audit/craft-floor guidance. No app code was changed by this assessment.

## Implementation integrity verdict

**Pass.** The implementation expresses the requested editorial archive through native-ratio photographs, an overlapping CD collection, restrained typography, neutral surfaces and honest demonstration labels. Native controls, labelled dialogs and explicit audio actions support the content. It is not a generic card interface.

The detector ran **once**, with `detect --json alive/frontend/src`, and its exact JSON result is saved in `design-detector.json`: `[]`. There are zero detector findings to validate or dismiss. A clean detector is not proof that behavior or accessibility is complete; the findings below came from source inspection.

## Audit health score before the corrective pass

| Dimension | Score | Evidence |
|---|---:|---|
| Accessibility | 3/4 | Semantic controls, keyboard routes, dialog focus restoration and strong token contrast; interrupted motion preference change needs a final-state reset. |
| Performance | 3/4 | Lazy/async photographs, explicit dimensions, GSAP cleanup; idle disc layer hints remain. |
| Theming | 4/4 | Coherent intentional single theme; no dark-mode requirement. Material-specific disc colors are purposeful. |
| Responsive design | 3/4 | Inspected desktop/mobile captures retain content hierarchy; footer link lacks the specified 44px target. |
| Implementation integrity | 4/4 | Product-specific structure, truthful sample content and clean detector result. |
| **Total** | **17/20 — Good** | Address the bounded issues below. This is an audit judgment, not WCAG certification. |

## Findings

**Initial findings: P0: 0. P1: 0 verified. P2: 2. P3: 1.** No blocking defect was demonstrated in this independent pass. All three recommendations below were subsequently applied by the parent and confirmed in source. The parent reports that all nine final Playwright tests passed and desktop/mobile captures were refreshed. The 17/20 score records the original audit rather than claiming a fresh post-fix score.

### P2 — Reduced-motion changes can retain an interrupted scene style

- **Location:** `frontend/src/components/SceneRoutes.tsx:28–38`.
- **Category:** Accessibility / animation state.
- **Evidence:** The entrance sets main opacity from 0.5 and y from 18. An update to `reduced` kills that timeline; the reduced branch resets only the curtain. It does not put main content into its final opacity/position.
- **Impact:** If the system preference changes during the 600ms entrance, content can remain faded or offset until a later normal entrance. This is a source-verified conditional path; it was **not reproduced in the browser** during this audit. No specific WCAG failure is claimed without exercising it.
- **Recommendation:** Set main content to opacity 1 and y 0 in the reduced branch, then check a preference change during the entrance. Suggested command: `$impeccable animate`.
- **Correction — resolved:** Confirmed `gsap.set(content.current, { opacity: 1, y: 0 })` in the reduced branch. The parent reports that the final browser test changes motion preference during navigation and passes assertions for main opacity 1 and translation 0.

### P2 — Footer home link has no 44px target guarantee

- **Location:** `frontend/src/styles.css:86`, `.footer-brand`; `frontend/src/App.tsx`, footer link.
- **Category:** Responsive / touch accessibility.
- **Evidence:** The anchor has 26px type and no padding, minimum height or flex alignment. Its visible line box in the inspected mobile capture is smaller than the project's 44px target specification. The footer's outer padding does not enlarge the anchor's clickable area.
- **Impact:** The small home target is less forgiving for touch. This is a project requirement gap; it is **not asserted as a WCAG 2.2 AA target-size failure**, whose criteria differ.
- **Recommendation:** Give the anchor an inline-flex 44px minimum hit area while retaining the current lettering. Suggested command: `$impeccable adapt`.
- **Correction — resolved:** Confirmed `min-height: 44px; display: inline-flex; align-items: center` on the footer anchor. The parent reports that the final desktop/mobile review captures were refreshed and all nine browser tests passed.

### P3 — Every disc retains `will-change` while idle

- **Location:** `frontend/src/music/music.css:8`, `.archive-disc`.
- **Category:** Performance.
- **Evidence:** `will-change: transform` is permanent on every rendered release, including discs faded outside the visible group.
- **Impact:** This requests retained rendering resources when idle and may become wasteful as the collection grows. The current four-disc archive showed no demonstrated slowdown; this is an optimization opportunity, not a measured performance bug.
- **Recommendation:** Remove the standing hint or scope it to active motion after profiling. Suggested command: `$impeccable optimize`.
- **Correction — resolved:** Confirmed the permanent `will-change` declaration was removed. No performance gain is claimed without profiling.

## Distillation opportunity

Music repeats demonstration status in the release facts, artist, description, track summary and footer. The inspected mobile screenshot makes that repetition visible. Preserve a clear demo disclosure and the truthful audio description; reduce duplicate labels if the parent review agrees. A release-level play action and transport play/pause also coexist after selecting audio; these serve different stages but could share one consistent primary action. These are optional design judgments, not counted technical defects. Suggested command: `$impeccable distill`.

## False-positive checks and positive evidence

- The mobile expand symbol is 36px, but it is a decorative span inside a full-image button; it is not a 36px interactive target.
- Photography handles touch with native horizontal scrolling and `touch-action: pan-x pan-y`; its mouse-only custom drag branch does not imply mouse-only access. Music uses pointer events, `pan-y`, capture and cancellation. Real device gesture quality remains untested by this reviewer.
- The global `.01ms` reduced-motion CSS rule is broad, but it is supplemented by explicit intro, carousel and scene alternatives. It is not itself evidence of destroyed feedback here. The interrupted scene path is the specific concern above.
- Single-theme design is intentional. Disc gradients, masks and metallic colors express a physical CD; they are not token-drift findings. Large branding is explicitly requested.
- Computed from the declared color values: muted `#62625b` on paper `#f2f0eb` is **5.40:1**; ink on paper is **15.74:1**; viewer secondary `#bdbcb5` on `#171717` is **9.41:1**. This does not substitute for checking every rendered state.
- PhotoViewer records/restores opener focus, uses native modal behavior and restores body overflow. Navigation uses native dialogs, visible focus and labelled controls. Main route headings receive focus after navigation.
- Audio begins only through explicit play actions, persists in one provider, exposes named seek/volume controls, provides recovery messages, and cleans up listeners/audio on teardown.
- Photographs provide alt text, intrinsic dimensions, lazy loading and async decoding. Six source JPEGs range from about 58KB to 458KB. The current emitted JS file is about 367KB uncompressed; no claim about runtime speed or compressed delivery is made.
- Compact mobile player arrow targets were observed changing from 40px to 44px during the parent task. The current 44px source is treated as resolved and is excluded from findings.

## Evidence limits and recommended actions

This was a bounded source audit plus visual inspection of the existing `music-mobile.png` (390px wide) and `photography-desktop.png` (1440px wide), captured by the project's current review suite on 16 October. The Playwright configuration targets headless Microsoft Edge/Chromium. The suite source includes synthesized touch, navigation, audio and reduced-motion checks; this assessment **did not independently rerun that suite or infer passing results from its existence**. The parent owns final test results and all-route visual review.

No physical phone, screen reader, WebKit/Firefox, CPU/network profile, 200% text zoom or live animation-interruption test was performed here. Responsive score does not certify those conditions. Source was being refined concurrently; this report records the inspected state and should be reconciled with the final changes.

The parent has applied the recommended `$impeccable animate`, `$impeccable adapt` and `$impeccable optimize` corrections and reports **9/9 final Playwright tests passing** after those changes. This includes the motion-preference interruption assertion; refreshed desktop/mobile screenshots are available. These test results are attributed to the parent, not independently rerun by this reviewer. All three audit findings are resolved within the bounded pass; `$impeccable distill` remains optional. No new detector run, defect search or broader accessibility/performance certification was performed. The existing `$impeccable polish` pass is the final workflow step.

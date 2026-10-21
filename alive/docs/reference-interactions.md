# Reference interaction reconstruction

Inspection date: 2026-10-16. This record supersedes the earlier screenshot-only reference review. The implementation is being reconstructed from the current live sites and the three supplied recordings, not from their private source.

## Tools and evidence

- Chrome DevTools MCP is not exposed by this session. No claim is made that it was used.
- The official Playwright CLI skill was found at `frontend/node_modules/playwright-core/lib/tools/skills/playwright-cli/SKILL.md`, read, and used through `node node_modules/playwright/cli.js cli -s=alive-reference`.
- An isolated Edge/Chromium browser performed real navigation, hover, pointer-down/move/up, wheel, clicks and viewport resizing. DOM rectangles, computed transforms/opacity/filter/clip paths, `document.getAnimations()` and requestAnimationFrame samples were collected. CDP is used for touch experiments.
- Desktop: 1440×900. Mobile: 390×844. PNG filenames contain requested offsets, while JSON records **actual** elapsed time. Screenshot overhead is significant for these WebGL scenes; nominal filename time must not be mistaken for exact capture time.
- `docs/references/{a24,huy,jesper}-interactions.json` and `jesper-navigation.json` contain raw measurements. Frame evidence is in the workspace `.impeccable/reconstruction/`.
- Supplied videos are 2560×1440: `19-57-37` = Jesper (13.333s), `19-58-03` = A24 (17.685s), `19-58-29` = Huy (14.571s). Frame sheets and samples are in `.impeccable/reconstruction/recordings/`. Browser chrome and occasional recording-software windows are excluded from visual geometry judgments. No reference imagery is shipped in the app.

## Huy: introduction and photography reel

**Initial state:** black full viewport, followed by a light field moving across a large stationary two-line name. The original has a proprietary illustrated figure moving with the reveal edge.

**Trigger:** navigation/reload. **Intermediate states:** at the 4.001s sample the light field occupies approximately 70% of the width, clipping the remaining text against the black side. **Final state:** at 8.008s the main gallery is visible. The visible duration includes asset loading; it is not a measured authored timeline length. A Rive `uvs` error appears, but this run did reach the gallery.

**Gallery geometry:** central image plane near (0.49W, 0.50H), roughly 0.26W wide, with native aspect-ratio variation. Earlier planes fold toward the upper right; later planes stack toward the lower left. A right-hand text list follows selection; an oversized sequence readout at lower left briefly blurs during movement. The supplied recording confirms this is a vertical perspective reel, not a flat horizontal card slider.

**Drag/scroll:** vertical wheel advances the continuous collection; the recording wraps from the end to the beginning. The generic horizontal drag experiment also triggered project selection on release, so it is not evidence of a horizontal drag carousel. A dedicated vertical experiment is recorded separately. Hover and click open project-detail behavior; the local equivalent will open the fullscreen photograph without changing the content API.

**Animation properties/easing:** rendered planes/text are principally Canvas/WebGL. The inspected canvas has an identity CSS transform; no observable CSS keyframe describes the reel geometry. Thus planar poses, perspective, damping and blur are **frame-derived estimates**, not extracted proprietary constants. Loading/reel timing is bounded by actual frame timestamps; implementation values will be calibrated against those frames.

**Implementation approach:** original GSAP-controlled scalar position drives image-plane transforms and synchronized metadata. Preserve full image proportions, keyboard/fullscreen support and reduced motion. Default to the observed reel, retaining the prior horizontal strip as an explicit alternative to preserve the original horizontal-gallery requirement. Recreate the typographic panel reveal with a.l.i.v.e branding, omitting the reference character.

**Verification status:** implemented and compared at 1440×900 and 390×844. The local desktop photograph is 374.4px wide, centered at (698.4,449.3); the live reference image is about 375px wide and centered near (706,450). The local mobile image is x=78.0–312.0, y=359.0–514.9, compared with the reference's approximately x=81–319, y=360–515. Different native image ratios explain the desktop height difference; neither image is distorted to improve a score. Keyboard wrapping, filtering, fullscreen navigation, pointer dragging and synthesized touch are exercised by the integration suite.

The focused loading experiment shows a full typography hold at approximately 5.49–5.99s after navigation and a **top-to-bottom clipping reveal** of the gallery around 6.97s. The text itself does not translate upward. The local intro therefore uses a left-to-right paper reveal, a stationary wordmark, then a top-to-bottom clipping reveal with coordinated landing elements. Asset waits are not simulated: the local readiness deadline is 3.2s plus a bounded exit, and Skip Intro/reduced motion can shorten it. The proprietary figure is omitted, and the warm-cache total duration is intentionally shorter than the recorded reference's asset-dependent load.

A fresh mobile Huy load was also captured (`huy-mobile-gallery.png`): the active photograph sits around x=81,y=360,w=238,h=155, with neighboring planes peeking from opposite corners. The local mobile poses were revised to follow that topology. The original horizontal archive remains available through Horizontal view.

## A24: physical disc archive

**Initial/final geometry:** at 1440×900, active disc projects to an oblique ellipse approximately x=484–1014, y=184–734, while its central hole sits close to viewport center. The next disc is larger and higher to the right; the previous disc is smaller and lower to the left. After one wheel step, previous artwork occupies approximately x=68–495, y=368–786. These are frame-derived bounds, not DOM rectangles.

**Trigger:** wheel, selection and responsive viewport change. **Intermediate states:** a 450px vertical wheel event begins moving the diagonal depth sequence; active metadata switches by the 377ms actual sample. Motion is near its settled pose by the approximately 0.8–1.2s samples. **Final state:** next release occupies the same central pose; prior release remains visible. Horizontal pointer dragging in the controlled desktop experiment did not advance selection. Hover adds a drawn contour around the active disc. Clicking the active disc opens a detail route; metadata lines reveal progressively.

**Animation properties/easing:** the discs render inside one full-viewport WebGL canvas. Available DOM styles expose navigation opacity transitions of 0.3s cubic-bezier(0.32,0.72,0,1), but these must not be misreported as the disc easing. Disc settle duration and curve must be estimated from frames. No CSS transform exposes the original disc rotations or camera focal length.

**Responsive:** at 390×844 the active disc occupies approximately x=81–321, y=299–547. Metadata spans the top; navigation is near the bottom. A neighboring disc peeks from the right with reduced apparent size. This is not the desktop layout merely scaled down.

**Implementation approach:** perspective-projected circular artwork, transparent central hole, stepped hub, metallic perimeter, diagonal position/depth/scale, continuous interpolated movement and synchronized release details. Retain pointer/touch and keyboard access as local usability additions, plus explicit audio playback. Use licensed local photos with original a.l.i.v.e disc typography; no A24 artwork or audio. Expose full controls below the scene so page scrolling remains possible outside the browsing surface.

**Verification status:** implemented, calibrated and compared using live desktop load/hover/drag/wheel/selection/back plus fresh mobile captures. The local active disc's projected bounds at 1440×900 are x=480.4–1005.0, y=183.7–728.5. Compared with the frame estimate x=484–1014,y=184–734, maximum edge deviation is about 9px (0.63% viewport width). At 390×844, local bounds are x=87.2–324.4,y=304.9–551.2, versus approximately x=81–321,y=299–547; the largest deviation is about 6px. These are projected contour/bounds comparisons, not whole-image pixel scores.

The first local pass was too tall (631px versus approximately 550px) and overlapped neighbors too much. The tilt was adjusted to a fitted CSS projection, and neighboring x/y spacing now changes with depth. `disc-calibration.json` records an inverse fit to observed bounds; it does not identify the reference's actual camera or rotation constants. Final desktop CSS rotations use approximately 49° X / −31° Y / −23° Z, with shallower Y rotation for receding discs. Metadata rows reveal in sequence. A browser-native contour responds to hover; its exact line wobble and hover-retention behavior differ from the reference's WebGL-drawn contour.

The controlled mobile vertical-touch experiment did not advance the A24 selection; no stronger original gesture claim is made. The local archive deliberately retains functional horizontal touch/pointer drag and keyboard controls. Wheel navigation is scoped to the scene and yields page scrolling at either finite end. Selecting a centered disc scrolls to track notes rather than starting audio or copying A24's film-detail route.

## Jesper: navigation and continuity

**Initial state:** persistent controls in four corners and a curved media stage. At 1440×900, the accessible article geometry has a 391.5px height (43.5svh), centered vertically at y=254.25; the visible curvature is rendered separately.

**Triggers inspected:** Profile/open-close, Featured→Full→Featured, project open and browser back, mobile Profile.

**Intermediate/final states:** Profile opens a large distorted circular aperture while the neighboring work remains visible, then reveals centered text inside it. Full navigation expands the aperture beyond the viewport: at 266ms the portal is approximately 60% viewport width, at 659ms it is covering the screen with staggered text still entering, and by 1.816s the full index is settled. Project selection expands into a large inset detail surface. Global controls remain fixed.

**Properties/easing:** the visual aperture and text are WebGL-rendered. Runtime DOM paragraphs retain opacity zero even while their rasterized equivalents are visible, so their computed opacity cannot be used to infer the displayed easing. The measured DOM navigation positions are persistent; aperture radius/warping and visible text timing are derived from frames. Any local GSAP curve is a calibrated estimate, explicitly not a recovered original parameter.

**Responsive:** desktop media stage becomes a vertical sequence at mobile width. The smaller Profile aperture is inspected separately. Avoid copying the reference's unrelated grid, miniature figures or artwork.

**Implementation approach:** replace the generic curtain with a center-out, mildly irregular aperture and a textured rim using local media; keep outgoing content visible around the incoming scene until the aperture covers it. Coordinate text/image reveals and preserve the existing router, persistent player, history, interruption cleanup and reduced-motion final states.

**Verification status:** all named navigation experiments and intermediate screenshots captured. The sliding curtain was replaced by an expanding irregular aperture with a small original WebGL rim shader sampling local artwork. Outgoing and incoming scenes coexist while the aperture grows; navigation and audio remain mounted. Heading reveals, focus handoff, history, rapid changes and reduced-motion interruption are integrated.

Deterministic Playwright clock comparisons remove screenshot-command latency. At equal 150/266/443/659ms offsets, the local normalized aperture radius is approximately 0.104/0.436/0.829/0.981. These values were fitted to the observed opening/coverage progression; the local curve is cubic-bezier(0.4,0,0.18,1), approximately 0.8s, **not** an extracted original easing. Reference and local paired frames are available at 150,266,443ms. The local rim and early deformation visibly differ: it samples local photography rather than refracting the reference's entire curved WebGL stage. This is an original, frame-calibrated reconstruction, not shader-level equivalence.

## Comparison and regression artifacts

- [Open the paired comparison gallery](comparisons/index.html): ten pairs, with identical viewport dimensions and labeled timing/phase.
- Resting geometry pairs cover both desktop and mobile. Wheel and aperture pairs use Playwright's virtual animation clock, quantized to roughly one 16ms animation frame.
- The intro pair compares the typography-hold phase rather than pretending different asset loads have the same elapsed time.
- `frontend/e2e/reconstruction.visual.spec.ts` stores four local composition baselines and a 266ms aperture baseline. These protect the reconstructed app against later regressions; they are **not** pixel-equivalence tests against different reference artwork and branding.
- `capture-reconstruction.mjs`, `local-clock.mjs`, `compare-reference-frames.mjs`, and the reference CLI scripts reproduce the evidence. The original MP4 files stay at the supplied local paths.

## Inspection and implementation limits

No reference source or proprietary shader was copied. Canvas-only properties are estimated from observed frames, while directly inspectable DOM styles are identified as measured. The original sites can change and exhibited runtime warnings; the dated evidence is the authority for this implementation. Playwright's screencast API failed after a missing-helper error left it in a stale recording state; timed PNG sequences and the supplied videos were used instead. No successful live-video recording is claimed.

Desktop/mobile rendering and synthesized Chromium touch are tested; no physical-phone, Safari or screen-reader-specific certification is claimed. The neutral palette, a.l.i.v.e typography, local licensed photographs, original disc printing and functional music controls are intentional adaptations. The reference's copyrighted figure, film artwork, floating objects, perspective floor grid, reviews and unrelated text are not part of the application.

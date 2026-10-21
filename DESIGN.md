---
name: a.l.i.v.e
description: An unbound artist's edition of photographs, sound and memory.
colors:
  paper: "#f8f7f3"
  ink: "#171717"
  muted: "#60605b"
  quiet: "#eeece6"
  line: "#d8d6cf"
  curtain: "#e8e5dc"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(58px, 7.4vw, 112px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  square: "0"
  disc: "50%"
spacing:
  gutter: "clamp(20px, 3.1vw, 52px)"
  small: "8px"
  medium: "24px"
  large: "40px"
components:
  play-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.disc}"
    width: "44px"
    height: "44px"
  text-link:
    textColor: "{colors.ink}"
    padding: "9px 0"
    height: "44px"
---

# Design System: a.l.i.v.e

## Overview

**Creative North Star: "An unbound artist's edition"**
An unbound artist's edition: photographs sit at their natural proportions, loose memories share a page with sound, and navigation moves like turning between exhibition rooms. The opening pairs a monumental, tightly composed `a.l.i.v.e` signature with an asymmetric photographic spread. Media, not containers, defines the composition.

Seven considered sources: an artist's monograph; contact-sheet editing; a listening-room wall; an unbound artist's edition; cinema intertitles; a travel notebook; a museum accession register. The fourth carries both still images and physical discs without imitating equipment. Impeccable seed: seed:ee5d701eb94e37ee. Catalog challengers were reviewed; their saturated colors, figurative ornament, terminal aesthetic or virtual-room framing conflict with the user's explicit restrained photographic brief. Keep their discipline of continuous state and clear active layers, not their styling.

The user explicitly delegated sensible design decisions and requested incremental working code. This session builds directly in code from that binding brief; no permanent comp/code preference was inferred or stored. No mockup approval is claimed.

## Colors

Warm paper and charcoal provide the field; secondary text remains readable. Quiet surfaces indicate hover or missing media. Hairlines group controls. A slightly darker curtain connects pages. The frontmatter records the values actually used in styles.css.

**The Content Color Rule.** Do not introduce an accent palette when photographs already carry color.

## Typography

Self-hosted DM Sans handles interfaces and body; Bodoni Moda handles the signature and display. Latin subsets are shipped with their OFL licenses. The home wordmark uses `clamp(112px, 21.5vw, 340px)` and 0.95 line-height, changing to 27vw on mobile. Its scale follows the explicit oversized-branding requirement. Route display uses the frontmatter scale; music headings have a 6rem cap. Body ranges from 15–21px according to hierarchy; metadata is 11–13px sentence case. Time and sequence use tabular numerals. Tracking never exceeds the -0.04em lower bound.

## Layout

The shared gutter is `clamp(20px, 3.1vw, 52px)`. Home uses an asymmetric photographic spread; the listening area and artist statement use two columns. At 600px home becomes a primary landscape and smaller portrait detail, and navigation becomes a native dialog. Very wide home/about/contact surfaces cap at 1640px; the listening section caps at 1220px. Photography defaults to a centered perspective reel with synchronized side metadata; Horizontal view preserves the native scrolling strip. Music uses a viewport-scale diagonal depth scene, with metadata at the upper left and complete listening controls below. Mobile geometry is derived separately, not simply scaled from desktop.

## Elevation & Depth

Page surfaces remain flat. Only discs use subtle lower shadows, central masks, material highlights and overlapping z-order. The fullscreen viewer uses an inverse field. No raised card system or decorative glass is present.

## Shapes

Photography remains rectangular and uncropped. Circular geometry belongs to discs and transport controls. Fine separators mark collections, track rows and page boundaries. Focus rings are distinct from hover feedback.

## Components

An original aperture replaces the earlier sliding curtain. Its fitted cubic-bezier(0.4,0,0.18,1) expands over approximately 0.8s; a small WebGL shader remaps local artwork around the edge. Outgoing content remains around the incoming scene until coverage completes. The header and audio provider remain mounted. Reel/disc position is continuous, with 0.14s pointer-follow and approximately 1.05s power3-out settling; these are frame-calibrated estimates, not reference source constants. Reduced motion skips spatial choreography. Audio never starts from browsing. Evidence and deliberate differences are recorded in `alive/docs/reference-interactions.md`.

Navigation is plain text with a current marker. Large framing respects complete photo ratios. Dialog viewer traps focus and restores its opener. Interactive targets >=44px. Persistent player is compact and unobtrusive. Empty and failed media have useful recovery copy. All demo works are labeled. Unconfigured contact destinations are plain text, never broken links.

The intro is a bounded native dialog: a dark initial field, left-to-right paper reveal over a stationary wordmark, then a top-to-bottom clipping reveal. It responds to actual asset readiness, Skip Intro and reduced motion. Changing motion preferences cannot reopen a dismissed intro. The reel confines custom wheel/touch browsing to its media/focused region; outside it, the page can scroll normally. Collection/view switches preserve focus, and the reel's fullscreen viewer returns to its accessible region after selection changes. The compact player stays mounted between routes; returning through its track link selects the current release. Native range controls provide seek and volume with a 44px hit area. Failed covers have a neutral disc fallback.

## Do's and Don'ts

- **Do** let full photo proportions set the frame.
- **Do** keep keyboard, touch and reduced-motion functions equivalent.
- **Do** retain demo disclosures until actual owner content replaces the samples.
- **Don't** add SaaS cards, decorative icon grids, glassmorphism or neon gradients.
- **Don't** invent personal facts, contact destinations or authorship claims.
- **Don't** scatter decorative motion across a page that already has a coordinated scene transition.

## Requested motion refinement � 2026-10-21

The home signature now uses self-hosted Caveat (OFL) with a 1.6-second left-to-right reveal, deferred until the intro closes. Selected discs draw two imperfect graphite contours over 1.53 seconds and turn gently into place over 2.8 seconds. Motion is finite and repeats on release selection; browsing never starts audio. Reduced motion renders the final state immediately.

Navigation retains the calibrated aperture geometry and persistent header/player, replacing the outlined WebGL rim with a borderless frosted-glass layer (18px backdrop blur). Decorative disc contours are hidden in both scenes throughout navigation. Focus indicators return with focus handoff after the transition. The user's explicit glass request supersedes the earlier prohibition for this transition only.

## Notebook typography and film layout � 2026-10-21

Indie Flower replaces the earlier display faces for h1�h6 and the home signature; Cutive Mono is the general text and navigation family. Both are self-hosted Google Fonts distributions with OFL licenses in public/licenses. The home spread uses one film area instead of photographs. Native video controls preserve touch/keyboard access and no autoplay; playback pauses offscreen or when the document is hidden. The original video aspect ratio is preserved after metadata loads.

Page sections reveal between 96% and 72% of viewport height, reversing as visitors scroll back above that range. GSAP ScrollTrigger is scoped to ordinary content sections; reconstructed reel and disc transforms remain independent. Focus within a section forces it visible, reduced motion clears animation, and effects clean up on route changes.

Asset configuration: `site.logo` and `site.homeVideo` in frontend/src/config.ts await the user's source paths. The attached logo is visible in chat but no corresponding accessible file was found in the workspace. Until supplied, navigation keeps its text fallback and the film area shows an honest empty state.

## Film carousel and reference hover refinement — 2026-10-21

The user explicitly authorized muted home-video autoplay for this refinement. Music remains manual. Five supplied 960×1280 MOV films replace the entire home spread; two layers dissolve over 700ms, with current/next loading only. The complete 3:4 image remains visible. Tap/click or Space pauses; arrow keys change films. Hidden/offscreen media pauses. Reduced motion starts paused and disables automatic advance.

Disc artwork no longer spins on selection. The established depth scene remains; two broken graphite contours orbit only on hover or keyboard focus, with a static selected outline on touch. Navigation keeps its routes and menu with a current-page dot, restrained color feedback and an intro-aware clipped label entrance. A faint, once-generated noise tile shifts in CSS steps; reduced motion freezes it. These are frame-calibrated adaptations of the supplied A24 recordings, not recovered shader constants. Evidence, modified files and verification are documented in alive/docs/film-refinement-review.md.


## Continuous film strip and milk palette - 2026-10-21

The home film presentation now moves continuously left at 32 CSS pixels per second. Each physical video wraps only after its full frame leaves the left edge, re-entering offscreen on the right; there is no slide snapping, crossfade or visible track reset. The five supplied portrait films share a responsive height and retain their original ratios. Videos sit directly adjacent with no layout gap. A horizontal alpha mask fades the outer 4% into the page without blurring the image centers. Only visible films play; near-edge films preload and distant sources detach. Tap or Space pauses without visible controls. Reduced motion uses a stationary, natively scrollable strip with manual playback and arrow-key browsing.

Paper is now a low-saturation milk tone (#f8f7f3), with coordinated quiet, line and curtain tokens. HTML, scene surfaces, selection and the glass overlay use the shared palette. Film grain remains a once-generated 192px monochrome tile, with stronger alpha and 0.42 base opacity; stepped positional changes and slight irregular opacity changes make the texture visible without per-frame noise generation. Hidden tabs stop it and reduced motion freezes it. Disc and navbar animations and scroll-reveal logic remain unchanged.


## Dark listening section and disc navigation - 2026-10-21

The home colophon is removed. The listening section now occupies a full-width charcoal band from the former upper divider to the footer boundary, with milk text and muted light metadata. The boundary lines and local CTA rule are removed. Its content retains the reversible scroll reveal; the dark field itself stays solid. Demo identification remains in the footer and archive.

The film strip has sharp edges without masks or gradients. The new fixed, pointer-transparent top frost uses a 12px backdrop blur and vertical gradient mask behind the navigation. Its opacity follows scroll position from zero at the page top to full effect at 180px, with no time-based scroll interpolation or scroll interception. It uses the current milk token rather than the attachment's outdated color example.

Activating the home disc starts a 300ms accelerating spin before routing. The same visible disc then moves into the incoming Music scene, adopting its established plane, perspective, hub and printing. Rotation/movement settle over 820ms, followed by a short handoff hold within a 1.2-second transition. The existing aperture remains the background transition. Transform translation and perspective use separate wrappers to avoid projection distortion. Normal archive contours and browsing remain unchanged. Keyboard activation, touch, reduced-motion interruption, duplicate clicks and history cancellation are handled; reduced motion goes directly to the selected release without spinning.

## Owner collections and frosted film perimeter - 2026-10-21

The entire photo catalog now uses the owner's 48 supplied images: Blue hour (5), Motion in frames (5), Summer 2025 (19), Arrakis (9) and Summer 2026 (10). Their titles, descriptions, exact source mappings and dimensions are recorded in alive/docs/photo-catalog.json and the illustrated HTML catalog. Dates follow collection folders, locations are not guessed, and intentional collage, inversion, grain and borders are retained. Web copies are byte-identical originals at safe ASCII URLs. Sample photos are removed from public assets and replaced on the gallery, About page and all disc artwork. Music remains demo audio with its existing disclosures.

Four narrow, pointer-transparent frosted strips soften the top, bottom, left and right of the home film area. Each uses 7px backdrop blur, a restrained milk tint and an inward gradient mask; the center remains sharp. This explicit request supersedes the previous sharp-perimeter direction. The continuous zero-gap movement, pause behavior and reduced-motion alternative remain intact.

The larger photo reel loads at most nine nearby images, preserving its existing geometry and wrap behavior. Collection filters wrap appropriately on tablet and retain a paper backing for contrast over passing image planes. The owner's supplied photo library is now the required source for future imagery.

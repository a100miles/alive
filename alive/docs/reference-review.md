# Reference review

**Superseded for interaction fidelity:** the subsequent live experiments, supplied recordings, clock-controlled comparisons and implementation measurements are recorded in [reference-interactions.md](reference-interactions.md). This earlier report remains as an honest record of the initial, limited inspection.

Reviewed the currently accessible versions on 16 October 2026. No historical version was used. The initial text-only review was supplemented by direct screenshots using headless Microsoft Edge through the installed Playwright test tooling.

| Reference | Verified evidence | Adaptation in a.l.i.v.e |
| --- | --- | --- |
| [Huy Phan](https://huyml.co/) | The captured intro uses very large red serif name lettering, a monochrome illustrated figure, and adjoining white and black areas. The page's text contains numbered selected work, categories and captions. The browser logged a Rive-related `uvs` error, and the bounded capture remained in the intro. | Keep the wordmark central to an orchestrated reveal; retain the brief's original neutral a.l.i.v.e identity. Carousel geometry and intro completion could not be verified in this run. |
| [A24 archive](https://a24.raviklaassens.com/) | An off-white textured intro reveals a thin edge-on disc. At mobile width, a large tilted disc with printed artwork, a central hole and metallic hub becomes visible, with a neighboring disc partly visible on the right. Title/director/year/cast sit above it; navigation sits near the bottom. The [creator's September 2026 case study](https://www.raviklaassens.com/work/a24) also confirms physical-media browsing and opening contextual details. | Physical circular discs with central holes, spatial placement, active-item emphasis and synchronized release details. Browsing does not start playback. |
| [Jesper Landberg](https://jesperlandberg.com/) | Desktop shows a black spatial stage, a perspective floor grid, and very large curved project-image panels across the center. Small name/Profile controls stay at the top corners and Featured/Full/Newsletter controls at the bottom corners. After resizing to mobile width, the work reorganizes into a vertical list of rounded image previews while corner navigation remains. | Persistent navigation and coordinated scene changes remain appropriate. The brief's light palette is preserved; Jesper's black stage and grid are not copied. The exact page-navigation transition was not exercised. |

## Screenshot evidence

Each site received one successful page load at 1440 × 900, followed by a viewport resize to 390 × 844 in the same session. These are responsive-width observations, not independent mobile-device launches or touch tests. Initial and later screenshots were opened and visually inspected. The script samples again after a short bounded delay; the `settled` filenames do not guarantee the reference has completed its loader.

| Reference | Desktop initial / later | Mobile initial / later |
| --- | --- | --- |
| Huy Phan | [Initial](references/huy-desktop-initial.png) / [Later](references/huy-desktop-settled.png) | [Initial](references/huy-mobile-initial.png) / [Later](references/huy-mobile-settled.png) |
| A24 | [Initial](references/a24-desktop-initial.png) / [Later](references/a24-desktop-settled.png) | [Initial](references/a24-mobile-initial.png) / [Later](references/a24-mobile-settled.png) |
| Jesper Landberg | [Initial](references/jesper-desktop-initial.png) / [Later](references/jesper-desktop-settled.png) | [Initial](references/jesper-mobile-initial.png) / [Later](references/jesper-mobile-settled.png) |

The sandbox initially denied network access. The authorized retry succeeded with HTTP 200 responses for all three sites. Huy's first desktop frame and Jesper's first desktop frame are black; Huy's later frames remain inside its intro, and A24's later desktop frame also remains inside its intro. Those captures are evidence of observed loading states, not complete layouts. A24's mobile frame and Jesper's later desktop/mobile frames expose the usable compositions described above.

The bounded inspection did not measure easing, drag inertia, precise animation durations, or route-change timelines. The supplied brief remains authoritative for those behaviors. These are original implementations of the interaction specifications, not a claim of exact visual reproduction. Reference screenshots are research evidence only; no reference artwork, audio, branding or proprietary source code is used in the application.

Reproduction script: `frontend/e2e/reference-inspection.mjs` (run from `frontend`; requires Playwright, system Edge and network access).

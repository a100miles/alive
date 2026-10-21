# a.l.i.v.e

A personal creative archive of photography and music. React + TypeScript + Vite + Tailwind CSS + React Router + GSAP, backed by a small Go content API. All bundled works are **demonstration media**, not the owner's photography or compositions.

## Run locally

Requires Node.js 22.12+ (tested with 24.11), npm and Go 1.24+.

```powershell
cd "C:\Users\ASUS\Desktop\pre-hackaton prep\alive"
npm --prefix frontend ci
npm run dev
```

Open http://127.0.0.1:5173. The launcher starts Vite on 5173 and Go on 8080; Ctrl+C stops both. The API must be running: there is deliberately no silently substituted frontend fixture dataset. Ports already in use must be released or the dev proxy adjusted.

Alternatively use two terminals:

```powershell
cd alive/backend
go run ./cmd/server
```

```powershell
cd alive/frontend
npm run dev
```

Vite proxies `/api` to Go. Local media is served by Vite in development, and Go serves it in production. `frontend/.env.example` documents an optional API origin. Backend configuration comes from the process environment; see [backend/README.md](backend/README.md). `.env.example` files are documentation, not automatic backend dotenv loading.

## Production build and direct URLs

```powershell
npm run build
cd backend
$env:FRONTEND_DIR = '../frontend/dist'
go run ./cmd/server
```

Open http://localhost:8080. Go serves the built SPA, API and media from the same origin, with route fallback for `/photography`, `/music`, `/about` and `/contact`. The Go binary can be built with `go build -o alive-server.exe ./cmd/server`. Configure `DATA_FILE`, `MEDIA_DIR`, `FRONTEND_DIR`, `PORT` and `CORS_ORIGINS` for the deployment environment. Use HTTPS at your reverse proxy. No hosting account or external deployment was configured.

## Content replacement

The single source of content truth is `backend/data/content.json`. Paths must be local public URLs under `/media/`, never filesystem paths. IDs use lowercase letters, digits and hyphens. Preserve valid references. Restart Go after editing JSON; startup validates the entire dataset and reports invalid content.

**Add a photograph:** copy a JPG, PNG, WebP or AVIF into `frontend/public/media/photos/`. Add a photo entry with `id`, existing `albumId`, `title`, `description`, `src`, meaningful `alt`, exact pixel `width`/`height`, `location`, `year`, `order`, and `demo: false`. Optional `tags` and `moods` string arrays support future discovery and are also available on releases. Images display at their original aspect ratio. Prefer compressed 1600–2400px images; strip private EXIF metadata before publication if appropriate.

**Add an album:** add an `albums` entry with unique `id`, `title`, `description`, `year`, and `coverImage`. Assign its ID to each photograph's `albumId`. It automatically appears in the gallery filter.

**Add a release:** copy cover art into the public media folder. Add a `releases` entry with `id`, `title`, `artist`, `year`, `type`, `description`, `coverImage`, ordered `trackIds`, `published` and `demo`. Empty `trackIds` produces the intentional “no audio yet” state. A release may contain one or many tracks.

**Add playable audio:** copy an MP3 (broad compatibility), WAV, M4A or Ogg file to `frontend/public/media/audio/`. Add a `tracks` entry with unique `id`, matching `releaseId`, `title`, `audioUrl`, duration in seconds, `order`, and `demo`. Add the ID to the release's `trackIds`. Audio starts only on a play action, and continues between routes. Only one audio element exists. Go supports byte ranges for seeking.

**Personalize the site:** edit `frontend/src/config.ts` for the artist statement and contact destinations. Email URLs use `mailto:`, external links use full HTTPS URLs. Empty links render “Coming soon” without a misleading clickable destination. The current statement is editable placeholder prose, with no invented biography.

Published flags control API visibility, **not** access to public media files. Keep private/unreleased source files outside `frontend/public/media`. There are no public upload or delete endpoints.

Demo asset sources and licenses are in [public/media/README.md](frontend/public/media/README.md). Audio can be recreated using the script in `scripts/`. Replace demo labels only after replacing the actual content. Update the home colophon and footer edition labels in `Home.tsx` and `App.tsx` when launching your real archive.

## Architecture

- `frontend/src/components`: shared navigation, bounded typographic intro, coordinated route aperture and media fallback.
- `frontend/src/gallery`: default perspective photo reel, alternate native horizontal strip, keyboard/touch controls and accessible modal viewer.
- `frontend/src/motion`: shared kinetic selection, frame-calibrated spatial poses and an original WebGL aperture-rim renderer.
- `frontend/src/music`: CD archive, persistent audio provider, reusable controls and compact player.
- `frontend/src/services/api.ts`: configurable fetch boundary with cancellation, retryable errors and typed envelopes.
- `backend/internal/repository`: validated JSON persistence behind a content repository interface.
- `backend/internal/services`: public content visibility and business rules, independent of React.
- `backend/internal/handlers`: REST transport and safe static media/SPA serving.

The content repository can be replaced by PostgreSQL without changing HTTP presentation. Optional metadata tags/moods and backend service boundaries leave room for future discovery. No LLM, vector store, CMS, Composio runtime or credentials are required.

The introduction waits for actual content and the first image, with a 3.2-second readiness deadline plus a bounded exit and Skip Intro. No fake percentages. Its stationary typography is uncovered horizontally, then the page is revealed from top to bottom. Reduced motion skips it and spatial transitions. The main gallery is a continuous perspective reel; Horizontal view retains native browser scrolling. Discs move through a diagonal depth arrangement with their own mobile geometry. Fullscreen viewing preserves selection and restores an accessible focus target. The expanding route aperture handles history, direct visits, rapid navigation and dynamic reduced motion without remounting the audio provider. WebGL failure leaves a semantic clipping reveal; no extra rendering library is required.

## Checks

```powershell
npm run check
npm test
npm run build
cd backend
go test ./...
go vet ./...
gofmt -l .
```

Browser integration checks, with both dev servers running:

```powershell
cd frontend
npx playwright test
```

The checked-in Playwright configuration uses installed Microsoft Edge. Change the channel to your installed Chromium browser if needed. Tests cover navigation/history/direct URLs, filtering, fullscreen focus, audio playback and persistence, mobile menu/touch, reduced motion and API recovery. Five visual baselines cover desktop/mobile spatial geometry and a clock-controlled aperture frame. Screenshots are saved to `../.impeccable/review` relative to the `alive` directory. See [verification.md](docs/verification.md) for actual results and limits.

The [interaction reconstruction report](docs/reference-interactions.md) documents initial/intermediate/final states, observed timing, geometry, input experiments, estimates and remaining fidelity limits. The [paired comparison gallery](docs/comparisons/index.html) contains ten reference/local pairs. Reference images are research evidence only and are not bundled into the public application.

## Design and skills

Project instructions, durable product context and visual system live one directory above this monorepo in `AGENTS.md`, `PRODUCT.md` and `DESIGN.md`. The three requested skills were installed once in `.agents/skills/` using their official commands. Impeccable 4.6 context initialized successfully; its installed optional hook can be approved in Codex through `/hooks`. Direct checks work without hook activation. All three skills subsequently appeared in this session's available-skills catalog, verifying Codex discovery.

Frontend Design informed the photographic spread, two-family typography, quiet controls, physical CDs and motion vocabulary. Impeccable is used for context, design critique, accessibility audit, simplification and finish review. See [design-review.md](docs/design-review.md) for findings and fixes. Composio was intentionally limited to environment preparation: no third-party login, no accounts connected, and no application dependency. Its CLI requires WSL on Windows and is deferred until an authorized integration needs it.

Reference inspection and honest fidelity limitations are recorded in [reference-review.md](docs/reference-review.md). The site uses original application code, with no copied reference branding, artwork or audio.

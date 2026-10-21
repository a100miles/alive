# a.l.i.v.e content API

A read-only Go 1.24 server using the standard library. It serves the public archive from validated JSON and can also serve local media and the frontend production build. No database, account, external API, or Go package download is required.

## Run

From `alive/backend`:

```powershell
go run ./cmd/server
```

The default API is `http://localhost:8080/api/v1`. The default media directory is `../frontend/public/media`. Run the frontend Vite server separately during development.

Configuration comes from process environment. `.env.example` documents the variables; the server does not automatically read an `.env` file.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | HTTP port, from 1 through 65535 |
| `DATA_FILE` | `data/content.json` | Metadata file, relative to the process working directory |
| `MEDIA_DIR` | `../frontend/public/media` | Public media root; URLs begin with `/media/` |
| `FRONTEND_DIR` | empty | Optional compiled frontend directory |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated exact origins; set empty to disable cross-origin permission |

For a single server after building the frontend:

```powershell
$env:FRONTEND_DIR = '../frontend/dist'
go run ./cmd/server
```

The Go server then serves the application at `http://localhost:8080`, including direct navigation to `/photography`, `/music`, `/about`, and `/contact`. It returns the frontend entry point for extensionless page requests. Missing assets and unknown API endpoints remain errors instead of receiving HTML.

For a compiled server:

```powershell
go build -o alive-server.exe ./cmd/server
./alive-server.exe
```

Keep the same working directory or set absolute environment paths for your deployment. The server binds to the configured port on all interfaces. Put it behind the deployment platform's HTTPS reverse proxy for public hosting.

## REST contract

Successful responses use `{ "data": ... }`. Collection responses always contain arrays, including when empty. Errors use `{ "error": { "code": "not_found", "message": "..." } }`.

| GET endpoint | Result |
| --- | --- |
| `/api/v1/health` | `{ "status": "ok" }` |
| `/api/v1/albums` | Albums, newest year first |
| `/api/v1/albums/{id}` | One album |
| `/api/v1/photos` | Photos in ascending `order` |
| `/api/v1/photos?album={id}` | Photos belonging to that album |
| `/api/v1/photos/{id}` | One photo |
| `/api/v1/releases` | Published releases, newest year first |
| `/api/v1/releases/{id}` | One published release |
| `/api/v1/tracks/{id}` | One track belonging to a published release |

Equal collection years retain their order in the content file. A release's `trackIds` are sorted using each track's `order`. IDs contain lowercase letters, numbers, and single separating hyphens, with a maximum of 64 characters.

Invalid IDs or query parameters return `400`; missing or unpublished items return `404`; write methods return `405`; unexpected repository failures return `500` without internal details. Unknown album filters return `404`. Duplicate and empty filter values are rejected. There are no public upload, update, or delete endpoints.

## Edit the archive

Metadata lives in `data/content.json`; media lives outside the backend in the configured public media directory. The repository validates and loads metadata at startup. Restart the server after editing the JSON. Invalid metadata prevents startup and produces a useful server log.

The bundled photography is licensed demonstration imagery from Unsplash; photographer credits, source pages, and license links are recorded in [`../frontend/public/media/photos/manifest.json`](../frontend/public/media/photos/manifest.json). The audio snippets are locally synthesized demonstrations. Neither is the owner's work. Keep `demo: true` for demo photos, releases, and tracks. Replace the files, captions, and metadata with your own work before changing that flag. Demo years are archive display metadata and do not assert when a source photograph was taken.

1. **Add an album:** append an object to `albums` with a unique `id`, `title`, `description`, `year`, and `coverImage` URL.
2. **Add a photo:** place the file inside the public media root, then append an object to `photos`. Supply a unique `id`, existing `albumId`, title, description, `/media/...` `src`, meaningful `alt`, actual pixel `width` and `height`, optional location as an empty string when unknown, year, order, and demo status. Optional `tags` support future discovery without an AI dependency.
3. **Add a release:** append an object to `releases` with its title, artist, year, type, description, local `coverImage`, `trackIds`, `published`, and `demo`. Use `trackIds: []` for a release without available audio.
4. **Add playable audio:** place a browser-compatible file in the public media root and append a `tracks` object with a unique `id`, existing `releaseId`, title, local `audioUrl`, duration in seconds, nonnegative order, and demo status. Add its ID to that release's `trackIds`. Every track must appear exactly once in its own release.

Local media URLs must start with `/media/` and use letters, numbers, slashes, underscores, hyphens, and a file extension. Absolute filesystem paths, external URLs, percent encoding, query strings, hidden paths, and traversal are rejected. Use ordinary filenames such as `/media/photos/morning-light.jpg` and `/media/audio/first-sketch.wav`.

`published: false` hides a release and its tracks from the API. The media directory is public static storage; keep private files outside it. This MVP does not implement authenticated media access or a CMS.

## Architecture and verification

- `cmd/server`: startup, HTTP timeouts, configuration, and shutdown.
- `internal/models`: typed JSON contracts and content validation.
- `internal/repository`: the `Content` interface and immutable JSON repository. A database implementation can use the same interface.
- `internal/services`: public release and track visibility rules, independent of HTTP and storage.
- `internal/handlers`: JSON envelopes, request validation, CORS, media, and optional SPA serving.
- `internal/config`: environment configuration and validation.

Media and frontend files are opened through Go 1.24's `os.Root`, which prevents filesystem traversal and symlink escapes. Directory listings are disabled. Browser audio seeking uses HTTP byte-range responses. Future authenticated management or AI services belong behind the backend boundary; no API keys or AI dependencies are present.

```powershell
gofmt -l cmd internal
go vet ./...
go test ./... -count=1
```

Tests cover valid endpoints, collection ordering and filtering, error envelopes, unpublished content, empty collections, CORS, metadata relationships, immutable repository data, malformed JSON, configuration, unsafe URL forms, symlink escape, media ranges, and SPA direct URLs. The symlink test skips explicitly on hosts that do not permit symlink creation.

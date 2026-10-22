# Tester deployment

The root render.yaml defines a free Render web service, built with alive/Dockerfile. It serves the existing Go API, React app, photos, films and music on the same HTTPS origin. The source repository can remain private. Automatic deployment is disabled; publish subsequent updates deliberately.

The private a100miles/alive repository is connected to the alive-test Render web service on main. Live URL: https://alive-test.onrender.com. Deploy updates manually after pushing to main. No credentials belong in this repository.

The website and bundled public media are reachable by anyone with the live URL. The owner authorized updating this existing deployment on 2026-10-22.

Configuration follows https://render.com/docs/blueprint-spec. The image runs as a non-root user and exposes only the production Go server, not a development server. The health endpoint is /api/v1/health. Docker is unavailable in the current environment, so the container build remains unverified. Frontend checks/build/tests and Go test/fmt/vet passed before this packaging change.

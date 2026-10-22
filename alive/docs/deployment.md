# Tester deployment

The root render.yaml defines a free Render web service, built with alive/Dockerfile. It serves the existing Go API, React app, photos, films and music on the same HTTPS origin. The source repository can remain private. Automatic deployment is disabled; publish subsequent updates deliberately.

Connect the private a100miles/alive repository in Render, create a Blueprint from main and review the free service before deploying. This requires a Render account with access to the GitHub repository. No credentials belong in this repository.

The resulting website and all bundled public media will be reachable by anyone with its URL. Public hosting is pending explicit confirmation after automatic approval review rejected the earlier GitHub Pages attempt. No hosting service has been created.

Configuration follows https://render.com/docs/blueprint-spec. The image runs as a non-root user and exposes only the production Go server, not a development server. The health endpoint is /api/v1/health. Docker is unavailable in the current environment, so the container build remains unverified. Frontend checks/build/tests and Go test/fmt/vet passed before this packaging change.

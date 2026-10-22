FROM node:24-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM golang:1.24-bookworm AS backend
WORKDIR /build/backend
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /alive-server ./cmd/server

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=backend /alive-server ./alive-server
COPY --from=frontend /build/frontend/dist ./public
COPY backend/data/content.json ./data/content.json
ENV PORT=8080 DATA_FILE=/app/data/content.json MEDIA_DIR=/app/public/media FRONTEND_DIR=/app/public CORS_ORIGINS=""
USER 65534:65534
EXPOSE 8080
CMD ["/app/alive-server"]

package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"

	"alive/backend/internal/config"
	"alive/backend/internal/models"
	"alive/backend/internal/repository"
	"alive/backend/internal/services"
)

type Server struct {
	library  services.Library
	media    *os.Root
	frontend *os.Root
	origins  map[string]bool
}

func New(content repository.Content, cfg config.Config) (*Server, error) {
	s := &Server{library: services.Library{Content: content}, origins: make(map[string]bool)}
	for _, origin := range cfg.CORSOrigins {
		s.origins[origin] = true
	}
	if cfg.MediaDir != "" {
		root, err := os.OpenRoot(cfg.MediaDir)
		if err != nil {
			return nil, errors.New("cannot open configured media directory")
		}
		s.media = root
	}
	if cfg.FrontendDir != "" {
		root, err := os.OpenRoot(cfg.FrontendDir)
		if err != nil {
			s.Close()
			return nil, errors.New("cannot open configured frontend directory")
		}
		s.frontend = root
	}
	return s, nil
}

func (s *Server) Close() {
	if s.media != nil {
		_ = s.media.Close()
	}
	if s.frontend != nil {
		_ = s.frontend.Close()
	}
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	defer func() {
		if recovered := recover(); recovered != nil {
			slog.Error("request panic", "panic", recovered)
			writeError(w, http.StatusInternalServerError, "internal_error", "The archive is temporarily unavailable.")
		}
	}()
	if !safeRequestPath(r.URL.Path) {
		writeError(w, http.StatusBadRequest, "invalid_path", "Use a valid local archive path.")
		return
	}
	if strings.HasPrefix(r.URL.Path, "/api/") || r.URL.Path == "/api" {
		s.api(w, r)
		return
	}
	if strings.HasPrefix(r.URL.Path, "/media/") || r.URL.Path == "/media" {
		s.serveMedia(w, r)
		return
	}
	s.serveFrontend(w, r)
}

func (s *Server) api(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Add("Vary", "Origin")
	if origin := r.Header.Get("Origin"); origin != "" && s.origins[origin] {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Max-Age", "600")
	}
	if r.Method == http.MethodOptions {
		if !s.origins[r.Header.Get("Origin")] || r.Header.Get("Access-Control-Request-Method") != http.MethodGet {
			writeError(w, http.StatusForbidden, "origin_not_allowed", "This cross-origin request is not allowed.")
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", "GET, OPTIONS")
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "The public archive is read-only.")
		return
	}
	if !strings.HasPrefix(r.URL.Path, "/api/v1/") {
		writeError(w, http.StatusNotFound, "not_found", "This archive endpoint does not exist.")
		return
	}
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/"), "/")
	if len(parts) > 2 || parts[0] == "" {
		writeError(w, http.StatusNotFound, "not_found", "This archive endpoint does not exist.")
		return
	}
	id := ""
	if len(parts) == 2 {
		id = parts[1]
		if !models.ValidID(id) {
			writeError(w, http.StatusBadRequest, "invalid_id", "Content IDs use lowercase letters, numbers and hyphens.")
			return
		}
	}
	query, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil || !validQuery(query, parts[0], id) {
		writeError(w, http.StatusBadRequest, "invalid_query", "Only the optional album filter is accepted on the photo collection.")
		return
	}
	var data any
	ctx := r.Context()
	switch parts[0] {
	case "health":
		if id == "" {
			data = map[string]string{"status": "ok"}
		}
	case "albums":
		if id == "" {
			data, err = s.library.Content.Albums(ctx)
		} else {
			data, err = s.library.Content.Album(ctx, id)
		}
	case "photos":
		if id == "" {
			album := query.Get("album")
			if album != "" {
				_, err = s.library.Content.Album(ctx, album)
			}
			if err == nil {
				data, err = s.library.Content.Photos(ctx, album)
			}
		} else {
			data, err = s.library.Content.Photo(ctx, id)
		}
	case "releases":
		if id == "" {
			data, err = s.library.Releases(ctx)
		} else {
			data, err = s.library.Release(ctx, id)
		}
	case "tracks":
		if id != "" {
			data, err = s.library.Track(ctx, id)
		}
	}
	if errors.Is(err, repository.ErrNotFound) || (data == nil && err == nil) {
		writeError(w, http.StatusNotFound, "not_found", "This item is not in the public archive.")
		return
	}
	if err != nil {
		slog.Error("read archive", "error", err)
		writeError(w, http.StatusInternalServerError, "internal_error", "The archive is temporarily unavailable.")
		return
	}
	writeJSON(w, http.StatusOK, struct {
		Data any `json:"data"`
	}{Data: data})
}

func validQuery(query url.Values, resource, id string) bool {
	for key, values := range query {
		if resource != "photos" || id != "" || key != "album" || len(values) != 1 || !models.ValidID(values[0]) {
			return false
		}
	}
	return true
}

func safeRequestPath(value string) bool {
	if !strings.HasPrefix(value, "/") || strings.ContainsAny(value, "\\%:\x00") || path.Clean(value) != value {
		return false
	}
	for _, part := range strings.Split(value, "/") {
		if strings.HasPrefix(part, ".") {
			return false
		}
	}
	return true
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		slog.Debug("write response", "error", err)
	}
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, struct {
		Error struct {
			Code    string `json:"code"`
			Message string `json:"message"`
		} `json:"error"`
	}{Error: struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	}{Code: code, Message: message}})
}

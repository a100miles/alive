package handlers

import (
	"net/http"
	"os"
	"path"
	"strings"

	"alive/backend/internal/models"
)

func (s *Server) serveMedia(w http.ResponseWriter, r *http.Request) {
	if !readMethod(w, r) {
		return
	}
	if models.ValidMediaURL(r.URL.Path) && serveFile(w, r, s.media, strings.TrimPrefix(r.URL.Path, "/media/")) {
		return
	}
	writeError(w, http.StatusNotFound, "not_found", "This media file is unavailable.")
}

func (s *Server) serveFrontend(w http.ResponseWriter, r *http.Request) {
	if !readMethod(w, r) {
		return
	}
	name := strings.TrimPrefix(r.URL.Path, "/")
	if name != "" && serveFile(w, r, s.frontend, name) {
		return
	}
	// Missing asset requests must remain 404; only navigation gets SPA HTML.
	if path.Ext(name) == "" && (r.Header.Get("Accept") == "" || strings.Contains(r.Header.Get("Accept"), "text/html")) && serveFile(w, r, s.frontend, "index.html") {
		return
	}
	writeError(w, http.StatusNotFound, "not_found", "This page is unavailable.")
}

func readMethod(w http.ResponseWriter, r *http.Request) bool {
	if r.Method == http.MethodGet || r.Method == http.MethodHead {
		return true
	}
	w.Header().Set("Allow", "GET, HEAD")
	writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "Only reading is available.")
	return false
}

func serveFile(w http.ResponseWriter, r *http.Request, root *os.Root, name string) bool {
	if root == nil {
		return false
	}
	// os.Root (Go 1.24) prevents symlink and traversal escape during the open.
	file, err := root.Open(name)
	if err != nil {
		return false
	}
	defer file.Close()
	info, err := file.Stat()
	if err != nil || !info.Mode().IsRegular() {
		return false
	}
	if path.Ext(name) == ".html" {
		w.Header().Set("Cache-Control", "no-cache")
	} else {
		w.Header().Set("Cache-Control", "public, max-age=3600")
	}
	// ServeContent supports range requests used by browser audio seeking.
	http.ServeContent(w, r, info.Name(), info.ModTime(), file)
	return true
}

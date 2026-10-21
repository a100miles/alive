package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"alive/backend/internal/config"
	"alive/backend/internal/models"
	"alive/backend/internal/repository"
)

func fixture(t *testing.T) models.Archive {
	t.Helper()
	data, err := os.ReadFile("../../data/content.json")
	if err != nil {
		t.Fatal(err)
	}
	var archive models.Archive
	if err := json.Unmarshal(data, &archive); err != nil {
		t.Fatal(err)
	}
	return archive
}

func testServer(t *testing.T, archive models.Archive, cfg config.Config) *Server {
	t.Helper()
	content, err := repository.New(archive)
	if err != nil {
		t.Fatal(err)
	}
	server, err := New(content, cfg)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(server.Close)
	return server
}

func request(server http.Handler, method, target string) *httptest.ResponseRecorder {
	response := httptest.NewRecorder()
	server.ServeHTTP(response, httptest.NewRequest(method, target, nil))
	return response
}

func TestAPIEndpoints(t *testing.T) {
	server := testServer(t, fixture(t), config.Config{})
	for _, target := range []string{
		"/api/v1/health", "/api/v1/albums", "/api/v1/albums/blue-hour",
		"/api/v1/photos", "/api/v1/photos/cold-flame", "/api/v1/photos?album=blue-hour",
		"/api/v1/releases", "/api/v1/releases/020226", "/api/v1/releases/sunrise", "/api/v1/tracks/020226-01",
	} {
		t.Run(target, func(t *testing.T) {
			response := request(server, http.MethodGet, target)
			if response.Code != http.StatusOK {
				t.Fatalf("status %d: %s", response.Code, response.Body.String())
			}
			var envelope struct {
				Data json.RawMessage `json:"data"`
			}
			if err := json.Unmarshal(response.Body.Bytes(), &envelope); err != nil || len(envelope.Data) == 0 {
				t.Fatalf("missing data envelope: %s", response.Body.String())
			}
			if !strings.Contains(response.Header().Get("Content-Type"), "application/json") {
				t.Fatal("missing JSON content type")
			}
		})
	}
}

func TestPhotoFilterAndOrdering(t *testing.T) {
	archive := fixture(t)
	archive.Photos[0], archive.Photos[2] = archive.Photos[2], archive.Photos[0]
	server := testServer(t, archive, config.Config{})
	response := request(server, http.MethodGet, "/api/v1/photos?album=blue-hour")
	var result struct {
		Data []models.Photo `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if len(result.Data) != 5 || result.Data[0].ID != "cold-flame" || result.Data[2].ID != "blue-impressions" {
		t.Fatalf("unexpected ordered photos: %+v", result.Data)
	}
	for _, photo := range result.Data {
		if photo.AlbumID != "blue-hour" {
			t.Fatal("album filter returned another album")
		}
	}
}

func TestAPIRejectsInvalidRequests(t *testing.T) {
	server := testServer(t, fixture(t), config.Config{})
	tests := []struct {
		method string
		target string
		status int
		code   string
	}{
		{"GET", "/api/v1/albums/missing", 404, "not_found"},
		{"GET", "/api/v1/photos/missing", 404, "not_found"},
		{"GET", "/api/v1/releases/missing", 404, "not_found"},
		{"GET", "/api/v1/tracks/missing", 404, "not_found"},
		{"GET", "/api/v1/tracks", 404, "not_found"},
		{"GET", "/api/v1/photos?album=missing", 404, "not_found"},
		{"GET", "/api/v1/photos/UPPERCASE", 400, "invalid_id"},
		{"GET", "/api/v1/photos?album=../secret", 400, "invalid_query"},
		{"GET", "/api/v1/photos?album=blue-hour&album=after-hours", 400, "invalid_query"},
		{"GET", "/api/v1/photos?album=", 400, "invalid_query"},
		{"GET", "/api/v1/photos?bad=1", 400, "invalid_query"},
		{"GET", "/api/v1/albums?album=blue-hour", 400, "invalid_query"},
		{"GET", "/api/v1/photos?album=blue-hour;bad", 400, "invalid_query"},
		{"GET", "/api/v1/unknown", 404, "not_found"},
		{"GET", "/api/v2/albums", 404, "not_found"},
		{"POST", "/api/v1/albums", 405, "method_not_allowed"},
		{"DELETE", "/api/v1/photos/cold-flame", 405, "method_not_allowed"},
	}
	for _, test := range tests {
		t.Run(test.method+" "+test.target, func(t *testing.T) {
			response := request(server, test.method, test.target)
			var result struct {
				Error struct {
					Code    string `json:"code"`
					Message string `json:"message"`
				} `json:"error"`
			}
			if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil {
				t.Fatal(err)
			}
			if response.Code != test.status || result.Error.Code != test.code || result.Error.Message == "" {
				t.Fatalf("got %d %s", response.Code, response.Body.String())
			}
		})
	}
}

func TestUnpublishedReleasesAndTracksArePrivate(t *testing.T) {
	archive := fixture(t)
	archive.Releases[0].Published = false
	server := testServer(t, archive, config.Config{})
	for _, target := range []string{"/api/v1/releases/020226", "/api/v1/tracks/020226-01", "/api/v1/tracks/020226-02"} {
		if response := request(server, "GET", target); response.Code != http.StatusNotFound {
			t.Fatalf("private content exposed at %s", target)
		}
	}
	response := request(server, "GET", "/api/v1/releases")
	if response.Code != http.StatusOK || strings.Contains(response.Body.String(), "020226") {
		t.Fatalf("public list contains private release: %s", response.Body.String())
	}
}

func TestEmptyCollectionsAreArrays(t *testing.T) {
	server := testServer(t, models.Archive{}, config.Config{})
	for _, target := range []string{"/api/v1/albums", "/api/v1/photos", "/api/v1/releases"} {
		if response := request(server, "GET", target); strings.TrimSpace(response.Body.String()) != `{"data":[]}` {
			t.Fatalf("wrong empty response for %s: %s", target, response.Body.String())
		}
	}
}

func TestCORS(t *testing.T) {
	server := testServer(t, fixture(t), config.Config{CORSOrigins: []string{"http://localhost:5173"}})
	for _, origin := range []string{"http://localhost:5173", "https://unlisted.example"} {
		r := httptest.NewRequest("OPTIONS", "/api/v1/photos", nil)
		r.Header.Set("Origin", origin)
		r.Header.Set("Access-Control-Request-Method", "GET")
		response := httptest.NewRecorder()
		server.ServeHTTP(response, r)
		if origin == "http://localhost:5173" {
			if response.Code != 204 || response.Header().Get("Access-Control-Allow-Origin") != origin {
				t.Fatal("configured origin was not allowed")
			}
		} else if response.Code != 403 || response.Header().Get("Access-Control-Allow-Origin") != "" {
			t.Fatal("unknown origin received CORS permission")
		}
	}
}

func TestMediaAndSPA(t *testing.T) {
	media := t.TempDir()
	frontend := t.TempDir()
	writeFixture(t, media, "audio/test.wav", "RIFF0123456789abcdef")
	writeFixture(t, frontend, "index.html", "<!doctype html><title>a.l.i.v.e</title>")
	writeFixture(t, frontend, "assets/app.js", "console.log('archive')")
	server := testServer(t, fixture(t), config.Config{MediaDir: media, FrontendDir: frontend})
	for _, target := range []string{"/", "/photography", "/music", "/about", "/contact"} {
		response := request(server, "GET", target)
		if response.Code != 200 || !strings.Contains(response.Body.String(), "<!doctype html>") {
			t.Fatalf("SPA route failed: %s %d", target, response.Code)
		}
	}
	for _, target := range []string{"/media/missing.wav", "/media/audio", "/assets/missing.js", "/api/v1/missing"} {
		if response := request(server, "GET", target); response.Code != 404 || strings.Contains(response.Body.String(), "<!doctype html>") {
			t.Fatalf("missing resource returned SPA: %s %d", target, response.Code)
		}
	}
	for _, target := range []string{"/media/../private.wav", "/media/%2e%2e/private.wav", "/media/%252e%252e/private.wav", "/media/audio%5cprivate.wav", "/media//audio/test.wav", "/.env", "/assets/../index.html"} {
		if response := request(server, "GET", target); response.Code != 400 {
			t.Fatalf("unsafe path not rejected: %s %d", target, response.Code)
		}
	}
	r := httptest.NewRequest("GET", "/media/audio/test.wav", nil)
	r.Header.Set("Range", "bytes=0-3")
	response := httptest.NewRecorder()
	server.ServeHTTP(response, r)
	if response.Code != http.StatusPartialContent || response.Body.String() != "RIFF" || response.Header().Get("Accept-Ranges") != "bytes" {
		t.Fatalf("audio byte ranges failed: %d %s", response.Code, response.Body.String())
	}
	response = request(server, "HEAD", "/media/audio/test.wav")
	if response.Code != http.StatusOK || response.Body.Len() != 0 {
		t.Fatal("HEAD must return file headers without body")
	}
}

func TestMediaRejectsSymlinkEscape(t *testing.T) {
	media := t.TempDir()
	outside := t.TempDir()
	writeFixture(t, outside, "private.wav", "private bytes")
	if err := os.Symlink(filepath.Join(outside, "private.wav"), filepath.Join(media, "escape.wav")); err != nil {
		t.Skipf("symlink creation is unavailable on this host: %v", err)
	}
	server := testServer(t, fixture(t), config.Config{MediaDir: media})
	if response := request(server, "GET", "/media/escape.wav"); response.Code != 404 || strings.Contains(response.Body.String(), "private bytes") {
		t.Fatal("symlink escaped the configured media root")
	}
}

func writeFixture(t *testing.T, root, name, body string) {
	t.Helper()
	filename := filepath.Join(root, filepath.FromSlash(name))
	if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filename, []byte(body), 0644); err != nil {
		t.Fatal(err)
	}
}

type failingContent struct{ repository.Content }

func (failingContent) Albums(context.Context) ([]models.Album, error) {
	return nil, errors.New("database password and private implementation details")
}

func TestInternalErrorsDoNotLeakDetails(t *testing.T) {
	server, err := New(failingContent{}, config.Config{})
	if err != nil {
		t.Fatal(err)
	}
	defer server.Close()
	response := request(server, "GET", "/api/v1/albums")
	if response.Code != 500 || strings.Contains(response.Body.String(), "password") || !strings.Contains(response.Body.String(), "internal_error") {
		t.Fatalf("unsafe internal error: %d %s", response.Code, response.Body.String())
	}
}

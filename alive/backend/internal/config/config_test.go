package config

import "testing"

func TestLoad(t *testing.T) {
	t.Setenv("PORT", "8081")
	t.Setenv("DATA_FILE", "data/content.json")
	t.Setenv("MEDIA_DIR", "../frontend/public/media")
	t.Setenv("FRONTEND_DIR", "../frontend/dist")
	t.Setenv("CORS_ORIGINS", "http://localhost:5173, https://archive.example")
	cfg, err := Load()
	if err != nil || cfg.Port != "8081" || len(cfg.CORSOrigins) != 2 || cfg.FrontendDir != "../frontend/dist" {
		t.Fatalf("bad config: %+v %v", cfg, err)
	}
}

func TestInvalidConfig(t *testing.T) {
	for _, port := range []string{"0", "65536", "not-a-port", ""} {
		t.Run("port="+port, func(t *testing.T) {
			t.Setenv("PORT", port)
			if _, err := Load(); err == nil {
				t.Fatal("invalid port accepted")
			}
		})
	}
	for _, origin := range []string{"*", "https://example.com/path", "https://user:pass@example.com", "file:///tmp"} {
		t.Run("origin="+origin, func(t *testing.T) {
			t.Setenv("PORT", "8080")
			t.Setenv("CORS_ORIGINS", origin)
			if _, err := Load(); err == nil {
				t.Fatal("invalid origin accepted")
			}
		})
	}
}

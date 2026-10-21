package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port        string
	DataFile    string
	MediaDir    string
	FrontendDir string
	CORSOrigins []string
}

func Load() (Config, error) {
	cfg := Config{
		Port:        value("PORT", "8080"),
		DataFile:    value("DATA_FILE", "data/content.json"),
		MediaDir:    value("MEDIA_DIR", "../frontend/public/media"),
		FrontendDir: os.Getenv("FRONTEND_DIR"),
	}
	port, err := strconv.Atoi(cfg.Port)
	if err != nil || port < 1 || port > 65535 {
		return Config{}, fmt.Errorf("PORT must be an integer between 1 and 65535")
	}
	origins := value("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
	for _, origin := range strings.Split(origins, ",") {
		origin = strings.TrimSpace(origin)
		if origin == "" {
			continue
		}
		parsed, err := url.Parse(origin)
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" || parsed.User != nil || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" {
			return Config{}, fmt.Errorf("CORS_ORIGINS must contain exact http(s) origins without paths")
		}
		cfg.CORSOrigins = append(cfg.CORSOrigins, origin)
	}
	return cfg, nil
}

func value(name, fallback string) string {
	if value, exists := os.LookupEnv(name); exists {
		return value
	}
	return fallback
}

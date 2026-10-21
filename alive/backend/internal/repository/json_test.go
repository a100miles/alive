package repository

import (
	"context"
	"os"
	"path/filepath"
	"testing"
)

func TestLoadArchiveAndProtectData(t *testing.T) {
	repo, err := Load("../../data/content.json")
	if err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	photos, err := repo.Photos(ctx, "blue-hour")
	if err != nil || len(photos) != 5 {
		t.Fatal("photography album missing")
	}
	photos[0].Title = "changed"
	photos[0].Tags[0] = "changed"
	photo, err := repo.Photo(ctx, "cold-flame")
	if err != nil || photo.Title == "changed" || photo.Tags[0] == "changed" {
		t.Fatal("callers can mutate repository photos")
	}
	releases, err := repo.Releases(ctx)
	if err != nil {
		t.Fatal(err)
	}
	releases[0].TrackIDs[0] = "changed"
	release, err := repo.Release(ctx, "020226")
	if err != nil || release.TrackIDs[0] != "020226-01" {
		t.Fatal("callers can mutate repository releases")
	}
}

func TestRejectMalformedContent(t *testing.T) {
	for name, body := range map[string]string{
		"broken.json":  `{`,
		"unknown.json": `{"albums":[],"photos":[],"releases":[],"tracks":[],"unexpected":true}`,
		"extra.json":   `{"albums":[],"photos":[],"releases":[],"tracks":[]} {}`,
		"invalid.json": `{"albums":[{"id":"bad"}]}`,
	} {
		t.Run(name, func(t *testing.T) {
			file := filepath.Join(t.TempDir(), name)
			if err := os.WriteFile(file, []byte(body), 0644); err != nil {
				t.Fatal(err)
			}
			if _, err := Load(file); err == nil {
				t.Fatal("malformed content accepted")
			}
		})
	}
}

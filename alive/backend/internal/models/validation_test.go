package models

import "testing"

func TestValidMediaURL(t *testing.T) {
	for _, value := range []string{"/media/photos/still-water.jpg", "/media/audio/soft-focus-01.wav"} {
		if !ValidMediaURL(value) {
			t.Errorf("rejected safe URL %q", value)
		}
	}
	for _, value := range []string{"/etc/passwd", "C:\\private\\file.wav", "https://example.com/file.jpg", "/media/../secret.jpg", "/media/%2e%2e/secret.jpg", "/media/%252e%252e/secret.jpg", "/media//file.jpg", "/media/.hidden.jpg", "/media/photo.jpg?file=secret", "/media/photo.jpg:secret", "/media/a\\b.jpg"} {
		if ValidMediaURL(value) {
			t.Errorf("accepted unsafe URL %q", value)
		}
	}
}

func TestValidID(t *testing.T) {
	for _, value := range []string{"ordinary-light", "soft-focus-01", "a"} {
		if !ValidID(value) {
			t.Errorf("rejected ID %q", value)
		}
	}
	for _, value := range []string{"", "../secret", "Hello", "two words", "-leading", "trailing-", "double--dash", "%2e%2e"} {
		if ValidID(value) {
			t.Errorf("accepted ID %q", value)
		}
	}
}

func TestValidateRelationships(t *testing.T) {
	valid := func() Archive {
		return Archive{
			Albums:   []Album{{ID: "album", Title: "Album", Year: 2026, CoverImage: "/media/photos/a.jpg"}},
			Photos:   []Photo{{ID: "photo", AlbumID: "album", Title: "Photo", Alt: "Synthetic landscape", Src: "/media/photos/a.jpg", Year: 2026, Width: 100, Height: 100}},
			Releases: []Release{{ID: "release", Title: "Release", Artist: "Demo", Year: 2026, Type: "Sketch", CoverImage: "/media/photos/a.jpg", TrackIDs: []string{"track"}}},
			Tracks:   []Track{{ID: "track", ReleaseID: "release", Title: "Track", AudioURL: "/media/audio/a.wav", Duration: 18}},
		}
	}
	if err := valid().Validate(); err != nil {
		t.Fatal(err)
	}
	tests := map[string]func(*Archive){
		"missing album":   func(a *Archive) { a.Photos[0].AlbumID = "missing" },
		"missing release": func(a *Archive) { a.Tracks[0].ReleaseID = "missing" },
		"missing track":   func(a *Archive) { a.Releases[0].TrackIDs = []string{"missing"} },
		"unlisted track":  func(a *Archive) { a.Releases[0].TrackIDs = []string{} },
		"duplicate track": func(a *Archive) { a.Releases[0].TrackIDs = []string{"track", "track"} },
		"duplicate photo": func(a *Archive) { a.Photos = append(a.Photos, a.Photos[0]) },
		"unsafe media":    func(a *Archive) { a.Photos[0].Src = "/media/../private.jpg" },
		"missing alt":     func(a *Archive) { a.Photos[0].Alt = "" },
		"bad dimensions":  func(a *Archive) { a.Photos[0].Height = 0 },
		"bad duration":    func(a *Archive) { a.Tracks[0].Duration = -1 },
	}
	for name, mutate := range tests {
		t.Run(name, func(t *testing.T) {
			archive := valid()
			mutate(&archive)
			if archive.Validate() == nil {
				t.Fatal("expected validation error")
			}
		})
	}
}

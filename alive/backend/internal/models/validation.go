package models

import (
	"fmt"
	"math"
	"path"
	"regexp"
	"strings"
)

var identifier = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
var mediaPath = regexp.MustCompile(`^/media/[A-Za-z0-9/_-]+\.[A-Za-z0-9]+$`)

func ValidID(id string) bool {
	return len(id) > 0 && len(id) <= 64 && identifier.MatchString(id)
}

// ValidMediaURL accepts public local URLs, never filesystem paths or remote URLs.
// Restricting the alphabet also excludes encoded traversal, query strings and ADS.
func ValidMediaURL(value string) bool {
	return len(value) <= 512 && mediaPath.MatchString(value) && path.Clean(value) == value
}

func (a Archive) Validate() error {
	albums := make(map[string]bool, len(a.Albums))
	photos := make(map[string]bool, len(a.Photos))
	releases := make(map[string]Release, len(a.Releases))
	tracks := make(map[string]Track, len(a.Tracks))
	for _, item := range a.Albums {
		if !ValidID(item.ID) || albums[item.ID] || !validText(item.Title, 160) || !validYear(item.Year) || !ValidMediaURL(item.CoverImage) {
			return fmt.Errorf("invalid or duplicate album %q", item.ID)
		}
		albums[item.ID] = true
	}
	for _, item := range a.Photos {
		if !ValidID(item.ID) || photos[item.ID] || !albums[item.AlbumID] || !validText(item.Title, 160) || !validText(item.Alt, 1000) || !ValidMediaURL(item.Src) || !validYear(item.Year) || item.Width <= 0 || item.Height <= 0 || item.Width > 30000 || item.Height > 30000 || item.Order < 0 {
			return fmt.Errorf("invalid or duplicate photo %q", item.ID)
		}
		for _, tag := range item.Tags {
			if !validText(tag, 80) {
				return fmt.Errorf("invalid tag on photo %q", item.ID)
			}
		}
		photos[item.ID] = true
	}
	for _, item := range a.Releases {
		_, duplicate := releases[item.ID]
		if !ValidID(item.ID) || duplicate || !validText(item.Title, 160) || !validText(item.Artist, 160) || !validYear(item.Year) || !validText(item.Type, 40) || !ValidMediaURL(item.CoverImage) || item.TrackIDs == nil {
			return fmt.Errorf("invalid or duplicate release %q", item.ID)
		}
		releases[item.ID] = item
	}
	for _, item := range a.Tracks {
		_, duplicate := tracks[item.ID]
		_, hasRelease := releases[item.ReleaseID]
		if !ValidID(item.ID) || duplicate || !hasRelease || !validText(item.Title, 160) || !ValidMediaURL(item.AudioURL) || item.Duration <= 0 || math.IsNaN(item.Duration) || math.IsInf(item.Duration, 0) || item.Order < 0 {
			return fmt.Errorf("invalid or duplicate track %q", item.ID)
		}
		tracks[item.ID] = item
	}
	listed := make(map[string]bool, len(tracks))
	for _, release := range a.Releases {
		for _, id := range release.TrackIDs {
			track, exists := tracks[id]
			if !exists || track.ReleaseID != release.ID || listed[id] {
				return fmt.Errorf("invalid track relationship %q in release %q", id, release.ID)
			}
			listed[id] = true
		}
	}
	for id := range tracks {
		if !listed[id] {
			return fmt.Errorf("track %q missing from its release", id)
		}
	}
	return nil
}

func validText(value string, maximum int) bool {
	return strings.TrimSpace(value) != "" && len(value) <= maximum
}

func validYear(year int) bool { return year >= 1800 && year <= 2200 }

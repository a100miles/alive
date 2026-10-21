package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"slices"
	"sort"

	"alive/backend/internal/models"
)

var ErrNotFound = errors.New("content not found")

// Content is the persistence boundary; another implementation can use a database.
type Content interface {
	Albums(context.Context) ([]models.Album, error)
	Album(context.Context, string) (models.Album, error)
	Photos(context.Context, string) ([]models.Photo, error)
	Photo(context.Context, string) (models.Photo, error)
	Releases(context.Context) ([]models.Release, error)
	Release(context.Context, string) (models.Release, error)
	Track(context.Context, string) (models.Track, error)
}

type JSON struct{ archive models.Archive }

func Load(filename string) (*JSON, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, fmt.Errorf("open content: %w", err)
	}
	defer file.Close()
	const maximumSize = 8 << 20
	info, err := file.Stat()
	if err != nil || !info.Mode().IsRegular() || info.Size() > maximumSize {
		return nil, errors.New("content must be a regular JSON file smaller than 8 MiB")
	}
	decoder := json.NewDecoder(io.LimitReader(file, maximumSize+1))
	decoder.DisallowUnknownFields()
	var archive models.Archive
	if err := decoder.Decode(&archive); err != nil {
		return nil, fmt.Errorf("decode content: %w", err)
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		return nil, errors.New("content must contain exactly one JSON object")
	}
	return New(archive)
}

func New(archive models.Archive) (*JSON, error) {
	if err := archive.Validate(); err != nil {
		return nil, fmt.Errorf("validate content: %w", err)
	}
	// Own a deep copy, so callers cannot mutate the immutable repository.
	archive.Albums = slices.Clone(archive.Albums)
	archive.Photos = clonePhotos(archive.Photos)
	archive.Releases = cloneReleases(archive.Releases)
	archive.Tracks = slices.Clone(archive.Tracks)
	sort.SliceStable(archive.Albums, func(i, j int) bool { return archive.Albums[i].Year > archive.Albums[j].Year })
	sort.SliceStable(archive.Photos, func(i, j int) bool { return archive.Photos[i].Order < archive.Photos[j].Order })
	sort.SliceStable(archive.Releases, func(i, j int) bool { return archive.Releases[i].Year > archive.Releases[j].Year })
	for i := range archive.Releases {
		order := make(map[string]int)
		for _, track := range archive.Tracks {
			order[track.ID] = track.Order
		}
		sort.SliceStable(archive.Releases[i].TrackIDs, func(a, b int) bool {
			return order[archive.Releases[i].TrackIDs[a]] < order[archive.Releases[i].TrackIDs[b]]
		})
	}
	return &JSON{archive: archive}, nil
}

func (r *JSON) Albums(ctx context.Context) ([]models.Album, error) {
	return append([]models.Album{}, r.archive.Albums...), ctx.Err()
}

func (r *JSON) Album(ctx context.Context, id string) (models.Album, error) {
	for _, item := range r.archive.Albums {
		if item.ID == id {
			return item, ctx.Err()
		}
	}
	return models.Album{}, ErrNotFound
}

func (r *JSON) Photos(ctx context.Context, albumID string) ([]models.Photo, error) {
	result := []models.Photo{}
	for _, item := range r.archive.Photos {
		if albumID == "" || item.AlbumID == albumID {
			item.Tags = slices.Clone(item.Tags)
			result = append(result, item)
		}
	}
	return result, ctx.Err()
}

func (r *JSON) Photo(ctx context.Context, id string) (models.Photo, error) {
	for _, item := range r.archive.Photos {
		if item.ID == id {
			item.Tags = slices.Clone(item.Tags)
			return item, ctx.Err()
		}
	}
	return models.Photo{}, ErrNotFound
}

func (r *JSON) Releases(ctx context.Context) ([]models.Release, error) {
	return cloneReleases(r.archive.Releases), ctx.Err()
}

func (r *JSON) Release(ctx context.Context, id string) (models.Release, error) {
	for _, item := range r.archive.Releases {
		if item.ID == id {
			item.TrackIDs = append([]string{}, item.TrackIDs...)
			return item, ctx.Err()
		}
	}
	return models.Release{}, ErrNotFound
}

func (r *JSON) Track(ctx context.Context, id string) (models.Track, error) {
	for _, item := range r.archive.Tracks {
		if item.ID == id {
			return item, ctx.Err()
		}
	}
	return models.Track{}, ErrNotFound
}

func clonePhotos(items []models.Photo) []models.Photo {
	result := append([]models.Photo{}, items...)
	for i := range result {
		result[i].Tags = slices.Clone(result[i].Tags)
	}
	return result
}

func cloneReleases(items []models.Release) []models.Release {
	result := append([]models.Release{}, items...)
	for i := range result {
		result[i].TrackIDs = append([]string{}, result[i].TrackIDs...)
	}
	return result
}

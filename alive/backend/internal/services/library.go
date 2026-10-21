package services

import (
	"context"

	"alive/backend/internal/models"
	"alive/backend/internal/repository"
)

// Library holds public visibility rules independently of storage and HTTP.
type Library struct{ Content repository.Content }

func (s Library) Releases(ctx context.Context) ([]models.Release, error) {
	items, err := s.Content.Releases(ctx)
	if err != nil {
		return nil, err
	}
	result := []models.Release{}
	for _, item := range items {
		if item.Published {
			result = append(result, item)
		}
	}
	return result, nil
}

func (s Library) Release(ctx context.Context, id string) (models.Release, error) {
	item, err := s.Content.Release(ctx, id)
	if err != nil {
		return models.Release{}, err
	}
	if !item.Published {
		return models.Release{}, repository.ErrNotFound
	}
	return item, nil
}

func (s Library) Track(ctx context.Context, id string) (models.Track, error) {
	track, err := s.Content.Track(ctx, id)
	if err != nil {
		return models.Track{}, err
	}
	if _, err := s.Release(ctx, track.ReleaseID); err != nil {
		return models.Track{}, err
	}
	return track, nil
}

package models

// Archive is the editable content file. Media remain separate from metadata.
type Archive struct {
	Albums   []Album   `json:"albums"`
	Photos   []Photo   `json:"photos"`
	Releases []Release `json:"releases"`
	Tracks   []Track   `json:"tracks"`
}

type Album struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Year        int    `json:"year"`
	CoverImage  string `json:"coverImage"`
}

type Photo struct {
	ID          string   `json:"id"`
	AlbumID     string   `json:"albumId"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Src         string   `json:"src"`
	Alt         string   `json:"alt"`
	Width       int      `json:"width"`
	Height      int      `json:"height"`
	Location    string   `json:"location"`
	Year        int      `json:"year"`
	Order       int      `json:"order"`
	Tags        []string `json:"tags,omitempty"`
	Moods       []string `json:"moods,omitempty"`
	Demo        bool     `json:"demo"`
}

type Release struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Artist      string   `json:"artist"`
	Year        int      `json:"year"`
	Type        string   `json:"type"`
	Description string   `json:"description"`
	CoverImage  string   `json:"coverImage"`
	TrackIDs    []string `json:"trackIds"`
	Published   bool     `json:"published"`
	Tags        []string `json:"tags,omitempty"`
	Moods       []string `json:"moods,omitempty"`
	Demo        bool     `json:"demo"`
}

type Track struct {
	ID        string  `json:"id"`
	ReleaseID string  `json:"releaseId"`
	Title     string  `json:"title"`
	AudioURL  string  `json:"audioUrl"`
	Duration  float64 `json:"duration"`
	Order     int     `json:"order"`
	Demo      bool    `json:"demo"`
}

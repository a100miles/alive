export interface Album { id: string; title: string; description: string; year: number; coverImage: string }
export interface Photo { id: string; albumId: string; title: string; description: string; src: string; alt: string; width: number; height: number; location: string; year: number; order: number; tags?: string[]; moods?: string[]; demo: boolean }
export interface Release { id: string; title: string; artist: string; year: number; type: string; description: string; coverImage: string; trackIds: string[]; published: boolean; tags?: string[]; moods?: string[]; demo: boolean }
export interface Track { id: string; releaseId: string; title: string; audioUrl: string; duration: number; order: number; demo: boolean }
export interface Archive { albums: Album[]; photos: Photo[]; releases: Release[]; tracks: Track[] }

import type { Album, Archive, Photo, Release, Track } from '../types'

const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(10000)
  const response = await fetch(`${base}/api/v1${path}`, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`The archive could not be loaded (${response.status}). Please try again.`)
  const body: unknown = await response.json()
  if (!body || typeof body !== 'object' || !('data' in body)) throw new Error('The archive returned an unexpected response.')
  return body.data as T
}

export async function loadArchive(signal: AbortSignal): Promise<Archive> {
  const [albums, photos, releases] = await Promise.all([
    request<Album[]>('/albums', signal), request<Photo[]>('/photos', signal), request<Release[]>('/releases', signal),
  ])
  const ids = [...new Set(releases.flatMap(release => release.trackIds))]
  const tracks = await Promise.all(ids.map(id => request<Track>(`/tracks/${encodeURIComponent(id)}`, signal)))
  return { albums, photos, releases, tracks }
}

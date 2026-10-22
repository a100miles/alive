import { useEffect, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { startFilmStrip } from './filmStrip'
import './home-video.css'

export function HomeVideo({ sources }: { sources: readonly string[] }) {
  const stage = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { width } = useViewport()
  // Match the strip height; the supplied films have a 3:4 aspect ratio.
  const filmHeight = width <= 600 ? Math.max(375, Math.min(525, width * 1.175)) : Math.max(400, Math.min(700, width * .5))
  const requiredFilms = Math.max(5, Math.ceil(width / (filmHeight * .75)) + 1)
  // Short collections repeat only enough to fill the strip and its offscreen buffer.
  const films = sources.length ? Array.from({ length: sources.length * Math.ceil(requiredFilms / sources.length) }, (_, index) => sources[index % sources.length]) : []
  const sourceKey = films.join('|')
  useEffect(() => {
    if (!stage.current || !sourceKey) return
    const strip = startFilmStrip(stage.current, sourceKey.split('|'), reduced)
    return () => strip.dispose()
  }, [sourceKey, reduced])

  if (!sources.length) return <div className="home-video-empty"><p>A film will appear here soon.</p></div>
  return <div className="home-video">
    <div ref={stage} className={`home-video-stage${reduced ? ' is-reduced' : ''}`} role="region" tabIndex={reduced ? 0 : undefined}
      aria-label={`Films.${reduced ? ' Scroll horizontally to browse.' : ''}`}
      onKeyDown={event => {
        if (reduced && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault(); event.currentTarget.scrollBy({ left: event.key === 'ArrowRight' ? 240 : -240, behavior: 'instant' })
        }
      }}>
      {films.map((src, index) => <div className="film-strip-item" key={`${src}-${index}`}>
        <video muted playsInline loop preload="none" aria-hidden="true" tabIndex={-1}/>
        <span className="film-unavailable" role="status">This film is unavailable.</span>
      </div>)}
    </div>
  </div>
}


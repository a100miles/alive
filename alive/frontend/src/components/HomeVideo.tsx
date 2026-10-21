import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { startFilmStrip } from './filmStrip'
import './home-video.css'

export function HomeVideo({ sources }: { sources: readonly string[] }) {
  const stage = useRef<HTMLDivElement>(null)
  const action = useRef<() => void>(() => {})
  const reduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  // Short collections repeat only enough to fill the strip and its offscreen buffer.
  const films = sources.length ? Array.from({ length: sources.length * Math.ceil(5 / sources.length) }, (_, index) => sources[index % sources.length]) : []
  const sourceKey = films.join('|')
  useEffect(() => {
    if (!stage.current || !sourceKey) return
    const strip = startFilmStrip(stage.current, sourceKey.split('|'), reduced, setPlaying)
    action.current = strip.toggle
    return () => { action.current = () => {}; strip.dispose() }
  }, [sourceKey, reduced])

  if (!sources.length) return <div className="home-video-empty"><p>A film will appear here soon.</p></div>
  return <div className="home-video">
    <div ref={stage} className={`home-video-stage${reduced ? ' is-reduced' : ''}`} role="region" tabIndex={0}
      aria-label={`Films. ${playing ? 'Playing' : 'Paused'}. Press Space or tap to ${playing ? 'pause' : 'play'}.${reduced ? ' Scroll horizontally to browse.' : ''}`}
      onClick={() => action.current()}
      onKeyDown={event => {
        if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); action.current() }
        if (reduced && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault(); event.currentTarget.scrollBy({ left: event.key === 'ArrowRight' ? 240 : -240, behavior: 'instant' })
        }
      }}>
      {films.map((src, index) => <div className="film-strip-item" key={`${src}-${index}`}>
        <video muted playsInline loop preload="none" aria-hidden="true" tabIndex={-1}/>
        <span className="film-unavailable" role="status">This film is unavailable.</span>
      </div>)}
    </div>
    {['top', 'bottom', 'left', 'right'].map(edge => <span key={edge} className={`home-video-glass home-video-glass--${edge}`} aria-hidden="true"/>)}
  </div>
}


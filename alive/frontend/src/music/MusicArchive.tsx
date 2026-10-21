import { useCallback, useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowDown, Pause, Play } from 'lucide-react'
import type { Release, Track } from '../types'
import { formatTime, useAudio } from './AudioProvider'
import { PlayerControls } from './PlayerControls'
import { CoverArt } from './CoverArt'
import { useViewport } from '../hooks/useViewport'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useKineticSelection } from '../motion/useKineticSelection'
import { discPose } from '../motion/referenceMotion'
import './music.css'
import './disc-contour.css'

export function MusicArchive({ releases, tracks }: { releases: Release[]; tracks: Track[] }) {
  const items = useMemo(() => releases.filter(item => item.published), [releases])
  const audio = useAudio()
  const location = useLocation()
  const homeRelease = (location.state as { homeRelease?: string } | null)?.homeRelease
  const viewport = useViewport()
  const reduced = useReducedMotion()
  const discs = useRef<(HTMLButtonElement | null)[]>([])
  const metadata = useRef<HTMLDivElement>(null)
  const listening = useRef<HTMLDivElement>(null)
  const mobile = viewport.width < 700
  const sceneHeight = Math.max(520, viewport.height - (mobile ? 76 : 88))
  const discSize = mobile ? viewport.width * .75 : Math.min(viewport.width * .45, viewport.height * .78)
  const render = useCallback((position: number) => {
    discs.current.forEach((disc, i) => {
      if (!disc) return
      gsap.set(disc, { ...discPose(i - position, viewport.width, sceneHeight), transformPerspective: discSize * 2.5, force3D: true })
    })
  }, [viewport.width, sceneHeight, discSize])
  const { surface, index: activeIndex, bind, move, goTo } = useKineticSelection({ count: items.length, initial: Math.max(0, items.findIndex(item => item.id === (homeRelease ?? audio.release?.id))), axis: 'x', step: viewport.width * (mobile ? .48 : .428), render })
  useLayoutEffect(() => { if (document.activeElement?.classList.contains('archive-disc')) discs.current[activeIndex]?.focus({preventScroll:true}) }, [activeIndex])
  const release = items[activeIndex]
  useLayoutEffect(() => {
    if(reduced || !metadata.current)return
    const context=gsap.context(()=>{gsap.fromTo('h2,.release-data > div,.release-demo',{y:10,opacity:.2,clipPath:'inset(0 0 100% 0)'},{y:0,opacity:1,clipPath:'inset(0 0 0% 0)',duration:.42,stagger:.045,ease:'power3.out'})},metadata)
    return()=>context.revert()
  },[release?.id,reduced])
  const releaseTracks = release ? release.trackIds.map(id => tracks.find(track => track.id === id && track.releaseId === release.id)).filter((track): track is Track => Boolean(track)) : []
  const playable = releaseTracks.find(track => track.audioUrl)
  const playing = audio.playing && audio.release?.id === release?.id
  const current = audio.release?.id === release?.id
  if (!release) return <section className="music-empty"><h1 tabIndex={-1}>Room for sound.</h1><p>The music archive is quiet for now. New releases will appear here.</p></section>

  return <section className="music-archive music-archive--spatial">
    <h1 className="sr-only" tabIndex={-1}>Sound, held.</h1>
    <div className="music-scene" style={{ '--disc-size': `${discSize}px`, '--music-scene-height': `${sceneHeight}px` } as CSSProperties}>
      <div className="release-introduction release-introduction--floating" ref={metadata} aria-live="polite" aria-atomic="true">
        <h2 key={release.id}>{release.title}</h2>
        <dl className="release-data"><div><dt>Artist</dt><dd>{release.artist}</dd></div><div><dt>Edition</dt><dd>{release.year} / {release.type}</dd></div><div><dt>Duration</dt><dd>{playable ? formatTime(releaseTracks.reduce((sum, track) => sum + track.duration, 0)) : 'In progress'}</dd></div></dl>
        {release.demo && <span className="release-demo">Demonstration recording</span>}
      </div>
      <div className="disc-carousel" role="region" aria-label="Music releases" aria-roledescription="carousel">
        <div ref={surface} className="disc-stage" tabIndex={0} {...bind} onKeyDown={event => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) }
          if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); goTo(event.key === 'Home' ? 0 : items.length - 1) }
          if (event.key === 'Escape') event.currentTarget.blur()
        }}>
          {items.map((item, index) => <button key={item.id} data-release-id={item.id} ref={element => { discs.current[index] = element }}
            type="button" className={`archive-disc${index === activeIndex ? ' is-active' : ''}${audio.playing && audio.release?.id === item.id ? ' is-playing' : ''}`}
            aria-label={`${item.title}, ${item.type}, ${item.year}. ${index + 1} of ${items.length}. Select release.${audio.playing && audio.release?.id === item.id ? ' Currently playing.' : ''}`}
            aria-pressed={index === activeIndex} tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => { if (index === activeIndex) listening.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' }); else goTo(index) }}>
            <span className="disc-object"><CoverArt className="disc-art" src={item.coverImage} loading={Math.abs(index - activeIndex) < 2 ? 'eager' : 'lazy'}/><span className="disc-finish"/>
              <span className="disc-print"><span>{item.title}</span><span>a.l.i.v.e<br/>{item.year}</span></span><span className="disc-hub"/>
              {audio.playing && audio.release?.id === item.id && <span className="disc-play-state">Playing</span>}
            </span><svg className="disc-hover-contour" viewBox="0 0 200 200" aria-hidden="true">
              <path pathLength="1" d="M100 4 C124 3 144 11 161 25 L180 48 C190 67 196 82 195 103 L188 136 C179 156 163 173 142 184 L111 195 C88 197 66 192 46 179 L22 155 C10 135 4 117 5 95 L12 62 C22 41 38 23 60 13 L83 6Z"/>
              <path pathLength="1" d="M103 2 C133 5 161 20 178 44 L191 73 C199 99 191 132 179 153 L155 178 C131 194 108 198 82 192 L52 182 C29 167 12 143 6 115 L5 86 C11 57 28 32 52 17 L80 5Z"/>
            </svg>
          </button>)}
        </div>
      </div>
      <div className="disc-navigation"><p className="disc-hint">Scroll or drag to explore</p><button className="music-details-link" onClick={() => listening.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' })}>Track notes <ArrowDown size={15}/></button><div className="disc-pagination"><button className="music-icon-button" aria-label="Previous release" onClick={() => move(-1)} disabled={activeIndex === 0}><ArrowLeft size={19}/></button><span aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span><button className="music-icon-button" aria-label="Next release" onClick={() => move(1)} disabled={activeIndex === items.length - 1}><ArrowRight size={19}/></button></div></div>
    </div>
    <div className="release-details" ref={listening}>
      <div><p className="release-description">{release.description}</p><p className="release-context">Sound, held. A place to return to.</p></div>
      <div className="release-listening">
        {playable ? <><div className="release-play-row"><button className="release-play" onClick={() => current ? audio.toggle() : audio.choose(playable.id)}>{playing ? <Pause size={17}/> : <Play size={17}/>} {playing ? 'Pause release' : current ? 'Resume release' : 'Listen to release'}</button><span>{releaseTracks.length} {releaseTracks.length === 1 ? 'track' : 'tracks'}</span></div>
          <ol className="release-tracklist">{releaseTracks.map((track, i) => <li className={audio.track?.id === track.id ? 'is-current' : ''} key={track.id}><button disabled={!track.audioUrl} aria-label={`${audio.track?.id === track.id && audio.playing ? 'Pause' : 'Play'} ${track.title}`} onClick={() => audio.track?.id === track.id ? audio.toggle() : audio.choose(track.id)}><span className="track-order">{String(i + 1).padStart(2, '0')}</span><span>{track.title}</span><span className="track-duration">{track.audioUrl ? formatTime(track.duration) : 'Not available'}</span></button></li>)}</ol></> : <div className="release-silent"><p>Artwork for a sound still to come.</p><span>There is no audio in this release yet.</span></div>}
        {audio.track && <div className="release-player"><p className="now-playing">{audio.playing ? 'Playing' : 'Selected'}: {audio.track.title}{audio.track.demo ? ' (demo)' : ''}</p><PlayerControls/>{audio.error && <p className="audio-error" role="alert">{audio.error}</p>}</div>}
      </div>
    </div>
  </section>
}

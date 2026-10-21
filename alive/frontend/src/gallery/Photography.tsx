import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ArrowDown, ArrowUp, ArrowLeft } from 'lucide-react'
import type { Album, Photo } from '../types'
import { MediaImage } from '../components/MediaImage'
import { PhotoViewer } from './PhotoViewer'
import { PhotoStrip } from './PhotoStrip'
import { useViewport } from '../hooks/useViewport'
import { useKineticSelection } from '../motion/useKineticSelection'
import { reelPose, relativeIndex } from '../motion/referenceMotion'
import './photography.css'

function PhotoReel({ photos, albums, album, onAlbum, onStrip }: { photos: Photo[]; albums: Album[]; album: string; onAlbum: (id: string) => void; onStrip: () => void }) {
  const viewport = useViewport()
  const reel = useRef<HTMLElement>(null)
  const toolbar = useRef<HTMLDivElement>(null)
  const bottom = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const root = reel.current
    const controls = toolbar.current
    if (!root || !controls) return
    // Measure layout only; CSS handles images crossing the protected band.
    const measure = () => {
      root.style.setProperty('--reel-protected-bottom', String(controls.offsetTop + controls.offsetHeight + 8) + 'px')
      if (bottom.current) root.style.setProperty('--reel-bottom-protected', String(root.clientHeight - bottom.current.offsetTop + 8) + 'px')
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(controls)
    observer.observe(root)
    if (bottom.current) observer.observe(bottom.current)
    return () => observer.disconnect()
  }, [])
  const height = Math.max(560, viewport.height - (viewport.width < 700 ? 76 : 88))
  const planes = useRef<(HTMLButtonElement | null)[]>([])
  const descriptions = useRef<(HTMLDivElement | null)[]>([])
  const count = useRef<HTMLSpanElement>(null)
  const [viewer, setViewer] = useState<number | null>(null)
  const render = useCallback((position: number, velocity: number) => {
    planes.current.forEach((plane, i) => {
      const offset = relativeIndex(i, position, photos.length)
      if (plane) gsap.set(plane, { ...reelPose(offset, viewport.width, height), transformPerspective: viewport.width * 1.3, force3D: true })
      const description = descriptions.current[i]
      if (description) gsap.set(description, { y: offset * height * .235, opacity: Math.max(0, 1 - Math.abs(offset) * .74), filter: `blur(${Math.min(2, Math.abs(offset) * .7)}px)`, visibility: Math.abs(offset) > 2.2 ? 'hidden' : 'visible' })
    })
    if (count.current) gsap.set(count.current, { filter: `blur(${Math.min(8, Math.abs(velocity) * 65)}px)` })
  }, [photos.length, viewport.width, height])
  const { surface, index, bind, goTo, move } = useKineticSelection({ count: photos.length, loop: true, axis: 'y', step: height * .36, mediaOnly: true, render })
  useLayoutEffect(() => { if (document.activeElement?.classList.contains('reel-plane')) planes.current[index]?.focus({preventScroll:true}) }, [index])
  const current = photos[index]
  return <section ref={reel} className="photo-reel" style={{ '--reel-height': `${height}px` } as CSSProperties}>
    <div ref={toolbar} className="reel-toolbar"><div><h1 tabIndex={-1}>Moments, held.</h1><p>A collection of things that asked me to stop.</p></div><div className="reel-filters" role="group" aria-label="Photography collection"><button data-album="all" aria-pressed={album === 'all'} onClick={() => onAlbum('all')}>All moments</button>{albums.map(item => <button data-album={item.id} key={item.id} aria-pressed={item.id === album} onClick={() => onAlbum(item.id)}>{item.title}</button>)}<button data-view-switch onClick={onStrip}>Horizontal view</button></div></div>
    {current ? <>
      <div className="reel-stage" ref={surface} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Photograph reel. Scroll, drag vertically, or use arrow keys." {...bind} onKeyDown={event => {
        if (['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) }
        if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); goTo(event.key === 'Home' ? 0 : photos.length - 1) }
        if (event.key === 'Escape') event.currentTarget.blur()
        if (event.key === 'Enter' && event.target === event.currentTarget) { event.preventDefault(); setViewer(index) }
      }}>
        <div className="reel-images">
        {photos.map((photo, i) => <button key={photo.id} ref={element => { planes.current[i] = element }} className={`reel-plane${i === index ? ' is-active' : ''}`} tabIndex={i === index ? 0 : -1} aria-label={`Open ${photo.title} fullscreen`} aria-hidden={i !== index} onClick={() => i === index ? setViewer(i) : goTo(i)}>
          {Math.abs(relativeIndex(i, index, photos.length)) <= 4 && <MediaImage eager={Math.abs(relativeIndex(i, index, photos.length)) < 2} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}/>}
        </button>)}
          <div className="reel-dissolve" aria-hidden="true"/>
          <div className="reel-dissolve reel-dissolve--bottom" aria-hidden="true"/>
        </div>
      </div>
      <div className="reel-context"><span>Photography</span><p>{albums.find(item => item.id === current.albumId)?.title}</p><span>{current.demo ? 'Sample archive' : current.location}<br/>{current.year}</span></div>
      <div className="reel-descriptions" aria-hidden="true">{photos.map((photo, i) => <div key={photo.id} className="reel-description" ref={element => { descriptions.current[i] = element }}><span>{albums.find(item => item.id === photo.albumId)?.title}</span><h2>{photo.title}</h2><p>{photo.description}</p></div>)}</div>
      <div className="reel-readout"><span>Selected photograph</span><strong ref={count}>{String(index + 1).padStart(2, '0')}</strong><span>/ {String(photos.length).padStart(2, '0')}</span></div>
      <div ref={bottom} className="reel-bottom"><p>Scroll to wander. Select to stay.</p><div className="reel-mobile-caption" aria-live="polite"><h2>{current.title}</h2><span>{[current.demo ? 'Sample photograph' : current.location, current.year].filter(Boolean).join(' / ')}</span></div><div className="gallery-arrows"><button className="icon-button" aria-label="Previous photo" onClick={() => move(-1)}><ArrowUp size={21}/></button><button className="icon-button" aria-label="Next photo" onClick={() => move(1)}><ArrowDown size={21}/></button></div></div>
    </> : <div className="empty-state page-padding"><h2>Room for new moments.</h2><p>There are no photographs in this collection yet.</p></div>}
    {viewer !== null && <PhotoViewer photos={photos} index={viewer} returnFocus={surface} onClose={() => setViewer(null)} onIndex={next => { setViewer(next); goTo(next) }}/ >}
  </section>
}

export function Photography({ albums, photos }: { albums: Album[]; photos: Photo[] }) {
  const [view, setView] = useState<'reel' | 'strip'>('reel')
  const [album, setAlbum] = useState('all')
  const root=useRef<HTMLDivElement>(null)
  const filterFocus=useRef<string|null>(null)
  const modeFocus=useRef(false)
  useLayoutEffect(()=>{
    if(filterFocus.current!==null){root.current?.querySelectorAll<HTMLButtonElement>('[data-album]').forEach(button=>{if(button.dataset.album===filterFocus.current)button.focus({preventScroll:true})});filterFocus.current=null}
  },[album])
  useLayoutEffect(()=>{if(modeFocus.current){root.current?.querySelector<HTMLButtonElement>('[data-view-switch]')?.focus({preventScroll:true});modeFocus.current=false}},[view])
  const selectAlbum=(id:string)=>{if(id!==album){filterFocus.current=id;setAlbum(id)}}
  const selectView=(next:'strip'|'reel')=>{modeFocus.current=true;setView(next)}
  return <div ref={root}>{view==='strip'?<><div className="strip-switch"><button data-view-switch className="underlined-link" onClick={()=>selectView('reel')}><ArrowLeft size={16}/> Perspective reel</button></div><PhotoStrip albums={albums} photos={photos}/></>:<PhotoReel key={album} albums={albums} photos={photos.filter(photo => album === 'all' || photo.albumId === album)} album={album} onAlbum={selectAlbum} onStrip={()=>selectView('strip')}/>}</div>
}


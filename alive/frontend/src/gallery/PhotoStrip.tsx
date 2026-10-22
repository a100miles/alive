import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Album, Photo } from '../types'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { MediaImage } from '../components/MediaImage'
import { boundedIndex, nearestCenter } from './navigation'
import { PhotoViewer } from './PhotoViewer'

export function PhotoStrip({ albums, photos }: { albums: Album[]; photos: Photo[] }) {
  const [album, setAlbum] = useState('all')
  const [active, setActive] = useState(0)
  const [viewer, setViewer] = useState<number | null>(null)
  const rail = useRef<HTMLDivElement>(null)
  const momentum = useRef(0)
  const drag = useRef({ down: false, x: 0, start: 0, lastX: 0, time: 0, velocity: 0, moved: false })
  const reduced = useReducedMotion()
  const collection = photos.filter(photo => album === 'all' || photo.albumId === album)
  const current = collection[active]
  const go = (index: number) => {
    const next = boundedIndex(index, collection.length)
    const container = rail.current
    const item = container?.children[next] as HTMLElement | undefined
    if (!container || !item) return
    cancelAnimationFrame(momentum.current)
    container.scrollTo({ left: item.offsetLeft + item.offsetWidth / 2 - container.clientWidth / 2, behavior: reduced ? 'instant' : 'smooth' })
    setActive(next)
  }
  useEffect(() => () => cancelAnimationFrame(momentum.current), [])
  const finishDrag = () => {
    if (!drag.current.down) return
    drag.current.down = false
    const element = rail.current
    if (!element) return
    element.classList.remove('is-dragging')
    if (reduced) { element.style.scrollSnapType = ''; return }
    let velocity = drag.current.velocity * 14
    const tick = () => {
      if (!rail.current || Math.abs(velocity) < .6) { element.style.scrollSnapType = ''; return }
      element.scrollLeft -= velocity
      velocity *= .92
      momentum.current = requestAnimationFrame(tick)
    }
    momentum.current = requestAnimationFrame(tick)
  }
  return <div className="photography-page">
    <div className="archive-heading page-padding"><div><h1 className="display-heading" tabIndex={-1}>Moments, held.</h1><p>A collection of things that asked me to stop.</p></div><span className="archive-total">{String(photos.length).padStart(2, '0')} photographs</span></div>
    <div className="album-bar page-padding" role="group" aria-label="Photography collection"><button aria-pressed={album === 'all'} onClick={() => { setAlbum('all'); setActive(0); rail.current?.scrollTo(0, 0) }}>All moments</button>{albums.map(item => <button aria-pressed={album === item.id} key={item.id} onClick={() => { setAlbum(item.id); setActive(0); rail.current?.scrollTo(0, 0) }}>{item.title}</button>)}</div>
    {collection.length ? <><div className="photo-rail" key={album} ref={rail} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Photographs. Use left and right arrow keys to browse." onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(active + (event.key === 'ArrowRight' ? 1 : -1)) } }} onScroll={() => {
      const el = rail.current
      if (el) setActive(nearestCenter(Array.from(el.children).map(child => (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2), el.scrollLeft + el.clientWidth / 2))
    }} onPointerDown={event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      cancelAnimationFrame(momentum.current)
      drag.current = { down: true, x: event.clientX, start: event.currentTarget.scrollLeft, lastX: event.clientX, time: performance.now(), velocity: 0, moved: false }
    }} onPointerMove={event => {
      if (!drag.current.down) return
      const delta = event.clientX - drag.current.x
      if (Math.abs(delta) > 5) { drag.current.moved = true; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.classList.add('is-dragging'); event.currentTarget.style.scrollSnapType = 'none' }
      if (!drag.current.moved) return
      event.preventDefault()
      const now = performance.now()
      drag.current.velocity = (event.clientX - drag.current.lastX) / Math.max(1, now - drag.current.time)
      drag.current.lastX = event.clientX; drag.current.time = now
      event.currentTarget.scrollLeft = drag.current.start - delta
    }} onPointerUp={finishDrag} onPointerCancel={finishDrag} onPointerLeave={() => { if (!drag.current.moved) finishDrag() }} onClickCapture={event => { if (drag.current.moved) { event.preventDefault(); event.stopPropagation(); drag.current.moved = false } }}>
      {collection.map((photo, index) => <figure className={`photo-slide ${index === active ? 'is-active' : ''}`} key={photo.id} style={{ aspectRatio: `${photo.width} / ${photo.height}` }}><button aria-label={`Open ${photo.title} fullscreen`} onClick={() => { setActive(index); setViewer(index) }}><MediaImage src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} eager={index < 2}/></button></figure>)}
    </div><div className="gallery-details page-padding"><div aria-live="polite"><h2>{current?.title}</h2><p>{[current?.demo ? 'Sample photograph' : current?.location, current?.year].filter(Boolean).join(' / ')}</p></div><span className="gallery-hint">Drag to wander. Select to stay.</span><div className="gallery-arrows"><button className="icon-button" aria-label="Previous photo" disabled={active === 0} onClick={() => go(active - 1)}><ArrowLeft size={22}/></button><span>{String(active + 1).padStart(2, '0')} / {String(collection.length).padStart(2, '0')}</span><button className="icon-button" aria-label="Next photo" disabled={active === collection.length - 1} onClick={() => go(active + 1)}><ArrowRight size={22}/></button></div></div></> : <div className="empty-state page-padding"><h2>Room for new moments.</h2><p>There are no photographs in this collection yet.</p></div>}
    {viewer !== null && <PhotoViewer photos={collection} index={viewer} onIndex={index => { setViewer(index); go(index) }} onClose={() => setViewer(null)}/>}
  </div>
}


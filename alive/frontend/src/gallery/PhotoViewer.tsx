import { useEffect, useRef, type RefObject } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { Photo } from '../types'
import { MediaImage } from '../components/MediaImage'
import { boundedIndex } from './navigation'

export function PhotoViewer({ photos, index, onIndex, onClose, returnFocus }: { photos: Photo[]; index: number; onIndex: (index: number) => void; onClose: () => void; returnFocus?: RefObject<HTMLElement | null> }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const photo = photos[index]
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement as HTMLElement | null
    const returnElement = returnFocus?.current
    const overflow = document.body.style.overflow
    element?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { element?.close(); document.body.style.overflow = overflow; const target=returnElement ?? previousFocus;if(target?.isConnected)target.focus({ preventScroll: true }) }
  }, [returnFocus])
  if (!photo) return null
  return <dialog className="photo-viewer" ref={dialog} aria-label={`Photograph: ${photo.title}`} onCancel={onClose} onKeyDown={event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); onIndex(boundedIndex(index + (event.key === 'ArrowRight' ? 1 : -1), photos.length)) }
  }}><div className="viewer-top"><span>a.l.i.v.e / photographs</span><button className="icon-button" aria-label="Close photograph" onClick={onClose}><X size={24}/></button></div><div className="viewer-image"><MediaImage key={photo.id} eager src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}/></div><div className="viewer-bottom"><div><h2>{photo.title}</h2><p>{photo.description}</p><span>{[photo.demo ? 'Sample photograph' : photo.location, photo.year].filter(Boolean).join(' / ')}</span></div><div className="gallery-arrows"><button className="icon-button" disabled={index === 0} aria-label="Previous photograph" onClick={() => onIndex(index - 1)}><ArrowLeft size={22}/></button><span>{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span><button className="icon-button" disabled={index === photos.length - 1} aria-label="Next photograph" onClick={() => onIndex(index + 1)}><ArrowRight size={22}/></button></div></div></dialog>
}


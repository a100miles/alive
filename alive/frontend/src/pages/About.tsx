import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { MediaImage } from '../components/MediaImage'
import type { Photo } from '../types'
import { site } from '../config'

export function About({ photos }: { photos: Photo[] }) {
  const photo = photos[2] ?? photos[0]
  return <div className="about-page page-padding"><h1 className="display-heading" tabIndex={-1}>A way of<br/>paying attention.</h1><div className="about-body"><div className="about-image">{photo && <MediaImage src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}/>}<span className="small-note">A photograph holds a place. A sound holds a time.</span></div><div className="artist-statement"><p>{site.about}</p><p>{site.aboutSecondary}</p><Link to="/contact" className="underlined-link">Keep in touch <ArrowUpRight size={18}/></Link><p className="small-note">This is an editable artist statement. Photography is from the 2025 and 2026 collections; the audio remains demonstration material.</p></div></div></div>
}


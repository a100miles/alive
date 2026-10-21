import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { MediaImage } from '../components/MediaImage'
import { site } from '../config'

export function About() {
  return <div className="about-page page-padding"><h1 className="display-heading" tabIndex={-1}>A way of<br/>paying attention.</h1><div className="about-body"><div className="about-image"><MediaImage src="/me.jpg" alt="Tamerlan in warm window light" width={1920} height={2560} eager/><span className="small-note">A photograph holds a place. A sound holds a time.</span></div><div className="artist-statement"><p>{site.about}</p><p>{site.aboutSecondary}</p><Link to="/contact" className="underlined-link">Keep in touch <ArrowUpRight size={18}/></Link><p className="small-note">This is an editable artist statement. Photography is from the 2025 and 2026 collections.</p></div></div></div>
}


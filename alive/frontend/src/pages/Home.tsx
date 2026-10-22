import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Archive } from '../types'
import { HomeVideo } from '../components/HomeVideo'
import { HomePencil } from '../components/HomePencil'
import { site } from '../config'
import { DiscNavigation } from '../motion/discNavigation'

export function Home({ archive }: { archive: Archive }) {
  const release = archive.releases.find(item => item.published)
  const openDisc = useContext(DiscNavigation)
  return <div className="home-page">
    <div className="home-title-row" data-scroll-fade><HomePencil/><div className="home-title-content" data-intro-enter><h1 className="home-wordmark" tabIndex={-1}>a.l.i.v.e</h1><p className="home-definition"><strong className="ink-emphasis">actual life by tamerlan yessimov</strong></p></div></div>
    <div className="home-spread" data-scroll-reveal>
      <HomeVideo sources={site.homeVideos}/>
    </div>
    <section className="home-listening-band" aria-labelledby="listening-title">
    <div className="home-listening" data-scroll-reveal>
      <div><h2 id="listening-title">Some moments<br/>have a sound.</h2><p><strong className="ink-emphasis">{site.introduction}</strong></p><Link className="underlined-link" to="/music">Enter the listening room <ArrowUpRight size={19}/></Link></div>
      {release && <Link to="/music" state={{ homeRelease: release.id }} className="home-release" aria-label={`Explore ${release.title}`} onClick={event => {
        if (!openDisc || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        const disc = event.currentTarget.querySelector<HTMLElement>('.home-disc')
        if (disc) { event.preventDefault(); openDisc(disc, release.id) }
      }}><div className="home-disc" style={{ backgroundImage: `url("${release.coverImage}")` }}><span/></div><p>{release.title}<span>{release.type} / {release.year}</span></p></Link>}
    </div>
    </section>
  </div>
}

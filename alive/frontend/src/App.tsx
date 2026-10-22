import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route } from 'react-router-dom'
import type { Archive } from './types'
import { loadArchive } from './services/api'
import { Navigation } from './components/Navigation'
import { FilmGrain } from './components/FilmGrain'
import { ScrollFrost } from './components/ScrollFrost'
import { Intro } from './components/Intro'
import { SceneRoutes } from './components/SceneRoutes'
import { AudioProvider } from './music/AudioProvider'
import { PersistentPlayer } from './music/PersistentPlayer'
import { MusicArchive } from './music/MusicArchive'
import { Home } from './pages/Home'
import { Photography } from './gallery/Photography'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'

const empty: Archive = { albums: [], photos: [], releases: [], tracks: [] }
export default function App() {
  const [archive, setArchive] = useState<Archive | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    loadArchive(controller.signal).then(setArchive).catch((err: unknown) => {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'The archive is unavailable. Please try again.')
    })
    return () => controller.abort()
  }, [attempt])
  const data = archive ?? empty
  return <BrowserRouter><AudioProvider releases={data.releases} tracks={data.tracks}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Navigation/>
    <FilmGrain/>
    <ScrollFrost/>
    {error ? <main id="main-content" className="error-state page-padding"><h1 className="display-heading" tabIndex={-1}>A quiet pause.</h1><p role="alert">{error}</p><button className="underlined-link" onClick={() => { setError(''); setAttempt(value => value + 1) }}>Try again</button></main> : archive ? <SceneRoutes><Route path="/" element={<Home archive={archive}/>}/><Route path="/photography" element={<Photography albums={archive.albums} photos={archive.photos}/>}/><Route path="/music" element={<MusicArchive releases={archive.releases} tracks={archive.tracks}/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<NotFound/>}/></SceneRoutes> : <main id="main-content" className="loading-state" aria-busy="true"><p role="status">Opening the archive…</p></main>}
    <footer className="site-footer"><Link to="/" className="footer-brand">a.l.i.v.e</Link><span>actual life,</span></footer>
    <PersistentPlayer/>
    <Intro ready={!!archive || !!error} image={archive?.photos[0]?.src}/>
  </AudioProvider></BrowserRouter>
}


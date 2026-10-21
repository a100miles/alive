import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, Routes, type Location } from 'react-router-dom'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { aperturePath, motion } from '../motion/referenceMotion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { DiscNavigation } from '../motion/discNavigation'
import { createDiscFlight } from '../motion/discFlight'

const titles: Record<string,string> = { '/':'actual life, in fragments','/photography':'Photography','/music':'Music','/about':'About','/contact':'Contact' }
gsap.registerPlugin(CustomEase)
CustomEase.create('archive-aperture', '.4,0,.18,1')
export function SceneRoutes({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [scene, setScene] = useState(location)
  const [incoming, setIncoming] = useState<Location | null>(null)
  const [departing, setDeparting] = useState(false)
  const flight = useRef<ReturnType<typeof createDiscFlight> | null>(null)
  const sceneRef = useRef(scene)
  const content = useRef<HTMLElement>(null)
  const arriving = useRef<HTMLDivElement>(null)
  const aperture = useRef<SVGPathElement>(null)
  const glass = useRef<HTMLDivElement>(null)
  const positions = useRef(new Map<string,number>())
  const clipId = useId().replace(/:/g,'')
  useScrollReveal(content, scene.key, !!incoming)
  useEffect(() => { const previous=history.scrollRestoration;history.scrollRestoration='manual';return()=>{history.scrollRestoration=previous} },[])
  useEffect(() => () => { flight.current?.dispose() }, [])
  const openDisc = useCallback((source: HTMLElement, releaseId: string) => {
    if (flight.current || incoming) return
    if (reduced) { navigate('/music', { state: { homeRelease: releaseId } }); return }
    setDeparting(true)
    flight.current = createDiscFlight(source, releaseId, token => navigate('/music', { state: { homeRelease: releaseId, flightToken: token } }))
  }, [incoming, navigate, reduced])
  useLayoutEffect(() => {
    if (!reduced || !flight.current) return
    const releaseId = flight.current.releaseId
    flight.current.dispose(); flight.current = null; setDeparting(false)
    navigate('/music', { replace: location.pathname === '/music', state: { homeRelease: releaseId } })
  }, [reduced, navigate, location.pathname])
  useLayoutEffect(() => { sceneRef.current=scene },[scene])
  useLayoutEffect(() => {
    if (flight.current && (location.state as { flightToken?: string } | null)?.flightToken !== flight.current.token) {
      flight.current.dispose(); flight.current = null; setDeparting(false)
    }
    if (location.key===sceneRef.current.key) { setIncoming(null);return }
    positions.current.set(sceneRef.current.key,window.scrollY)
    if(reduced || location.pathname===sceneRef.current.pathname){setScene(location);setIncoming(null)}
    else setIncoming(location)
  },[location,reduced])
  useLayoutEffect(() => {
    if(!incoming || !glass.current || !aperture.current) return
    if(arriving.current)arriving.current.style.marginTop=`${-(positions.current.get(incoming.key) ?? 0)}px`
    const shared = flight.current
    const target = shared ? Array.from(arriving.current?.querySelectorAll<HTMLElement>('[data-release-id]') ?? []).find(element => element.dataset.releaseId === shared.releaseId) : undefined
    if (shared && target) shared.arrive(target)
    const state={progress:0}
    const draw=()=>{aperture.current?.setAttribute('d',aperturePath(state.progress,window.innerWidth,window.innerHeight))}
    draw()
    const timeline=gsap.timeline({onComplete:()=>{setScene(incoming);setIncoming(null);setDeparting(false)}})
    timeline.to(state,{progress:1,duration:motion.portal,ease:'archive-aperture',onUpdate:draw},0)
    timeline.fromTo(glass.current,{opacity:0},{opacity:1,duration:.18},0)
    timeline.to(glass.current,{opacity:0,duration:.35},motion.portal-.35)
    const headings=arriving.current?.querySelectorAll('h1,.home-definition,.release-introduction h2,.artist-statement > p')
    if(headings?.length) timeline.fromTo(headings,{y:22,opacity:0},{y:0,opacity:1,duration:.55,stagger:.045,ease:'power3.out'},.22)
    if(shared && target) timeline.to({}, { duration: .9 }, 0)
    return()=>{timeline.kill()}
  },[incoming])
  useLayoutEffect(() => {
    if (flight.current && scene.pathname === '/music') { flight.current.dispose(); flight.current = null }
    document.title=`a.l.i.v.e — ${titles[scene.pathname] ?? 'Page not found'}`
    window.scrollTo({top:positions.current.get(scene.key) ?? 0,behavior:'instant'})
    if(scene.key!=='default')content.current?.querySelector<HTMLElement>('h1')?.focus({preventScroll:true})
  },[scene])
  return <DiscNavigation.Provider value={openDisc}>
    <main id="main-content" ref={content} inert={!!incoming || departing} className={incoming ? 'scene-transitioning' : undefined}><Routes location={scene}>{children}</Routes></main>
    {incoming && <>
      <svg className="scene-clip-definitions" aria-hidden="true"><defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse"><path ref={aperture}/></clipPath></defs></svg>
      <div className="scene-incoming" aria-hidden="true" inert style={{clipPath:`url(#${clipId})`}}>
        <div ref={arriving} className="scene-arriving"><Routes location={incoming}>{children}</Routes></div>
      </div>
      <div ref={glass} className="scene-glass" aria-hidden="true"/>
    </>}
  </DiscNavigation.Provider>
}
